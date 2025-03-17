import BillHistoryItem from "@/components/BillHistoryItem";
import TestItem from "@/components/TestItem";

export default function History() {
    return (
        <>
            <div className="w-full min-h-screen bg-[#1B1F2B] flex flex-col pt-5">
                <div className="w-full px-4">
                    <h1 className="text-5xl font-bold text-white text-center pb-10">HISTORY</h1>
                    <TestItem />
                </div>
            </div>
        </>
    );
}
