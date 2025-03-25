import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            MedScheduler
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="hover:text-blue-200 transition-colors">
              Home
            </Link>
            <Link href="/about" className="hover:text-blue-200 transition-colors">
              About
            </Link>
            <Link href="/doctors" className="hover:text-blue-200 transition-colors">
              Doctors
            </Link>
            <Link href="/services" className="hover:text-blue-200 transition-colors">
              Services
            </Link>
            <Link href="/contact" className="hover:text-blue-200 transition-colors">
              Contact
            </Link>

            {session ? (
              <div className="relative ml-4 group">
                <button className="flex items-center hover:text-blue-200 transition-colors focus:outline-none">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full mr-2"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center mr-2">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span>{session.user?.name || 'User'}</span>
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link href="/dashboard" className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white">
                    Dashboard
                  </Link>
                  <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white">
                    Profile
                  </Link>
                  {session.user?.role === 'DOCTOR' && (
                    <Link href="/my-patients" className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white">
                      My Patients
                    </Link>
                  )}
                  {session.user?.role === 'PATIENT' && (
                    <Link href="/my-appointments" className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white">
                      My Appointments
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <Link href="/" className="block py-2 hover:text-blue-200 transition-colors">
              Home
            </Link>
            <Link href="/about" className="block py-2 hover:text-blue-200 transition-colors">
              About
            </Link>
            <Link href="/doctors" className="block py-2 hover:text-blue-200 transition-colors">
              Doctors
            </Link>
            <Link href="/services" className="block py-2 hover:text-blue-200 transition-colors">
              Services
            </Link>
            <Link href="/contact" className="block py-2 hover:text-blue-200 transition-colors">
              Contact
            </Link>

            {session ? (
              <>
                <div className="border-t border-blue-500 my-2"></div>
                <div className="flex items-center py-2">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full mr-2"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center mr-2">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span>{session.user?.name || 'User'}</span>
                </div>
                <Link href="/dashboard" className="block py-2 hover:text-blue-200 transition-colors">
                  Dashboard
                </Link>
                <Link href="/profile" className="block py-2 hover:text-blue-200 transition-colors">
                  Profile
                </Link>
                {session.user?.role === 'DOCTOR' && (
                  <Link href="/my-patients" className="block py-2 hover:text-blue-200 transition-colors">
                    My Patients
                  </Link>
                )}
                {session.user?.role === 'PATIENT' && (
                  <Link href="/my-appointments" className="block py-2 hover:text-blue-200 transition-colors">
                    My Appointments
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left py-2 hover:text-blue-200 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="block mt-2 bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;