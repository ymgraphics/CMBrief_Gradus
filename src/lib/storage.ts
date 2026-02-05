import { BriefData } from "./schema";

export interface SavedBrief {
    id: string;
    clientName: string;
    projectName: string;
    timestamp: number;
    data: BriefData;
}

const STORAGE_KEY = "saved-briefs";

export const storage = {
    // Get all saved briefs
    getAll(): SavedBrief[] {
        if (typeof window === "undefined") return [];
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error reading from localStorage:", error);
            return [];
        }
    },

    // Save a brief
    save(brief: Omit<SavedBrief, "id" | "timestamp">): SavedBrief {
        const newBrief: SavedBrief = {
            ...brief,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };

        const briefs = this.getAll();
        briefs.push(newBrief);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(briefs));
        return newBrief;
    },

    // Get briefs by client
    getByClient(clientName: string): SavedBrief[] {
        return this.getAll().filter(
            (brief) => brief.clientName.toLowerCase() === clientName.toLowerCase()
        );
    },

    // Get a single brief by ID
    getById(id: string): SavedBrief | null {
        return this.getAll().find((brief) => brief.id === id) || null;
    },

    // Delete a brief
    delete(id: string): boolean {
        const briefs = this.getAll().filter((brief) => brief.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(briefs));
        return true;
    },

    // Get all unique client names
    getClients(): string[] {
        const briefs = this.getAll();
        const clients = new Set(briefs.map((b) => b.clientName));
        return Array.from(clients).sort();
    },

    // Group briefs by client
    groupByClient(): Record<string, SavedBrief[]> {
        const briefs = this.getAll();
        const grouped: Record<string, SavedBrief[]> = {};

        briefs.forEach((brief) => {
            if (!grouped[brief.clientName]) {
                grouped[brief.clientName] = [];
            }
            grouped[brief.clientName].push(brief);
        });

        // Sort each client's briefs by timestamp (newest first)
        Object.keys(grouped).forEach((client) => {
            grouped[client].sort((a, b) => b.timestamp - a.timestamp);
        });

        return grouped;
    },
};
