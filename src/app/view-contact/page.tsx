"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import ViewContacts from "@/components/ViewContacts";
import BackButton from '@/components/BackButton';

export default function ViewContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/add-contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, phone }),
    });

    const data = await response.json();
    if (data.success) {
      setMessage("Contact added successfully!");
      // Optionally reset the form
      setName("");
      setEmail("");
      setPhone("");
    } else {
      setMessage("Failed to add contact.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <BackButton />
      <div className="flex flex-col items-center space-y-4 mt-8 w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold">Add Contact</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <PhoneInput
            id="phone"
            name="phone"
            value={phone}
            onChange={(value) => setPhone(value)}
            placeholder="Enter your phone number"
            defaultCountry="US"
            className="w-full mb-2"
          />
          
          <Button type="submit" className="w-full bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200">
            Add Contact
          </Button>
        </form>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </div>
      <ViewContacts />
    </div>
  );
}
