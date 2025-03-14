import { useState } from "react";
import { useSession } from "next-auth/react";

export default function AiPage() {
  const { data: session } = useSession();
  const [symptoms, setSymptoms] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const symptomList = symptoms.split(",").map((s) => s.trim());

    const res = await fetch("/api/ai/recommendation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: symptomList }),
    });
    const data = await res.json();
    if (res.ok) {
      setRecommendation(`Recommended specialty: ${data.recommendedSpecialty}`);
    } else {
      setRecommendation(data.message || "Error generating recommendation");
    }
  };

  if (!session) return <p>Please sign in to use recommendations.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Symptom-Based Doctor Recommendation</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <label className="block mb-2">Enter your symptoms (comma-separated):</label>
        <input
          type="text"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Get Recommendation
        </button>
      </form>
      {recommendation && <p className="mt-4">{recommendation}</p>}
    </div>
  );
}