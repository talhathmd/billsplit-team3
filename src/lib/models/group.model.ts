import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // name of group
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // owner of group
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }], // list of contacts in group
    },
    { timestamps: true }
);

const Group = mongoose.models.Group || mongoose.model("Group", GroupSchema);
export default Group;