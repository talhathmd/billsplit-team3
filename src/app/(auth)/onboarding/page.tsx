import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import AccountProfile from "@/components/forms/AccountProfile";


export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) return null; // Handle unauthorized access

  const userEmail = user?.emailAddresses[0]?.emailAddress;

  // Connect to DB and ensure User model works
  await connectToDB();
  const existingUser = await User.findOne({ email: userEmail });

  if (existingUser?.onboarded) {
    redirect("/dashboard");
  }

  const userData = {
    id: user.id,
    email: userEmail,
    name: user.fullName || "", 
    phone: "",
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20 bg-white">
      <h1 className="text-heading2-bold text-light-1">Onboarding</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Complete your profile to use your account.
      </p>
      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}
