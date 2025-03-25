import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

interface Doctor {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
}

export default function DoctorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }

    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors");
        if (!res.ok) {
          throw new Error("Failed to fetch doctors");
        }
        const data = await res.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchDoctors();
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!session) {
    return <div className="p-4 text-center">Please sign in to view doctors.</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Our Medical Professionals</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      
      {isLoading ? (
        <div className="text-center py-8">Loading doctors...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No doctors found.</p>
          ) : (
            doctors.map((doctor) => (
              <div key={doctor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {doctor.image ? (
                      <img src={doctor.image} alt={doctor.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg">{doctor.name || "Doctor"}</h3>
                    <p className="text-sm text-gray-600">{doctor.email}</p>
                  </div>
                </div>
                
                <Link href={`/appointments?doctorId=${doctor.id}`}>
                  <a className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition-colors">
                    Book Appointment
                  </a>
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}