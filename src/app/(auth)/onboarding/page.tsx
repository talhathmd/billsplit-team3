import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const runtime = "edge";

async function Page() {
  const user = await currentUser();
  if (!user) return null;
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  // If not onboarded, proceed with rendering the onboarding form
  const userData = { id: user.id, email: userEmail };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="text-heading2-bold text-light-1">Onboarding</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Complete your profile.
      </p>
      <section className="mt-9 bg-dark-2 p-10"></section>
    </main>
  );
}

export default Page;
