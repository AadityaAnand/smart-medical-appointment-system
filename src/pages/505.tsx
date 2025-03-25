import Link from "next/link";
import Layout from "../components/Layout";

export default function Custom500() {
  return (
    <Layout title="Server Error | Smart Medical System">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-9xl font-extrabold text-red-600">500</h1>
          <h2 className="text-3xl font-bold my-4">Server Error</h2>
          <p className="text-gray-600 mb-8">
            Sorry, something went wrong on our end. We're working to fix the issue.
            Please try again later.
          </p>
          <Link href="/">
            <a className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg inline-block">
              Back to Home
            </a>
          </Link>
        </div>
      </div>
    </Layout>
  );
}