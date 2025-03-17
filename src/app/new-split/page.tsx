"use client";
import { UploadButton } from "@uploadthing/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function UploadBill() {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageUpload = async (res: any) => {
    console.log("Upload Response:", res);  // Log the response
  
    if (res && res[0]) {
      const uploadedImageUrl = res[0].url;
      setImageUrl(uploadedImageUrl);
  
      // Send image URL to the API for Google Vision processing
      const response = await fetch("/api/extract-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: uploadedImageUrl }),
      });
  
      if (!response.ok) {
        console.error("Failed to process image");
        return;
      }
  
      const { text } = await response.json();
      setExtractedText(text);
    }
  };
  

  return (
    <div className="flex flex-col items-center space-y-4 mt-8">
      <UploadButton
        endpoint="billImage"
        onClientUploadComplete={handleImageUpload}
        onUploadError={(err: Error) => alert(`Upload failed: ${err.message}`)}
        className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200 cursor-pointer"
      />
      {imageUrl && (
        <Button
          onClick={() => window.open(imageUrl, "_blank")}
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200"
        >
          View Original Bill
        </Button>
      )}
      {extractedText && (
        <textarea
          className="w-full h-40 p-2 border rounded bg-gray-100 text-gray-800 font-mono text-sm leading-relaxed"
          value={extractedText}
          readOnly
        />
      )}
    </div>
  );
}
