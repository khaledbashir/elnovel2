"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClearCachePage() {
  const [status, setStatus] = useState<"idle" | "clearing" | "done">("idle");
  const router = useRouter();

  const clearCache = () => {
    setStatus("clearing");
    
    // Clear all localStorage
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Clear IndexedDB (used by Tambo SDK)
    if (window.indexedDB) {
      indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    }
    
    setStatus("done");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card border rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Clear Tambo Cache</h1>
        
        {status === "idle" && (
          <>
            <p className="text-muted-foreground mb-6">
              This will clear all cached data including the old Tambo project ID.
              You'll need to refresh the page after clearing.
            </p>
            <button
              onClick={clearCache}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Clear Cache
            </button>
          </>
        )}
        
        {status === "clearing" && (
          <p className="text-center text-muted-foreground">Clearing cache...</p>
        )}
        
        {status === "done" && (
          <>
            <div className="bg-green-500/10 border border-green-500/20 rounded-md p-4 mb-4">
              <p className="text-green-600 dark:text-green-400 font-medium">
                ✓ Cache cleared successfully!
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Current Project ID: <code className="bg-muted px-2 py-1 rounded text-xs">
                {process.env.NEXT_PUBLIC_TAMBO_PROJECT_ID || "Not set"}
              </code>
            </p>
            <button
              onClick={() => window.location.href = "/"}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Refresh & Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
