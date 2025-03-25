
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { appointmentId } = router.query;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }

    const fetchAppointment = async () => {
      if (!appointmentId) return;
      
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch appointment");
        }
        const data = await res.json();
        setAppointment(data);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load appointment details. Please try again later.");
      }
    };

    if (session && appointmentId) {
      fetchAppointment();
    }
  }, [session, status, router, appointmentId]);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create checkout session");
      }
      
      const data = await res.json();
      

      window.location.href = data.url;
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error processing payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || !appointment) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!session) {
    return <div className="p-4 text-center">Please sign in to continue.</div>;
  }

  const getPriceByPriority = (priority) => {
    switch (priority) {
      case "HIGH": return "$150.00";
      case "MEDIUM": return "$100.00";
      default: return "$50.00";
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Appointment Payment</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Appointment Details</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Doctor:</span>
            <span className="font-medium">{appointment.doctor.name || appointment.doctor.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time:</span>
            <span className="font-medium">{new Date(appointment.scheduledAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${
              appointment.status === "CONFIRMED" ? "text-green-600" :
              appointment.status === "PENDING" ? "text-yellow-600" :
              "text-gray-600"
            }`}>{appointment.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Priority:</span>
            <span className={`font-medium ${
              appointment.priority === "HIGH" ? "text-red-600" :
              appointment.priority === "MEDIUM" ? "text-yellow-600" :
              "text-green-600"
            }`}>{appointment.priority}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Payment Summary</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Consultation Fee:</span>
            <span className="font-medium">{getPriceByPriority(appointment.priority)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-semibold">Total:</span>
            <span className="font-semibold">{getPriceByPriority(appointment.priority)}</span>
          </div>
          <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600 mb-4">
            By proceeding with payment, you agree to our terms of service and cancellation policy.
          </p>
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded text-white ${
              isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}