import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState("loading");
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  useEffect(() => {
    if (!session_id) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/payment/verify?session_id=${session_id}`);
        if (!res.ok) {
          throw new Error("Payment verification failed");
        }
        
        const data = await res.json();
        setAppointmentDetails(data.appointment);
        setStatus("success");
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [session_id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Verifying payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">
            We couldn't verify your payment. If you believe this is an error, please contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <a className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded transition-colors">
                Back to Dashboard
              </a>
            </Link>
            <Link href="/contact">
              <a className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors">
                Contact Support
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-500 p-6 text-center">
          <div className="text-white text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Thank you for your payment. Your appointment has been confirmed.
          </p>
          
          {appointmentDetails && (
            <div className="mb-6 border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Appointment Details</h3>
              <p className="text-sm text-gray-600">
                <span className="block mb-1">
                  <strong>Doctor:</strong> {appointmentDetails.doctor.name || "Your Doctor"}
                </span>
                <span className="block mb-1">
                  <strong>Date & Time:</strong> {new Date(appointmentDetails.scheduledAt).toLocaleString()}
                </span>
                <span className="block">
                  <strong>Reference:</strong> #{appointmentDetails.id}
                </span>
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard">
              <a className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded text-center transition-colors">
                Back to Dashboard
              </a>
            </Link>
            <Link href="/appointments">
              <a className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center transition-colors">
                View Appointment
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}