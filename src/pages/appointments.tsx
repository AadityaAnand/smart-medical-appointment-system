import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AppointmentsPage(){
    const {data: session} = useSession();
    const router = useRouter();
    const [doctorId, setDoctorId] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent)=>{
        e.preventDefault();
        const res = await fetch("/api/appointments",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({doctorId, scheduledAt}),
        });
        const data = await res.json();
        if(res.ok){
            setMessage("Appointment created successfully!");
            router.push("/dashboard");
        } else{
            setMessage(data.message||"Error creating appointment");
        }
    };

    if (!session) return <p>Please sign in to book an appointment</p>;

    return(
        <div className="p-4">
            <h1 className="text-2xl font-bold">Book an Appointment</h1>
            {message && <p>{message}</p>}
            <form onSubmit = {handleSubmit} className="mt-4">
                <div className="mb-4">
                    <label className="block mb-1">Doctor ID</label>
                    <input
                    type="text"
                    value={doctorId}
                    onChange={(e)=> setDoctorId(e.target.value)}
                    className="border p-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Scheduled At</label>
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e)=> setScheduledAt(e.target.value)}
                    className="border p-2 w-full"
                    /> 
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded"> Book Appointment</button>
            </form>
        </div>
    );
}