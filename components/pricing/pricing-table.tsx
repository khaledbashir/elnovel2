"use client";

import React from "react";
// We'll reuse the existing pricing table component
// For now, export a simple placeholder that matches the schema
// TODO: Import the actual PricingTable component from /novel/pricingtale

export interface PricingTableProps {
  rows?: Array<{
    id: string;
    role: string;
    description: string;
    hours: number;
    rate: number;
  }>;
  discount?: number;
  onUpdate?: (data: any) => void;
}

const PricingTable: React.FC<PricingTableProps> = ({
  rows = [],
  discount = 0,
  onUpdate,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-card rounded-lg border border-border shadow-sm">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Project Pricing
      </h2>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">
          No pricing data yet. Tambo will generate pricing table here.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex justify-between p-2 border border-border rounded"
            >
              <div>
                <div className="font-medium">{row.role}</div>
                <div className="text-sm text-muted-foreground">
                  {row.description}
                </div>
              </div>
              <div className="text-right">
                <div>{row.hours}h × ${row.rate}/h</div>
                <div className="font-semibold">
                  ${(row.hours * row.rate).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PricingTable;
