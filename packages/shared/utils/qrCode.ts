// ============================================
// GÉNÉRATION QR CODE — para o proprietário
// URL cible : https://SEU-DOMINIO.vercel.app/t/[truckId]
// ============================================

/**
 * Génère l'URL du QR Code via l'API Google Charts (gratuit, sans dépendance)
 */
export function getQRCodeImageUrl(truckId: string, baseUrl: string, size = 300): string {
  const menuUrl = `${baseUrl}/t/${truckId}`;
  const encoded = encodeURIComponent(menuUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=0D0D0D&color=FF6B35&margin=20`;
}

/**
 * Télécharge le QR Code en PNG haute résolution (pour impression)
 */
export async function downloadQRCode(truckId: string, truckName: string, baseUrl: string) {
  const url = getQRCodeImageUrl(truckId, baseUrl, 1000);
  const response = await fetch(url);
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `qrcode-${truckName.toLowerCase().replace(/\s+/g, "-")}.png`;
  link.click();
}

/**
 * URL canonique du menu (cible du QR Code)
 */
export function getMenuUrl(truckId: string, baseUrl: string): string {
  return `${baseUrl}/t/${truckId}`;
}
