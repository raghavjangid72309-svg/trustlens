type EvidenceItem = {
  title?: string;
  link?: string;
  classification: "supporting" | "contradicting" | "unclear";
};

type EvidenceGraphProps = {
  claim: string;
  evidence: EvidenceItem[];
};

export default function EvidenceGraph({
  claim,
  evidence,
}: EvidenceGraphProps) {
  const supporting = evidence.filter(
    (item) => item.classification === "supporting"
  );

  const contradicting = evidence.filter(
    (item) => item.classification === "contradicting"
  );

  const unclear = evidence.filter(
    (item) => item.classification === "unclear"
  );

  return (
    <div className="mt-14 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">

      {/* HEADER */}

      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
          EVIDENCE GRAPH
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Evidence connected to the claim
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          TrustLens organizes discovered sources by how their
          available evidence relates to the claim.
        </p>
      </div>


      {/* GRAPH */}

      <div className="overflow-x-auto pb-4">

        <div className="min-w-[900px]">

          {/* CLAIM NODE */}

          <div className="flex justify-center">

            <div className="relative max-w-xl rounded-2xl border border-white/20 bg-white/[0.06] px-7 py-6 text-center shadow-2xl shadow-black/20">

              <div className="absolute -inset-px -z-10 rounded-2xl bg-white/[0.02] blur-xl" />

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-600">
                INVESTIGATION CLAIM
              </p>

              <p className="mt-3 text-sm font-medium leading-6 text-white">
                {claim}
              </p>

            </div>

          </div>


          {/* MAIN CONNECTOR */}

          <div className="relative mx-auto h-16 w-full">

            <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-white/20" />

            <div className="absolute left-[16.66%] right-[16.66%] top-8 h-px bg-white/10" />

            <div className="absolute left-[16.66%] top-8 h-8 w-px bg-white/10" />

            <div className="absolute left-1/2 top-8 h-8 w-px -translate-x-1/2 bg-white/10" />

            <div className="absolute right-[16.66%] top-8 h-8 w-px bg-white/10" />

          </div>


          {/* THREE BRANCHES */}

          <div className="grid grid-cols-3 gap-5">

            <EvidenceColumn
              title="Supporting"
              count={supporting.length}
              color="green"
              items={supporting}
            />

            <EvidenceColumn
              title="Contradicting"
              count={contradicting.length}
              color="red"
              items={contradicting}
            />

            <EvidenceColumn
              title="Unclear"
              count={unclear.length}
              color="yellow"
              items={unclear}
            />

          </div>

        </div>

      </div>


      {/* LEGEND */}

      <div className="mt-8 flex flex-wrap gap-5 border-t border-white/5 pt-6 text-xs text-gray-600">

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Supporting evidence
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Contradicting evidence
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          Unclear evidence
        </div>

      </div>

    </div>
  );
}


function EvidenceColumn({
  title,
  count,
  color,
  items,
}: {
  title: string;
  count: number;
  color: "green" | "red" | "yellow";
  items: EvidenceItem[];
}) {
  const styles = {
    green: {
      border: "border-green-500/20",
      bg: "bg-green-500/[0.04]",
      text: "text-green-400",
      line: "bg-green-400/20",
    },
    red: {
      border: "border-red-500/20",
      bg: "bg-red-500/[0.04]",
      text: "text-red-400",
      line: "bg-red-400/20",
    },
    yellow: {
      border: "border-yellow-500/20",
      bg: "bg-yellow-500/[0.04]",
      text: "text-yellow-400",
      line: "bg-yellow-400/20",
    },
  };

  const style = styles[color];

  return (
    <div>

      {/* CATEGORY */}

      <div
        className={`rounded-2xl border ${style.border} ${style.bg} px-5 py-4 text-center`}
      >

        <p
          className={`text-[10px] uppercase tracking-[0.2em] ${style.text}`}
        >
          {title}
        </p>

        <p
          className={`mt-2 text-3xl font-semibold ${style.text}`}
        >
          {count}
        </p>

      </div>


      {/* CATEGORY CONNECTOR */}

      {items.length > 0 && (
        <div className="flex justify-center">
          <div
            className={`h-6 w-px ${style.line}`}
          />
        </div>
      )}


      {/* SOURCES */}

      <div className="space-y-3">

        {items.length === 0 ? (

          <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center">
            <p className="text-xs text-gray-700">
              No evidence classified here
            </p>
          </div>

        ) : (

          items.map((item, index) => (
            <EvidenceNode
              key={`${item.link}-${index}`}
              item={item}
              number={index + 1}
            />
          ))

        )}

      </div>

    </div>
  );
}


function EvidenceNode({
  item,
  number,
}: {
  item: EvidenceItem;
  number: number;
}) {
  let domain = "Unknown source";

  if (item.link) {
    try {
      domain = new URL(item.link)
        .hostname
        .replace("www.", "");
    } catch {
      domain = "Unknown source";
    }
  }

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04]"
    >

      <div className="flex items-start gap-3">

        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] text-gray-500">
          {String(number).padStart(2, "0")}
        </span>

        <div className="min-w-0">

          <p className="line-clamp-2 text-sm font-medium leading-6 text-gray-300 group-hover:text-white">
            {item.title || "Untitled source"}
          </p>

          <p className="mt-2 truncate text-[10px] text-gray-600">
            {domain}
          </p>

        </div>

        <span className="ml-auto text-gray-700 transition group-hover:text-gray-300">
          ↗
        </span>

      </div>

    </a>
  );
}
