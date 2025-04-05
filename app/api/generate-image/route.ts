import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY!;
const MODEL_ID = "gemini-2.0-flash-exp-image-generation";

export async function POST(request: NextRequest) {
  try {
    const { prompt, originalImageUrl } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    // Check if we have an original image to work with
    if (!originalImageUrl) {
      console.log("No original image provided, generating from scratch");
    } else {
      console.log("Original image provided, will use for transformation");
    }

    // Enhance the prompt with the realistic instruction
    const enhancedPrompt = `${prompt} make it look ultra realistic as well while keeping the unchangeable natural features`;

    console.log("Sending prompt to Gemini:", enhancedPrompt);

    // Prepare the request for Gemini
    let requestBody;

    if (originalImageUrl) {
      // If we have an original image, include it in the request
      let imageData;

      try {
        // Fetch the image if it's a URL
        if (originalImageUrl.startsWith("http")) {
          console.log("Fetching original image from URL");
          const imageResponse = await fetch(originalImageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          }
          const imageBlob = await imageResponse.blob();
          const buffer = await imageBlob.arrayBuffer();
          imageData = Buffer.from(buffer).toString("base64");
        } else if (originalImageUrl.startsWith("data:image")) {
          // Extract base64 data from data URL
          console.log("Extracting base64 data from data URL");
          imageData = originalImageUrl.split(",")[1];
        }

        console.log("Successfully processed original image");

        // Create request with both image and text
        requestBody = {
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageData,
                  },
                },
                {
                  text: enhancedPrompt,
                },
              ],
            },
          ],
        };
      } catch (imageError) {
        console.error("Error processing original image:", imageError);
        // Fall back to text-only request
        requestBody = {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: enhancedPrompt,
                },
              ],
            },
          ],
        };
      }
    } else {
      // Text-only request
      requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: enhancedPrompt,
              },
            ],
          },
        ],
      };
    }

    // Create the complete request body with generation config
    const completeRequestBody = {
      ...requestBody,
      generationConfig: {
        responseModalities: ["image", "text"],
        responseMimeType: "text/plain",
      },
    };

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeRequestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate image", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Gemini response received");

    // Extract the image data from the response
    let imageBase64 = "";
    let imageMimeType = "";
    let responseText = "";

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            responseText = part.text;
          }
          if (
            part.inlineData &&
            part.inlineData.mimeType.startsWith("image/")
          ) {
            imageBase64 = part.inlineData.data;
            imageMimeType = part.inlineData.mimeType;
          }
        }
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        {
          error: "No image was generated",
        },
        { status: 400 }
      );
    }

    // Upload the image to ImgBB
    try {
      console.log("Uploading generated image to ImgBB...");

      const formData = new FormData();
      formData.append("key", "29582b3e174fd6a70bcf007f2985b705"); // Your ImgBB API key
      formData.append("image", imageBase64);
      formData.append("name", `gemini_generated_${Date.now()}`);

      const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });

      if (!imgbbResponse.ok) {
        throw new Error(`ImgBB upload failed: ${imgbbResponse.status}`);
      }

      const imgbbData = await imgbbResponse.json();

      if (!imgbbData.success) {
        throw new Error(imgbbData.error?.message || "ImgBB upload failed");
      }

      console.log("Image uploaded to ImgBB successfully");

      // Return the ImgBB URL instead of the base64 data
      return NextResponse.json({
        success: true,
        imageUrl: imgbbData.data.url,
        displayUrl: imgbbData.data.display_url, // Smaller thumbnail URL
        deleteUrl: imgbbData.data.delete_url, // URL to delete the image if needed
        responseText,
      });
    } catch (imgbbError) {
      console.error("Error uploading to ImgBB:", imgbbError);

      // Fall back to returning the base64 data but with a warning
      return NextResponse.json({
        success: true,
        imageUrl: `data:${imageMimeType};base64,${imageBase64.substring(
          0,
          100
        )}...`, // Truncated preview
        fullImageTooLarge: true,
        responseText,
        error:
          "Image was generated but could not be uploaded to storage. The returned URL is truncated.",
      });
    }
  } catch (error) {
    console.error("Error in image generation API:", error);
    return NextResponse.json(
      { error: "Failed to process image generation request" },
      { status: 500 }
    );
  }
}
