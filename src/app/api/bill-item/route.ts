import { NextResponse } from "/next/server";
import mongoose from "mongoose";
import billItem from "@/lib/models/items.model";

const connectToDB =async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URL || "");
};


// get bill item data from db
export async function GET(req: Request) {
    try {
        await connectToDB();

        const url = new URL(req.url);
        const billID = url.searchParams.get("billId");

        let items;

        if (billID) {
            items = await billItem.find({ bill: billID }).populate("bill assignedTo");
        } else {
            items = await billItem.find().populate("bill assignedTo");
        }

        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching bill items"} , { status: 500 });
    }
}

// add bill item data to db
export async function POST(req: Request) {
    try {
        await connectToDB();

        const { billID, name, price, assignedTo } = await req.json();

        const newItem = new billItem({
            bill: billID,
            name,
            price,
            assignedTo
        });

        await newItem.save();

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Error creating bill item" }, { status: 500 });
    }
}