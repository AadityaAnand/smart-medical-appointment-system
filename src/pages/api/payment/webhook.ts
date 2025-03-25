import { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import prisma from "../../../../lib/prisma";
import { AppointmentStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"] as string;

    if (!sig || !webhookSecret) {
      return res.status(400).send(`Webhook signature or secret missing`);
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const appointmentId = session.metadata?.appointmentId;
    
    if (!appointmentId) {
      console.error("No appointment ID in session metadata");
      return;
    }

    await prisma.appointment.update({
      where: { id: Number(appointmentId) },
      data: { status: AppointmentStatus.CONFIRMED },
    });

    
    console.log(`Appointment ${appointmentId} confirmed after payment`);
  } catch (error) {
    console.error("Error processing checkout session:", error);
  }
}