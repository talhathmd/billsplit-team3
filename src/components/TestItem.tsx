'use client';

import React, { useState } from "react";

interface Bill {
    _id: string;
    creator: string;
    imageURL?: string;
    totalAmount?: number;
    participants: string[];
    status: string;
    createdAt: string; 
}

export default function TestItem() {

    const [modalIsOpen, setModalOpen] = useState(false);
    const [selectedImageURL, setSelectedImageUrl] = useState<string | undefined>(undefined);

    // Create an array of dummy bills
    const bills: Bill[] = [
        {
            _id: "1",
            creator: "John Doe",
            imageURL: "http://example.com/image1.jpg",
            totalAmount: 50,
            participants: ["John", "Jane"],
            status: "paid",
            createdAt: "2025-03-16T12:00:00Z",
        },
        {
            _id: "2",
            creator: "Alice Smith",
            imageURL: "http://example.com/image2.jpg",
            totalAmount: 100,
            participants: ["Alice", "Bob"],
            status: "pending",
            createdAt: "2025-03-17T14:00:00Z",
        },
        {
            _id: "3",
            creator: "Charlie Brown",
            imageURL: "http://example.com/image3.jpg",
            totalAmount: 75,
            participants: ["Charlie", "Dave"],
            status: "paid",
            createdAt: "2025-03-18T16:00:00Z",
        },
    ];

    const openModal = (imageURL: string | undefined) => {
        setSelectedImageUrl(imageURL);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

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