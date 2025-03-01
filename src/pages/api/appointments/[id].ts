import { NextApiRequest, NextApiResponse } from "next";
import {getSession} from "next-auth/react";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    const {id} = req.query;
    if(typeof id !== "string"){
        return res.status(400).json({message: "Invalid appointemnt id"});
    }

    const session = await getSession({req});
    if (!session) return res.status(401).json({message: "Unauthorized"});

    switch (req.method){
        case "GET":
            return handleGetAppointment(req, res, session.user, id);
        case "PATCH":
            return handleUpdateAppointment(req, res, session.user, id);
        default:
            res.setHeader("Allow", ["GET", "PATC"]);
            return res.status(405).json({message: `Method ${req.method} not allowed`});
    }
}

async function handleGetAppointment(req: NextApiRequest, res: NextApiResponse, user: any, id: string){
    try{
        const appointemnt = await prisma.appointment.findUnique({
            where: {id: Number(id)},
            include: {patient: true, doctor:true},
        });

        if (!appointemnt) return res.status(404).json({message: "Appointment not found"});
        if (user.role == "PATIENT" && appointemnt.patient.email !== user.email){
            return res.status(403).json({message: "Forbidden"});
        }
        if (user.role == "DOCTOR" && appointemnt.patient.email !== user.email){
            return res.status(403).json({message: "Forbidden"});
        }
        return res.status(200).json(appointemnt);
    } catch(error){
        console.error("Error fetching app[ointment:", error);
        return res.status(500).json({message: "Error fetchin appointment"});
    }
}

async function handleUpdateAppointment(req: NextApiRequest, res: NextApiResponse, user: any, id: string) {
    try{
        const {status} = req.body;
        if (!status) return res.status(400).json({message: "Missing status"});
        if (user.role!== "DOCTOR" && user.role!== "ADMIN"){
            return res.status(403).json({message: "Only doctors or admins can update appointments."});
        }
        const updated = await prisma.appointment.update({
            where: {id: Number(id)},
            data: {status},
        });
        return res.status(200).json(updated);
    } catch (error){
        console.error("Error updating appointment", error);
        return res.status(500).json({message: "Error updating appointment"});
    }
}

