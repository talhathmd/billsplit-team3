import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import { currentUser } from "@/clerk/nextjs/server";
import Group from "@/lib/models/group.model";
import User from "@/lib/models/user.model";

export async function POST(req: Request) {
    try {
        await connectToDB();
        const clerkUser= await currentUser();   // get current user fron clerk

        if (!clerkUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const 
    }
}