import { useEffect, useState } from "react";
import {useSession} from "next-auth/react";


export default function MedicalHistoryPage(){
    const {data: session} = useSession();
    const [history, setHistory] = useState<any[]>([]);
    const [ description, setDescription] = useState("");
    const [message, setMessage] = useState("");

    useEffect(()=>{
        if(session){
            fetch("/api/medical-history")
                .then((res)=>res.json())
                .then((data)=> setHistory(data))
                .catch((err)=>console.error(err));
        }
    }, [session]);

    const handleSubmit = async(e: React.FormEvent)=>{
        e.preventDefault();
        const res = await fetch("/api/medical-history",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({description}),
        });
        const data = await res.json();
        if(res.ok){
            setMessage("Medical history added successfully!");
            setDescription("");
            fetch("/api/medical-history")
                .then((res)=>res.json())
                .then((data)=>setHistory(data));
        } else{
            setMessage(data.message|| "Error adding medical history");
        }
    };

    if(!session) return <p>Please sign in to view medical history</p>
    return (
        <div className="p-4">
          <h1 className="text-2xl font-bold">Medical History</h1>
          {message && <p>{message}</p>}
          <ul className="my-4">
            {history.length === 0 ? (
              <p>No records found.</p>
            ) : (
              history.map((record) => (
                <li key={record.id} className="border p-2 my-2">
                  <p>{record.description}</p>
                  <p className="text-sm text-gray-500">
                    Recorded on: {new Date(record.createdAt).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>
          <form onSubmit={handleSubmit}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 w-full"
              placeholder="Add new medical history record"
            />
            <button type="submit" className="bg-green-500 text-white px-4 py-2 mt-2 rounded">
              Add Record
            </button>
          </form>
        </div>
      );

}