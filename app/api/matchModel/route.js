// import { MongoClient } from "mongodb";
// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const uri = process.env.MONGODB_URI;
// const dbName = "mydb";

// // Helper for cosine similarity
// function cosineSimilarity(a, b) {
//   let dot = 0,
//     normA = 0,
//     normB = 0;
//   for (let i = 0; i < a.length; i++) {
//     dot += a[i] * b[i];
//     normA += a[i] * a[i];
//     normB += b[i] * b[i];
//   }
//   return dot / (Math.sqrt(normA) * Math.sqrt(normB));
// }

// export async function POST(req) {
//   const { text, imageUrl } = await req.json();
//   let inputText = text;

//   // If image, generate caption (pseudo-code, adjust as needed)
//   if (imageUrl && !text) {
//     const captionRes = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: "Describe the handbag in this image." },
//         {
//           role: "user",
//           content: [{ type: "image_url", image_url: { url: imageUrl } }],
//         },
//       ],
//     });
//     inputText = captionRes.choices[0].message.content;
//   }

//   // Get embedding for input
//   const embedRes = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: inputText,
//   });
//   const inputEmbedding = embedRes.data[0].embedding;

//   // Load embeddings from MongoDB
//   const client = new MongoClient(uri);
//   await client.connect();
//   const db = client.db(dbName);
//   const embeddingsDoc = await db
//     .collection("embeddings")
//     .findOne({ _id: "handbag_embeddings" });
//   const { styles, designOptions } = embeddingsDoc.data;

//   // Find closest style
//   let bestStyle = null,
//     bestScore = -1;
//   for (const [style, emb] of Object.entries(styles)) {
//     const score = cosineSimilarity(inputEmbedding, emb);
//     if (score > bestScore) {
//       bestScore = score;
//       bestStyle = style;
//     }
//   }

//   // For each DO category, find closest match
//   const bestDOs = {};
//   for (const [cat, options] of Object.entries(designOptions[bestStyle])) {
//     let bestDO = null,
//       bestDOScore = -1;
//     for (const [code, emb] of Object.entries(options)) {
//       const score = cosineSimilarity(inputEmbedding, emb);
//       if (score > bestDOScore) {
//         bestDOScore = score;
//         bestDO = code;
//       }
//     }
//     bestDOs[cat] = bestDO;
//   }

//   await client.close();
//   return new Response(
//     JSON.stringify({ style: bestStyle, designOptions: bestDOs }),
//     { status: 200 }
//   );
// }
