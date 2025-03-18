"use client";
import { useEffect, useState } from "react";
import { Contact } from "@/lib/types/contact";

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
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6 mt-5">
      <h2 className="text-2xl font-bold mb-4">Your Contacts</h2>
      {message && <p className="text-red-500">{message}</p>}
      <div className="w-full max-w-md">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <div key={contact._id} className="p-4 bg-white shadow-md rounded mb-2">
              <h3 className="font-bold">{contact.name}</h3>
              <p>Email: {contact.email}</p>
              <p>Phone: {contact.phone}</p>
            </div>
          ))
        ) : (
          <p>No contacts found.</p>
        )}
      </div>
    </div>
  );
}
