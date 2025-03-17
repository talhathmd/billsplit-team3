import { NextResponse } from "next/server";

interface BillDetails {
    storeName?: string;
    address?: string;
    phoneNumber?: string;
    ticketNumber?: string;
    receiptNumber?: string;
    authorizationCode?: string;
    date?: string;
    time?: string;
    items: {
      name: string;
      quantity: number;
      price: string;
    }[];
    subtotal?: string;
    salesTax?: string;
    total?: string;
    paymentMethod?: string;
  }
  
  export const runtime = "nodejs";
  
  // Define the API response interface
  interface ApiResponse {
    success: boolean;
    result?: {
      response: string;
    };
    errors?: any; // Adjust type according to the structure of errors, if needed
  }
  
  export async function POST(req: Request) {
    try {
      const { extractedText } = await req.json();

      if (!extractedText) {
        return NextResponse.json({ error: "No extracted text provided" }, { status: 400 });
      }

      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = process.env.CLOUDFLARE_API_TOKEN;
      const model = "@cf/meta/llama-3.1-8b-instruct"; // You can change this model if needed
  
      // Construct the messages for the AI model
      const messages = [
        {
          role: "system",
          content: "Extract data about a bill."
        },
        {
          role: "user",
          content: extractedText
        }
      ];

      // Construct the request body with the JSON schema
      const requestBody = {
        messages: messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            type: "object",
            properties: {
              storeName: { type: "string" },
              address: { type: "string" },
              phoneNumber: { type: "string" },
              ticketNumber: { type: "string" },
              receiptNumber: { type: "string" },
              authorizationCode: { type: "string" },
              date: { type: "string" },
              time: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    quantity: { type: "number" },
                    price: { type: "string" }
                  },
                  required: ["name", "quantity", "price"]
                }
              },
              subtotal: { type: "string" },
              salesTax: { type: "string" },
              total: { type: "string" },
              paymentMethod: { type: "string" }
            },
            required: [
              "storeName",
              "total",

            ]
          }
        }
      };

      // Send the request to the Cloudflare AI endpoint
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      const rawResponse = await response.json(); // Get the raw response as JSON
      console.log("Cloudflare API Response:", rawResponse); // Log the raw response
      
      // Return the structured response
      return NextResponse.json(rawResponse);
    } catch (error) {
      console.error("Error in Cloudflare API:", error);
      return NextResponse.json({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      }, { status: 500 });
    }
  }
  
  // Optional: GET handler to inform users about the correct usage
  export async function GET(req: Request) {
    return new Response(
      JSON.stringify({ message: "This endpoint only supports POST requests." }),
      { status: 405 }
    );
  }
  