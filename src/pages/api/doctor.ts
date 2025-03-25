import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { Role } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {

      const doctors = await prisma.user.findMany({
        where: {
          role: Role.DOCTOR,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          
        },
      });

      return res.status(200).json(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return res.status(500).json({ message: 'Error fetching doctors' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}