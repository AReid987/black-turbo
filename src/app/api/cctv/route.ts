import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { runAllIngestors, PipelineCamera } from "@/lib/data/cctvPipeline";

export const dynamic = "force-dynamic";

const PREFIX_COUNTRY: Record<string, string> = {
  TFL: "GB", NYC: "US", CAL: "US", WSDOT: "US", GDOT: "US",
  IDOT: "US", MDOT: "US", ATX: "US", CODOT: "US", DGT: "ES",
  MAD: "ES", SGP: "SG", WINDY: "GL", OSM: "OSM", FI: "FI",
};

const COUNTRY_NAME: Record<string, string> = {
  GB: "United Kingdom", US: "United States", ES: "Spain", SG: "Singapore",
  GL: "Global", OSM: "OpenStreetMap", FI: "Finland",
};

function transform(cam: PipelineCamera) {
  const prefix = cam.id.split("-")[0].toUpperCase();
  const countryCode = PREFIX_COUNTRY[prefix] || prefix;
  const country = COUNTRY_NAME[countryCode] || countryCode;
  return {
    id: cam.id,
    name: cam.direction_facing || `${prefix} Camera`,
    lat: cam.lat,
    lng: cam.lon,
    url: cam.media_url,
    type: cam.media_type || "image",
    country,
    city: cam.source_agency || prefix,
    refreshInterval: cam.refresh_rate_seconds || 60,
    region: prefix,
  };
}

let liveCache: { cameras: any[]; timestamp: string } | null = null;
let liveCacheTime = 0;
const LIVE_CACHE_MS = 5 * 60 * 1000;

function getStaticCameras(): any[] {
  try {
    const raw = readFileSync(join(process.cwd(), "public", "cameras.json"), "utf-8");
    const parsed = JSON.parse(raw);
    return parsed.cameras || [];
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const live = searchParams.get("live") === "true";

  let cameras: any[] = [];

  if (live) {
    // Live mode: fetch from external APIs (may be slow)
    try {
      if (!liveCache || Date.now() - liveCacheTime > LIVE_CACHE_MS) {
        const { cameras: pipelineCams, results } = await runAllIngestors();
        liveCache = {
          cameras: pipelineCams.map(transform),
          timestamp: new Date().toISOString(),
        };
        liveCacheTime = Date.now();
        console.log("[CCTV] Live ingested", pipelineCams.length, "cameras");
        for (const r of results) {
          console.log(`[CCTV] ${r.name}: ${r.count}${r.error ? " (ERROR)" : ""}`);
        }
      }
      cameras = liveCache!.cameras;
    } catch (err: any) {
      console.error("[CCTV] Live pipeline error:", err?.message || err);
      // Fall back to static on live failure
      cameras = getStaticCameras();
    }
  } else {
    // Default: serve instantly from pre-built static JSON
    cameras = getStaticCameras();
  }

  if (country) {
    cameras = cameras.filter(
      (c) => c.country === country || c.region === country || c.city === country
    );
  }

  const total = cameras.length;
  cameras = cameras.slice(0, Math.min(limit, cameras.length));

  return NextResponse.json({
    cameras,
    total: cameras.length,
    allCount: total,
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  // Force live refresh
  liveCache = null;
  liveCacheTime = 0;
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
