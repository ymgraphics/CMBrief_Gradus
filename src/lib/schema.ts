import { z } from "zod";

export const briefSchema = z.object({
    general: z.object({
        clientBrand: z.string().optional(),
        projectName: z.string().optional(),
        dateOfRequest: z.string().optional(),
        requestedBy: z.string().optional(),
        deadlineDate: z.string().optional(),
        deadlineTime: z.string().optional(),
        priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
    }),
    objective: z.object({
        goalAwareness: z.boolean().optional(),
        goalEngagement: z.boolean().optional(),
        goalTraffic: z.boolean().optional(),
        goalConversion: z.boolean().optional(),
        goalCommunity: z.boolean().optional(),
        goalEvent: z.boolean().optional(),
        keyObjective: z.string().optional(),
    }),
    platform: z.object({
        platforms: z.array(z.string()).optional(), // Instagram, Facebook, TikTok, LinkedIn, Stories, Ads
        format: z.string().optional(), // Post, Carousel, etc.
        dimensions: z.string().optional(),
        visualsCount: z.string().optional(),
    }),
    audience: z.object({
        ageRange: z.string().optional(),
        location: z.string().optional(),
        profile: z.string().optional(),
        painPoint: z.string().optional(),
    }),
    message: z.object({
        mainMessage: z.string().optional(),
        secondaryMessage: z.string().optional(),
    }),
    copy: z.object({
        headlines: z.array(z.string()),
        ctas: z.array(z.string()),
        language: z.string().optional(),
    }),
    visual: z.object({
        mood: z.string().optional(),
        colors: z.string().optional(),
        style: z.string().optional(),
        references: z.string().optional(),
    }),
    brand: z.object({
        logoUsage: z.enum(["Yes", "No"]),
        fonts: z.string().optional(),
        dos: z.string().optional(),
        donts: z.string().optional(),
    }),
    assets: z.object({
        providePhotos: z.boolean(),
        provideVideos: z.boolean(),
        provideLogos: z.boolean(),
        provideGuidelines: z.boolean(),
        providePrevious: z.boolean(),
        assetsLinks: z.array(z.string()),
    }),
    deliverables: z.object({
        finalFormat: z.string().optional(), // JPG, PNG, etc.
        editableRequired: z.enum(["Yes", "No"]),
        exportVariations: z.string().optional(),
    }),
    validation: z.object({
        validator: z.string().optional(),
        revisionsIncluded: z.string().optional(),
        feedbackDeadline: z.string().optional(),
    }),
    context: z.object({
        pastInsight: z.string().optional(),
        competitorBenchmark: z.string().optional(),
    }),
    notes: z.object({
        internalNotes: z.string().optional(),
    }),
});

export type BriefData = z.infer<typeof briefSchema>;

export const defaultBriefData: BriefData = {
    general: {
        clientBrand: "",
        projectName: "",
        dateOfRequest: new Date().toISOString().split("T")[0],
        requestedBy: "",
        deadlineDate: "",
        deadlineTime: "",
        priority: "Medium",
    },
    objective: {
        goalAwareness: false,
        goalEngagement: false,
        goalTraffic: false,
        goalConversion: false,
        goalCommunity: false,
        goalEvent: false,
        keyObjective: "",
    },
    platform: {
        platforms: [],
        format: "",
        dimensions: "",
        visualsCount: "",
    },
    audience: {
        ageRange: "",
        location: "",
        profile: "",
        painPoint: "",
    },
    message: {
        mainMessage: "",
        secondaryMessage: "",
    },
    copy: {
        headlines: [""],
        ctas: [""],
        language: "",
    },
    visual: {
        mood: "",
        colors: "",
        style: "",
        references: "",
    },
    brand: {
        logoUsage: "Yes",
        fonts: "",
        dos: "",
        donts: "",
    },
    assets: {
        providePhotos: false,
        provideVideos: false,
        provideLogos: false,
        provideGuidelines: false,
        providePrevious: false,
        assetsLinks: [""],
    },
    deliverables: {
        finalFormat: "",
        editableRequired: "No",
        exportVariations: "",
    },
    validation: {
        validator: "",
        revisionsIncluded: "",
        feedbackDeadline: "",
    },
    context: {
        pastInsight: "",
        competitorBenchmark: "",
    },
    notes: {
        internalNotes: "",
    },
};
