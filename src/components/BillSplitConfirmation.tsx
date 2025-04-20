'use client';

import React, { useState } from 'react';
import { IoPerson } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { IoMdCopy, IoMdCheckmark } from "react-icons/io";
import SendEmailButton from './SendEmailButton';

interface PersonalBill {
    contactId: string;
    contactName: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        sharedWith: number;
    }[];
    subtotal: number;
    taxShare: number;
    total: number;
}

interface Props {
    personalBills: PersonalBill[];
    billId: string;
    onClose: () => void;
}

export default function BillSplitConfirmation({ personalBills, billId, onClose }: Props) {
    const [copiedLinks, setCopiedLinks] = useState<{ [key: string]: boolean }>({});

    const generateShareLink = async (contactId: string) => {
        try {
            const response = await fetch('/api/create-share-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    billId,
                    contactId,
                }),
            });
            
            const data = await response.json();
            if (data.success) {
                const shareLink = `${window.location.origin}/shared-bill/${data.shareId}`;
                await navigator.clipboard.writeText(shareLink);
                
                // Show copied status
                setCopiedLinks(prev => ({
                    ...prev,
                    [contactId]: true
                }));
                
                // Reset copied status after 3 seconds
                setTimeout(() => {
                    setCopiedLinks(prev => ({
                        ...prev,
                        [contactId]: false
                    }));
                }, 3000);
                
                return shareLink;
            }
        } catch (error) {
            console.error('Error generating share link:', error);
            alert('Failed to generate share link');
        }
    };

    if (!personalBills || personalBills.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                <div className="bg-white rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">No bills to display</h2>
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Bill Split Summary</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-6">
                        {personalBills.map((bill) => (
                            <div key={bill.contactId} 
                                className="bg-white rounded-lg shadow p-4 border border-emerald-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <IoPerson className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-xl font-semibold">
                                            {bill.contactName === "Me" ? "Your Bill" : `${bill.contactName}'s Bill`}
                                        </h3>
                                    </div>
                                    <Button
                                        onClick={() => generateShareLink(bill.contactId)}
                                        className="bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2"
                                    >
                                        {copiedLinks[bill.contactId] ? (
                                            <>
                                                <IoMdCheckmark className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <IoMdCopy className="w-4 h-4" />
                                                Copy Share Link
                                            </>
                                        )}
                                    </Button>
                                    <SendEmailButton
                                        billId={billId}
                                        contactId={bill.contactId}
                                        contactEmail={bill.contactName}
                                    />
                                </div>

                                <div className="space-y-3">
                                    {bill.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                {item.sharedWith > 1 && (
                                                    <p className="text-sm text-gray-500">
                                                        (Shared with {item.sharedWith - 1} other{item.sharedWith > 2 ? 's' : ''})
                                                    </p>
                                                )}
                                            </div>
                                            <p>${item.price.toFixed(2)}</p>
                                        </div>
                                    ))}

                                    <div className="border-t pt-3 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>${bill.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax Share</span>
                                            <span>${bill.taxShare.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>${bill.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 