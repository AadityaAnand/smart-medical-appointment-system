import React, { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message when component mounts
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "bot",
        content: "Hello! I'm your medical assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    const userMessageObj: ChatMessage = {
      id: generateUniqueId(),
      type: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessageObj]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ userMessage }),
      });
      
      let data;
      try {
        // Try to parse the JSON response regardless of status code
        data = await res.json();
      } catch (parseError) {
        // If JSON parsing fails, create a generic error message
        data = { botReply: "Error: Couldn't parse server response" };
      }
      
      if (!res.ok) {
        // Instead of throwing, we'll create an error message from the response
        const botMessage: ChatMessage = {
          id: generateUniqueId(),
          type: "bot",
          content: data.message || "Sorry, I encountered an error processing your request.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // If response is successful, add the bot's reply
        const botMessage: ChatMessage = {
          id: generateUniqueId(),
          type: "bot",
          content: data.botReply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      // This will catch network errors or other exceptions
      console.error("Chatbot error:", error);
      const errorMessage: ChatMessage = {
        id: generateUniqueId(),
        type: "bot",
        content: "Sorry, I couldn't connect to the server. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border rounded-lg shadow-md overflow-hidden flex flex-col h-96">
      <div className="bg-blue-600 text-white p-3">
        <h3 className="font-bold">Medical Assistant (AI-Powered)</h3>
        <p className="text-xs opacity-75">Ask medical questions for general guidance</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`mb-3 max-w-3/4 ${
              msg.type === "user" ? "ml-auto" : "mr-auto"
            }`}
          >
            <div 
              className={`p-3 rounded-lg ${
                msg.type === "user" 
                  ? "bg-blue-500 text-white rounded-br-none" 
                  : "bg-white border rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
            <div 
              className={`text-xs mt-1 ${
                msg.type === "user" ? "text-right" : "text-left"
              } text-gray-500`}
            >
              {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-1 text-gray-500">
            <div className="animate-bounce h-2 w-2 bg-gray-400 rounded-full delay-0"></div>
            <div className="animate-bounce h-2 w-2 bg-gray-400 rounded-full delay-150"></div>
            <div className="animate-bounce h-2 w-2 bg-gray-400 rounded-full delay-300"></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-2 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded p-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your medical question..."
            disabled={isLoading}
          />
          <button
            className={`px-4 py-2 rounded text-white ${
              isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Not a substitute for professional medical advice. Consult a doctor for diagnosis and treatment.
        </p>
      </div>
    </div>
  );
}