'use client';

import React, { useEffect, useState } from "react";
import { ContactDocument } from "@/lib/models/contact.model";

interface Bill {
    _id: string;
    storeName: string;
    date: string;
    time: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        assignedContacts: string[];
    }[];
    subtotal: number;
    totalTax: number;
    total: number;
    imageUrl: string;
    createdAt: string;
}

export default function BillHistoryItem() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [contacts, setContacts] = useState<ContactDocument[]>([]);
    const [modalIsOpen, setModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/get-contacts');
            if (!response.ok) throw new Error('Failed to fetch contacts');
            const data = await response.json();
            
            // Extract the contacts array from the response
            if (data.success && Array.isArray(data.contacts)) {
                setContacts(data.contacts);
            } else {
                console.error('Invalid contacts data structure:', data);
                setContacts([]);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
        }
    };

    const getContactNames = (contactIds: string[]) => {
        if (!contactIds?.length || !contacts?.length) return '';
        
        return contactIds
            .map(id => {
                // Try both string and direct comparison
                const contact = contacts.find(c => 
                    c._id.toString() === id.toString() || 
                    c._id === id
                );
                return contact?.name || '';
            })
            .filter(Boolean)
            .join(", ");
    };

    const openModal = (bill: Bill) => {
        setSelectedBill(bill);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedBill(null);
    };

    const fetchBills = async () => {
        try {
            const response = await fetch('/api/get-bills');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setBills(data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    useEffect(() => {
        fetchContacts();
        fetchBills();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Bill History</h2>
            <div className="space-y-4">
                {bills.map((bill) => (
                    <div key={bill._id} className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold">{bill.storeName}</h3>
                                <p className="text-gray-600">{new Date(bill.date).toLocaleDateString()}</p>
                                <p className="text-lg font-medium mt-2">${bill.total.toFixed(2)}</p>
                            </div>
                            <button 
                                onClick={() => openModal(bill)}
                                className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition-colors"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalIsOpen && selectedBill && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold">{selectedBill.storeName}</h2>
                                <button 
                                    onClick={closeModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Date: {new Date(selectedBill.date).toLocaleDateString()}</span>
                                    <span>Time: {selectedBill.time}</span>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-2">Items</h3>
                                    {selectedBill.items.map((item, index) => (
                                        <div key={index} className="flex flex-col py-2 border-b">
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-medium">${item.price.toFixed(2)}</p>
                                            </div>
                                            {item.assignedContacts.length > 0 && (
                                                <div className="mt-1">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Assigned to: </span>
                                                        {getContactNames(item.assignedContacts)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${selectedBill.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax</span>
                                        <span>${selectedBill.totalTax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>${selectedBill.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {selectedBill.imageUrl && (
                                    <div className="mt-4">
                                        <a 
                                            href={selectedBill.imageUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-emerald-500 hover:text-emerald-600"
                                        >
                                            View Original Receipt
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

