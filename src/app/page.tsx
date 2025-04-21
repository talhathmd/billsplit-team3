import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const runtime = "nodejs";


export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col font-sans overflow-y-auto bg-white">
      {/* Main Content */}
      <div className="relative z-10 flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow-lg w-full px-8 py-4 flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold">B</div>
            <h1 className="text-2xl font-bold text-gray">BillSplit</h1>
          </div>
          <div>
            <SignedOut>
              <SignInButton>
                <Button className="px-6 py-2 bg-transparent border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-600/10 transition-colors duration-200">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center text-center py-24 px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-semibold text-gray leading-tight mb-6">
              Split Bills <span className="text-emerald-500">Effortlessly</span> with Friends
            </h1>

            <p className="text-gray text-xl mb-12 max-w-2xl mx-auto">
              Just snap a photo of your bill, tag your friends, and let us handle the rest. No more awkward calculations or payment chasing.
            </p>

            <div className="space-y-8">
              <div className="flex justify-center space-x-4">
                <SignedOut>
                  <SignInButton>
                    <Button className="py-2.5 px-6 bg-emerald-600 text-white rounded-md font-medium hover:bg-teal-600 transition-colors duration-200">
                      Start Splitting Bills
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/onboarding">
                    <Button 
                      data-tutorial="dashboard-button"
                      className="py-2.5 px-6 bg-emerald-600 text-white rounded-md font-medium hover:bg-teal-600 transition-colors duration-200"
                    >
                      Dashboard
                    </Button>
                  </Link>
                </SignedIn>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-emerald-500 font-semibold mb-2">Scan Bills</h3>
                  <p className="text-gray">Upload a photo of your receipt and our AI will extract all items automatically</p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-emerald-500 font-semibold mb-2">Split Items</h3>
                  <p className="text-gray">Easily assign items to friends and split shared dishes fairly</p>
                </div>
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-emerald-500 font-semibold mb-2">Track Payments</h3>
                  <p className="text-gray">Keep track of who has paid and send friendly reminders automatically</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
