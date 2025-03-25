import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || session.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden. Admin access required." });
  }

  if (req.method === "GET") {
    try {
      const appointments = await prisma.appointment.findMany({
        include: {
          patient: true,
          doctor: true,
        },
        orderBy: { scheduledAt: "desc" },
      });
      
      return res.status(200).json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ message: "Error fetching appointments" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}