"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Define the interface for form data
interface FormData {
  phone: string;
  name: string;
  email: string;
}

interface AccountProfileProps {
  user: any;
  btnTitle: string;
}

const AccountProfile: React.FC<AccountProfileProps> = ({ user, btnTitle }) => {
  const router = useRouter();
  // Local state for form fields with initial values
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    name: user?.name || "",
    email: user?.email || "",
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <input
          id="name"
          name="name"
          type="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
        />
      </div>

      {/* Submit Button */}
      <button type="submit">{btnTitle}</button>
    </form>
  );
};

export default AccountProfile;
