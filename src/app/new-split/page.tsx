"use client";
import { UploadButton } from "@uploadthing/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SelectContact from "@/components/SelectContact";
import Contact, { ContactDocument } from "@/lib/models/contact.model";
import { BillItem } from "@/lib/models/bills.model";
import BillSplitConfirmation from "@/components/BillSplitConfirmation";
import { useUser } from "@clerk/nextjs";

// Add this interface to track item assignments
interface ItemAssignment {
  itemIndex: number;
  contacts: ContactDocument[];
}

// Add this interface near the top with your other interfaces
interface PersonalBill {
    contactId: string;
    contactName: string;
    items: {
        name: string;
        quantity: number;
        price: number;
        sharedWith: number;
    }[];
    subtotal: number;
    taxShare: number;
    total: number;
}

// Also add the calculatePersonalBills function before your component
const calculatePersonalBills = (billData: any) => {
    const personalBillsMap = new Map<string, PersonalBill>();

    // Initialize personal bills for each contact with assigned items
    billData.items.forEach((item: any, index: number) => {
        const assignedContacts = item.assignedContacts || [];
        const numPeopleSharing = assignedContacts.length;
        if (numPeopleSharing === 0) return;

        const pricePerPerson = item.price / numPeopleSharing;
        const quantityPerPerson = item.quantity / numPeopleSharing;

        assignedContacts.forEach((contactId: string) => {
            if (!personalBillsMap.has(contactId)) {
                personalBillsMap.set(contactId, {
                    contactId,
                    contactName: "", // We'll update this later
                    items: [],
                    subtotal: 0,
                    taxShare: 0,
                    total: 0
                });
            }

            const personalBill = personalBillsMap.get(contactId)!;
            personalBill.items.push({
                name: item.name,
                quantity: quantityPerPerson,
                price: pricePerPerson,
                sharedWith: numPeopleSharing
            });
            personalBill.subtotal += pricePerPerson;
        });
    });

    // Calculate tax share proportionally
    const totalBillAmount = billData.subtotal;
    personalBillsMap.forEach(personalBill => {
        const proportion = personalBill.subtotal / totalBillAmount;
        personalBill.taxShare = billData.totalTax * proportion;
        personalBill.total = personalBill.subtotal + personalBill.taxShare;
    });

    return Array.from(personalBillsMap.values());
};

export default function UploadBill() {
  const { user } = useUser();
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fullResponse, setFullResponse] = useState<any | null>(null);
  const [itemAssignments, setItemAssignments] = useState<ItemAssignment[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [savedBillId, setSavedBillId] = useState<string | null>(null);
  const [personalBills, setPersonalBills] = useState<PersonalBill[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = async (res: any) => {
    if (res && res[0]) {
      setIsProcessing(true);
      const uploadedImageUrl = res[0].url;
      setImageUrl(uploadedImageUrl);

      try {
        // Send image URL to the API for Google Vision processing
        const response = await fetch("/api/extract-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: uploadedImageUrl }),
        });

        if (!response.ok) {
          throw new Error("Failed to process image");
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
          throw new Error("Failed to retrieve data from Cloudflare");
        }

        const data = await cloudflareResponse.json();
        console.log("Cloudflare API Response:", data);

        if (data.result && data.result.response) {
          setFullResponse(data.result.response);
        }
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Failed to process image. Please try again.");
      } finally {
        setIsProcessing(false);
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
    if (!fullResponse || !user) return;

    const billData = {
      clerkId: user.id, // Use the actual clerk ID
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
      console.log("Sending bill data:", billData); // Debug log

      const response = await fetch("/api/save-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          // Handle duplicate bill error
          alert(data.error || "This bill appears to be a duplicate.");
          return;
        }
        throw new Error(data.error || "Failed to save bill");
      }

      if (data.success) {
        // Calculate personal bills and add contact names
        const personalBills = calculatePersonalBills(billData);
        console.log("Calculated personal bills:", personalBills); // Debug log
        
        // Add contact names to personal bills
        personalBills.forEach(bill => {
            const contact = itemAssignments
                .flatMap(assignment => assignment.contacts)
                .find(contact => contact._id === bill.contactId);
            if (contact) {
                bill.contactName = contact.name;
            }
        });
        
        console.log("Final personal bills with names:", personalBills); // Debug log
        setPersonalBills(personalBills);
        setSavedBillId(data._id); // Change this from data.billId to data._id
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("Failed to save bill");
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center space-y-4 mt-8 w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg overflow-auto flex-grow">
          <UploadButton
            endpoint="billImage"
            onClientUploadComplete={handleImageUpload}
            onUploadError={(err: Error) => alert(`Upload failed: ${err.message}`)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200 cursor-pointer"
          />
          
          {isProcessing && (
            <div className="flex items-center gap-2 text-emerald-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
              <span>Processing receipt...</span>
            </div>
          )}
          
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
      
      {showConfirmation && savedBillId && (
        <BillSplitConfirmation
          personalBills={personalBills}
          billId={savedBillId}
          onClose={() => {
            setShowConfirmation(false);
            // Optionally redirect to history page
            // router.push('/history');
          }}
        />
      )}
    </>
  );
}
