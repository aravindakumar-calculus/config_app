import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "mydb";
const collectionName = "ref_map";

export async function GET() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Find the document with the reference matrix
    const doc = await collection.findOne({ ref_map: { $exists: true } });
    if (!doc) {
      return new Response(JSON.stringify({ error: "Matrix not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Return the full object (ref_map + defaults)
    const { ref_map, defaults } = doc;
    return new Response(JSON.stringify({ ref_map, defaults }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
