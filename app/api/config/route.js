import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI; // Use environment variable for Vercel
const dbName = "mydb";
const collectionName = "config_db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name"); // e.g., /api/config?name=Handbag

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch global config (no 'name' field)
    const globalConfig = await collection.findOne({ name: { $exists: false } });
    if (!globalConfig) {
      return new Response(
        JSON.stringify({ error: "Global config not found" }),
        {
          status: 404,
        }
      );
    }

    // Fetch model-specific config by name
    let modelConfig = {};
    if (name) {
      modelConfig = await collection.findOne({ name });
      if (!modelConfig) {
        return new Response(
          JSON.stringify({ error: "Model config not found" }),
          {
            status: 404,
          }
        );
      }
    }

    // Remove _id fields
    delete globalConfig._id;
    if (modelConfig._id) delete modelConfig._id;

    // Merge: global fields + model fields (model fields override if duplicate)
    const mergedConfig = { ...globalConfig, ...modelConfig };

    return new Response(JSON.stringify(mergedConfig), {
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
