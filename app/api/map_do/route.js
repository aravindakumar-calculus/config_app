// import { MongoClient } from "mongodb";
// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const uri = process.env.MONGODB_URI;
// const dbName = "mydb";

// const ATTRIBUTES = [
//   "Handle",
//   "Closure",
//   "Front",
//   "FrontPocket",
//   "Strap",
//   "Rear",
//   "AddOn",
// ];

// const FEATURE_WEIGHTS = {
//   shape: 3,
//   gusset: 3,
//   handle: 3,
//   closure: 2,
//   frontPocket: 2,
//   front: 2,
//   strap: 2,
//   addOns: 1,
//   rear: 1,
// };

// const SYNONYMS = {
//   "mounted at top": ["mounted at the very top", "top mounted"],
//   "no gusset": ["no separate side gusset", "no gussets"],
//   trapezoid: ["trapezoid shape", "trapezoidal"],
//   square: ["squarish", "square shape"],
//   "large gusset": ["large side gussets", "big gusset"],
//   rectangular: ["rectangular", "straight edges"],
//   "triangular gusset": ["triangular looking gussets"],
//   "no handle": ["no handle", "no handles"],
//   "no add-ons": ["no add-ons", "none"],
// };

// function normalize(str) {
//   return (str || "")
//     .toLowerCase()
//     .replace(/[^\w\s]/g, "")
//     .trim();
// }

// function extractKeywords(descArr) {
//   return descArr
//     .map((desc) => desc.split(/[\s,.]+/))
//     .flat()
//     .map(normalize)
//     .filter((w) => w.length > 2);
// }

// function expandWithSynonyms(val) {
//   const norm = normalize(val);
//   let expanded = [norm];
//   Object.entries(SYNONYMS).forEach(([key, arr]) => {
//     if (norm === key || arr.includes(norm)) {
//       expanded = expanded.concat(arr.map(normalize));
//     }
//   });
//   return expanded;
// }

// // Improved DO mapping: keyword-based and fallback to best match
// function mapToDO(category, value, optionsArr) {
//   const expandedVals = expandWithSynonyms(value);
//   let bestMatch = null;
//   let bestScore = -1;
//   for (const opt of optionsArr) {
//     const optKeywords = extractKeywords([opt.description]);
//     let score = 0;
//     for (const v of expandedVals) {
//       if (optKeywords.includes(v)) score++;
//     }
//     if (score > bestScore) {
//       bestScore = score;
//       bestMatch = opt.code;
//     }
//     // Exact match fallback
//     if (
//       expandedVals.some((v) => normalize(opt.description).includes(v)) ||
//       expandedVals.some((v) => normalize(opt.code) === v)
//     ) {
//       return opt.code;
//     }
//   }
//   // Return best keyword match if no exact match
//   return bestMatch;
// }

// function scoreFeaturesAgainstStyle(features, style, designOptionsObj) {
//   let score = 0;
//   const styleKeywords = extractKeywords(style.description);
//   for (const [key, val] of Object.entries(features)) {
//     if (!val) continue;
//     const expandedVals = expandWithSynonyms(val);
//     if (styleKeywords.some((kw) => expandedVals.includes(kw))) {
//       score += FEATURE_WEIGHTS[key] || 1;
//     }
//   }
//   for (const [cat, optionsArr] of Object.entries(designOptionsObj)) {
//     for (const opt of optionsArr) {
//       const optKeywords = extractKeywords([opt.description]);
//       for (const [key, val] of Object.entries(features)) {
//         if (!val) continue;
//         const expandedVals = expandWithSynonyms(val);
//         if (optKeywords.some((kw) => expandedVals.includes(kw))) {
//           score += (FEATURE_WEIGHTS[key] || 1) * 2;
//         }
//       }
//     }
//   }
//   return score;
// }

// export async function POST(req) {
//   const { text, imageUrl } = await req.json();
//   let inputText = text;
//   let inputFeatures = {};

//   if (imageUrl && !text) {
//     const featureRes = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content:
//             "Extract the following features from this handbag image. For each, choose only from the following values: shape: trapezoid, square, triangular; gusset: exposed, hidden, standard, large, none; handle: mounted on front/back, mounted at top, no handle; closure: flap, strap, arch, none; frontPocket: yes, no, large, small, rectangular; front: strips, arches, stitching, none; strap: wide, narrow, runner, none; addOns: charms, none; rear: luggage strap, none. Return as JSON with keys: shape, gusset, handle, closure, frontPocket, front, strap, addOns, rear.",
//         },
//         {
//           role: "user",
//           content: [{ type: "image_url", image_url: { url: imageUrl } }],
//         },
//       ],
//       response_format: { type: "json_object" },
//     });
//     try {
//       inputFeatures = JSON.parse(featureRes.choices[0].message.content);
//       inputText = Object.values(inputFeatures).filter(Boolean).join(", ");
//     } catch {
//       inputFeatures = {};
//       inputText = "";
//     }
//   }

//   const client = new MongoClient(uri);
//   await client.connect();
//   const db = client.db(dbName);

//   const designOptionsDocs = await db
//     .collection("design_options")
//     .find({})
//     .toArray();

//   const stylesDocs = await db.collection("styles").find({}).toArray();

//   let styleCode = null;
//   let bestScore = -1;
//   let debugLog = [];

//   if (Object.keys(inputFeatures).length > 0) {
//     for (const style of stylesDocs) {
//       const styleOptionsDoc = designOptionsDocs.find(
//         (doc) => doc.style === style.name
//       );
//       const designOptionsObj = styleOptionsDoc?.design_options || {};
//       const score = scoreFeaturesAgainstStyle(
//         inputFeatures,
//         style,
//         designOptionsObj
//       );
//       debugLog.push({ style: style.name, score });
//       if (score > bestScore) {
//         bestScore = score;
//         styleCode = style.name;
//       }
//     }
//   } else {
//     const normText = normalize(inputText);
//     for (const style of stylesDocs) {
//       if (
//         style.description &&
//         style.description.some((desc) => normText.includes(normalize(desc)))
//       ) {
//         styleCode = style.name;
//         break;
//       }
//     }
//   }
//   if (!styleCode && stylesDocs.length > 0) styleCode = stylesDocs[0].name;

//   const styleOptionsDoc = designOptionsDocs.find(
//     (doc) => doc.style === styleCode
//   );
//   const designOptionsObj = styleOptionsDoc?.design_options || {};

//   let optionsPrompt = "";
//   for (const attr of ATTRIBUTES) {
//     const optionsArr = designOptionsObj[attr] || [];
//     if (optionsArr.length > 0) {
//       optionsPrompt += `\n${attr} options:\n`;
//       for (const opt of optionsArr) {
//         optionsPrompt += `- ${opt.description}\n`;
//       }
//     }
//   }

//   const systemPrompt = `
// You are an expert handbag configurator. Given a handbag description, output a JSON object with the following keys: Handle, Closure, Front, FrontPocket, Strap, Rear, AddOn. For each key, select a value that exactly matches one of the options below for the selected style. If unsure, leave the value as an empty string.
// ${optionsPrompt}
// For each attribute, select only from the provided options. Do not invent or paraphrase. If the description does not match any option, leave it blank.
// `;

//   const messages = [
//     { role: "system", content: systemPrompt },
//     { role: "user", content: inputText },
//   ];

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages,
//     response_format: { type: "json_object" },
//   });

//   let attributes = {};
//   try {
//     attributes = JSON.parse(response.choices[0].message.content);
//   } catch {
//     attributes = {};
//   }

//   const doCodes = {};
//   for (const attr of ATTRIBUTES) {
//     const val = attributes[attr];
//     const optionsArr = designOptionsObj[attr] || [];
//     doCodes[attr] = mapToDO(attr, val, optionsArr);
//   }

//   const designOptions = {
//     Handle: doCodes.Handle,
//     Closure: doCodes.Closure,
//     Front: doCodes.Front,
//     FrontPocket: doCodes.FrontPocket,
//     Strap: doCodes.Strap,
//     Rear: doCodes.Rear,
//     AddOn: doCodes.AddOn,
//   };

//   await client.close();
//   return new Response(
//     JSON.stringify({
//       style: styleCode,
//       designOptions,
//       features: inputFeatures,
//       caption: inputText,
//       debug: debugLog,
//     }),
//     { status: 200 }
//   );
// }
