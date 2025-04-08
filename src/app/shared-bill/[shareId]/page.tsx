'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { IoPerson } from "react-icons/io5";
import { useParams } from 'next/navigation';

interface SharedBill {
    storeName: string;
    date: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        sharedWith: number;
    }[];
    subtotal: number;
    taxShare: number;
    total: number;
    contactName: string;
}

export default function SharedBillPage() {
    const params = useParams();
    const shareId = params?.shareId as string;
    
    const [bill, setBill] = useState<SharedBill | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBill = async () => {
            if (!shareId) return;
            
            try {
                const response = await fetch(`/api/get-shared-bill/${shareId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch bill');
                }
                const data = await response.json();
                setBill(data);
            } catch (error) {
                setError('Failed to load bill details');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBill();
    }, [shareId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error || !bill) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Error</h1>
                    <p className="text-gray-600">{error || 'Bill not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <Card className="bg-white p-6 shadow-lg rounded-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <IoPerson className="w-6 h-6 text-emerald-500" />
                        <h1 className="text-2xl font-bold">{bill.contactName}'s Bill</h1>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold">{bill.storeName}</h2>
                        <p className="text-gray-600">{new Date(bill.date).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-4">
                        {bill.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start py-2 border-b">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    {item.sharedWith > 1 && (
                                        <p className="text-sm text-gray-500">
                                            (Shared with {item.sharedWith - 1} other{item.sharedWith > 2 ? 's' : ''})
                                        </p>
                                    )}
                                </div>
                                <p className="font-medium">${item.price.toFixed(2)}</p>
                            </div>
                        ))}

                        <div className="pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${bill.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax Share</span>
                                <span>${bill.taxShare.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>${bill.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
} 