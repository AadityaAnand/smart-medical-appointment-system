import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session  = await getSession({req});
    if (!session) return res.status(401).json({message: "Unauthorized"});

    switch (req.method){
        case "GET":
            return handleGetPrescription(req, res, session.user);
        case "POST":
            return handleCreatePrescription(req, res, session.user);
        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).json({message: `Method ${req.method} not allowed`});
    }
}

async function handleGetPrescription(req: NextApiRequest, res: NextApiResponse, user: any) {
    try{
        const {appointmentId} = req.query;
        if(appointmentId){
            const prescription = await prisma.prescription.findUnique({
                where: {appointmentId: Number(appointmentId)},
            });
            return res.status(200).json(prescription);
        } else{
            const prescriptions = await prisma.prescription.findMany();
            return res.status(200).json(prescriptions);
        }
    } catch(error){
        console.error("Error fetching prescriptions:", error);
        return res.status(500).json({message: "Error fetching prescriptions"});
    }
}

async function handleCreatePrescription(req: NextApiRequest, res: NextApiResponse, user: any) {
    try{
        if(user.role!=="DOCTOR"){
            return res.status(403).json({message: "Only doctors can create prescriptions"});
        }
        const {appointmentId, medication, dosage, instructions} = req.body;
        if (!appointmentId||!medication||dosage|| !instructions){
            return res.status(400).json({message: "Missing fields"})
        }
        const prescription = await prisma.prescription.create({
            data: {
                appointmentId: Number(appointmentId),
                medication,
                dosage,
                instructions,
            },
        });
        return res.status(201).json(prescription);
    } catch(error){
        console.error("Error creating prescriptions", error);
        return res.status(500).json({message: "Error creating prescription"});
        
    }
    
}