import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    const session = await getSession({req});
    if (!session) return res.status(401).json({message: "Unauthorized"});
    if(req.method!=="POST"){
        res.setHeader("Allow",["POST"]);
        return res.status(405).json({message:`Method ${req.method} not allowed`});
    }
    try{
        const {symptoms} = req.body;
        if(!symptoms||!Array.isArray(symptoms)){
            return res.status(400).json({message:"symptoms must be an array of strings"});
        }
        let recommendedSpecialty = "General Medicine";
        const lowerCaseSymptoms = symptoms.map((s: string) => s.toLowerCase());

        if (lowerCaseSymptoms.some((symptom: string) => ["chest pain", "shortness of breath"].includes(symptom))) {
        recommendedSpecialty = "Cardiology";
        } else if (lowerCaseSymptoms.some((symptom: string) => symptom.includes("skin"))) {
        recommendedSpecialty = "Dermatology";
        } else if (lowerCaseSymptoms.some((symptom: string) => symptom.includes("mental"))) {
        recommendedSpecialty = "Psychiatry";
        }
        return res.status(200).json({ recommendedSpecialty });
    } catch (error) {
        console.error("Error in AI recommendation:", error);
        return res.status(500).json({ message: "Error generating recommendation" });
    }
}