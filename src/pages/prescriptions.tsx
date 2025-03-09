import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PrescriptionsPage() {
  const { data: session } = useSession();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [appointmentId, setAppointmentId] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session && session.user.role === "DOCTOR") {
      fetch("/api/prescriptions")
        .then((res) => res.json())
        .then((data) => setPrescriptions(data))
        .catch((err) => console.error(err));
    }
  }, [session]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, medication, dosage, instructions }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Prescription created successfully!");
      // Refresh list
      fetch("/api/prescriptions")
        .then((res) => res.json())
        .then((data) => setPrescriptions(data));
    } else {
      setMessage(data.message || "Error creating prescription");
    }
  };

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/prescriptions?appointmentId=${appointmentId}`);
    const data = await res.json();
    setPrescriptions(data ? [data] : []);
  };

  if (!session) return <p>Please sign in to view prescriptions.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Prescriptions</h1>
      {session.user.role === "DOCTOR" ? (
        <>
          <form onSubmit={handleCreate} className="mb-4">
            <div className="mb-2">
              <label className="block">Appointment ID</label>
              <input
                type="text"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-2">
              <label className="block">Medication</label>
              <input
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-2">
              <label className="block">Dosage</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-2">
              <label className="block">Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="border p-2 w-full"
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Create Prescription
            </button>
          </form>
          {message && <p>{message}</p>}
          <h2 className="text-xl font-semibold mt-4">All Prescriptions</h2>
          <ul>
            {prescriptions.map((p) => (
              <li key={p.id} className="border p-2 my-2">
                <p>Appointment ID: {p.appointmentId}</p>
                <p>Medication: {p.medication}</p>
                <p>Dosage: {p.dosage}</p>
                <p>Instructions: {p.instructions}</p>
                <p>Created on: {new Date(p.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold">View Prescription by Appointment ID</h2>
          <form onSubmit={handleFetch}>
            <input
              type="text"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              className="border p-2 w-full"
              placeholder="Enter Appointment ID"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">
              Fetch Prescription
            </button>
          </form>
          <ul>
            {prescriptions.length > 0 ? (
              prescriptions.map((p) => (
                <li key={p.id} className="border p-2 my-2">
                  <p>Appointment ID: {p.appointmentId}</p>
                  <p>Medication: {p.medication}</p>
                  <p>Dosage: {p.dosage}</p>
                  <p>Instructions: {p.instructions}</p>
                  <p>Created on: {new Date(p.createdAt).toLocaleString()}</p>
                </li>
              ))
            ) : (
              <p>No prescription found.</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
}