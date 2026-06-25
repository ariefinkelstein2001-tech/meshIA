import { parsearPlanilla } from "@/lib/parsers";
import { AdapterError, type AdapterResultado, type FuenteAdapter } from "./types";

/**
 * Adaptador de Google Sheets.
 *
 * MVP (hecho-para-ti): el cliente publica su planilla y nos pasa la URL.
 * Soportamos:
 *   - URL de "Publicar en la web" como CSV
 *   - URL normal de la hoja → la convertimos a export?format=csv
 *
 * No usamos la API de Google (sin OAuth) para mantener el MVP simple.
 */
export const sheetAdapter: FuenteAdapter = {
  tipo: "sheet",
  async obtenerMovimientos(config): Promise<AdapterResultado> {
    const url = typeof config.url === "string" ? config.url : "";
    if (!url) {
      throw new AdapterError("Falta la URL del Google Sheet.");
    }

    const csvUrl = aUrlCsv(url);
    let texto: string;
    try {
      const res = await fetch(csvUrl, { redirect: "follow" });
      if (!res.ok) {
        throw new AdapterError(
          "No pudimos leer la planilla. Revisa que esté publicada o compartida como 'cualquiera con el enlace'.",
        );
      }
      texto = await res.text();
    } catch (e) {
      if (e instanceof AdapterError) throw e;
      throw new AdapterError(
        "No pudimos conectar con Google Sheets. Intenta de nuevo en un rato.",
      );
    }

    if (texto.trimStart().startsWith("<")) {
      // Nos devolvió HTML (login/permiso), no CSV.
      throw new AdapterError(
        "La planilla no es pública. Publícala en Archivo → Compartir → Publicar en la web, o compártela como 'cualquiera con el enlace'.",
      );
    }

    return parsearPlanilla(texto);
  },
};

/** Convierte una URL de Google Sheets a su exportación CSV. */
export function aUrlCsv(url: string): string {
  // Ya es un export/pub CSV.
  if (/output=csv|format=csv/.test(url)) return url;

  // URL normal: https://docs.google.com/spreadsheets/d/<ID>/edit#gid=<GID>
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch) {
    const id = idMatch[1];
    const gidMatch = url.match(/[#&]gid=(\d+)/);
    const gid = gidMatch ? gidMatch[1] : "0";
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
  }

  // Desconocida: la usamos tal cual y dejamos que el fetch falle con mensaje claro.
  return url;
}
