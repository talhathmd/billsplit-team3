import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export const runtime = "edge";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#1B1F2B]">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Section: Logo and Welcome Message */}
        <div className="flex flex-col justify-center items-start p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-500 rounded flex items-center justify-center text-white text-2xl font-bold">
              B
            </div>
            <h2 className="text-3xl font-bold text-gray-100">BillSplit</h2>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-100 mb-4">
            Split Bills with Friends, <span className="text-teal-400">Effortlessly</span>
          </h1>
          <p className="text-lg text-gray-400">
            Simply snap a photo of your receipt, let our AI extract the items, 
            and easily split costs with your friends. No more calculator needed, 
            no more awkward money conversations.
          </p>
        </div>

        {/* Right Section: Sign Up Form */}
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-3xl font-semibold text-teal-400 mb-6 text-center">
            Create Account
          </h2>

          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            afterSignUpUrl="/dashboard"
          />
          <p className="mt-6 text-sm text-center text-gray-400">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-teal-400 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-teal-400 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      {/* Background Accent Blob - Bottom */}
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-40 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative right-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a5d6a7] to-[#ffa726] opacity-10"
          />
        </div>
      </div>
    </div>
  );
}
