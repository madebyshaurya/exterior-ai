import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with server-side environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    const { imageData, folder } = data;
    
    if (!imageData) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }
    
    // Create a timestamp for the signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate a unique public_id
    const randomString = Math.random().toString(36).substring(2, 8);
    const publicId = `${folder}/${timestamp}_${randomString}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageData, {
      folder,
      public_id: publicId,
      timestamp
    });
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
