import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export const runtime = "nodejs";

export default function SignInPage() {
  return (
    <div>
      <h1>BillSplit</h1>
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            forceRedirectUrl="/onboarding"
          />
    </div>
  );
}
