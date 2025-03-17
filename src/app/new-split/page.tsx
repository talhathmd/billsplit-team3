"use client";
import { UploadButton } from "@uploadthing/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function UploadBill() {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fullResponse, setFullResponse] = useState<any | null>(null); // Store full Cloudflare response

  const handleImageUpload = async (res: any) => {
    console.log("Upload Response:", res);

    if (res && res[0]) {
      const uploadedImageUrl = res[0].url;
      setImageUrl(uploadedImageUrl);

      // Send image URL to the API for Google Vision processing
      const response = await fetch("/api/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadedImageUrl }),
      });

      if (!response.ok) {
        console.error("Failed to process image");
        return;
      }

      const { text } = await response.json();
      setExtractedText(text);

      // Send extracted text to Cloudflare
      const cloudflareResponse = await fetch("/api/cloudflare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedText: text }),
      });

      if (!cloudflareResponse.ok) {
        console.error("Failed to retrieve data from Cloudflare");
        return;
      }

      const data = await cloudflareResponse.json();
      console.log("Cloudflare API Response:", data); // Log the response

      // Assuming the response structure is { result: { response: { ... } } }
      if (data.result && data.result.response) {
        setFullResponse(data.result.response); // Store the structured response
      }
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

      {fullResponse && (
        <div className="mt-4 p-4 bg-gray-100 border rounded text-sm w-full overflow-x-auto">
          <h2 className="font-bold text-lg mb-2">Bill Details</h2>
          <p><strong>Store Name:</strong> {fullResponse.storeName}</p>
          <p><strong>Address:</strong> {fullResponse.address}</p>
          <p><strong>Phone Number:</strong> {fullResponse.phoneNumber}</p>
          <p><strong>Ticket Number:</strong> {fullResponse.ticketNumber}</p>
          <p><strong>Receipt Number:</strong> {fullResponse.receiptNumber}</p>
          <p><strong>Authorization Code:</strong> {fullResponse.authorizationCode}</p>
          <p><strong>Date:</strong> {fullResponse.date}</p>
          <p><strong>Time:</strong> {fullResponse.time}</p>
          <h3 className="font-bold mt-2">Items:</h3>
          <ul>
            {fullResponse.items.map((item: any, index: number) => (
              <li key={index}>
                {item.name} - Quantity: {item.quantity}, Price: {item.price}
              </li>
            ))}
          </ul>
          <p><strong>Subtotal:</strong> {fullResponse.subtotal}</p>
          <p><strong>Sales Tax:</strong> {fullResponse.salesTax}</p>
          <p><strong>Total:</strong> {fullResponse.total}</p>
          <p><strong>Payment Method:</strong> {fullResponse.paymentMethod}</p>
        </div>
      )}
    </div>
  );
}
