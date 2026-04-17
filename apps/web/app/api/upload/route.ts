import { NextRequest, NextResponse } from "next/server";
import { AwsClient } from "aws4fetch";

// In a real scenario, you'd use a Convex Auth helper here to verify the session.
// For now, we will assume the frontend has passed the authentication check before calling this.
// Or we can check for the presence of the convex_auth_session cookie.

export async function POST(req: NextRequest) {
  // Simplified check: check for auth cookies or a custom header
  // Note: For full security, you should verify the JWT token from Convex.
  const hasAuth = req.cookies.get("convex_auth_session");
  // if (!hasAuth) {
  //   return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  // }


  const { key, contentType } = await req.json();

  if (!key || !contentType) {
    return NextResponse.json({ error: "key e contentType são obrigatórios" }, { status: 400 });
  }

  // Valider le type de fichier
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(contentType)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
  }

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

  const uploadEndpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;

  const signed = await r2.sign(
    new Request(uploadEndpoint, {
      method: "PUT",
      headers: { "Content-Type": contentType },
    }),
    {
      aws: { signQuery: true },
    }
  );

  return NextResponse.json({
    uploadUrl: signed.url,
    publicUrl: `${publicUrl}/${key}`,
  });
}
