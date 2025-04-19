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
import { useUser } from "@clerk/nextjs";

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
  refreshKey?: number;
  includeSelf?: boolean;                  // *add 'Me' to billItem assignment
}

export default function SelectContact({ 
  onSelect, 
  placeholder = "Select a contact",
  refreshKey = 0,
  includeSelf = false
}: SelectContactProps) {
  const { user } = useUser();
  const [contacts, setContacts] = useState<ContactDocument[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const response = await fetch("/api/get-contacts");
      const data = await response.json();

      // contacts can either be from contactList or self assign
      let loadedContacts = data.contacts || [];

      // handle self assign
      if (includeSelf && user) {
        const meContact = {
          _id: "me", // me is the special identifier
          clerkId: user.id,
          name: "Me",
          email: user.emailAddress || "You" // displays (You) for user readability
        } as ContactDocument;

        // insert ME into loaded contacts (beginning of list)
        loadedContacts = [meContact, ...loadedContacts]; 
      }

      if (Array.isArray(loadedContacts)) {
        setContacts(loadedContacts);
      }
    };

    fetchContacts();
  }, [refreshKey, includeSelf, user]);

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