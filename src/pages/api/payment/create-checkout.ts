import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../../lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ message: "Missing appointmentId" });
    }


    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(appointmentId) },
      include: { doctor: true },
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({ message: "Cannot pay for a cancelled appointment" });
    }


    const amount = appointment.priority === "HIGH" ? 15000 : 
                   appointment.priority === "MEDIUM" ? 10000 : 5000;


    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment with Dr. ${appointment.doctor.name || "Doctor"}`,
              description: `Scheduled for ${new Date(appointment.scheduledAt).toLocaleString()}`,
            },
            unit_amount: amount, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/appointments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/appointments/cancel`,
      metadata: {
        appointmentId: appointment.id.toString(),
        userId: session.user.id,
      },
    });

    return res.status(200).json({ sessionId: stripeSession.id, url: stripeSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({ message: "Error creating checkout session" });
  }
}