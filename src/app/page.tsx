import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white w-full px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-emerald-600">BillSplit</div>
        <SignedOut>
          <SignInButton>
            <button className="px-6 py-2 text-emerald-600 hover:text-emerald-700 border-2 border-emerald-600 rounded hover:border-emerald-700">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <section>
          {/* Button for logged-out users */}
          <SignedOut>
            <SignInButton>
              <button className="mt-5 py-3 px-6 text-emerald-600 border-2 border-emerald-600 rounded-lg text-lg font-semibold hover:text-emerald-700 hover:border-emerald-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center">
                Get Started
              </button>
            </SignInButton>
          </SignedOut>

          {/* Button for logged-in users */}
          <SignedIn>
            <Link href="/dashboard" passHref>
              <div className="w-full mx-auto">
                <button className="mx-auto mt-5 py-3 px-6 text-emerald-600 border-2 border-emerald-600 rounded-lg text-lg font-semibold hover:text-emerald-700 hover:border-emerald-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center">
                  Dashboard
                </button>
              </div>
            </Link>
          </SignedIn>
        </section>
      </MaxWidthWrapper>
    </div>
  );
}
