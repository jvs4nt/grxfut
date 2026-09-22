import { RsvpControls, type RsvpState } from "@/components/rsvp-controls";
import {
  PIX_AMOUNT_LABEL,
  PIX_KEY,
  PIX_PAYLOAD,
  PIX_RECEIVER,
} from "@/lib/pix";
import { getPixQrSvg } from "@/lib/pix-qr";

export async function RsvpForm({
  matchId,
  state,
}: {
  matchId: string;
  state: RsvpState;
}) {
  // O QR é gerado no servidor e desce como string: assim o pacote `qrcode`
  // nunca entra no bundle do cliente.
  const qrSvg = await getPixQrSvg();

  return (
    <RsvpControls
      matchId={matchId}
      state={state}
      pix={{
        payload: PIX_PAYLOAD,
        pixKey: PIX_KEY,
        receiver: PIX_RECEIVER,
        amountLabel: PIX_AMOUNT_LABEL,
        qrSvg,
      }}
    />
  );
}
