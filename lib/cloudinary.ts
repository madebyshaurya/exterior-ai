import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'exteriorai', // Replace with your cloud name
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '123456789012345', // Replace with your API key
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret', // Replace with your API secret
  secure: true
});

export default cloudinary;

// Helper function to upload an image to Cloudinary
export async function uploadToCloudinary(file: File, folder: string = 'projects'): Promise<string> {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Create a unique public_id based on timestamp and random string
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    const publicId = `${folder}/${timestamp}_${randomString}`;
    
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('upload_preset', 'exteriorai_unsigned'); // Create an unsigned upload preset in your Cloudinary dashboard
    formData.append('folder', folder);
    formData.append('public_id', publicId);
    
    // Upload to Cloudinary using the upload API
    const response = await fetch(`https://api.cloudinary.com/v1_1/exteriorai/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    console.log('Cloudinary upload successful:', data);
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
