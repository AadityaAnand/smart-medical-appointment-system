import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-yellow-500 p-6 text-center">
          <div className="text-white text-6xl mb-4">!</div>
          <h2 className="text-2xl font-bold text-white">Payment Cancelled</h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Your payment process was cancelled. Your appointment has not been confirmed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard">
              <a className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded text-center transition-colors">
                Back to Dashboard
              </a>
            </Link>
            <Link href="/appointments">
              <a className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center transition-colors">
                Try Again
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}