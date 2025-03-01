import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../../lib/prisma";
import { AppointmentStatus } from "@prisma/client";

export default async function handler (req: NextApiRequest, res: NextApiResponse){
    const session = await getSession({req});
    if (!session) return res.status(401).json({message: "Unauthorized"});
    switch (req.method){
        case "GET":
            return handleGetAppointments(req, res, session.user);
        case "POST":
            return handleCreateAppointment(req, res, session.user);
        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).json({message: `Method ${req.method} not allowed`});
    }
}

async function handleGetAppointments(req: NextApiRequest, res: NextApiResponse, user: any){
    try{
        const whereClause = 
            user.role==="DOCTOR"
            ? {doctor: {email: user.email}}
            : user.role === "PATIENT"
            ? {patient: {email: user.email}}
            : {};
        
        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: {patient: true, doctor: true},
            orderBy: {scheduledAt: "asc"},
        });
        return res.status(200).json(appointments);
    } catch (error){
        console.error("Error fetching appointments:", error);
        return res.status(500).json({message: "Error fetching appointments"});
    }
}

async function handleCreateAppointment(req: NextApiRequest, res: NextApiResponse, user: any){
    try{
        if (user.role !== "PATIENT"){
            return res.status(403).json({message: "Only patients can create appointments."});
        }
        const {doctorId, scheduledAt} = req.body;
        if(!doctorId||!scheduledAt){
            return res.status(400).json({message: "Missing Doctor ID or Appointment Schedule"});
        }
        const appointment = await prisma.appointment.create({
            data: {
                patient:{connect: {email: user.email}},
                doctor: {connect: {id: Number(doctorId)}},
                scheduledAt: new Date(scheduledAt),
                status: AppointmentStatus.PENDING,
            },
        });
        return res.status(201).json(appointment);
    } catch (error){
        console.error("Error creating appointment:", error);
        return res.status(500).json({message: "Error creating appointment"});
    }
}
