import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = readFileSync(join(process.cwd(), "public", "cameras.json"), "utf-8");
    const parsed = JSON.parse(raw);
    const cameras = parsed.cameras || [];

    const counts = new Map<string, { code: string; name: string; count: number }>();
    const codeMap: Record<string, string> = {
      TFL: "GB", NYC: "US", CAL: "US", WSDOT: "US", GDOT: "US",
      IDOT: "US", MDOT: "US", ATX: "US", CODOT: "US", DGT: "ES",
      MAD: "ES", SGP: "SG", WINDY: "GL", OSM: "OSM", FI: "FI",
    };
    const nameMap: Record<string, string> = {
      GB: "United Kingdom", US: "United States", ES: "Spain", SG: "Singapore",
      GL: "Global", OSM: "OpenStreetMap", FI: "Finland",
    };

    for (const cam of cameras) {
      const prefix = (cam.id || "").split("-")[0].toUpperCase();
      const code = codeMap[prefix] || prefix;
      const existing = counts.get(code);
      if (existing) {
        existing.count++;
      } else {
        counts.set(code, { code, name: nameMap[code] || prefix, count: 1 });
      }
    }

    const countries = Array.from(counts.values()).sort((a, b) => b.count - a.count);
    return NextResponse.json({ countries, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ countries: [], error: err?.message || "Failed to load cameras" });
  }
}
