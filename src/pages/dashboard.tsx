import { data } from "autoprefixer";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard(){
  const {data: session, status} = useSession();
  const [appointments, setAppointments] = useState([]);

  useEffect(()=>{
    if(session){
      fetch("/api/appointments")
        .then((res)=>res.json())
        .then((data)=>setAppointments(data))
        .catch((err)=>console.error(err))
    }
  }, [session]);

  if (status==="loading") return <p>Loading Sessions</p>;
  if(!session) return <p> Please sign in</p>;
  return(
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {session.user.name}. Role: {session.user.role}</p>
      <button onClick={()=> signOut()} className="bg-red-500 text-white px-3 py-1 rounded">
        Sign Out 
      </button>
      <nav className="my-4">
        <Link href="/appointments">
          <a className="mr-4 underline text-blue-500"> Book Appointment</a>
        </Link>
        <Link href="/medical-history">
          <a className="mr-4 underline text-blue-500">Medical History</a>
        </Link>
        <Link href="prescriptions">
          <a className="mr-4 underline text-blue-500">Prescriptions</a>
        </Link>
      </nav>
      <h2 className="text-xl font-semibold">Your Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul>
          {appointments.map((apt: any) => (
            <li key={apt.id} className="border p-2 my-2">
              Appointment with Dr. {apt.doctor?.name} on{" "}
              {new Date(apt.scheduledAt).toLocaleString()} - Status: {apt.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}