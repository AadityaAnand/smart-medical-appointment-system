import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of symptoms' });
    }

    // Generate doctor specialty recommendation using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a medical assistant. Your task is to recommend the most appropriate medical specialty based on the symptoms provided. 
          Respond with only the medical specialty (e.g., "Cardiologist", "Dermatologist", "General Practitioner", etc.).
          
          For example:
          - For chest pain, shortness of breath: "Cardiologist"
          - For skin rashes, moles: "Dermatologist"
          - For headaches, dizziness: "Neurologist"
          
          Keep your response concise and only name the specialty without additional text.`
        },
        { 
          role: 'user', 
          content: `Based on these symptoms, what type of doctor should I see: ${symptoms.join(', ')}` 
        }
      ],
      max_tokens: 50,
      temperature: 0.3,
    });

    const specialty = response.choices[0].message.content?.trim();
    
    return res.status(200).json({ 
      specialty,
      message: `Based on your symptoms, we recommend seeing a ${specialty}. This is just a suggestion - please consult with your primary care physician for proper referrals.`
    });
  } catch (error) {
    console.error('Doctor recommendation error:', error);
    return res.status(500).json({ message: 'Error processing your request' });
  }
}