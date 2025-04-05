import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get("audio") as Blob;

    if (!audioBlob) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log(
      "Received audio file, size:",
      audioBlob.size,
      "type:",
      audioBlob.type
    );

    // For debugging - log the available models
    try {
      const modelsResponse = await fetch(
        "https://api.elevenlabs.io/v1/models",
        {
          method: "GET",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        console.log("Available models:", modelsData);
      }
    } catch (err) {
      console.error("Error fetching models:", err);
    }

    // Create a new FormData for the ElevenLabs API
    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append("file", audioBlob, "recording.webm");
    // Use the default model
    elevenLabsFormData.append("model_id", "eleven_multilingual_v2");

    console.log("Sending request to ElevenLabs API...");

    // Call ElevenLabs Scribe API
    const response = await fetch(
      "https://api.elevenlabs.io/v1/speech-to-text",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          Accept: "application/json",
        },
        body: elevenLabsFormData,
      }
    );

    console.log("ElevenLabs API response status:", response.status);

    if (!response.ok) {
      let errorText = "";
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
      }

      console.error("ElevenLabs API error:", errorText);
      return NextResponse.json(
        { error: "Failed to transcribe audio", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Transcription successful:", data);

    return NextResponse.json({
      success: true,
      transcript: data.text || "",
    });
  } catch (error) {
    console.error("Error in transcription API:", error);
    return NextResponse.json(
      {
        error: "Failed to process transcription request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
