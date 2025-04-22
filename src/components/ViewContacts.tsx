"use client";
import { useEffect, useState } from "react";
import { Contact } from "@/lib/types/contact";
import { IoPerson } from "react-icons/io5";

export default function ViewContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      const response = await fetch("/api/get-contacts");
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
      } else {
        setMessage("Failed to load contacts.");
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="w-full max-w-2xl mt-10 mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Your Contacts</h2>
      {message && <p className="text-red-500 text-center">{message}</p>}

      {contacts.length > 0 ? (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all hover:shadow-md"
            >
              <div className="flex">
              <IoPerson className="w-5 h-5 text-emerald-500 mr-2" />
              <h3 className="text-lg font-semibold text-emerald-600">{contact.name}</h3>
              </div>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Email:</span> {contact.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Phone:</span> {contact.phone}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No contacts found.</p>
      )}
    </div>
  );
}
