import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { userMessage } = req.body;
    if (!userMessage) {
      return res.status(400).json({ message: "Missing userMessage" });
    }

    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", 
        messages: [
          {
            role: "system",
            content:
              "You are a helpful medical assistant. Please include a disclaimer that you are not a real doctor and advise consulting a professional for medical issues.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from OpenAI:", errorText);
      return res.status(500).json({ message: "Chatbot error" });
    }

    const data = await response.json();
    const botReply =
      data.choices[0].message?.content || "Sorry, I can't respond right now.";
    return res.status(200).json({ botReply });
  } catch (error) {
    console.error("Error in chatbot:", error);
    return res.status(500).json({ message: "Chatbot error" });
  }
}