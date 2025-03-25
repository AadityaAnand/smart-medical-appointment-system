
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("users");
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (session && session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!session || session.user.role !== "ADMIN") {
    return <div className="p-4 text-center">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setTab("users")}
            className={`py-2 px-4 ${
              tab === "users" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setTab("appointments")}
            className={`py-2 px-4 ${
              tab === "appointments" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setTab("stats")}
            className={`py-2 px-4 ${
              tab === "stats" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
            }`}
          >
            Statistics
          </button>
        </div>
      </div>
      
      {tab === "users" && <UserManagement />}
      {tab === "appointments" && <AppointmentManagement />}
      {tab === "stats" && <Statistics />}
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/admin/appointments");
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Appointment Management</h2>
      {isLoading ? (
        <p>Loading appointments...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appt.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.patient.name || appt.patient.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.doctor.name || appt.doctor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(appt.scheduledAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appt.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                      appt.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      appt.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appt.priority === "HIGH" ? "bg-red-100 text-red-800" :
                      appt.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {appt.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Statistics() {

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">System Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">247</p>
          <p className="mt-2 text-sm text-gray-500">15 new users this week</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Appointments</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">583</p>
          <p className="mt-2 text-sm text-gray-500">32 appointments today</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Active Doctors</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">15</p>
          <p className="mt-2 text-sm text-gray-500">2 new doctors this month</p>
        </div>
      </div>
    </div>
  );
}