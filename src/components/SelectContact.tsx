"use client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { Document } from "mongoose";

// Define interface
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
  includeSelf?: boolean;
}

export default function SelectContact({ 
  onSelect, 
  placeholder = "Select a contact",
  refreshKey = 0,
  includeSelf = false
}: SelectContactProps) {
  const { user } = useUser();
  const [contacts, setContacts] = useState<ContactDocument[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>("");

  useEffect(() => {
    const fetchContacts = async () => {
      const response = await fetch("/api/get-contacts");
      const data = await response.json();
      let loadedContacts = data.contacts || [];

      if (includeSelf && user) {
        const meContact = {
          _id: "me",
          clerkId: user.id,
          name: "Me",
          email: user.emailAddresses?.[0]?.emailAddress || "You"
        } as ContactDocument;

        loadedContacts = [meContact, ...loadedContacts];
      }

      if (Array.isArray(loadedContacts)) {
        setContacts(loadedContacts);
      }
    };

    fetchContacts();
  }, [refreshKey, includeSelf, user]);



  const handleChange = (value: string) => {
    if (value === "none") {
      setSelectedValue("none");
      onSelect(null); // unselect
    } else {
      setSelectedValue(value);
      const selectedContact = contacts.find(contact => contact._id === value);
      onSelect(selectedContact || null);
    }
  };


  return (
    <Select value={selectedValue} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">— None —</SelectItem>
        {contacts.map((contact) => (
          <SelectItem key={contact._id} value={contact._id}>
            {contact.name} ({contact.email})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

  );
}
