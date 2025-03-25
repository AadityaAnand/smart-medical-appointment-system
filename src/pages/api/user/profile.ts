// src/pages/api/user/profile.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      return res.status(500).json({ message: "Error fetching profile" });
    }
  } else if (req.method === "PUT") {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: { name },
      });
      
      return res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ message: "Error updating profile" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}