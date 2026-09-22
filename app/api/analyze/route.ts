import { NextRequest, NextResponse } from "next/server";

type Evidence = {
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
};

type Classification =
  | "supporting"
  | "contradicting"
  | "unclear";

function getDomain(link?: string) {
  if (!link) return "unknown";

  try {
    return new URL(link).hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}

function getSourceQuality(link?: string) {
  const domain = getDomain(link);

  if (
    domain.endsWith(".gov") ||
    domain.includes(".gov.")
  ) {
    return {
      type: "Government",
      quality: "high",
      points: 3,
    };
  }

  if (
    domain.endsWith(".edu") ||
    domain.includes(".ac.")
  ) {
    return {
      type: "Academic",
      quality: "high",
      points: 3,
    };
  }

  const trustedNews = [
    "reuters.com",
    "bbc.com",
    "bbc.co.uk",
    "thehindu.com",
    "indianexpress.com",
    "apnews.com",
  ];

  if (trustedNews.some((site) => domain.includes(site))) {
    return {
      type: "News",
      quality: "medium-high",
      points: 2,
    };
  }

  return {
    type: "Web",
    quality: "unknown",
    points: 1,
  };
}

function classifyEvidence(
  claim: string,
  evidence: Evidence
): Classification {
  const text = `
    ${claim}
    ${evidence.title || ""}
    ${evidence.snippet || ""}
  `.toLowerCase();

  const supportingSignals = [
    "confirmed",
    "official",
    "available",
    "launched",
    "verified",
    "announced",
    "according to",
    "reported",
    "yes",
    "true",
    "supports",
    "shows that",
    "found that",
  ];

  const contradictingSignals = [
    "false",
    "fake",
    "denied",
    "not true",
    "incorrect",
    "scam",
    "unavailable",
    "debunked",
    "no evidence",
    "misleading",
    "hoax",
    "disproven",
    "does not exist",
  ];

  let supportingScore = 0;
  let contradictingScore = 0;

  for (const signal of supportingSignals) {
    if (text.includes(signal)) {
      supportingScore++;
    }
  }

  for (const signal of contradictingSignals) {
    if (text.includes(signal)) {
      contradictingScore++;
    }
  }

  if (
    supportingScore > contradictingScore &&
    supportingScore > 0
  ) {
    return "supporting";
  }

  if (
    contradictingScore > supportingScore &&
    contradictingScore > 0
  ) {
    return "contradicting";
  }

  return "unclear";
}

function getExplanation(
  classification: Classification,
  quality: string
) {
  if (classification === "supporting") {
    return `This source contains language consistent with the claim. Source quality: ${quality}.`;
  }

  if (classification === "contradicting") {
    return `This source contains language that conflicts with the claim. Source quality: ${quality}.`;
  }

  return `This source does not provide a clear enough signal either way. Source quality: ${quality}.`;
}

export async function POST(request: NextRequest) {
  try {
    const { claim, results } = await request.json();

    if (!claim || !Array.isArray(results)) {
      return NextResponse.json(
        {
          error:
            "Claim and evidence results are required.",
        },
        { status: 400 }
      );
    }

    const analyzedResults = results.map(
      (result: Evidence) => {
        const sourceInfo = getSourceQuality(result.link);

        const classification = classifyEvidence(
          claim,
          result
        );

        return {
          ...result,
          classification,
          sourceType: sourceInfo.type,
          sourceQuality: sourceInfo.quality,
          sourcePoints: sourceInfo.points,
          explanation: getExplanation(
            classification,
            sourceInfo.quality
          ),
        };
      }
    );

    const supporting = analyzedResults.filter(
      (item) =>
        item.classification === "supporting"
    );

    const contradicting = analyzedResults.filter(
      (item) =>
        item.classification === "contradicting"
    );

    const unclear = analyzedResults.filter(
      (item) =>
        item.classification === "unclear"
    );

    const total = analyzedResults.length;

    const weightedSupporting =
      supporting.reduce(
        (sum, item) => sum + item.sourcePoints,
        0
      );

    const weightedContradicting =
      contradicting.reduce(
        (sum, item) => sum + item.sourcePoints,
        0
      );

    const totalWeightedEvidence =
      analyzedResults.reduce(
        (sum, item) => sum + item.sourcePoints,
        0
      );

    let evidenceBalance = 50;

    if (totalWeightedEvidence > 0) {
      evidenceBalance = Math.round(
        ((weightedSupporting -
          weightedContradicting +
          totalWeightedEvidence) /
          (totalWeightedEvidence * 2)) *
          100
      );
    }

    const uniqueDomains = new Set(
      analyzedResults.map((item) =>
        getDomain(item.link)
      )
    ).size;

    const sourceDiversity =
      total === 0
        ? 0
        : Math.round(
            (uniqueDomains / total) * 100
          );

    return NextResponse.json({
      claim,

      evidence: analyzedResults,

      summary: {
        total,
        supporting: supporting.length,
        contradicting: contradicting.length,
        unclear: unclear.length,

        evidenceScore: evidenceBalance,

        uniqueSources: uniqueDomains,

        sourceDiversity,

        weightedSupporting,
        weightedContradicting,
      },

      methodology: {
        description:
          "TrustLens currently combines evidence language, source type, and source diversity to organize web evidence.",

        limitation:
          "This is a prototype evidence-analysis system. It does not determine whether a claim is objectively true or false.",
      },
    });
  } catch (error) {
    console.error(
      "Analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to analyze evidence.",
      },
      { status: 500 }
    );
  }
}