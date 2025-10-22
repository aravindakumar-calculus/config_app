import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "mydb";
const collectionName = "incompatible_rules";

export async function GET() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch the first document that contains a 'rules' array
    const doc = await collection.findOne({ rules: { $exists: true } });
    if (!doc) {
      return new Response(JSON.stringify({ error: "Rules not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Return only the rules array
    return new Response(JSON.stringify({ rules: doc.rules }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
