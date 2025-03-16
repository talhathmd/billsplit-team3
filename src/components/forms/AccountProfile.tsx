"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "../ui/phone-input";


// Define the interface for form data
interface FormData {
  phone: string;
  name: string;
  email: string;
}

interface AccountProfileProps {
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string; // Optional phone field
  };
  btnTitle: string;
}

const AccountProfile: React.FC<AccountProfileProps> = ({ user, btnTitle }) => {
  const router = useRouter();
  // Local state for form fields with initial values
  const [formData, setFormData] = useState<FormData>({
    phone: user.phone || "", // Use user's phone if available
    name: user.name || "",
    email: user.email || "",
  });

  // Handle form Input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle phone input change
  const handlePhoneChange = (value: string | undefined) => {
    setFormData({ ...formData, phone: value || "" }); // Coerce undefined to an empty string
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: formData.email,
          phone: formData.phone,
          name: formData.name,
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        console.log("User successfully added or updated:", responseData);
        router.push("/dashboard"); // Redirect to dashboard after successful onboarding
      } else {
        console.error("Error from server:", responseData.error);
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name">Name</label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>

      {/* Phone Field */}
    
          <PhoneInput
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="Enter your phone number"
            defaultCountry="US"
          />


      {/* Submit Button */}
      <Button type="submit">{btnTitle}</Button>
    </form>
  );
};

export default AccountProfile;
