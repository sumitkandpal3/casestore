// app/api/generate-image/route.ts
import { NextResponse } from "next/server";

const HUGGING_FACE_API_URL =
  "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";

const HUGGING_FACE_API_KEY = "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"; // Replace with env var in production

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Prompt received:", prompt);

    const response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        options: {
          wait_for_model: true, // Ensures model is loaded if not already
        },
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error response from API:", errorResponse);
      return NextResponse.json(
        { error: "Error from Hugging Face API", details: errorResponse },
        { status: 500 }
      );
    }

    // Instead of treating it as JSON, read the response as a binary stream
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert the binary buffer to a Base64 string
    const base64Image = buffer.toString("base64");

    // Prepare the data URI for returning the image in base64 format
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (err) {
    console.error("Error generating image:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
