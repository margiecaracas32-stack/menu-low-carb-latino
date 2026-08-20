import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? "local";
  const environment = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";

  return NextResponse.json(
    {
      service: "menu-low-carb-latino",
      commit,
      environment,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

