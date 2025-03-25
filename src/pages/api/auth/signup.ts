import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { Role } from '@prisma/client';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password, role } = req.body;


    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }


    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }


    if (role !== Role.PATIENT && role !== Role.DOCTOR) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
           },
    });

       const { ...userWithoutSensitiveInfo } = user;

    return res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutSensitiveInfo,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}