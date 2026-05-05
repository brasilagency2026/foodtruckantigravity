// ============================================
// GÉNÉRATION QR CODE — para o proprietário
// URL cible : https://SEU-DOMINIO.vercel.app/t/[truckId]
// ============================================

/**
 * Génère l'URL du QR Code via l'API Google Charts (gratuit, sans dépendance)
 */
export function getQRCodeImageUrl(truckId: string, baseUrl: string, size = 300, seo?: { state: string; city: string; slug: string }): string {
  const menuUrl = seo 
    ? `${baseUrl}/t/${seo.state}/${seo.city}/${seo.slug}`
    : `${baseUrl}/t/${truckId}`;
  const encoded = encodeURIComponent(menuUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=FFFFFF&color=000000&margin=20`;
}

/**
 * Télécharge le QR Code en PNG haute résolution (pour impression)
 */
export async function downloadQRCode(truckId: string, truckName: string, baseUrl: string, seo?: { state: string; city: string; slug: string }) {
  const url = getQRCodeImageUrl(truckId, baseUrl, 1000, seo);
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = img.width;
    const paddingBottom = 160;
    const height = img.height + paddingBottom;

    canvas.width = width;
    canvas.height = height;

    // Fond blanc
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Dessiner le QR Code
    ctx.drawImage(img, 0, 0, width, img.height);

    // Dessiner le texte "Foodpronto"
    ctx.fillStyle = "#FF6B35"; // Couleur orange Food Pronto (ou noir "#000000")
    ctx.font = "bold 90px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Foodpronto", width / 2, img.height + (paddingBottom / 2));

    // Lancer le téléchargement
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qrcode-${truckName.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.click();

    URL.revokeObjectURL(objectUrl);
  };
  img.src = objectUrl;
}

/**
 * URL canonique du menu (cible du QR Code)
 */
export function getMenuUrl(truckId: string, baseUrl: string): string {
  return `${baseUrl}/t/${truckId}`;
}
