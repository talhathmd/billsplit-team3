"use client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Contact from "@/lib/models/contact.model";
import { Document } from 'mongoose';

// Define interface extending Document for type safety with Mongoose
interface ContactDocument extends Document {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
}

interface SelectContactProps {
  onSelect: (contact: ContactDocument | null) => void;
  placeholder?: string;
}

export default function SelectContact({ onSelect, placeholder = "Select a contact" }: SelectContactProps) {
  const [contacts, setContacts] = useState<ContactDocument[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      // Check if contacts are in localStorage
      const cachedContacts = localStorage.getItem('contacts');
      if (cachedContacts) {
        setContacts(JSON.parse(cachedContacts));
        return;
      }

      const response = await fetch("/api/get-contacts");
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
        // Cache contacts
        localStorage.setItem('contacts', JSON.stringify(data.contacts));
      }
    };

    fetchContacts();
  }, []);

  return (
    <Select onValueChange={(value: string) => {
      const selectedContact = contacts.find(contact => contact._id === value);
      onSelect(selectedContact || null);
    }}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {contacts.map((contact) => (
          <SelectItem key={contact._id} value={contact._id}>
            {contact.name} ({contact.email})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 