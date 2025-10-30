import { MongoClient } from "mongodb";
import { createCanvas, loadImage } from "canvas";
import { MaxRectsPacker } from "maxrects-packer";

const uri = process.env.MONGODB_URI;
const dbName = "mydb";
const collectionName = "png_files";

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

    // Fetch PNG URLs for each DO
    const docs = await collection
      .find({ model_code, do_code: { $in: do_codes } })
      .toArray();
    // Flatten all PNG URLs
    const pngUrls = docs
      .flatMap((doc) =>
        doc.pieces.flatMap((piece) =>
          Array.isArray(piece.png_urls) ? piece.png_urls.flat(Infinity) : []
        )
      )
      .filter(Boolean);

    // Load all PNGs
    const images = [];
    for (const url of pngUrls) {
      try {
        const img = await loadImage(url);
        images.push({ img, width: img.width, height: img.height, url });
      } catch (e) {
        // skip failed images
      }
    }

    if (images.length === 0) {
      return new Response(JSON.stringify({ error: "No images loaded" }), {
        status: 400,
      });
    }

    // ======= MaxRects Packing =======
    const CANVAS_WIDTH = 3456; // 4ft at 72dpi
    const GAP = 5;
    const PADDING = 20; // Padding for border

    // Prepare rects for packing (add GAP to width/height)
    const rects = images.map((img, i) => ({
      width: img.width + GAP,
      height: img.height + GAP,
      data: i,
    }));

    // Use a large max height, will trim later
    const packer = new MaxRectsPacker(CANVAS_WIDTH - 2 * PADDING, 100000, GAP, {
      smart: true,
      pot: false,
      square: false,
      allowRotation: false,
    });
    packer.addArray(rects);

    const bin = packer.bins[0];

    // Map positions back to images (add PADDING to both x and y)
    const positions = bin.rects.map((rect) => {
      const imgObj = images[rect.data];
      return {
        img: imgObj.img,
        x: rect.x + PADDING,
        y: rect.y + PADDING,
        width: rect.rot ? imgObj.height : imgObj.width,
        height: rect.rot ? imgObj.width : imgObj.height,
        rotated: rect.rot,
      };
    });

    // Calculate canvas height needed (add padding top and bottom)
    const contentHeight = Math.max(
      ...positions.map((p) => p.y + p.height),
      100
    );
    const canvasHeight = contentHeight + PADDING;

    // Compose canvas
    const canvas = createCanvas(CANVAS_WIDTH, canvasHeight);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight);

    // Draw a thick black border around the full canvas (6ft)
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, CANVAS_WIDTH - 3, canvasHeight - 3);

    // Draw each piece (no border for each piece)
    for (const { img, x, y, width, height, rotated } of positions) {
      if (rotated) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, 0, -width, height, width);
        ctx.restore();
      } else {
        ctx.drawImage(img, x, y, width, height);
      }
    }

    // Packing efficiency logging
    const totalImageArea = images.reduce(
      (sum, img) => sum + img.width * img.height,
      0
    );
    const canvasArea = CANVAS_WIDTH * canvasHeight;
    const efficiency = ((totalImageArea / canvasArea) * 100).toFixed(1);
    console.log(
      `Packing efficiency: ${efficiency}% (${totalImageArea}/${canvasArea})`
    );

    // Return as PNG buffer
    const buffer = canvas.toBuffer("image/png");
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=master_pattern_preview.png",
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
