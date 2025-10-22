export async function GET() {
  return new Response(
    JSON.stringify({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      preset: process.env.CLOUDINARY_UNSIGNED_PRESET,
    }),
    { status: 200 }
  );
}
