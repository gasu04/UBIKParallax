/*
 * GraphPage — Full-screen graph view
 * Bauhaus: geometric, minimal chrome
 */

import GraphView from "@/components/GraphView";

export default function GraphPage() {
  return (
    <div className="fade-in">
      <div className="px-8 lg:px-16 pt-8 lg:pt-12 pb-6">
        <h1 style={{ fontFamily: 'var(--font-display)' }}
            className="text-2xl lg:text-3xl font-bold text-[oklch(0.12_0_0)] mb-2">
          GRAPH
        </h1>
        <div className="bauhaus-rule-red w-16 mb-4" />
        <p style={{ fontFamily: 'var(--font-mono)' }}
           className="text-xs text-[oklch(0.50_0_0)] max-w-md mb-2">
          Every node is an observation. Every edge is a connection. Click a node to read.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)' }}
           className="text-[10px] text-[oklch(0.60_0_0)]">
          ● Circle = Mathematics &nbsp;&nbsp; ■ Square = Philosophy &nbsp;&nbsp; ◆ Diamond = Journal
        </p>
      </div>

      <div className="bauhaus-rule" />

      <div className="bg-[oklch(0.98_0.005_90)]">
        <GraphView height={600} interactive={true} />
      </div>
    </div>
  );
}
