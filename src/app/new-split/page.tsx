"use client";
import { UploadButton } from "@uploadthing/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center space-y-4 mt-8 w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg overflow-auto flex-grow">
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
          <div className="flex flex-col gap-1 mt-4 w-full h-full">
            <h2 className="font-bold text-lg mb-2">{fullResponse.storeName || "Store Name"}</h2>
            <p>{fullResponse.address || "Address not available"}</p>
            <p>{fullResponse.phoneNumber || "Phone number not available"}</p>
            <p>{fullResponse.date || "Date not available"}</p>
            <p>{fullResponse.time || "Time not available"}</p>

            {fullResponse.items.map((item: any, index: number) => (
              <Card key={index} className="mt-1">
                <CardHeader>
                  <CardTitle>{item.name || "Item Name"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <span>x {item.quantity || 1}</span>
                    
                    <span className="flex items-center">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        defaultValue={item.price ? item.price.replace('$', '') : "Price not available"}
                        className="w-24 border rounded mx-2"
                      />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="flex-grow">
                    <strong>Subtotal:</strong>
                  </span>
                  <span className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input
                      type="number"
                      defaultValue={fullResponse.subtotal ? fullResponse.subtotal.replace('$', '') : "0"}
                      className="w-24 border rounded mx-2"
                    />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex-grow">
                    <strong>SalesTax:</strong>
                  </span>
                  <span className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input
                      type="number"
                      defaultValue={fullResponse.salesTax ? fullResponse.salesTax.replace('$', '') : "0"}
                      className="w-24 border rounded mx-2"
                    />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex-grow">
                    <strong>Total:</strong>
                  </span>
                  <span className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input
                      type="number"
                      defaultValue={fullResponse.total ? fullResponse.total.replace('$', '') : "0"}
                      className="w-24 border rounded mx-2"
                    />
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  

  );
}
