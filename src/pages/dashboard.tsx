
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Chatbot from "../components/Chatbot";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;

    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/appointments");
        if (!res.ok) {
          throw new Error("Failed to fetch appointments");
        }
        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load appointments. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [session]);

  if (status === "loading") {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">Please sign in to access your dashboard.</p>
        <Link href="/">
          <a className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            Go to Home
          </a>
        </Link>
      </div>
    );
  }


  const now = new Date();
  const filteredAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.scheduledAt);
    if (activeTab === "upcoming") {
      return apptDate >= now && appt.status !== "CANCELLED";
    } else if (activeTab === "past") {
      return apptDate < now || appt.status === "COMPLETED";
    } else if (activeTab === "cancelled") {
      return appt.status === "CANCELLED";
    }
    return true;
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {session.user.name || session.user.email}</h1>
          <p className="text-gray-600">Role: {session.user.role}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Link href="/appointments">
            <a className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
              Book Appointment
            </a>
          </Link>
          
          {session.user.role === "DOCTOR" && (
            <Link href="/prescriptions">
              <a className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                Create Prescription
              </a>
            </Link>
          )}
          
          {session.user.role === "ADMIN" && (
            <Link href="/admin">
              <a className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded">
                Admin Panel
              </a>
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "upcoming"
                    ? "text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Upcoming Appointments
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "past"
                    ? "text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Past Appointments
              </button>
              <button
                onClick={() => setActiveTab("cancelled")}
                className={`py-3 px-4 text-sm font-medium ${
                  activeTab === "cancelled"
                    ? "text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Cancelled
              </button>
            </div>
            
            <div className="p-4">
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
              )}
              
              {isLoading ? (
                <div className="text-center py-8">Loading appointments...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {activeTab} appointments found.
                  {activeTab === "upcoming" && (
                    <div className="mt-2">
                      <Link href="/appointments">
                        <a className="text-blue-500 hover:underline">Book a new appointment</a>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAppointments.map((appt) => (
                    <div key={appt.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">
                          {session.user.role === "PATIENT"
                            ? `Dr. ${appt.doctor.name || appt.doctor.email}`
                            : `Patient: ${appt.patient.name || appt.patient.email}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(appt.scheduledAt).toLocaleString()}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appt.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                            appt.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                            appt.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {appt.status}
                          </span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            appt.priority === "HIGH" ? "bg-red-100 text-red-800" :
                            appt.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {appt.priority} Priority
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                        <Link href={`/appointments/${appt.id}`}>
                          <a className="text-blue-500 hover:text-blue-700">
                            View Details
                          </a>
                        </Link>
                        
                        {session.user.role === "DOCTOR" && appt.status === "CONFIRMED" && (
                          <Link href={`/prescriptions/create?appointmentId=${appt.id}`}>
                            <a className="text-green-500 hover:text-green-700 ml-4">
                              Create Prescription
                            </a>
                          </Link>
                        )}
                        
                        {session.user.role === "PATIENT" && appt.status === "PENDING" && (
                          <Link href={`/payments/checkout?appointmentId=${appt.id}`}>
                            <a className="text-green-500 hover:text-green-700 ml-4">
                              Pay Now
                            </a>
                          </Link>
                        )}
                        
                        {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                          <button 
                            className="text-red-500 hover:text-red-700 ml-4"
                            onClick={() => handleCancelAppointment(appt.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Quick Stats</h2>
            </div>
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Upcoming Appointments</span>
                <span className="font-medium">{appointments.filter(a => new Date(a.scheduledAt) >= now && a.status !== "CANCELLED").length}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Completed Appointments</span>
                <span className="font-medium">{appointments.filter(a => a.status === "COMPLETED").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Payments</span>
                <span className="font-medium">{appointments.filter(a => a.status === "PENDING").length}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Medical Assistant</h2>
            </div>
            <div className="p-4">
              <Chatbot />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


async function handleCancelAppointment(appointmentId) {
  if (!confirm("Are you sure you want to cancel this appointment?")) {
    return;
  }
  
  try {
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    
    if (!res.ok) {
      throw new Error("Failed to cancel appointment");
    }
  
    window.location.reload();
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    alert("Error cancelling appointment. Please try again.");
  }
}