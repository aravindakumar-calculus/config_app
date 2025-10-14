import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "mydb";
const collectionName = "config_db";

export async function GET() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Get all models with a name field
    const models = await collection
      .find({ name: { $exists: true } })
      .project({ name: 1, modelUrl: 1, _id: 0 })
      .toArray();

    return new Response(JSON.stringify(models), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
