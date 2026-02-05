"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Download, Save, Upload, RotateCcw, PlusCircle, MinusCircle, FolderOpen } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FormField } from "@/components/ui/form-field"
import { briefSchema, BriefData } from "@/lib/schema"
import { useBriefStore } from "@/lib/store"

import { pdf } from "@react-pdf/renderer"
import { BriefDocument } from "@/components/brief-pdf"

import { defaultBriefData } from "@/lib/schema"

export default function BriefForm() {
    const { data, setData, reset } = useBriefStore()

    const form = useForm<BriefData>({
        resolver: zodResolver(briefSchema),
        defaultValues: data,
        mode: "onChange",
    })

    // Sync store changes to form - REMOVED TO PREVENT INFINITE LOOP
    // useEffect(() => {
    //    form.reset(data)
    // }, [data, form])

    // Sync form changes to store
    const { watch, control, register, formState: { errors } } = form
    useEffect(() => {
        const subscription = watch((value) => {
            setData(value as BriefData)
        })
        return () => subscription.unsubscribe()
    }, [watch, setData])

    const { fields: headlines, append: appendHeadline, remove: removeHeadline } = useFieldArray({
        control,
        // @ts-ignore
        name: "copy.headlines"
    })

    const { fields: ctas, append: appendCta, remove: removeCta } = useFieldArray({
        control,
        // @ts-ignore
        name: "copy.ctas"
    })

    const { fields: assetLinks, append: appendAssetLink, remove: removeAssetLink } = useFieldArray({
        control,
        // @ts-ignore
        name: "assets.assetsLinks"
    })

    const onSubmit = async (data: BriefData) => {
        try {
            const blob = await pdf(<BriefDocument data={data} />).toBlob()
            const url = URL.createObjectURL(blob)

            // Create a sanitized filename
            const clientName = data.general.clientBrand?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'client'
            const projectName = data.general.projectName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'project'
            const date = new Date().toISOString().split('T')[0]

            const filename = `${clientName}_${projectName}_${date}.pdf`

            // 1. Trigger Client Download
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // 2. Upload to Server Archive
            const formData = new FormData()
            formData.append('file', blob, filename)
            formData.append('filename', filename)
            formData.append('clientName', data.general.clientBrand || 'Uncategorized')

            try {
                const response = await fetch('/api/briefs/save', {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || "Server responded with error");
                }

                toast.success("PDF generated and saved to Archive!", {
                    description: "The brief has been successfully generated and archived.",
                    duration: 5000,
                })
            } catch (uploadError: any) {
                console.error("Failed to upload to archive:", uploadError)
                toast.warning(`Archive Error: ${uploadError.message}`, {
                    description: "Ensure Cloudflare R2 binding is configured.",
                    duration: 5000,
                })
            }

        } catch (error) {
            console.error(error)
            toast.error("Failed to generate PDF", {
                description: "An error occurred while generating the PDF. Please try again.",
                duration: 5000,
            })
        }
    }

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", `brief-${data.general.projectName || "untitled"}.json`)
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
        toast.success("Brief exported to JSON")
    }

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string)
                setData(json)
                form.reset(json) // Manually reset form on import
                toast.success("Brief loaded successfully")
            } catch (error) {
                toast.error("Invalid JSON file")
            }
        }
        reader.readAsText(file)
        event.target.value = ""
    }

    const handleReset = () => {
        if (confirm("Are you sure you want to clear the form? This cannot be undone.")) {
            reset()
            form.reset(defaultBriefData) // Manually reset form
            toast.success("Form cleared")
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto p-4 md:p-8">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 sticky top-0 z-10 py-4 -mx-4 px-4 bg-background/80 backdrop-blur-xl border-b shadow-sm md:border-none md:static md:bg-transparent md:p-0 md:shadow-none">
                <div>
                    <img src="/images/gradus-logo-full.png" alt="Gradus Agency" className="h-16 w-auto object-contain" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <input type="file" id="file-upload" className="hidden" accept=".json" onChange={handleImport} />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="group bg-white hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 active:scale-95"
                    >
                        <Upload className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-y-0.5" /> Load
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        asChild
                        className="group bg-white hover:bg-purple-50 hover:border-purple-400 hover:text-purple-600 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 active:scale-95"
                    >
                        <Link href="/archive">
                            <FolderOpen className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" /> Archive
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="group bg-white hover:bg-green-50 hover:border-green-400 hover:text-green-600 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 active:scale-95"
                    >
                        <Save className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-y-0.5" /> Save
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        title="Reset Form"
                        className="group text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <RotateCcw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
                    </Button>
                </div>
            </div>

            {/* 1. General Project Information */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-primary text-xl">1. General Project Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <FormField label="Client / Brand" error={errors.general?.clientBrand?.message}>
                            <Input {...register("general.clientBrand")} placeholder="e.g. 7Ciel" />
                        </FormField>
                        <FormField label="Project Name / Campaign" error={errors.general?.projectName?.message}>
                            <Input {...register("general.projectName")} placeholder="e.g. Ramadan Special" />
                        </FormField>
                        <FormField label="Requested By (CM)" error={errors.general?.requestedBy?.message}>
                            <Input {...register("general.requestedBy")} placeholder="Manager Name" />
                        </FormField>
                        <FormField label="Date of Request" error={errors.general?.dateOfRequest?.message}>
                            <Input type="date" {...register("general.dateOfRequest")} />
                        </FormField>
                        <FormField label="Deadline" error={errors.general?.deadlineDate?.message} className="flex gap-2">
                            <Input type="date" {...register("general.deadlineDate")} className="flex-1" />
                            <Input type="time" {...register("general.deadlineTime")} className="w-32" />
                        </FormField>
                        <div className="space-y-3">
                            <Label>Priority Level</Label>
                            <Controller
                                control={control}
                                name="general.priority"
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                        {["Low", "Medium", "High", "Urgent"].map((priority) => (
                                            <div key={priority} className="flex items-center space-x-2">
                                                <RadioGroupItem value={priority} id={priority} />
                                                <Label htmlFor={priority} className="font-normal">{priority}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 2. Objective */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                <Card className="border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-primary text-xl">2. Objective of the Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { id: "goalAwareness", label: "Awareness" },
                                { id: "goalEngagement", label: "Engagement" },
                                { id: "goalTraffic", label: "Traffic" },
                                { id: "goalConversion", label: "Conversion / Sales" },
                                { id: "goalCommunity", label: "Community Building" },
                                { id: "goalEvent", label: "Announcement / Event" },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                    <Controller
                                        control={control}
                                        name={`objective.${item.id}` as any}
                                        render={({ field: { value, onChange } }) => (
                                            <Checkbox checked={value} onCheckedChange={onChange} id={item.id} />
                                        )}
                                    />
                                    <Label htmlFor={item.id} className="font-normal cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{item.label}</Label>
                                </div>
                            ))}
                        </div>
                        <FormField label="Key Objective (1 Sentence)" error={errors.objective?.keyObjective?.message}>
                            <Input {...register("objective.keyObjective")} placeholder="e.g. Drive 1000 signups for the new menu launch." />
                        </FormField>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 3. Platform & Format */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                <Card className="border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-primary text-xl">3. Platform & Format</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label>Platform(s)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {["Instagram", "Facebook", "TikTok", "LinkedIn", "Stories", "Ads"].map((platform) => (
                                    <div key={platform} className="flex items-center space-x-2">
                                        <Controller
                                            control={control}
                                            name="platform.platforms"
                                            render={({ field }) => {
                                                return (
                                                    <Checkbox
                                                        checked={field.value?.includes(platform)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), platform])
                                                                : field.onChange(field.value?.filter((value) => value !== platform))
                                                        }}
                                                    />
                                                )
                                            }}
                                        />
                                        <Label className="font-normal">{platform}</Label>
                                    </div>
                                ))}
                            </div>
                            {errors.platform?.platforms && <p className="text-sm text-red-500">{errors.platform.platforms.message}</p>}
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <FormField label="Format" error={errors.platform?.format?.message}>
                                <Input {...register("platform.format")} placeholder="Post, Carousel, Reel..." />
                            </FormField>
                            <FormField label="Dimensions" error={errors.platform?.dimensions?.message}>
                                <Input {...register("platform.dimensions")} placeholder="1080x1350" />
                            </FormField>
                            <FormField label="Visuals Count" optional>
                                <Input {...register("platform.visualsCount")} placeholder="e.g. 3" />
                            </FormField>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 4. Audience */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
                <Card className="border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-primary text-xl">4. Target Audience</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <FormField label="Age Range" optional>
                            <Input {...register("audience.ageRange")} placeholder="25-34" />
                        </FormField>
                        <FormField label="Location" optional>
                            <Input {...register("audience.location")} placeholder="UAE, KSA..." />
                        </FormField>
                        <FormField label="Profile" optional>
                            <Input {...register("audience.profile")} placeholder="Young professionals, foodies..." />
                        </FormField>
                        <FormField label="Pain Point / Interest" optional>
                            <Input {...register("audience.painPoint")} placeholder="Quick delivery, healthy options..." />
                        </FormField>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 5. Message & 6. Copy */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
                <Card className="border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-primary text-xl">5. Key Message & 6. Copy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField label="Main Message" error={errors.message?.mainMessage?.message}>
                            <Textarea {...register("message.mainMessage")} placeholder="Core message to communicate..." />
                        </FormField>
                        <FormField label="Secondary Message" optional>
                            <Textarea {...register("message.secondaryMessage")} placeholder="Detailed info..." />
                        </FormField>
                        <Separator />
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-3">
                                <Label>Headline(s) (On Visual)</Label>
                                {headlines.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <Input {...register(`copy.headlines.${index}`)} placeholder="Catchy title..." />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeHeadline(index)}
                                            disabled={headlines.length === 1}
                                            className="shrink-0"
                                        >
                                            <MinusCircle className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendHeadline("")}
                                    className="w-full border-dashed"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" /> Add Headline
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <Label>Subtext / CTA(s)</Label>
                                {ctas.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <Input {...register(`copy.ctas.${index}`)} placeholder="Book Now..." />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeCta(index)}
                                            disabled={ctas.length === 1}
                                            className="shrink-0"
                                        >
                                            <MinusCircle className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendCta("")}
                                    className="w-full border-dashed"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" /> Add CTA
                                </Button>
                            </div>
                            <FormField label="Language" optional>
                                <Input {...register("copy.language")} placeholder="EN / AR" />
                            </FormField>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 7. Visual & 8. Brand */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.5 }}>
                <Card className="border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-primary text-xl">7. Visual Direction & 8. Brand</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField label="Mood / Vibe" optional>
                                <Input {...register("visual.mood")} placeholder="Premium, Cozy, Energetic..." />
                            </FormField>
                            <FormField label="Colors" optional>
                                <Input {...register("visual.colors")} placeholder="Brand colors..." />
                            </FormField>
                            <FormField label="Style" optional>
                                <Input {...register("visual.style")} placeholder="Photography, Illustration..." />
                            </FormField>
                            <FormField label="Logo Usage" optional>
                                <Controller control={control} name="brand.logoUsage" render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </FormField>
                        </div>
                        <FormField label="References / Inspiration" optional>
                            <Textarea {...register("visual.references")} placeholder="Links to pinterest, instagram..." />
                        </FormField>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField label="Do's" optional>
                                <Textarea {...register("brand.dos")} placeholder="Respect margins..." />
                            </FormField>
                            <FormField label="Don'ts" optional>
                                <Textarea {...register("brand.donts")} placeholder="No comic sans..." />
                            </FormField>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 9. Assets & 10. Deliverables */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.6 }}>
                <Card className="border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-primary text-xl">9. Assets & 10. Deliverables</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label>Assets Provided</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                <div className="flex items-center space-x-2">
                                    <Controller control={control} name="assets.providePhotos" render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} /><Label className="font-normal">Photos</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller control={control} name="assets.provideVideos" render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} /><Label className="font-normal">Videos</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller control={control} name="assets.provideLogos" render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} /><Label className="font-normal">Logos</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller control={control} name="assets.provideGuidelines" render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} /><Label className="font-normal">Guidelines</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Controller control={control} name="assets.providePrevious" render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />} /><Label className="font-normal">Prev. Designs</Label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label>Assets Links</Label>
                            {assetLinks.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-center">
                                    <Input {...register(`assets.assetsLinks.${index}`)} placeholder="Link to assets (Drive/WeTransfer)..." />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAssetLink(index)}
                                        disabled={assetLinks.length === 1}
                                        className="shrink-0"
                                    >
                                        <MinusCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendAssetLink("")}
                                className="w-full border-dashed"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" /> Add Asset Link
                            </Button>
                        </div>
                        <Separator className="my-6" />
                        <div className="grid md:grid-cols-3 gap-4">
                            <FormField label="Final Format" optional>
                                <Input {...register("deliverables.finalFormat")} placeholder="JPG, MP4..." />
                            </FormField>
                            <FormField label="Editable Required?">
                                <Controller control={control} name="deliverables.editableRequired" render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </FormField>
                            <FormField label="Export Variations" optional>
                                <Input {...register("deliverables.exportVariations")} placeholder="Size, Lang..." />
                            </FormField>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* 11. Validation, 12. Context, 13. Notes */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.7 }}>
                <Card className="border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-primary text-xl">Additional Info & Validation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <FormField label="Validator" optional>
                                <Input {...register("validation.validator")} placeholder="Client / Manager" />
                            </FormField>
                            <FormField label="Revisions Included" optional>
                                <Input {...register("validation.revisionsIncluded")} placeholder="e.g. 2" />
                            </FormField>
                            <FormField label="Feedback Deadline" optional>
                                <Input {...register("validation.feedbackDeadline")} placeholder="24h" />
                            </FormField>
                        </div>
                        <Separator />
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField label="Past Insights" optional>
                                <Textarea {...register("context.pastInsight")} placeholder="What worked before..." />
                            </FormField>
                            <FormField label="Benchmarks" optional>
                                <Textarea {...register("context.competitorBenchmark")} placeholder="Competitor examples..." />
                            </FormField>
                        </div>
                        <FormField label="Internal Notes (CM Only)" optional>
                            <Textarea {...register("notes.internalNotes")} placeholder="Sensitive info, constraints..." className="bg-yellow-50/50" />
                        </FormField>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="flex justify-end gap-4 sticky bottom-8 p-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl z-20 transition-all duration-300 hover:shadow-2xl">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleExport()}
                    className="bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Progress
                </Button>
                <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-[1.02]"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF Brief
                </Button>
            </div>

        </form >
    )
}
