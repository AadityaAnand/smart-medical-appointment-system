import React, { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input) return;
    const userMessage = input;
    setMessages((prev) => [...prev, `You: ${userMessage}`]);
    setInput("");

    try {
      const res = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, `Bot: ${data.botReply}`]);
      } else {
        setMessages((prev) => [...prev, "Bot: Error responding"]);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [...prev, "Bot: Error connecting to server"]);
    }
  };

  return (
    <div className="border p-4 rounded">
      <h3 className="font-bold mb-2">Medical Chatbot (Powered by OpenAI)</h3>
      <div className="mb-2">
        {messages.map((msg, index) => (
          <p key={index} className="mb-1">
            {msg}
          </p>
        ))}
      </div>
      <input
        type="text"
        className="border p-2 w-full"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a medical question..."
      />
      <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSend}>
        Send
      </button>
    </div>
  );
}