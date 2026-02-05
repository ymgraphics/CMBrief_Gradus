import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BriefData, defaultBriefData } from './schema';

interface BriefStore {
    data: BriefData;
    setData: (data: BriefData) => void;
    updateSection: (section: keyof BriefData, data: Partial<BriefData[keyof BriefData]>) => void;
    reset: () => void;
}

export const useBriefStore = create<BriefStore>()(
    persist(
        (set) => ({
            data: defaultBriefData,
            setData: (data) => set({ data }),
            updateSection: (section, sectionData) =>
                set((state) => ({
                    data: {
                        ...state.data,
                        [section]: { ...state.data[section], ...sectionData },
                    },
                })),
            reset: () => set({ data: defaultBriefData }),
        }),
        {
            name: 'brief-storage',
        }
    )
);
