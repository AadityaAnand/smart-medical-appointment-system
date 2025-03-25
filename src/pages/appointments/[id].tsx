// src/pages/appointments/[id].tsx
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function AppointmentDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  
  const [appointment, setAppointment] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }

    const fetchAppointmentDetails = async () => {
      if (!id) return;
      
      try {
        const res = await fetch(`/api/appointments/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch appointment");
        }
        const data = await res.json();
        setAppointment(data);
        
        // Check if there's a prescription
        const presRes = await fetch(`/api/prescriptions?appointmentId=${id}`);
        if (presRes.ok) {
          const presData = await presRes.json();
          if (presData) {
            setPrescription(presData);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load appointment details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (session && id) {
      fetchAppointmentDetails();
    }
  }, [session, status, router, id]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update appointment");
      }
      
      // Refresh data
      const updatedAppointment = await res.json();
      setAppointment(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      setError("Failed to update appointment status. Please try again.");
    }
  };

  if (status === "loading" || isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!session) {
    return <div className="p-4 text-center">Please sign in to view appointment details.</div>;
  }

  if (error) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
        <Link href="/dashboard">
          <a className="text-blue-500 hover:underline">Back to Dashboard</a>
        </Link>
      </div>
    );
  }

  if (!appointment) {
    return <div className="p-4 text-center">Appointment not found.</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Appointment Details</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Information</h2>
            <span className={`px-2 py-1 text-xs rounded-full ${
              appointment.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
              appointment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
              appointment.status === "CANCELLED" ? "bg-red-100 text-red-800" :
              appointment.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {appointment.status}
            </span>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Patient</p>
              <p className="font-medium">{appointment.patient.name || appointment.patient.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Doctor</p>
              <p className="font-medium">{appointment.doctor.name || appointment.doctor.email}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Date & Time</p>
            <p className="font-medium">{new Date(appointment.scheduledAt).toLocaleString()}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Priority</p>
            <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
              appointment.priority === "HIGH" ? "bg-red-100 text-red-800" :
              appointment.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
              "bg-green-100 text-green-800"
            }`}>
              {appointment.priority} Priority
            </span>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-medium">{new Date(appointment.createdAt).toLocaleString()}</p>
          </div>
        </div>
        
        {session.user.role === "DOCTOR" && appointment.status !== "CANCELLED" && (
          <div className="p-4 bg-gray-50 border-t">
            <h3 className="font-medium mb-2">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {appointment.status !== "CONFIRMED" && (
                <button
                  onClick={() => handleUpdateStatus("CONFIRMED")}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Confirm Appointment
                </button>
              )}
              
              {(appointment.status === "CONFIRMED" || appointment.status === "PENDING") && (
                <button
                  onClick={() => handleUpdateStatus("COMPLETED")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Mark as Completed
                </button>
              )}
              
              {appointment.status !== "CANCELLED" && (
                <button
                  onClick={() => handleUpdateStatus("CANCELLED")}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {prescription ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-4 border-b bg-green-50">
            <h2 className="font-semibold">Prescription</h2>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600">Medication</p>
              <p className="font-medium">{prescription.medication}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dosage</p>
              <p className="font-medium">{prescription.dosage}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Instructions</p>
              <p className="font-medium">{prescription.instructions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prescribed On</p>
              <p className="font-medium">{new Date(prescription.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      ) : session.user.role === "DOCTOR" && appointment.status === "CONFIRMED" ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Prescription</h2>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-4">No prescription has been created for this appointment yet.</p>
            <Link href={`/prescriptions/create?appointmentId=${appointment.id}`}>
              <a className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded inline-block">
                Create Prescription
              </a>
            </Link>
          </div>
        </div>
      ) : null}
      
      <div className="flex justify-between">
        <Link href="/dashboard">
          <a className="text-blue-500 hover:text-blue-700">
            Back to Dashboard
          </a>
        </Link>
        
        {session.user.role === "PATIENT" && appointment.status === "PENDING" && (
          <Link href={`/payments/checkout?appointmentId=${appointment.id}`}>
            <a className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
              Pay Now
            </a>
          </Link>
        )}
      </div>
    </div>
  );
}