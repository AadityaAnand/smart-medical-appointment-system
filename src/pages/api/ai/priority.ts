import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { symptoms, patientAge, existingConditions } = req.body;
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ message: "symptoms must be an array" });
    }

    let priority = "LOW";
    const lowerCaseSymptoms = symptoms.map((s: string) => s.toLowerCase());


    if (lowerCaseSymptoms.includes("chest pain") || lowerCaseSymptoms.includes("stroke")) {
      priority = "HIGH";
    } else if (patientAge > 65 || (existingConditions && existingConditions.length > 0)) {
      priority = "MEDIUM";
    }

    return res.status(200).json({ priority });
  } catch (error) {
    console.error("Error in appointment priority:", error);
    return res.status(500).json({ message: "Error determining priority" });
  }
}