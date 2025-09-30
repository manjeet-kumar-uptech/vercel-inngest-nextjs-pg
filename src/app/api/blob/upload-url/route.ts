import { NextRequest } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const objectName = `uploads/${Date.now()}-${file.name}`;

    const { url } = await put(objectName, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || "text/csv",
    });

    return new Response(JSON.stringify({ url, pathname: objectName }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message ?? "Upload failed" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}


