"use client";

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DocumentManager() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus('idle');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/documents/ingest', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Upload failed');

            setStatus('success');
            setMessage(`Indexed ${data.chunks} chunks from ${file.name}`);
            setFile(null); // Reset
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Knowledge Base Upload
            </h3>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                        <div className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:bg-accent/50",
                            file ? "border-primary bg-accent/20" : "border-muted-foreground/25"
                        )}>
                            <input
                                type="file"
                                accept=".pdf,.txt,.md"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                                {file ? (
                                    <span className="font-medium text-foreground">{file.name}</span>
                                ) : (
                                    <span className="text-muted-foreground">Click to select PDF or Text file</span>
                                )}
                            </div>
                        </div>
                    </label>
                </div>

                {file && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Indexing...
                            </>
                        ) : (
                            'Upload & Index'
                        )}
                    </button>
                )}

                {status === 'success' && (
                    <div className="p-3 bg-green-500/10 text-green-600 rounded-md flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {message}
                    </div>
                )}

                {status === 'error' && (
                    <div className="p-3 bg-red-500/10 text-red-600 rounded-md flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
