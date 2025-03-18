'use client';

import React, { useEffect, useState } from "react";

interface Bill {
    _id: string;
    creator: string;
    imageURL?: string;
    totalAmount?: number;
    participants: string[];
    status: string;
    createdAt: string; 
}


export default function BillHistoryItem() {
    const [bills, setBills] = useState<Bill[]>([]);

    const [modalIsOpen, setModalOpen] = useState(false);
    const [selectedImageURL, setSelectedImageUrl] = useState<string | undefined>(undefined);

    const openModal = (imageURL: string | undefined) => {
        setSelectedImageUrl(imageURL);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const fetchBills = async () => {
        try {
            const response = await fetch('/api/get-bills');

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error("Empty resonse format from server");
            }

            setBills(data);
            } catch (error) {
                console.error('Error fetching bills:', error);
            }

    };

    useEffect(() => {
        fetchBills();
    }, []); 

    return (
        <div>
            <ul>
                {bills.map((bill) => (
                <li key={bill._id} className="flex w-full justify-between items-center p-4 border-b">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold">{bill.createdAt}</h3>
                        <p className="text-sm text-gray-600">{bill.participants.join(", ")}</p>
                        <p className={`text-sm ${bill.status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
                            {bill.status}
                        </p>
                    </div>
                    <button 
                        className="flex justify-end"
                        onClick={() => openModal(bill.imageURL)}
                    >
                        <img src="/icons/list.svg" className="w-8 h-auto" alt="List Button" />
                    </button>
                </li>
                ))}
            </ul>

            {modalIsOpen && selectedImageURL && (
                <div className="modal-overlay fixed inset-0 bg-black bg-opacity-5- flex justify-center items-center">
                    <div className="modal-content bg-white p-4 rounded relative">
                        <button onClick={closeModal} className="absolute close-btn p-2 top-2 right-2 text-white bg-red-500 rounded-full">
                            X
                        </button>
                        <img src={selectedImageURL} alt="bill image" className="w-96 h-auto" />
                    </div>
                </div>
            )}
            
        </div>
    );
}

