import { Page, Text, View, Document, StyleSheet, Font, Image, Link } from '@react-pdf/renderer';
import { BriefData } from '@/lib/schema';

// Register Poppins font - Using local files for stability
Font.register({
    family: 'Poppins',
    fonts: [
        { src: '/fonts/Poppins-Regular.woff2', fontWeight: 400 }, // Regular
        { src: '/fonts/Poppins-Regular.woff2', fontWeight: 500 }, // Medium
        { src: '/fonts/Poppins-Regular.woff2', fontWeight: 700 }, // Bold
    ]
});

const colors = {
    primary: '#1a1a1a',
    secondary: '#666666',
    accent: '#000000',
    border: '#e5e5e5',
    bgLight: '#f9f9f9',
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Poppins',
        fontSize: 9,
        color: colors.primary,
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 40,
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: colors.accent,
        letterSpacing: -0.5,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#fee2e2',
        borderRadius: 4,
    },
    priorityText: {
        color: '#ef4444',
        fontSize: 8,
        fontWeight: 700,
        textTransform: 'uppercase',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 8,
    },
    metaItem: {
        flexDirection: 'column',
    },
    metaLabel: {
        fontSize: 7,
        color: colors.secondary,
        textTransform: 'uppercase',
        marginBottom: 2,
        fontWeight: 500,
    },
    metaValue: {
        fontSize: 9,
        fontWeight: 500,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: colors.bgLight,
        padding: 6,
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 700,
        color: colors.accent,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        gap: 20,
        flexWrap: 'wrap',
    },
    col2: {
        width: '48%',
    },
    col3: {
        width: '30%',
    },
    fieldGroup: {
        marginBottom: 8,
    },
    label: {
        fontSize: 7,
        color: colors.secondary,
        textTransform: 'uppercase',
        marginBottom: 2,
        fontWeight: 500,
    },
    value: {
        fontSize: 9,
        color: colors.primary,
    },
    checkboxGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#ffffff',
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
    },
    checkboxItemActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxText: {
        fontSize: 8,
        color: colors.secondary,
        marginLeft: 4,
    },
    checkboxTextActive: {
        color: '#ffffff',
        fontWeight: 500,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        border: `1px solid ${colors.secondary}`,
        marginRight: 4,
    },
    dotActive: {
        backgroundColor: '#ffffff',
        borderColor: '#ffffff',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: `1px solid ${colors.border}`,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 7,
        color: '#999',
    },
    tag: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 4,
        marginBottom: 4,
        fontSize: 8,
    },
    linkButton: {
        backgroundColor: colors.primary,
        color: '#ffffff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        fontSize: 8,
        textDecoration: 'none',
        marginRight: 8,
        marginBottom: 8,
    },
});

interface BriefDocumentProps {
    data: BriefData;
}

const Field = ({ label, value, style = {} }: { label: string; value?: string | number, style?: any }) => {
    if (!value) return null;
    return (
        <View style={[styles.fieldGroup, style]}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
};

const TagGroup = ({ label, items, activeItems }: { label: string, items: string[], activeItems?: string[] | Record<string, boolean> }) => {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {items.map((item, i) => (
                    <View key={i} style={styles.tag}>
                        <Text>{item}</Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

const Checkbox = ({ label, checked }: { label: string; checked: boolean }) => (
    <View style={[styles.checkboxItem, checked ? styles.checkboxItemActive : {}]}>
        <View style={[styles.dot, checked ? styles.dotActive : {}]} />
        <Text style={[styles.checkboxText, checked ? styles.checkboxTextActive : {}]}>{label}</Text>
    </View>
)

export const BriefDocument = ({ data }: BriefDocumentProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                {/* Top Row: Logo & Priority */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Image src="/images/gradus-logo-full.png" style={{ width: 120 }} />
                    {data.general.priority === 'Urgent' && (
                        <View style={styles.priorityBadge}>
                            <Text style={styles.priorityText}>URGENT PRIORITY</Text>
                        </View>
                    )}
                </View>

                {/* Main Titles: Client (Left) - Project (Right) */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View>
                        <Text style={{ fontSize: 10, color: colors.secondary, marginBottom: 2, textTransform: 'uppercase' }}>CLIENT / BRAND</Text>
                        <Text style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>
                            {data.general.clientBrand || "Client Name"}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10, color: colors.secondary, marginBottom: 2, textTransform: 'uppercase' }}>PROJECT</Text>
                        <Text style={styles.title}>
                            {data.general.projectName || "Project Name"}
                        </Text>
                    </View>
                </View>

                {/* Meta Row */}
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>REQUESTED BY</Text>
                        <Text style={styles.metaValue}>{data.general.requestedBy || "N/A"}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>DATE</Text>
                        <Text style={styles.metaValue}>{data.general.dateOfRequest || new Date().toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>DEADLINE</Text>
                        <Text style={styles.metaValue}>{data.general.deadlineDate} {data.general.deadlineTime}</Text>
                    </View>
                </View>
            </View>

            {/* Content Grid */}

            {/* 2. Objectives */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>01. OBJECTIVES & STRATEGY</Text>
                </View>
                <View style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>GOALS</Text>
                    <View style={styles.checkboxGrid}>
                        <Checkbox label="Awareness" checked={!!data.objective.goalAwareness} />
                        <Checkbox label="Engagement" checked={!!data.objective.goalEngagement} />
                        <Checkbox label="Traffic" checked={!!data.objective.goalTraffic} />
                        <Checkbox label="Conversion" checked={!!data.objective.goalConversion} />
                        <Checkbox label="Community" checked={!!data.objective.goalCommunity} />
                        <Checkbox label="Event" checked={!!data.objective.goalEvent} />
                    </View>
                </View>
                <Field label="Key Objective" value={data.objective.keyObjective} />
            </View>

            {/* 3. Platform & 4. Audience */}
            <View style={styles.row}>
                <View style={[styles.col2, styles.section]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>02. PLATFORM SPECIFICS</Text>
                    </View>
                    <TagGroup label="Platforms" items={data.platform.platforms || []} />
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                        <Field label="Format" value={data.platform.format} />
                        <Field label="Size" value={data.platform.dimensions} />
                        <Field label="Count" value={data.platform.visualsCount} />
                    </View>
                </View>

                <View style={[styles.col2, styles.section]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>03. TARGET AUDIENCE</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <Field label="Age Range" value={data.audience.ageRange} />
                        <Field label="Location" value={data.audience.location} />
                    </View>
                    <Field label="Profile Persona" value={data.audience.profile} />
                    <Field label="Key Pain Point" value={data.audience.painPoint} />
                </View>
            </View>

            {/* 5. Message & Copy */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>04. MESSAGING & COPY</Text>
                </View>
                <Field label="Main Message" value={data.message.mainMessage} />
                <Field label="Secondary Message" value={data.message.secondaryMessage} />
                <View style={styles.divider} />
                <View style={styles.row}>
                    <View style={styles.col3}>
                        <Text style={styles.label}>COPY & TEXT VISUAL</Text>
                        {(data.copy.headlines || []).map((h, i) => (
                            <Text key={i} style={[styles.value, { marginBottom: 2 }]}>{h}</Text>
                        ))}
                    </View>
                    <View style={styles.col3}>
                        <Text style={styles.label}>SUBTEXT / CTAS</Text>
                        {(data.copy.ctas || []).map((c, i) => (
                            <Text key={i} style={[styles.value, { marginBottom: 2 }]}>{c}</Text>
                        ))}
                    </View>
                    <Field label="Language" value={data.copy.language} style={styles.col3} />
                </View>
            </View>

            {/* 6. Visual & Brand */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>05. VISUAL DIRECTION</Text>
                </View>
                <View style={styles.row}>
                    <Field label="Mood/Tone" value={data.visual.mood} style={styles.col3} />
                    <Field label="Style" value={data.visual.style} style={styles.col3} />
                    <Field label="Color Palette" value={data.visual.colors} style={styles.col3} />
                </View>
                <Field label="Visual References" value={data.visual.references} style={{ marginTop: 8 }} />

                <View style={[styles.row, { marginTop: 12 }]}>
                    <Field label="Logo Usage" value={data.brand.logoUsage} style={styles.col3} />
                    <Field label="Required Elements (Do's)" value={data.brand.dos} style={styles.col3} />
                    <Field label="Avoid Elements (Dont's)" value={data.brand.donts} style={styles.col3} />
                </View>
            </View>

            {/* 7. Deliverables */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>06. ASSETS & DELIVERABLES</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: '48%' }}>
                        <Text style={styles.label}>PROVIDED ASSETS</Text>
                        <View style={styles.checkboxGrid}>
                            <Checkbox label="Photos" checked={!!data.assets.providePhotos} />
                            <Checkbox label="Videos" checked={!!data.assets.provideVideos} />
                            <Checkbox label="Logos" checked={!!data.assets.provideLogos} />
                            <Checkbox label="Guidelines" checked={!!data.assets.provideGuidelines} />
                        </View>
                    </View>
                    <View style={{ width: '48%' }}>
                        <View style={styles.row}>
                            <Field label="Final Format" value={data.deliverables.finalFormat} style={styles.col2} />
                            <Field label="Editable?" value={data.deliverables.editableRequired} style={styles.col2} />
                        </View>
                    </View>
                </View>
                {/* Assets Links */}
                <View style={{ marginTop: 12 }}>
                    <Text style={styles.label}>ASSETS LINKS</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {(data.assets.assetsLinks || []).map((link, i) => (
                            link ? (
                                <Link key={i} src={link} style={styles.linkButton}>
                                    <Text>OPEN LINK {i + 1}</Text>
                                </Link>
                            ) : null
                        ))}
                    </View>
                </View>
            </View>

            <Text style={styles.footerText}>
                Generated by Brief Generator • {new Date().getFullYear()}
            </Text>

            <View style={styles.footer}>
                <Text style={styles.footerText}>INTERNAL USE ONLY</Text>
                <Text style={styles.footerText}>PAGE 1 OF 1</Text>
            </View>

        </Page>
    </Document>
);
