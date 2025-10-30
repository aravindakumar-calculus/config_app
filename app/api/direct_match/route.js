import { MongoClient } from "mongodb";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const uri = process.env.MONGODB_URI;
const dbName = "mydb";

export async function POST(req) {
  const { imageUrl, text } = await req.json();

  if (!imageUrl && !text) {
    return new Response(
      JSON.stringify({ error: "Image URL or text required" }),
      { status: 400 }
    );
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  try {
    // 1. Load all styles (no DOs yet)
    const stylesDocs = await db.collection("styles").find({}).toArray();

    // 2. Build style-only prompt
    const stylePrompt = buildStylePrompt(stylesDocs);

    // 3. Call AI to select style
    const styleMessages = [
      {
        role: "system",
        content: stylePrompt,
      },
    ];
    if (imageUrl) {
      styleMessages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: text || "Select the closest matching handbag style.",
          },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      });
    } else {
      styleMessages.push({
        role: "user",
        content: text,
      });
    }

    const styleResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: styleMessages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const styleResult = JSON.parse(styleResponse.choices[0].message.content);
    const selectedStyleCode = styleResult.style;

    // 4. Load DOs for selected style only
    const designOptionsDoc = await db
      .collection("design_options")
      .findOne({ style: selectedStyleCode });

    // 5. Build DOs prompt for this style
    const doPrompt = buildDOsPrompt(stylesDocs, designOptionsDoc);

    // 6. Call AI to select DOs for this style
    const doMessages = [
      {
        role: "system",
        content: doPrompt,
      },
    ];
    if (imageUrl) {
      doMessages.push({
        role: "user",
        content: [
          {
            type: "text",
            text:
              text ||
              "Select the closest matching design options for this handbag style.",
          },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      });
    } else {
      doMessages.push({
        role: "user",
        content: text,
      });
    }

    const doResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: doMessages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const doResult = JSON.parse(doResponse.choices[0].message.content);

    // Add style code to result (if not present)
    doResult.style = selectedStyleCode;

    // --- Console logs for selected style and DO option names ---
    const selectedStyle = stylesDocs.find((s) => s.name === selectedStyleCode);
    console.log(
      "Selected Style:",
      selectedStyleCode,
      "-",
      selectedStyle?.description
    );

    if (designOptionsDoc) {
      [
        "Handle",
        "Closure",
        "Front",
        "FrontPocket",
        "Strap",
        "Rear",
        "AddOn",
      ].forEach((cat) => {
        const code = doResult[cat];
        const opt = (designOptionsDoc.design_options[cat] || []).find(
          (o) => o.code === code
        );
        if (opt) {
          console.log(`Selected ${cat}:`, code, "-", opt.description);
        } else {
          console.log(`Selected ${cat}:`, code, "- Not found in options");
        }
      });
    }

    await client.close();

    return new Response(JSON.stringify(doResult), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    await client.close();
    console.error("Direct match error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to match design options" }),
      { status: 500 }
    );
  }
}

// Prompt for style selection only
function buildStylePrompt(stylesDocs) {
  let prompt = `You are a handbag style matching expert. Analyze the provided handbag and select the EXACT matching style code from the available options below.

IMPORTANT INSTRUCTIONS:
1. Return ONLY a valid style code from the list below.
2. Select the closest match.
3. Return your response as JSON with this exact key: style

========== AVAILABLE STYLES ==========\n`;

  stylesDocs.forEach((style) => {
    prompt += `\nSTYLE: ${style.name}
Description: ${
      Array.isArray(style.description)
        ? style.description.join(" ")
        : style.description
    }\n`;
  });

  prompt += `\n========== OUTPUT FORMAT ==========
Return JSON with this exact structure:
{
  "style": "<style_code>"
}
`;

  return prompt;
}

// Prompt for DOs for a single style
function buildDOsPrompt(stylesDocs, designOptionsDoc) {
  const style = stylesDocs.find((s) => s.name === designOptionsDoc.style);
  let prompt = `You are a handbag design matching expert. The selected style is "${
    designOptionsDoc.style
  }": ${
    Array.isArray(style.description)
      ? style.description.join(" ")
      : style.description
  }

Select the EXACT matching design option codes from the available options below.

IMPORTANT INSTRUCTIONS:
1. Return ONLY valid codes from the lists below
2. Select the closest match for each category
3. If no close match exists, use the "00" (none) option for that category
4. Focus on functional details (mounting, hardware, shape) over aesthetics
5. Return your response as JSON with these exact keys: Handle, Closure, Front, FrontPocket, Strap, Rear, AddOn

========== DESIGN OPTIONS FOR THIS STYLE ==========\n`;

  const categories = [
    "Handle",
    "Closure",
    "Front",
    "FrontPocket",
    "Strap",
    "Rear",
    "AddOn",
  ];

  categories.forEach((category) => {
    if (designOptionsDoc.design_options[category]) {
      prompt += `\n${category.toUpperCase()}:\n`;
      designOptionsDoc.design_options[category].forEach((option) => {
        prompt += `  - ${option.code}: ${option.description}\n`;
      });
    }
  });

  prompt += `\n\n========== OUTPUT FORMAT ==========
Return JSON with this exact structure:
{
  "Handle": "<handle_code>",
  "Closure": "<closure_code>",
  "Front": "<front_code>",
  "FrontPocket": "<frontpocket_code>",
  "Strap": "<strap_code>",
  "Rear": "<rear_code>",
  "AddOn": "<addon_code>"
}
`;

  return prompt;
}
