import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      {/* Protect Page - Redirect if Not Signed In */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-emerald-600">Dashboard</h1>
            <UserButton />
          </div>

          {/* Navigation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DashboardCard title="New Split" link="/dashboard/new-split" />
            <DashboardCard title="History" link="/dashboard/history" />
            <DashboardCard title="Received" link="/dashboard/received" />
            <DashboardCard title="Settings" link="/dashboard/settings" />
          </div>
        </div>
      </SignedIn>
    </main>
  );
}

/* Reusable Card Component */
function DashboardCard({ title, link }: { title: string; link: string }) {
  return (
    <Link href={link} className="block">
      <div className="p-5 bg-emerald-600 text-white rounded-lg shadow-md text-center font-semibold hover:bg-emerald-700 transition-all">
        {title}
      </div>
    </Link>
  );
}
