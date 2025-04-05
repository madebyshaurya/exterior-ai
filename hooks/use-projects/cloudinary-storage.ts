// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Upload a file to Cloudinary
export async function uploadFile(file: File, folder: string): Promise<string> {
  try {
    console.log(`Starting file upload to Cloudinary folder: ${folder}`);

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    console.log("File converted to base64");

    // Create a unique public_id based on timestamp and random string
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    const publicId = `${folder}/${timestamp}_${randomString}`;

    console.log("Creating FormData for Cloudinary upload");
    // Create a FormData object
    const formData = new FormData();
    formData.append("file", base64Data);

    // For signed upload (more secure)
    // We'll use a timestamp and API key directly
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "297570152235";
    formData.append("api_key", apiKey);

    // Add additional parameters
    formData.append("folder", folder);
    formData.append("timestamp", timestamp.toString());
    formData.append("public_id", publicId);

    console.log("Sending upload request to server-side API route");

    // Try the server-side API route first (more secure)
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: base64Data,
          folder: folder,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      console.log("Server-side upload successful");
      return data.url;
    } catch (serverError) {
      console.error(
        "Server-side upload failed, falling back to direct upload:",
        serverError
      );

      // Fallback to direct upload if server-side fails
      // Get cloud name from environment variable
      const cloudName =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "djvhgbnje";

      console.log(
        "Falling back to direct Cloudinary upload to cloud:",
        cloudName
      );
      // Upload to Cloudinary using the upload API
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      console.log("Cloudinary upload successful:", data);
      return data.secure_url;
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

// Upload a project image
export async function uploadProjectImage(
  userId: string,
  projectId: string,
  file: File
): Promise<string> {
  console.log(
    `Uploading project image for user ${userId}, project ${projectId}`
  );
  console.log("File details:", {
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024).toFixed(2)} KB`,
  });

  // Create a folder structure similar to what we had with Firebase
  const folder = `users/${userId}/projects/${projectId}`;

  try {
    // Upload to Cloudinary
    console.log(`Uploading to Cloudinary folder: ${folder}`);
    const imageUrl = await uploadFile(file, folder);
    console.log(`Upload successful, image URL: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error("Error uploading project image:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

// Delete a file (not implemented for Cloudinary in this version)
export async function deleteFile(path: string): Promise<void> {
  console.log(
    `Delete file functionality not implemented for Cloudinary: ${path}`
  );
  // Cloudinary deletion would require the public_id, which we don't have from just the URL
  // For a complete implementation, you would need to store the public_id along with the URL
}
