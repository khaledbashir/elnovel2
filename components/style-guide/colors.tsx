"use client";

import * as React from "react";

const tokens = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--muted",
  "--muted-foreground",
  "--border",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--accent",
  "--accent-foreground",
  "--resizable-handle-hex",
];

export function ColorStyleGuide() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Color Style Guide</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((t) => (
          <div key={t} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">{t}</span>
              <span className="font-mono text-xs text-muted-foreground">var({t})</span>
            </div>
            <div className="mt-3 h-10 rounded" style={{ background: `var(${t})` }} />
          </div>
        ))}
      </div>
    </div>
  );
}