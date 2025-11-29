"use client";

import { useState } from "react";
import { Button } from "@/components/tailwind/ui/button";
import { Textarea } from "@/components/tailwind/ui/textarea";

export default function TestSlidesPage() {
    const [prompt, setPrompt] = useState("Create a 3-slide presentation about AI startups");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const testAPI = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await fetch("/api/generate-slides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            if (res.ok) {
                const data = await res.json();
                setResponse(data);
            } else {
                const errorData = await res.json();
                setError(errorData.error || "Failed to generate slides");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Z.AI Slides API Test</h1>

            <div className="space-y-4 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-2">Test Prompt:</label>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                        className="w-full"
                    />
                </div>

                <Button onClick={testAPI} disabled={loading}>
                    {loading ? "Calling API..." : "Test Z.AI API"}
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-4">
                    <h3 className="font-bold text-red-800 dark:text-red-200">Error:</h3>
                    <pre className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</pre>
                </div>
            )}

            {response && (
                <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                        <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">✅ Success! Raw Response:</h3>
                        <pre className="mt-2 text-xs bg-black text-green-400 p-4 rounded overflow-auto max-h-96">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                        <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">🔍 Response Keys:</h3>
                        <ul className="list-disc list-inside text-sm">
                            {Object.keys(response).map((key) => (
                                <li key={key}>
                                    <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">{key}</code>
                                    {" → "}
                                    <span className="text-muted-foreground">{typeof response[key]}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {response.html && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                            <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-2">🎨 HTML Content Preview:</h3>
                            <div className="border border-purple-300 dark:border-purple-700 p-4 rounded bg-white dark:bg-gray-900">
                                <div dangerouslySetInnerHTML={{ __html: response.html }} />
                            </div>
                        </div>
                    )}

                    {response.slides && Array.isArray(response.slides) && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">📊 Slides Array:</h3>
                            <p className="text-sm mb-2">Found {response.slides.length} slides</p>
                            {response.slides.map((slide: any, idx: number) => (
                                <div key={idx} className="border border-yellow-300 dark:border-yellow-700 p-3 rounded mb-2 bg-white dark:bg-gray-900">
                                    <p className="font-bold">Slide {idx + 1}</p>
                                    <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(slide, null, 2)}</pre>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
