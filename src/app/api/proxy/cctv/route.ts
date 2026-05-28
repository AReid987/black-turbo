import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = new Set([
  // Finland
  "weathercam.digitraffic.fi",
  // Windy
  "images-webcams.windy.com",
  // TFL
  "s3-eu-west-1.amazonaws.com",
  // Austin TX
  "cctv.austinmobility.io",
  // NYC DOT
  "webcams.nyctmc.org",
  // Caltrans / California DOT
  "cwwp2.dot.ca.gov",
  "cwwp2.dot.ca.gov:80",
  // WSDOT
  "images.wsdot.wa.gov",
  "www.wsdot.wa.gov",
  // Georgia DOT
  "navigator-c2c.dot.ga.gov",
  "navigatos-c2c.dot.ga.gov",
  // Illinois DOT
  "www.travelmidwest.com",
  "travelmidwest.com",
  // Michigan DOT
  "mdotjboss.state.mi.us",
  // DGT Spain
  "infocar.dgt.es",
  // Madrid
  "datos.madrid.es",
  "www.madrid.es",
  // Colorado DOT
  "cotg.carsprogram.org",
  // Singapore
  "datamall2.mytransport.sg",
  "datamall.mytransport.sg",
]);

const ALLOWED_PATH_PATTERNS = [
  // TFL S3 pattern
  /^\/jamcams\.tfl\.gov\.uk\//,
];

function isAllowed(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    if (ALLOWED_HOSTS.has(host)) return true;
    for (const pattern of ALLOWED_PATH_PATTERNS) {
      if (pattern.test(url.pathname)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  if (!isAllowed(targetUrl)) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Shadowbroker/1.0)",
        Accept: "image/*,video/*,*/*",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: 502 }
      );
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Proxy failed" },
      { status: 502 }
    );
  }
}
