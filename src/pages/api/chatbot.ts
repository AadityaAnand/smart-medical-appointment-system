import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }


  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { userMessage } = req.body;
    
    if (!userMessage) {
      return res.status(400).json({ message: 'Missing user message' });
    }


    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful medical assistant chatbot. 
          Your primary function is to provide general health information and guidance.
          
          Rules:
          1. Always include a disclaimer that you are not a real doctor and the user should consult a medical professional for proper diagnosis and treatment.
          2. For minor issues, you can suggest general remedies or over-the-counter solutions.
          3. For anything that seems serious, advise seeing a doctor immediately.
          4. If the symptoms indicate an emergency (chest pain, difficulty breathing, severe bleeding, etc.), advise calling emergency services.
          5. If asked about specific medications, only provide general information about common usage, not specific dosages.
          6. Never diagnose conditions with certainty.
          7. Be compassionate and clear in your responses.
          
          Remember: Your advice is informational only and not a substitute for professional medical care.`
        },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const botReply = response.choices[0].message.content;
    return res.status(200).json({ botReply });
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({ message: 'Error processing your request' });
  }
}