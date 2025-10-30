import { MongoClient } from "mongodb";
import JSZip from "jszip";

const uri = process.env.MONGODB_URI;
const dbName = "mydb";
const collectionName = "dxf_files";

async function fetchDXF(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return await res.text();
}

export async function POST(req) {
  const { model_code, do_codes } = await req.json();
  if (!model_code || !Array.isArray(do_codes) || do_codes.length === 0) {
    return new Response(
      JSON.stringify({ error: "Missing model_code or do_codes" }),
      { status: 400 }
    );
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch DXF URLs for each DO
    const dxfDocs = await collection
      .find({ model_code, do_code: { $in: do_codes } })
      .toArray();

    // Gather all DXF URLs (handles nested arrays in dxf_urls)
    const dxfUrls = dxfDocs
      .flatMap((doc) =>
        doc.pieces.flatMap((piece) =>
          Array.isArray(piece.dxf_urls) ? piece.dxf_urls.flat(Infinity) : []
        )
      )
      .filter(Boolean);

    console.log("[DXF] URLs to fetch:", dxfUrls);

    // Fetch all DXF files and add to zip
    const zip = new JSZip();
    let count = 1;
    const zippedFiles = [];
    for (const url of dxfUrls) {
      try {
        const dxfText = await fetchDXF(url);
        const filename = url.split("/").pop().split("?")[0]; // Use original DXF filename
        zip.file(filename, dxfText);
        zippedFiles.push(filename);
        console.log(`[DXF] Zipped: ${filename} (${url})`);
        count++;
      } catch (err) {
        console.warn(`[DXF] Failed to fetch: ${url}`);
      }
    }

    console.log("[DXF] Files zipped and sent:", zippedFiles);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=DXF_File.zip",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
