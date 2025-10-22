// import { MongoClient } from "mongodb";
// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const uri = process.env.MONGODB_URI;
// const dbName = "mydb";

// export async function POST() {
//   try {
//     console.log("Connecting to MongoDB...");
//     const client = new MongoClient(uri);
//     await client.connect();
//     const db = client.db(dbName);

//     console.log("Fetching styles...");
//     const styles = await db.collection("styles").find().toArray();
//     console.log("Styles fetched:", styles.length);

//     console.log("Fetching design options...");
//     const designOptions = await db
//       .collection("design_options")
//       .find()
//       .toArray();
//     console.log("Design options fetched:", designOptions.length);

//     const embeddings = { styles: {}, designOptions: {} };

//     // Style embeddings
//     for (const style of styles) {
//       const desc = style.description.join(" ");
//       console.log(`Embedding style: ${style.name}`);
//       const res = await openai.embeddings.create({
//         model: "text-embedding-3-small",
//         input: desc,
//       });
//       embeddings.styles[style.name] = res.data[0].embedding;
//     }

//     // DO embeddings
//     for (const doc of designOptions) {
//       const style = doc.style;
//       embeddings.designOptions[style] = {};
//       if (!doc.design_options || typeof doc.design_options !== "object") {
//         console.log(
//           `Skipping style ${style}: design_options missing or invalid`
//         );
//         continue;
//       }
//       for (const [cat, arr] of Object.entries(doc.design_options)) {
//         if (!Array.isArray(arr)) {
//           console.log(
//             `Skipping category ${cat} in style ${style}: not an array`
//           );
//           continue;
//         }
//         embeddings.designOptions[style][cat] = {};
//         for (const doObj of arr) {
//           if (!doObj || !doObj.code || !doObj.description) {
//             console.log(
//               `Skipping DO in style ${style}, category ${cat}: invalid DO object`,
//               doObj
//             );
//             continue;
//           }
//           console.log(`Embedding DO: ${style} - ${cat} - ${doObj.code}`);
//           try {
//             const doDesc = doObj.description;
//             const res = await openai.embeddings.create({
//               model: "text-embedding-3-small",
//               input: doDesc,
//             });
//             embeddings.designOptions[style][cat][doObj.code] =
//               res.data[0].embedding;
//           } catch (err) {
//             console.error(
//               `Error embedding DO: ${style} - ${cat} - ${doObj.code}`,
//               err
//             );
//           }
//         }
//       }
//     }

//     console.log("Saving embeddings to MongoDB...");
//     await db
//       .collection("embeddings")
//       .updateOne(
//         { _id: "handbag_embeddings" },
//         { $set: { data: embeddings } },
//         { upsert: true }
//       );

//     await client.close();
//     console.log("Embeddings generation complete.");
//     return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
//   } catch (err) {
//     console.error("Error in /api/embeddings:", err);
//     return new Response(
//       JSON.stringify({ status: "error", message: err.message }),
//       { status: 500 }
//     );
//   }
// }
