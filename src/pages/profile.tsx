import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }

    if (session) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setRole(session.user.role || "");
      setIsLoading(false);
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      // Update session data (in a real app, you might need to refresh the session)
      // This is a simplified approach
      if (session) {
        session.user.name = name;
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Error updating profile" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <Layout title="Profile | Smart Medical System">
        <div className="p-4 text-center">Loading...</div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout title="Profile | Smart Medical System">
        <div className="p-4 text-center">Please sign in to view your profile.</div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile | Smart Medical System">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        
        {message.text && (
          <div className={`p-4 rounded mb-6 ${
            message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update your account information and preferences.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed as it is associated with your account authentication.
              </p>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                type="text"
                id="role"
                value={role}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
              />
              <p className="mt-1 text-sm text-gray-500">
                To change your role, please contact an administrator.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`px-4 py-2 rounded-md text-white ${
                  isSaving ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
        
        {/* Security Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg font-medium text-gray-900">Security</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your security settings.
            </p>
          </div>
          
          <div className="p-4 sm:p-6">
            <p className="text-sm text-gray-700 mb-4">
              Your account is secured through your Google authentication provider.
            </p>
            
            <Link href="/api/auth/signout">
              <a className="text-red-600 hover:text-red-800 font-medium">
                Sign out of all devices
              </a>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}