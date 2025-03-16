// import { connectToDB } from "@/lib/mongoose";
// import User from "@/lib/models/user.model";

// interface Params {
//   userId: string;
//   email: string;
//   username: string;
// }

// export async function updateUser({
//   userId,
//   email,
//   username,
// }: Params): Promise<void> {
//   try {
//     // Ensure DB connection
//     await connectToDB();

//     // Update user or create a new one if it doesn't exist
//     await User.findOneAndUpdate(
//       { userId }, // Use userId as the identifier
//       { email, username },
//       { upsert: true, new: true } // 'new: true' returns the updated document
//     );

//     // console.log("User successfully updated/created");
//   } catch (error: any) {
//     console.error("Failed to create/update user:", error.message);
//     throw new Error(`Failed to create/update user: ${error.message}`);
//   }
// }
