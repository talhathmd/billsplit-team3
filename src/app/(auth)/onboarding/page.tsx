import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AccountProfile from "@/components/forms/AccountProfile";

export const runtime = "edge";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) return null; // Handle unauthorized access

  const userEmail = user?.emailAddresses[0]?.emailAddress;

  // Render onboarding form or content here
  const userData = {
    id: user.id,
    email: userEmail,
    name: "", // Placeholder for name input
    phone: "", // Placeholder for phone input
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
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
