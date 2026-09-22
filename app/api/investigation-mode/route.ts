import { NextRequest, NextResponse } from "next/server";

type InvestigationMode =
  | "general"
  | "shopping"
  | "news"
  | "company"
  | "fact-check";

function detectMode(claim: string): InvestigationMode {
  const text = claim.toLowerCase();

  if (
    text.includes("price") ||
    text.includes("₹") ||
    text.includes("rs ") ||
    text.includes("buy") ||
    text.includes("cost") ||
    text.includes("discount") ||
    text.includes("offer")
  ) {
    return "shopping";
  }

  if (
    text.includes("today") ||
    text.includes("latest") ||
    text.includes("recent") ||
    text.includes("news") ||
    text.includes("yesterday")
  ) {
    return "news";
  }

  if (
    text.includes("company") ||
    text.includes("startup") ||
    text.includes("hiring") ||
    text.includes("job") ||
    text.includes("employee")
  ) {
    return "company";
  }

  if (
    text.includes("true") ||
    text.includes("false") ||
    text.includes("real") ||
    text.includes("fake") ||
    text.includes("claim") ||
    text.includes("rumour") ||
    text.includes("rumor") ||
    text.includes("viral") ||
    text.includes("fact")
  ) {
    return "fact-check";
  }

  return "general";
}

function getSearchStrategy(mode: InvestigationMode) {
  switch (mode) {
    case "shopping":
      return {
        label: "Shopping Investigation",
        description:
          "Focus on product information, pricing, availability, and seller evidence.",
        searches: ["web"],
      };

    case "news":
      return {
        label: "News Investigation",
        description:
          "Focus on recent reporting, dates, and independent news sources.",
        searches: ["web"],
      };

    case "company":
      return {
        label: "Company Investigation",
        description:
          "Focus on company information, official pages, jobs, and independent sources.",
        searches: ["web"],
      };

    case "fact-check":
      return {
        label: "Fact Check Investigation",
        description:
          "Focus on evidence that supports, contradicts, or leaves the claim unclear.",
        searches: ["web"],
      };

    default:
      return {
        label: "General Investigation",
        description:
          "Search the web for relevant evidence and compare the available information.",
        searches: ["web"],
      };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const claim =
      typeof body?.claim === "string"
        ? body.claim.trim()
        : "";

    if (!claim) {
      return NextResponse.json(
        {
          error: "Please enter a claim.",
        },
        { status: 400 }
      );
    }

    const mode = detectMode(claim);
    const strategy = getSearchStrategy(mode);

    return NextResponse.json({
      claim,
      mode,
      label: strategy.label,
      description: strategy.description,
      searches: strategy.searches,
      methodology: {
        step1: "Classify the investigation type.",
        step2: "Select relevant evidence sources.",
        step3: "Collect web evidence.",
        step4:
          "Compare supporting, contradicting, and unclear evidence.",
      },
    });
  } catch (error) {
    console.error(
      "Investigation mode error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to determine investigation mode.",
      },
      { status: 500 }
    );
  }
}
