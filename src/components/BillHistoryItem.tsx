'use client';

import React, { useEffect, useState } from "react";
import { ContactDocument } from "@/lib/models/contact.model";
import { IoMdCopy, IoMdCheckmark } from "react-icons/io";
import { IoPerson } from "react-icons/io5";
import { Button } from "@/components/ui/button";

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

interface PersonalBill {
    contactId: string;
    contactName: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        sharedWith: number; // number of people sharing this item
    }[];
    subtotal: number;
    taxShare: number;
    total: number;
}

export default function BillHistoryItem() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [contacts, setContacts] = useState<ContactDocument[]>([]);
    const [modalIsOpen, setModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [showPersonalBills, setShowPersonalBills] = useState(false);
    const [personalBills, setPersonalBills] = useState<PersonalBill[]>([]);
    const [copiedLinks, setCopiedLinks] = useState<{ [key: string]: boolean }>({});

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

    const calculatePersonalBills = (bill: Bill) => {
        const personalBillsMap = new Map<string, PersonalBill>();

        // Initialize personal bills for each contact
        contacts.forEach(contact => {
            personalBillsMap.set(contact._id, {
                contactId: contact._id,
                contactName: contact.name,
                items: [],
                subtotal: 0,
                taxShare: 0,
                total: 0
            });
        });

        // Calculate items and subtotals for each person
        bill.items.forEach(item => {
            const numPeopleSharing = item.assignedContacts.length;
            if (numPeopleSharing === 0) return;

            const pricePerPerson = item.price / numPeopleSharing;
            const quantityPerPerson = item.quantity / numPeopleSharing;

            item.assignedContacts.forEach(contactId => {
                const personalBill = personalBillsMap.get(contactId);
                if (personalBill) {
                    personalBill.items.push({
                        name: item.name,
                        quantity: quantityPerPerson,
                        price: pricePerPerson,
                        sharedWith: numPeopleSharing
                    });
                    personalBill.subtotal += pricePerPerson;
                }
            });
        });

        // Calculate tax share proportionally
        const totalBillAmount = bill.subtotal;
        personalBillsMap.forEach(personalBill => {
            const proportion = personalBill.subtotal / totalBillAmount;
            personalBill.taxShare = bill.totalTax * proportion;
            personalBill.total = personalBill.subtotal + personalBill.taxShare;
        });

        return Array.from(personalBillsMap.values()).filter(bill => bill.items.length > 0);
    };

    const handleViewPersonalBills = () => {
        if (selectedBill) {
            const bills = calculatePersonalBills(selectedBill);
            setPersonalBills(bills);
            setShowPersonalBills(true);
        }
    };

    const generateShareLink = async (billId: string, contactId: string) => {
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
            }
        } catch (error) {
            console.error('Error generating share link:', error);
            alert('Failed to generate share link');
        }
    };

    useEffect(() => {
        fetchContacts();
        fetchBills();
    }, []);

    const renderModalContent = () => {
        if (!selectedBill) return null;

        if (showPersonalBills) {
            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Individual Bills</h2>
                        <button 
                            onClick={() => setShowPersonalBills(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Back to Full Bill
                        </button>
                    </div>
                    
                    {personalBills.map((personalBill) => (
                        <div key={personalBill.contactId} className="bg-white rounded-lg shadow p-4 border border-emerald-100">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <IoPerson className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-xl font-semibold">{personalBill.contactName}'s Bill</h3>
                                </div>
                                <Button
                                    onClick={() => generateShareLink(selectedBill._id, personalBill.contactId)}
                                    className="bg-emerald-500 hover:bg-emerald-600 flex items-center gap-2"
                                >
                                    {copiedLinks[personalBill.contactId] ? (
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
                            </div>
                            
                            <div className="space-y-3">
                                {personalBill.items.map((item, idx) => (
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
                                        <span>${personalBill.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax Share</span>
                                        <span>${personalBill.taxShare.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>${personalBill.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
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
        );
    };

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
                            {renderModalContent()}
                            
                            {!showPersonalBills && (
                                <button 
                                    onClick={handleViewPersonalBills}
                                    className="mt-4 w-full bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition-colors"
                                >
                                    View Individual Bills
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

