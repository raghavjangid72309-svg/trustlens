"use client";

import { useState } from "react";

type SearchResult = {
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
};

type InvestigationData = {
  claim: string;
  results: SearchResult[];
};

type AnalyzedEvidence = SearchResult & {
  classification: "supporting" | "contradicting" | "unclear";
  sourceType: string;
  sourceQuality: string;
  sourcePoints: number;
  explanation: string;
};

type AnalysisData = {
  evidence: AnalyzedEvidence[];
  summary: {
    total: number;
    supporting: number;
    contradicting: number;
    unclear: number;
    evidenceScore: number;
    uniqueSources: number;
    sourceDiversity: number;
    weightedSupporting: number;
    weightedContradicting: number;
  };
  methodology: {
    description: string;
    limitation: string;
  };
};

/* ---------------- HELPERS ---------------- */

function getDomain(link?: string) {
  if (!link) return "Unknown source";

  try {
    return new URL(link).hostname.replace("www.", "");
  } catch {
    return "Unknown source";
  }
}

function getSourceType(link?: string) {
  const domain = getDomain(link);

  if (
    domain.endsWith(".gov") ||
    domain.includes(".gov.")
  ) {
    return "Government";
  }

  if (
    domain.endsWith(".edu") ||
    domain.includes(".ac.")
  ) {
    return "Academic";
  }

  if (
    domain.includes("reuters") ||
    domain.includes("bbc") ||
    domain.includes("thehindu") ||
    domain.includes("indianexpress") ||
    domain.includes("apnews")
  ) {
    return "News";
  }

  return "Web";
}

/*
  Important:
  We do not blindly call response.json().
  This lets us identify HTML responses instead of showing
  "Unexpected token '<'".
*/
async function readJsonResponse(
  response: Response,
  endpoint: string
) {
  const contentType =
    response.headers.get("content-type") || "";

  const text = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `${endpoint} returned ${response.status} instead of JSON.`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `${endpoint} returned invalid JSON.`
    );
  }
}

/* ---------------- PAGE ---------------- */

export default function Home() {
  const [claim, setClaim] = useState("");

  const [data, setData] =
    useState<InvestigationData | null>(null);

  const [analysis, setAnalysis] =
    useState<AnalysisData | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ---------------- INVESTIGATE ---------------- */

  const investigate = async () => {
    if (!claim.trim()) {
      setError("Please enter a claim first.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    setAnalysis(null);

    try {
      /* STEP 1: LIVE WEB SEARCH */

      const response = await fetch(
        "/api/investigate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            claim: claim.trim(),
          }),
        }
      );

      const result = await readJsonResponse(
        response,
        "/api/investigate"
      );

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Investigation failed."
        );
      }

      setData(result);

      /* STEP 2: LOCAL EVIDENCE ANALYSIS */

      const analysisResponse =
        await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            claim: result.claim,
            results: result.results,
          }),
        });

      const analysisResult =
        await readJsonResponse(
          analysisResponse,
          "/api/analyze"
        );

      if (!analysisResponse.ok) {
        throw new Error(
          analysisResult?.error ||
            "Evidence analysis failed."
        );
      }

      setAnalysis(analysisResult);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Investigation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- NEW INVESTIGATION ---------------- */

  const startNewInvestigation = () => {
    setClaim("");
    setData(null);
    setAnalysis(null);
    setError("");
  };

  const exampleClaims = [
    "Is the iPhone 15 available in India?",
    "Is this company hiring freshers?",
    "Is this viral claim supported by evidence?",
  ];

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07090d] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-bold text-black">
              T
            </div>

            <span className="text-xl font-semibold">
              TrustLens
            </span>

          </div>

          <div className="hidden items-center gap-5 text-sm text-gray-500 sm:flex">

            <span>
              Evidence Intelligence
            </span>

            <span className="h-1 w-1 rounded-full bg-gray-700" />

            <span>
              Live Web Research
            </span>

          </div>

        </div>

      </header>


      {/* ================= LANDING ================= */}

      {!data && !loading && (

        <>

          {/* HERO */}

          <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 text-center sm:px-6 sm:pt-28">

            <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-white/[0.025] blur-3xl" />

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-gray-400 sm:text-sm">

              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

              Investigate claims with live web evidence

            </div>

            <h1 className="mx-auto max-w-5xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">

              Don&apos;t just search.

              <br />

              <span className="bg-gradient-to-r from-white via-gray-300 to-gray-600 bg-clip-text text-transparent">
                Investigate.
              </span>

            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">

              TrustLens turns a simple claim into an
              evidence-backed investigation across the
              live web.

            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-600">

              <span>✓ Live web evidence</span>
              <span>✓ Source transparency</span>
              <span>✓ Evidence-first analysis</span>

            </div>


            {/* SEARCH BOX */}

            <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.035] p-2 shadow-2xl backdrop-blur">

              <div className="rounded-2xl bg-[#0a0d12]">

                <textarea
                  value={claim}
                  onChange={(e) =>
                    setClaim(e.target.value)
                  }
                  placeholder="Enter a claim you want to investigate..."
                  className="h-32 w-full resize-none rounded-t-2xl bg-transparent p-5 text-base leading-7 text-white outline-none placeholder:text-gray-600"
                />

                <div className="flex flex-col gap-4 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3 text-left">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                      🔎
                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Investigation engine
                      </p>

                      <p className="text-xs text-gray-700">
                        Search the live web for evidence
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={investigate}
                    disabled={loading}
                    className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Investigate →
                  </button>

                </div>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="mx-auto mt-5 max-w-4xl rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-left">

                <p className="text-sm font-medium text-red-300">
                  Investigation couldn&apos;t be completed
                </p>

                <p className="mt-2 text-xs leading-6 text-red-400">
                  {error}
                </p>

                <button
                  onClick={() => setError("")}
                  className="mt-3 text-xs text-red-300 underline"
                >
                  Dismiss
                </button>

              </div>

            )}


            {/* EXAMPLES */}

            <div className="mt-9">

              <p className="mb-4 text-[11px] uppercase tracking-[0.2em] text-gray-600">
                Try an investigation
              </p>

              <div className="flex flex-wrap justify-center gap-3">

                {exampleClaims.map(
                  (example) => (

                    <button
                      key={example}
                      onClick={() =>
                        setClaim(example)
                      }
                      className="rounded-full border border-white/10 bg-white/[0.015] px-4 py-2.5 text-sm text-gray-500 transition hover:border-white/20 hover:text-gray-200"
                    >
                      {example}
                    </button>

                  )
                )}

              </div>

            </div>

          </section>


          {/* FEATURES */}

          <section className="border-y border-white/10 bg-white/[0.012]">

            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6">

              <div className="grid gap-5 md:grid-cols-3">

                {[
                  {
                    number: "01",
                    icon: "🔎",
                    title: "Search beyond one result",
                    text:
                      "Collect relevant evidence from multiple web sources.",
                  },
                  {
                    number: "02",
                    icon: "🧩",
                    title: "Connect the evidence",
                    text:
                      "Organize sources around the claim instead of leaving you with a pile of links.",
                  },
                  {
                    number: "03",
                    icon: "🧠",
                    title: "Understand uncertainty",
                    text:
                      "Separate supporting evidence, contradictions, and information that remains unclear.",
                  },
                ].map((item) => (

                  <div
                    key={item.number}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-7"
                  >

                    <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      {item.icon}
                    </div>

                    <p className="text-xs text-gray-600">
                      {item.number}
                    </p>

                    <h2 className="mt-3 text-xl font-semibold">
                      {item.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-gray-500">
                      {item.text}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          </section>


          {/* HOW IT WORKS */}

          <section className="mx-auto max-w-7xl px-5 py-24 sm:px-6">

            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
                  HOW IT WORKS
                </p>

                <h2 className="mt-5 max-w-md text-3xl font-semibold sm:text-4xl">
                  From a question to an investigation.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-gray-500">
                  TrustLens makes web research more
                  structured, transparent, and understandable.
                </p>

              </div>

              <div className="space-y-4">

                {[
                  [
                    "01",
                    "Define the claim",
                    "Tell TrustLens exactly what you want to investigate.",
                  ],
                  [
                    "02",
                    "Gather evidence",
                    "Search the live web and collect relevant sources.",
                  ],
                  [
                    "03",
                    "Compare the evidence",
                    "Look for supporting, contradicting, and unclear information.",
                  ],
                  [
                    "04",
                    "Understand the result",
                    "Get a transparent evidence-based view.",
                  ],
                ].map(
                  ([number, title, text]) => (

                    <div
                      key={number}
                      className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
                    >

                      <span className="text-sm text-gray-700">
                        {number}
                      </span>

                      <div>

                        <h3 className="font-semibold">
                          {title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {text}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </section>


          {/* PRINCIPLE */}

          <section className="border-t border-white/10">

            <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6">

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12">

                <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
                  THE TRUSTLENS PRINCIPLE
                </p>

                <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
                  Don&apos;t ask the internet
                  <br />
                  to decide for you.
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-500">
                  TrustLens shows people the evidence,
                  explains uncertainty, and lets them make
                  the final judgment.
                </p>

              </div>

            </div>

          </section>


          {/* FOOTER */}

          <footer className="border-t border-white/10">

            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">

              <div className="flex items-center gap-2">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-black">
                  T
                </div>

                <span className="text-sm text-gray-400">
                  TrustLens
                </span>

              </div>

              <p className="text-xs text-gray-700">
                Search less. Investigate better.
              </p>

            </div>

          </footer>

        </>

      )}


      {/* ================= LOADING ================= */}

      {loading && (

        <section className="mx-auto max-w-5xl px-5 py-32 text-center">

          <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white" />

          <h2 className="text-xl font-semibold">
            Investigating your claim...
          </h2>

          <p className="mt-3 text-sm text-gray-600">
            Gathering and analyzing web evidence.
          </p>

        </section>

      )}


      {/* ================= DASHBOARD ================= */}

      {data && !loading && (

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6">

          {/* NEW INVESTIGATION */}

          <button
            onClick={startNewInvestigation}
            className="mb-10 text-sm text-gray-500 hover:text-white"
          >
            ← New investigation
          </button>


          {/* CLAIM */}

          <div className="mb-10">

            <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
              INVESTIGATION
            </p>

            <h1 className="mt-4 max-w-4xl break-words text-3xl font-semibold tracking-tight sm:text-5xl">
              {data.claim}
            </h1>

          </div>


          {/* SUMMARY */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

              <p className="text-xs uppercase tracking-widest text-gray-600">
                Sources
              </p>

              <p className="mt-3 text-3xl font-semibold">
                {data.results?.length ?? 0}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Web sources found
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

              <p className="text-xs uppercase tracking-widest text-gray-600">
                Supporting
              </p>

              <p className="mt-3 text-3xl font-semibold text-green-400">
                {analysis?.summary.supporting ?? 0}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Sources supporting
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

              <p className="text-xs uppercase tracking-widest text-gray-600">
                Contradicting
              </p>

              <p className="mt-3 text-3xl font-semibold text-red-400">
                {analysis?.summary.contradicting ?? 0}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Sources challenging
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

              <p className="text-xs uppercase tracking-widest text-gray-600">
                Evidence Score
              </p>

              <p className="mt-3 text-3xl font-semibold">
                {analysis
                  ? `${analysis.summary.evidenceScore}%`
                  : "—"}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Evidence balance
              </p>

            </div>


            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">

              <p className="text-xs uppercase tracking-widest text-gray-600">
                Source Diversity
              </p>

              <p className="mt-3 text-3xl font-semibold">
                {analysis
                  ? `${analysis.summary.sourceDiversity}%`
                  : "—"}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {analysis?.summary.uniqueSources ?? 0} unique domains
              </p>

            </div>

          </div>


          {/* STATUS */}

          <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] p-6">

            <h2 className="font-semibold">
              Evidence analyzed
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-500">
              TrustLens has organized the available web
              results into supporting, contradicting, and
              unclear evidence.
            </p>

            <p className="mt-3 text-xs text-yellow-500/60">
              Prototype classification — not a definitive
              truth determination.
            </p>

          </div>


          {/* SOURCES */}

          <div className="mt-14">

            <div className="mb-7">

              <p className="text-xs uppercase tracking-widest text-gray-600">
                EVIDENCE
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Sources discovered
              </h2>

            </div>


            <div className="grid gap-5 lg:grid-cols-2">

              {data.results?.map(
                (result, index) => {

                  const domain =
                    getDomain(result.link);

                  const sourceType =
                    getSourceType(result.link);

                  const analyzed =
                    analysis?.evidence.find(
                      (item) =>
                        item.link === result.link
                    );

                  const classification =
                    analyzed?.classification;

                  return (

                    <a
                      key={`${result.link}-${index}`}
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20 hover:bg-white/[0.04]"
                    >

                      <div className="flex gap-4">

                        <div className="min-w-0 flex-1">

                          <div className="mb-3 flex flex-wrap gap-2">

                            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gray-500">
                              {sourceType}
                            </span>

                            <span className="text-xs text-gray-700">
                              #{String(index + 1).padStart(2, "0")}
                            </span>

                            {classification === "supporting" && (

                              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-green-400">
                                Supporting
                              </span>

                            )}

                            {classification === "contradicting" && (

                              <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-red-400">
                                Contradicting
                              </span>

                            )}

                            {classification === "unclear" && (

                              <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-yellow-400">
                                Unclear
                              </span>

                            )}

                          </div>


                          {analyzed && (

                            <div className="mb-4 flex flex-wrap gap-2">

                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-wider text-gray-500">
                                {analyzed.sourceQuality} source
                              </span>

                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-wider text-gray-500">
                                {analyzed.sourcePoints} evidence weight
                              </span>

                            </div>

                          )}


                          <h3 className="break-words text-lg font-semibold leading-7">
                            {result.title || "Untitled source"}
                          </h3>

                          <p className="mt-2 break-all text-xs text-gray-600">
                            {domain}
                          </p>

                        </div>

                        <span className="shrink-0 text-gray-600">
                          ↗
                        </span>

                      </div>


                      {result.snippet && (

                        <p className="mt-5 border-t border-white/5 pt-5 text-sm leading-7 text-gray-400">
                          {result.snippet}
                        </p>

                      )}


                      {analyzed?.explanation && (

                        <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4">

                          <p className="text-[10px] uppercase tracking-widest text-gray-600">
                            WHY THIS SOURCE MATTERS
                          </p>

                          <p className="mt-2 text-xs leading-6 text-gray-500">
                            {analyzed.explanation}
                          </p>

                        </div>

                      )}

                    </a>

                  );
                }
              )}

            </div>

          </div>


          {/* EVIDENCE CATEGORIES */}

          <div className="mt-14 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-green-500/10 bg-green-500/[0.03] p-7">

              <p className="text-xs uppercase tracking-widest text-green-400/60">
                SUPPORTING
              </p>

              <p className="mt-4 text-4xl font-semibold text-green-400">
                {analysis?.summary.supporting ?? 0}
              </p>

              <h3 className="mt-4 text-xl font-semibold">
                Evidence that supports
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                Sources containing information consistent
                with the claim.
              </p>

            </div>


            <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-7">

              <p className="text-xs uppercase tracking-widest text-red-400/60">
                CONTRADICTING
              </p>

              <p className="mt-4 text-4xl font-semibold text-red-400">
                {analysis?.summary.contradicting ?? 0}
              </p>

              <h3 className="mt-4 text-xl font-semibold">
                Evidence that conflicts
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                Sources containing information inconsistent
                with the claim.
              </p>

            </div>


            <div className="rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.03] p-7">

              <p className="text-xs uppercase tracking-widest text-yellow-400/60">
                UNCLEAR
              </p>

              <p className="mt-4 text-4xl font-semibold text-yellow-400">
                {analysis?.summary.unclear ?? 0}
              </p>

              <h3 className="mt-4 text-xl font-semibold">
                Missing or unclear
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-500">
                Evidence that does not clearly support or
                contradict the claim.
              </p>

            </div>

          </div>


          {/* EVIDENCE BALANCE */}

          {analysis && (

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-7">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs uppercase tracking-widest text-gray-600">
                    EVIDENCE BALANCE
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Current evidence score
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                    This score represents the balance of
                    the current evidence classification.
                    It is not a probability that the claim
                    is true.
                  </p>

                </div>

                <div className="text-left sm:text-right">

                  <p className="text-4xl font-bold">
                    {analysis.summary.evidenceScore}%
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    Evidence balance
                  </p>

                </div>

              </div>


              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5">

                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{
                    width: `${analysis.summary.evidenceScore}%`,
                  }}
                />

              </div>

            </div>

          )}


          {/* METHODOLOGY */}

          {analysis?.methodology && (

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-7">

              <p className="text-xs uppercase tracking-widest text-gray-600">
                HOW TRUSTLENS ANALYZES
              </p>

              <h3 className="mt-3 text-xl font-semibold">
                Transparent methodology
              </h3>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500">
                {analysis.methodology.description}
              </p>

              <div className="mt-5 rounded-xl border border-yellow-500/10 bg-yellow-500/[0.03] p-4">

                <p className="text-xs leading-6 text-yellow-500/60">
                  {analysis.methodology.limitation}
                </p>

              </div>

            </div>

          )}


          {/* END */}

          <div className="mt-16 border-t border-white/10 pt-8">

            <button
              onClick={startNewInvestigation}
              className="text-sm text-gray-500 hover:text-white"
            >
              ← Start another investigation
            </button>

          </div>

        </section>

      )}

    </main>
  );
}
