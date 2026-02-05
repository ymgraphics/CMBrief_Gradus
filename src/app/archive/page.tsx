"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Download, FileText, FolderOpen, ChevronRight, Folder } from "lucide-react";

interface BriefFile {
    name: string;
    client: string;
    createdAt: string;
    size: number;
    path: string;
}

export default function ArchivePage() {
    const [briefs, setBriefs] = useState<BriefFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClient, setSelectedClient] = useState<string | null>(null);

    useEffect(() => {
        const fetchBriefs = async () => {
            try {
                const res = await fetch("/api/briefs/list");
                let data;

                try {
                    data = await res.json();
                } catch (e) {
                    // If JSON parse fails (e.g. 500 HTML error), read text
                    const text = await res.text().catch(() => "Unknown error");
                    throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}...`);
                }

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch briefs");
                }

                if (data.files) {
                    setBriefs(data.files);
                }
            } catch (err: any) {
                console.error("Failed to fetch briefs", err);
                setError(err.message);
                setBriefs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBriefs();
    }, []);

    // Group briefs by client
    const briefsByClient = briefs.reduce((acc, brief) => {
        if (!acc[brief.client]) {
            acc[brief.client] = [];
        }
        acc[brief.client].push(brief);
        return acc;
    }, {} as Record<string, BriefFile[]>);

    const clientNames = Object.keys(briefsByClient).sort();

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        {selectedClient ? (
                            <button
                                onClick={() => setSelectedClient(null)}
                                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Folders
                            </button>
                        ) : (
                            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Generator
                            </Link>
                        )}
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {selectedClient ? selectedClient : "Brief Archive"}
                        </h1>
                        <p className="text-slate-500 mt-2">
                            {selectedClient
                                ? `Viewing ${briefsByClient[selectedClient]?.length} saved briefs.`
                                : "Access all generated briefs, organized by client."}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-slate-500">Loading archive...</p>
                    </div>
                ) : error ? (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-destructive/10 p-4 rounded-full mb-4 text-destructive">
                                <FolderOpen className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-destructive">Archive Unavailable</h3>
                            <p className="text-destructive/80 max-w-md mt-2">
                                {error}
                            </p>
                            <p className="text-sm text-muted-foreground mt-4">
                                Check your Cloudflare project settings {">"} R2 Bucket Bindings.
                            </p>
                        </CardContent>
                    </Card>
                ) : briefs.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <FolderOpen className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">No briefs found</h3>
                            <p className="text-slate-500 max-w-sm mt-2">
                                Generated briefs will appear here automatically.
                            </p>
                            <Button asChild className="mt-6">
                                <Link href="/">Generate a Brief</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Folder Grid View */}
                        {!selectedClient && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {clientNames.map((client) => (
                                    <div
                                        key={client}
                                        onClick={() => setSelectedClient(client)}
                                        className="group cursor-pointer flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 hover:scale-[1.02] transition-all duration-200"
                                    >
                                        <div className="bg-blue-50 text-blue-500 p-4 rounded-full mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            <Folder className="w-8 h-8 fill-current" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 text-center truncate w-full" title={client}>
                                            {client}
                                        </h3>
                                        <span className="text-xs font-medium text-slate-500 mt-1">
                                            {briefsByClient[client].length} file{briefsByClient[client].length !== 1 && 's'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* File Details View */}
                        {selectedClient && briefsByClient[selectedClient] && (
                            <Card className="overflow-hidden border-0 shadow-md">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        {briefsByClient[selectedClient].map((brief) => (
                                            <div key={brief.path} className="flex items-center p-4 hover:bg-slate-50 transition-colors group">
                                                <div className="bg-slate-100 p-2 rounded text-slate-400 mr-4 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-slate-900 truncate pr-4">
                                                        {brief.name}
                                                    </h4>
                                                    <div className="flex items-center text-xs text-slate-500 mt-1 space-x-3">
                                                        <span>{format(new Date(brief.createdAt), "MMM d, yyyy • h:mm a")}</span>
                                                        <span>•</span>
                                                        <span>{(brief.size / 1024).toFixed(1)} KB</span>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" asChild className="ml-4 shrink-0">
                                                    <a href={`/api/briefs/${brief.path}`} download>
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
