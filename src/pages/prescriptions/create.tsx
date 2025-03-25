import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function CreatePrescriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { appointmentId } = router.query;
  
  const [appointment, setAppointment] = useState(null);
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    
    if (session && session.user.role !== "DOCTOR") {
      router.push("/dashboard");
    }

    const fetchAppointmentDetails = async () => {
      if (!appointmentId) return;
      
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch appointment");
        }
        const data = await res.json();
        setAppointment(data);
        
        // Check if there's already a prescription
        const presRes = await fetch(`/api/prescriptions?appointmentId=${appointmentId}`);
        if (presRes.ok) {
          const presData = await presRes.json();
          if (presData) {
            // Redirect to view page as prescription already exists
            router.push(`/appointments/${appointmentId}`);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load appointment details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (session && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [session, status, router, appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");
    
    try {
      if (!medication || !dosage || !instructions) {
        throw new Error("Please fill all required fields");
      }
      
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          medication,
          dosage,
          instructions,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create prescription");
      }
      
      setSuccess("Prescription created successfully!");
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/appointments/${appointmentId}`);
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error creating prescription");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!session || session.user.role !== "DOCTOR") {
    return <div className="p-4 text-center">Only doctors can access this page.</div>;
  }

  if (!appointment) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          Appointment not found or you don't have permission to access it.
        </div>
        <Link href="/dashboard">
          <a className="text-blue-500 hover:underline">Back to Dashboard</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Prescription</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{success}</div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Appointment Information</h2>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-sm text-gray-600">Patient</p>
            <p className="font-medium">{appointment.patient.name || appointment.patient.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date & Time</p>
            <p className="font-medium">{new Date(appointment.scheduledAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              appointment.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
              appointment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
              appointment.status === "CANCELLED" ? "bg-red-100 text-red-800" :
              "bg-blue-100 text-blue-800"
            }`}>
              {appointment.status}
            </span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Prescription Details</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medication *
            </label>
            <input
              type="text"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Enter medication name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage *
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="E.g., 500mg twice daily"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions *
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border rounded-md p-2"
              rows={4}
              placeholder="Enter detailed instructions for the patient"
              required
            ></textarea>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t flex justify-between">
          <Link href={`/appointments/${appointmentId}`}>
            <a className="text-gray-600 hover:text-gray-800">
              Cancel
            </a>
          </Link>
          
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 rounded text-white ${
              isSaving ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isSaving ? "Saving..." : "Create Prescription"}
          </button>
        </div>
      </form>
    </div>
  );
}