'use client';

import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/dashboard')}
      className="fixed top-4 left-4 p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
      aria-label="Back to Dashboard"
    >
      <IoArrowBack size={24} />
    </button>
  );
}