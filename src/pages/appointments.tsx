import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Priority } from "@prisma/client";

interface PriorityResponse {
  priority: Priority;
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [doctorId, setDoctorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [existingConditions, setExistingConditions] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  
  const handleCheckPriority = async () => {
    if (!symptoms) {
      setMessage("Please enter at least one symptom");
      return;
    }

    setIsLoading(true);
    try {
      const symptomList = symptoms.split(",").map((s) => s.trim());
      const conditionList = existingConditions 
        ? existingConditions.split(",").map((c) => c.trim()) 
        : [];
      const age = Number(patientAge) || 0;
      
      const res = await fetch("/api/ai/priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          symptoms: symptomList, 
          patientAge: age, 
          existingConditions: conditionList 
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to determine priority");
      }

      const data = await res.json() as PriorityResponse;
      setPriority(data.priority);
      setMessage(`Priority determined: ${data.priority}`);
    } catch (error) {
      console.error("Error checking priority:", error);
      setMessage("Error determining priority. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctorId) {
      setMessage("Please enter a doctor ID");
      return;
    }
    
    if (!scheduledAt) {
      setMessage("Please select a date and time");
      return;
    }

    
    if (!priority) {
      await handleCheckPriority();
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          doctorId: parseInt(doctorId), 
          scheduledAt, 
          priority: priority || "LOW" 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create appointment");
      }

      setMessage("Appointment created successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error creating appointment:", error);
      setMessage(error instanceof Error ? error.message : "Error creating appointment");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!session) {
    return <div className="p-4 text-center">Please sign in to book an appointment.</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Doctor ID</label>
          <input
            type="number"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="Enter doctor ID"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Appointment Date & Time</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="border rounded p-2 w-full"
            required
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded border">
          <h2 className="font-semibold mb-2">Priority Assessment</h2>
          <p className="text-sm text-gray-600 mb-3">
            Please provide the following information to help us determine the priority of your appointment.
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Symptoms (comma-separated)</label>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="border rounded p-2 w-full"
                placeholder="E.g., headache, fever, cough"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Your Age</label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="border rounded p-2 w-full"
                placeholder="Age in years"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Existing Conditions (comma-separated)</label>
              <input
                type="text"
                value={existingConditions}
                onChange={(e) => setExistingConditions(e.target.value)}
                className="border rounded p-2 w-full"
                placeholder="E.g., diabetes, hypertension"
              />
            </div>
            
            <button
              type="button"
              onClick={handleCheckPriority}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Check Priority"}
            </button>
          </div>
        </div>
        
        {priority && (
          <div className="bg-blue-50 p-3 rounded">
            <p className="font-medium">
              Determined Priority: <span className={`font-bold ${
                priority === "HIGH" ? "text-red-600" : 
                priority === "MEDIUM" ? "text-yellow-600" : 
                "text-green-600"
              }`}>{priority}</span>
            </p>
          </div>
        )}
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}