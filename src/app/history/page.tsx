'use client';

import BillHistoryItem from "@/components/BillHistoryItem";
import BackButton from '@/components/BackButton';

export default function History() {
    return (
        <>
            <BackButton />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-emerald-600 pl-12">Bill History</h1>
                <div className="bg-white rounded-lg shadow-lg">
                    <BillHistoryItem />
                </div>
            </div>
        </>
    );
}
