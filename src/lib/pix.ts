/**
 * BR Code (PIX copia e cola) estático do fut.
 *
 * O valor vive no campo `54` (`17.00`) e os quatro dígitos finais (`A2DA`) são o
 * CRC16/CCITT-FALSE de tudo que vem antes, incluindo o `6304`. Mudar o valor, a
 * chave ou o recebedor exige **regerar o payload e recalcular o CRC** — editar o
 * string na mão produz um código que todo banco rejeita no checksum.
 *
 * O campo `62-05` carrega um txid fixo, então todos os pagamentos chegam
 * idênticos no extrato: a conciliação é feita pelo nome de quem pagou.
 */
export const PIX_PAYLOAD =
  "00020126680014BR.GOV.BCB.PIX0126felipesoares1308@gmail.com0216Pagamento do fut520400005303986540517.005802BR5921FELIPE SOARES PEREIRA6009SAO PAULO6226052216xfgPGUEhgINbW3CMAH8P6304A2DA";

export const PIX_KEY = "felipesoares1308@gmail.com";
export const PIX_RECEIVER = "FELIPE SOARES PEREIRA";
export const PIX_AMOUNT_CENTS = 1700;
export const PIX_AMOUNT_LABEL = "R$ 17,00";

export type PixInfo = {
  payload: string;
  pixKey: string;
  receiver: string;
  amountLabel: string;
  qrSvg: string;
};
