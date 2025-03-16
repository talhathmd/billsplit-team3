import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { FaCamera } from "react-icons/fa";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      {/* Protect Page - Redirect if Not Signed In */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div className="w-full max-w-2xl rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-emerald-600">Dashboard</h1>
            <UserButton />
          </div>

          {/* Navigation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/new-split" className="block">
              <div className="p-5 bg-emerald-600 text-white rounded-lg shadow-md text-center font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2">
                <span>New Split</span>
                <FaCamera />
              </div>
            </Link>
            <Link href="/dashboard/history" className="block">
              <div className="p-5 bg-emerald-600 text-white rounded-lg shadow-md text-center font-semibold hover:bg-emerald-700 transition-all">
                History
              </div>
            </Link>
            <Link href="/dashboard/received" className="block">
              <div className="p-5 bg-emerald-600 text-white rounded-lg shadow-md text-center font-semibold hover:bg-emerald-700 transition-all">
                Received
              </div>
            </Link>
            <Link href="/dashboard/settings" className="block">
              <div className="p-5 bg-emerald-600 text-white rounded-lg shadow-md text-center font-semibold hover:bg-emerald-700 transition-all">
                Settings
              </div>
            </Link>
          </div>
        </div>
      </SignedIn>
    </main>
  );
}
