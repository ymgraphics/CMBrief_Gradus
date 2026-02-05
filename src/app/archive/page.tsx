"use client"

import { useEffect, useState } from "react"
import { storage, SavedBrief } from "@/lib/storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash2, FolderOpen, FileText } from "lucide-react"
import { toast } from "sonner"
import { pdf } from "@react-pdf/renderer"
import { BriefDocument } from "@/components/brief-pdf"
import { useBriefStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function ArchivePage() {
    const [groupedBriefs, setGroupedBriefs] = useState<Record<string, SavedBrief[]>>({})
    const [loading, setLoading] = useState(true)
    const { setData } = useBriefStore()
    const router = useRouter()

    useEffect(() => {
        loadBriefs()
    }, [])

    const loadBriefs = () => {
        try {
            const grouped = storage.groupByClient()
            setGroupedBriefs(grouped)
        } catch (error) {
            console.error("Failed to load briefs:", error)
            toast.error("Failed to load archive")
        } finally {
            setLoading(false)
        }
    }

    const handleRegenerate = async (brief: SavedBrief) => {
        try {
            // Load data into form
            setData(brief.data)

            // Generate PDF
            const blob = await pdf(<BriefDocument data={brief.data} />).toBlob()
            const url = URL.createObjectURL(blob)

            const clientName = brief.clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            const projectName = brief.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            const date = new Date().toISOString().split('T')[0]
            const filename = `${clientName}_${projectName}_${date}.pdf`

            // Download
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success("PDF regenerated!", {
                description: "The brief has been downloaded.",
                duration: 3000,
            })
        } catch (error) {
            console.error("Failed to regenerate:", error)
            toast.error("Failed to regenerate PDF")
        }
    }

    const handleLoadToForm = (brief: SavedBrief) => {
        setData(brief.data)
        router.push("/")
        toast.success("Brief loaded!", {
            description: "The brief data has been loaded into the form.",
            duration: 3000,
        })
    }

    const handleDelete = (id: string, projectName: string) => {
        if (confirm(`Delete "${projectName}"? This cannot be undone.`)) {
            storage.delete(id)
            loadBriefs()
            toast.success("Brief deleted")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading archive...</p>
                </div>
            </div>
        )
    }

    const clientNames = Object.keys(groupedBriefs)

    if (clientNames.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <CardTitle>No Saved Briefs</CardTitle>
                        <CardDescription>
                            Your archive is empty. Save briefs from the generator to see them here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/")} className="w-full">
                            Go to Generator
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Brief Archive
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                {Object.values(groupedBriefs).flat().length} saved brief{Object.values(groupedBriefs).flat().length !== 1 ? 's' : ''} across {clientNames.length} client{clientNames.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <Button onClick={() => router.push("/")} variant="outline">
                            Back to Generator
                        </Button>
                    </div>
                </div>

                {/* Grouped by Client */}
                {clientNames.map((clientName) => (
                    <motion.div
                        key={clientName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            <FolderOpen className="w-6 h-6 text-blue-600" />
                            {clientName}
                        </h2>

                        {/* Icon Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {groupedBriefs[clientName].map((brief) => (
                                <Card
                                    key={brief.id}
                                    className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-blue-400"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <FileText className="w-10 h-10 text-blue-600 mb-2" />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(brief.id, brief.projectName)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <CardTitle className="text-lg line-clamp-2">
                                            {brief.projectName}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {new Date(brief.timestamp).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button
                                            onClick={() => handleRegenerate(brief)}
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                            size="sm"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Regenerate PDF
                                        </Button>
                                        <Button
                                            onClick={() => handleLoadToForm(brief)}
                                            variant="outline"
                                            className="w-full"
                                            size="sm"
                                        >
                                            Load to Form
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
