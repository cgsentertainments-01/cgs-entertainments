import QRCode from "qrcode";

/**
 * Generates a high-quality, scannable QR Code Data URL (PNG).
 * @param text The URL or string to encode in the QR code
 * @returns Base64 Data URL string representing the PNG image
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
  if (!text) return "";

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H", // High error correction for robust scannability
      margin: 2,
      scale: 10,
      width: 400,
      color: {
        dark: "#1E1B4B", // Dark navy/indigo for high contrast
        light: "#FFFFFF", // Pure white background
      },
    });
    return dataUrl;
  } catch (err) {
    console.error("Error generating QR code:", err);
    return "";
  }
}

/**
 * Constructs the canonical verification URL for a registration.
 * @param reference Registration ID or QR Token
 * @param origin Optional window.location.origin
 */
export function getVerificationUrl(reference: string, origin?: string): string {
  if (!reference) return "";
  
  // If reference is already a full URL, return it
  if (reference.startsWith("http://") || reference.startsWith("https://")) {
    return reference;
  }

  const base =
    origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const cleanBase = base.replace(/\/$/, "");
  const cleanRef = encodeURIComponent(reference.trim());

  return `${cleanBase}/verify/${cleanRef}`;
}
