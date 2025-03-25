import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        content: 'Hello! I\'m your medical assistant. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    const userMessageObj: ChatMessage = {
      id: generateUniqueId(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessageObj]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Error processing your request');
      }
      
      const botMessage: ChatMessage = {
        id: generateUniqueId(),
        type: 'bot',
        content: data.botReply,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      const errorMessage: ChatMessage = {
        id: generateUniqueId(),
        type: 'bot',
        content: 'Sorry, I encountered a problem. Please try again later.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
              msg.type === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div 
              className={`p-3 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white border rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
            <div 
              className={`text-xs mt-1 ${
                msg.type === 'user' ? 'text-right' : 'text-left'
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
              isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Not a substitute for professional medical advice. Consult a doctor for diagnosis and treatment.
        </p>
      </div>
    </div>
  );
};

export default Chatbot;