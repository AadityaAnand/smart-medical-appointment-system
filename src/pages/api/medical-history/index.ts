import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    const session = await getSession({req});
    if (!session) return res.status(401).json({message: "Unauthorized"});

    switch (req.method){
        case "GET":
            return handleGetMedicalHistory(req, res, session.user);
        case "POST":
            return handleAddMedicalHistory(req, res, session.user);
        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).json({message: `Method ${req.method} not allowed`});
    }
}

async function handleGetMedicalHistory(req: NextApiRequest, res: NextApiResponse, user: any) {
    try{
        if(user.role==="PATIENT"){
            const history = await prisma.medicalHistory.findMany({
                where: {user: {email: user.email}},
                orderBy: {createdAt:"desc"}
            });
            return res.status(200).json(history);
        } else if (user.role==="DOCTOR"||user.role==="ADMIN"){
            const{patientId} = req.query;
            if(!patientId) return res.status(400).json({message: "patientId is required for doctors/admin"});
            const history = await prisma.medicalHistory.findMany({
                where: {userId: Number(patientId)},
                orderBy: {createdAt: "desc"},
            });
            return res.status(200).json(history);
        } else{
            return res.status(403).json({message: "Forbidden"});
        }
    } catch(error){
        console.error("Error fetching medical history:", error);
        return res.status(500).json({message: "Error fetching medical history"});
    }   
}

async function handleAddMedicalHistory(req:NextApiRequest, res: NextApiResponse, user: any) {
    try{
        const {description, patientId} = req.body;
        if(!description) return res.status(400).json({messagge: "Missing description"});
        const targetUserId = user.role === "PATIENT" ? user.id: Number(patientId);
        if(!targetUserId) return res.status(400).json({message: "patientId is required"});
        const newHistory = await prisma.medicalHistory.create({
            data:{
                userId: targetUserId,
                description,
            },
        });
        return res.status(201).json(newHistory);
    } catch(error){
        console.error("Error adding medical history:", error);
        return res.status(500).json({message: "Error adding medical history"});
    }
}