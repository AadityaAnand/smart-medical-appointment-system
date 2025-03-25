// src/components/Layout.tsx
import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = "Smart Medical System" }: LayoutProps) {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Smart Medical Appointment System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        {/* Header/Navbar */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/">
                  <a className="flex-shrink-0 flex items-center">
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="ml-2 font-bold text-gray-900">MediSmart</span>
                  </a>
                </Link>
                
                {session && (
                  <nav className="hidden md:ml-6 md:flex md:space-x-4">
                    <Link href="/dashboard">
                      <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100">
                        Dashboard
                      </a>
                    </Link>
                    <Link href="/appointments">
                      <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100">
                        Appointments
                      </a>
                    </Link>
                    <Link href="/doctors">
                      <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100">
                        Doctors
                      </a>
                    </Link>
                    
                    {session.user.role === "DOCTOR" && (
                      <Link href="/prescriptions">
                        <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100">
                          Prescriptions
                        </a>
                      </Link>
                    )}
                    
                    {session.user.role === "ADMIN" && (
                      <Link href="/admin">
                        <a className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100">
                          Admin
                        </a>
                      </Link>
                    )}
                  </nav>
                )}
              </div>
              
              <div className="flex items-center">
                {session ? (
                  <div className="ml-3 relative group">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                        {session.user.name ? session.user.name[0] : "U"}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                        {session.user.name || session.user.email}
                      </span>
                      <svg className="ml-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
      
                      <Link href="/profile">
                        <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Your Profile
                        </a>
                      </Link>
                      
                      <Link href="/medical-history">
                        <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Medical History
                        </a>
                      </Link>
                      
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Link href="/api/auth/signin">
                      <a className="text-blue-600 hover:text-blue-800 font-medium">
                        Sign In
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        {session && (
          <div className="md:hidden bg-gray-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between overflow-x-auto py-3 space-x-4">
                <Link href="/dashboard">
                  <a className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    Dashboard
                  </a>
                </Link>
                <Link href="/appointments">
                  <a className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    Appointments
                  </a>
                </Link>
                <Link href="/doctors">
                  <a className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    Doctors
                  </a>
                </Link>
                
                {session.user.role === "DOCTOR" && (
                  <Link href="/prescriptions">
                    <a className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      Prescriptions
                    </a>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 bg-gray-50">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Smart Medical System. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}