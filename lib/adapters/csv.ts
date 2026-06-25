import { parsearPlanilla } from "@/lib/parsers";
import type { AdapterResultado, FuenteAdapter } from "./types";

/**
 * Adaptador CSV: el cliente sube un archivo y nosotros lo parseamos.
 * El contenido del archivo llega como texto en config.contenido.
 */
export const csvAdapter: FuenteAdapter = {
  tipo: "csv",
  async obtenerMovimientos(config): Promise<AdapterResultado> {
    const contenido =
      typeof config.contenido === "string" ? config.contenido : "";
    return parsearPlanilla(contenido);
  },
};
