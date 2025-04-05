// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Simple function to upload to ImgBB (free image hosting)
export async function uploadFile(file: File, folder: string): Promise<string> {
  try {
    console.log(`Starting file upload to ImgBB`);

    // Convert file to base64 (remove the data:image/jpeg;base64, part)
    const base64Data = await fileToBase64(file);
    const base64Clean = base64Data.split(",")[1];
    console.log("File converted to base64");

    // Create FormData for ImgBB
    const formData = new FormData();
    formData.append("key", "29582b3e174fd6a70bcf007f2985b705"); // Your ImgBB API key
    formData.append("image", base64Clean);
    formData.append("name", `${folder}_${Date.now()}`);

    console.log("Sending upload request to ImgBB");
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Upload failed");
    }

    console.log("ImgBB upload successful:", data);
    return data.data.url;
  } catch (error) {
    console.error("Error uploading to ImgBB:", error);
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

  // Create a folder path for organization
  const folder = `exteriorai_${userId}_${projectId}`;

  try {
    // Upload to ImgBB
    console.log(`Uploading to ImgBB with folder: ${folder}`);
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

// Delete a file (not implemented for ImgBB in this version)
export async function deleteFile(path: string): Promise<void> {
  console.log(`Delete file functionality not implemented for ImgBB: ${path}`);
  // ImgBB doesn't provide a simple API for deletion without authentication
}
