import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [doctorId, setDoctorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [existingConditions, setExistingConditions] = useState("");
  const [priority, setPriority] = useState("");
  const handleCheckPriority = async () => {
    const symptomList = symptoms.split(",").map((s) => s.trim());
    const conditionList = existingConditions.split(",").map((c) => c.trim());
    const age = Number(patientAge);
    const res = await fetch("/api/ai/priority", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: symptomList, patientAge: age, existingConditions: conditionList }),
    });

    const data = await res.json();
    if (res.ok) {
      setPriority(data.priority);
      setMessage(`Priority determined: ${data.priority}`);
    } else {
      setMessage(data.message || "Error determining priority");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, scheduledAt, priority }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Appointment created successfully!");
      router.push("/dashboard");
    } else {
      setMessage(data.message || "Error creating appointment");
    }
  };

  if (!session) return <p>Please sign in to book an appointment.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Book an Appointment (with Priority Check)</h1>
      {message && <p className="my-2 text-red-500">{message}</p>}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block mb-1">Doctor ID</label>
          <input
            type="text"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Scheduled At</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Symptoms (comma-separated)</label>
          <input
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Patient Age</label>
          <input
            type="number"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Existing Conditions (comma-separated)</label>
          <input
            type="text"
            value={existingConditions}
            onChange={(e) => setExistingConditions(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCheckPriority}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Check Priority
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Book Appointment
          </button>
        </div>
      </form>

      {priority && (
        <p className="mt-2">
          Determined Priority: <strong>{priority}</strong>
        </p>
      )}
    </div>
  );
}