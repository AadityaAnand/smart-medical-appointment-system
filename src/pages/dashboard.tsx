import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>You are not signed in.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome, {session.user?.name}</h1>
      <p>Your role: {session.user?.role}</p>
    </div>
  );
}