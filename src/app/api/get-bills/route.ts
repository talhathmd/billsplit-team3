import { NextResponse } from "next/server";
import mongoose from "mongoose";
import billsModel from "@/lib/models/bills.model";

const connectToDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URL || "");
};

export async function GET() {
    try {
        await connectToDB();
        const bills = await billsModel.find();
        return NextResponse.json(bills, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching bills" }, { status: 500 });
    }
}
