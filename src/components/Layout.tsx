import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireAuth?: boolean;
  allowedRoles?: string[];
};

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Smart Medical Scheduler',
  description = 'Book appointments with doctors and manage your medical needs',
  requireAuth = false,
  allowedRoles = [],
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  
  React.useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + router.asPath);
    }
    
    
    if (
      requireAuth &&
      status === 'authenticated' &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(session?.user?.role || '')
    ) {
      router.push('/unauthorized');
    }
  }, [requireAuth, router, status, allowedRoles, session]);

  if (requireAuth && status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Layout;