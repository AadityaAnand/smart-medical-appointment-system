import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import prisma from "../../../../lib/prisma";
import { AppointmentStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { session_id } = req.query;
  
  if (!session_id || typeof session_id !== "string") {
    return res.status(400).json({ message: "Missing session_id" });
  }

  try {

    const stripeSession = await stripe.checkout.sessions.retrieve(session_id);
    
    if (!stripeSession || stripeSession.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }


    const appointmentId = stripeSession.metadata?.appointmentId;
    
    if (!appointmentId) {
      return res.status(400).json({ message: "Invalid session: no appointment ID" });
    }


    const appointment = await prisma.appointment.update({
      where: { id: Number(appointmentId) },
      data: { status: AppointmentStatus.CONFIRMED },
      include: { patient: true, doctor: true },
    });


    return res.status(200).json({ 
      success: true, 
      appointment,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ message: "Error verifying payment" });
  }
}