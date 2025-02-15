"use client";
import { UploadButton } from "@uploadthing/react";
import { useState } from "react";
import Tesseract from "tesseract.js";

export default function UploadBill() {
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const handleImageUpload = async (res: any) => {
    if (res && res[0]) {
      const imageUrl = res[0].url;

      // Call the API to process the image
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      const { image: base64Image } = await response.json();
      const buffer = Buffer.from(base64Image, 'base64');

      // Perform OCR on the processed image
      const { data } = await Tesseract.recognize(buffer, "eng", {
        logger: (m) => console.log(m), // Log progress
      });
      setExtractedText(data.text);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <UploadButton
        endpoint="billImage"
        onClientUploadComplete={handleImageUpload}
        onUploadError={(err: Error) => alert(`Upload failed: ${err.message}`)}
      />
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
