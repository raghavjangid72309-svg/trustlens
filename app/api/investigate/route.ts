import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

type SerpResult = {
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { claim } = await request.json();

    if (!claim || !claim.trim()) {
      return NextResponse.json(
        { error: "Please enter a claim." },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "SerpApi API key is missing." },
        { status: 500 }
      );
    }

    // Only ONE SerpApi search
    const response = await axios.get(
      "https://serpapi.com/search.json",
      {
        params: {
          engine: "google",
          q: claim.trim(),
          api_key: apiKey,
        },
      }
    );

    const results: SerpResult[] = (
      response.data.organic_results || []
    ).slice(0, 8);

    return NextResponse.json({
      claim,
      results: results.map((result) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        source: result.source,
      })),
    });
  } catch (error) {
    console.error("Investigation error:", error);

    return NextResponse.json(
      {
        error: "Failed to investigate the claim.",
      },
      { status: 500 }
    );
  }
}
