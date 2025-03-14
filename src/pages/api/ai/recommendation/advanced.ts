import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

const openaiModule = require("openai");
const Configuration = openaiModule.Configuration;
const OpenAIApi = openaiModule.OpenAIApi;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { symptoms } = req.body;
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ message: "symptoms must be an array" });
    }

    const prompt = `You are a knowledgeable medical assistant. A patient reports the following symptoms: ${symptoms.join(
      ", "
    )}. Based on these symptoms, what type of doctor should the patient consult? Respond with one specialty only (e.g., Cardiologist, Dermatologist, Neurologist, etc.) and include a disclaimer that your advice is for informational purposes only.`;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", 
      messages: [
        { role: "system", content: "You are a helpful medical assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const recommendedSpecialty = response.data.choices[0].message?.content.trim();
    return res.status(200).json({ recommendedSpecialty });
  } catch (error) {
    console.error("Error in advanced recommendation:", error);
    return res.status(500).json({ message: "Error generating advanced recommendation" });
  }
}