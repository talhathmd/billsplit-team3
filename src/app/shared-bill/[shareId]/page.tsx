'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { IoPerson } from "react-icons/io5";
import { useParams } from 'next/navigation';
import { userInfo } from 'os';
import { useUser } from "@clerk/nextjs";
import Contact from "@/lib/models/contact.model";
import { Button } from "@/components/ui/button";
import { IoMdCheckmark } from "react-icons/io";

interface SharedBill {
    storeName: string;
    date: string;
    imageUrl: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        sharedWith: number;
    }[];
    subtotal: number;
    taxShare: number;
    tipShare: number;  // Added tipShare
    total: number;
    contactName: string;
    contactId: string ,
    isCurrentUser?: boolean,
    isMyBill: boolean;
    paymentStatus: string;
}

export default function SharedBillPage() {
    const { user } = useUser();
    const params = useParams();
    const shareId = params?.shareId as string;

    const [bill, setBill] = useState<SharedBill | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string>('pending');

    useEffect(() => {
        const fetchBill = async () => {
            if (!shareId) return;
            
            try {
                const response = await fetch(`/api/get-shared-bill/${shareId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch bill');
                }
                const data = await response.json();
                console.log("API response:", data); // Add this to see what's returned
                console.log("isCurrentUser in response:", data.isCurrentUser);
                setBill(data);
                setPaymentStatus(data.paymentStatus || 'pending');
            } catch (error) {
                setError('Failed to load bill details');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBill();
    }, [shareId]);

    const handlePaymentStatus = async () => {
        try {
            const response = await fetch('/api/update-payment-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shareId,
                    status: paymentStatus === 'pending' ? 'paid' : 'pending'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update payment status');
            }

            const data = await response.json();
            setPaymentStatus(data.paymentStatus);
        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    };

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
                        <h1 className="text-2xl font-bold">
                            {bill.contactName === "Me" ? "Your Bill" : `${bill.contactName}'s Bill`}
                        </h1>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold">{bill.storeName}</h2>
                        <p className="text-gray-600">{new Date(bill.date).toLocaleDateString()}</p>
                    </div> 

                    {bill.imageUrl && (
                        <div className="mb-6">
                            <a 
                                href={bill.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-500 hover:text-emerald-600 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                View Original Receipt
                            </a>
                        </div>
                    )}

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
                            {bill.tipShare > 0 && (
                                <div className="flex justify-between">
                                    <span>Tip Share</span>
                                    <span>${bill.tipShare.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>${bill.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                onClick={handlePaymentStatus}
                                className={`w-full ${
                                    paymentStatus === 'paid' 
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : 'bg-emerald-500 hover:bg-emerald-600'
                                }`}
                            >
                                {paymentStatus === 'paid' ? (
                                    <>
                                        <IoMdCheckmark className="w-5 h-5 mr-2" />
                                        Paid
                                    </>
                                ) : (
                                    'Mark as Paid'
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}