import "server-only";
import { Resend } from "resend";

/**
 * Envío de emails (§ Fase 4) con Resend.
 * Si no hay RESEND_API_KEY configurada, no rompe: registra y devuelve simulado.
 */

interface EnviarArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function enviarEmail({
  to,
  subject,
  html,
  text,
}: EnviarArgs): Promise<{ ok: boolean; simulado?: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "meshIA <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY no configurada — simulando envío a ${to}: ${subject}`,
    );
    return { ok: true, simulado: true };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[email] error de Resend:", error);
    return { ok: false };
  }
  return { ok: true, id: data?.id };
}

/**
 * STUB documentado (§ Fase 4): envío por WhatsApp, para después.
 *
 * Plan: integrar WhatsApp Cloud API (Meta) o un proveedor como Twilio.
 * Requiere número de empresa verificado y plantillas aprobadas. No implementado.
 */
export async function enviarWhatsapp(
  telefono: string,
  mensaje: string,
): Promise<{ ok: boolean; pendiente: true }> {
  console.warn(
    `[whatsapp] STUB no implementado. Destino ${telefono}: ${mensaje.slice(0, 40)}…`,
  );
  return { ok: false, pendiente: true };
}
