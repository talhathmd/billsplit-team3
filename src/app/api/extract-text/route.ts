import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
      const { imageUrl } = await req.json(); // Expect JSON with image URL
  
      if (!imageUrl) {
        return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
      }
  
      console.log("Image URL received:", imageUrl);
  
      // Call Google Vision API
      const visionResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { source: { imageUri: imageUrl } },
                features: [{ type: "TEXT_DETECTION" }],
              },
            ],
          }),
        }
      );
  
      const visionData = await visionResponse.json();
      console.log("Vision API Response:", visionData);
  
      const extractedText = visionData.responses?.[0]?.fullTextAnnotation?.text || "No text found";
  
      return NextResponse.json({ text: extractedText });
    } catch (error) {
      console.error("Error extracting text:", error);
      return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
    }
  }
  