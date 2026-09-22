import QRCode from "qrcode";
import { PIX_PAYLOAD } from "@/lib/pix";

// Server-only: nunca importe este módulo de um componente "use client", senão o
// pacote `qrcode` vai parar no bundle do navegador.
let cached: Promise<string> | null = null;

export function getPixQrSvg(): Promise<string> {
  // O payload é constante, então uma geração por processo basta.
  cached ??= QRCode.toString(PIX_PAYLOAD, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 232,
    // Escuro sobre branco de propósito: QR invertido falha em boa parte dos
    // leitores de app de banco.
    color: { dark: "#09090b", light: "#ffffff" },
  });

  return cached;
}
