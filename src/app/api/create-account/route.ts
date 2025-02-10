import { currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/users.model";

export async function GET() {
  try {
    await connectToDB();
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists
    let user = await User.findOne({ clerkId: clerkUser.id });

    // If new user, create in MongoDB
    if (!user) {
      user = await User.create({
        clerkId: clerkUser.id,
        name: clerkUser.firstName,
        email: clerkUser.emailAddresses[0]?.emailAddress,
      });
    }

    return Response.json(user);
  } catch (error) {
    return Response.json({ error: "Error fetching user" }, { status: 500 });
  }
}
