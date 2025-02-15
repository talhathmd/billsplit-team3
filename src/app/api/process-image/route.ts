import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    // Fetch the image
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    // Convert the image to grayscale
    const grayscaleImage = await sharp(Buffer.from(buffer))
      .grayscale()
      .toBuffer();

    // Return the processed image as a base64 string
    const base64Image = grayscaleImage.toString('base64');
    return NextResponse.json({ image: base64Image });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
} 