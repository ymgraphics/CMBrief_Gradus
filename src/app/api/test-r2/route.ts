import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        // @ts-ignore - Access the Cloudflare env directly
        const env = process.env;

        return NextResponse.json({
            hasEnv: !!env,
            hasBucket: !!(env as any).BRIEFS_BUCKET,
            envKeys: Object.keys(env || {}).filter(k => k.includes('BRIEF')),
            platform: typeof (globalThis as any).EdgeRuntime !== 'undefined' ? 'edge' : 'node'
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
