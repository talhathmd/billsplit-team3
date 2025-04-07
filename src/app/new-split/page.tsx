"use client";
import { UploadButton } from "@uploadthing/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SelectContact from "@/components/SelectContact";
import Contact, { ContactDocument } from "@/lib/models/contact.model";
import { BillItem } from "@/lib/models/bills.model";

// Add this interface to track item assignments
interface ItemAssignment {
  itemIndex: number;
  contacts: ContactDocument[];
}

export default function UploadBill() {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fullResponse, setFullResponse] = useState<any | null>(null); // Store full Cloudflare response
  const [itemAssignments, setItemAssignments] = useState<ItemAssignment[]>([]);

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

  // Add this function to handle contact selection
  const handleContactSelect = (itemIndex: number, contact: ContactDocument | null) => {
    if (!contact) return;
    
    setItemAssignments(prev => {
      const newAssignments = [...prev];
      const existingIndex = newAssignments.findIndex(a => a.itemIndex === itemIndex);
      
      if (existingIndex >= 0) {
        if (!newAssignments[existingIndex].contacts.find(c => c._id === contact._id)) {
          newAssignments[existingIndex].contacts.push(contact);
        }
      } else {
        newAssignments.push({ itemIndex, contacts: [contact] });
      }
      
      return newAssignments;
    });
  };

  const handleSendBill = async () => {
    if (!fullResponse) return;

    const billData = {
      storeName: fullResponse.storeName,
      address: fullResponse.address,
      phoneNumber: fullResponse.phoneNumber,
      date: fullResponse.date,
      time: fullResponse.time,
      items: fullResponse.items.map((item: any, index: number) => ({
        name: item.name,
        quantity: item.quantity || 1,
        price: parseFloat(item.price?.replace('$', '') || '0'),
        assignedContacts: itemAssignments.find(a => a.itemIndex === index)?.contacts.map(c => c._id) || []
      })),
      subtotal: parseFloat(fullResponse.subtotal?.replace('$', '') || '0'),
      totalTax: parseFloat(fullResponse.totalTax?.replace('$', '') || '0'),
      total: parseFloat(fullResponse.total?.replace('$', '') || '0'),
      imageUrl: imageUrl || ''
    };

    try {
      const response = await fetch("/api/save-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });

      const data = await response.json();
      if (data.success) {
        alert("Bill saved successfully!");
        // Optionally redirect or reset form
      } else {
        alert("Failed to save bill");
      }
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Failed to save bill");
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
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span>x {item.quantity || 1}</span>
                      <span className="flex items-center">
                        <span className="mr-2">$</span>
                        <Input
                          type="number"
                          defaultValue={item.price ? item.price.replace('$', '') : "0"}
                          className="w-24 border rounded mx-2"
                        />
                      </span>
                    </div>
                    <div className="mt-2">
                      <SelectContact 
                        onSelect={(contact) => handleContactSelect(index, contact)}
                        placeholder="Assign to contact"
                      />
                    </div>
                    {/* Display assigned contacts */}
                    <div className="mt-2">
                      {itemAssignments.find(a => a.itemIndex === index)?.contacts.map(contact => (
                        <span key={contact._id} className="inline-block bg-emerald-100 text-emerald-800 px-2 py-1 rounded mr-2 mb-2">
                          {contact.name}
                        </span>
                      ))}
                    </div>
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
                    <strong>TotalTax:</strong>
                  </span>
                  <span className="flex items-center">
                    <span className="mr-2">$</span>
                    <Input
                      type="number"
                      defaultValue={fullResponse.totalTax ? fullResponse.totalTax.replace('$', '') : "0"}
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
        {fullResponse && (
              <Button 
                onClick={handleSendBill}
                className="mt-6 w-full bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Send Bill
              </Button>
            )}
      </div>
    </div>
  

  );
}
