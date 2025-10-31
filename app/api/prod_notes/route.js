import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "mydb";
const collectionName = "prod_notes";

export async function GET() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();
    // Remove _id for frontend use
    const cleanData = data.map(({ _id, ...rest }) => rest);
    return new Response(JSON.stringify(cleanData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
