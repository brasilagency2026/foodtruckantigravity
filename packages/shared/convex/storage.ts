import { v } from "convex/values";
import { action } from "./_generated/server";
import { AwsClient } from "aws4fetch"; // compatible R2

// ============================================
// GÉNÉRATION DE PRESIGNED URL — Cloudflare R2
// Le client upload directement sur R2
// sans passer par le backend
// ============================================

export const generateUploadUrl = action({
  args: {
    key: v.string(),       // ex: "menu/1234567890-abc.jpg"
    contentType: v.string(), // ex: "image/jpeg"
  },
  handler: async (ctx, { key, contentType }) => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
    const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

    const r2 = new AwsClient({
      accessKeyId,
      secretAccessKey: secretKey,
      service: "s3",
      region: "auto",
    });

    const url = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;

    // Presigned URL valide 10 minutes
    const signed = await r2.sign(
      new Request(url, { method: "PUT" }),
      {
        aws: { signQuery: true },
        headers: { "Content-Type": contentType },
        expiresIn: 600,
      }
    );

    return {
      uploadUrl: signed.url,
      publicUrl: `${publicUrl}/${key}`,
    };
  },
});

// ============================================
// SUPPRIMER une photo de R2
// ============================================

export const deleteFromR2 = action({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
    const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;

    const r2 = new AwsClient({
      accessKeyId,
      secretAccessKey: secretKey,
      service: "s3",
      region: "auto",
    });

    const url = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;

    await r2.fetch(url, { method: "DELETE" });
  },
});
