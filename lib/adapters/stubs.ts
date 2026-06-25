import { AdapterError, type FuenteAdapter } from "./types";

/**
 * Stubs de fuentes futuras (§ Fase 5 del brief).
 * Dejamos la interfaz lista para no rehacer la arquitectura cuando las
 * implementemos, pero NO conectan nada todavía.
 *
 * Nota del brief: Stripe NO opera tarjetas locales en Chile — no usarlo.
 * Para pagos en Chile: Flow / Mercado Pago / Webpay.
 */

function noImplementado(nombre: string): FuenteAdapter["obtenerMovimientos"] {
  return async () => {
    throw new AdapterError(
      `La integración con ${nombre} todavía no está disponible. Por ahora conecta tus datos con Google Sheets o CSV.`,
    );
  };
}

/** Banco vía Fintoc (cartola/movimientos). Pendiente. */
export const bancoAdapter: FuenteAdapter = {
  tipo: "banco",
  obtenerMovimientos: noImplementado("el banco (Fintoc)"),
};

/** SII: documentos tributarios electrónicos. Pendiente. */
export const siiAdapter: FuenteAdapter = {
  tipo: "sii",
  obtenerMovimientos: noImplementado("el SII"),
};

/** Pagos: Flow / Mercado Pago / Webpay (NO Stripe en Chile). Pendiente. */
export const pagosAdapter: FuenteAdapter = {
  tipo: "pagos",
  obtenerMovimientos: noImplementado("la pasarela de pagos (Flow / Webpay)"),
};
