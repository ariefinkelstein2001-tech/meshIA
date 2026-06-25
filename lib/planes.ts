import type { Plan } from "./types";

/**
 * Catálogo de planes de meshIA — fuente única de verdad para:
 *  - la página de precios (/planes) y la landing
 *  - el gating de features por empresa.plan (Fase 5)
 *
 * Precios en CLP/mes. Sin cobro aún (Fase 5 deja solo el gating).
 */

export interface PlanInfo {
  id: Plan;
  nombre: string;
  precio: number; // CLP / mes
  pitch: string;
  features: string[];
  destacado?: boolean;
  /** Límites usados por el gating (§ Fase 5). */
  limites: {
    /** Máximo de fuentes de datos conectadas. */
    maxFuentes: number;
    /** Acceso al dashboard Pulso. */
    pulso: boolean;
    /** Acceso a páginas de Sitio. */
    sitio: boolean;
    /** Resumen semanal por email. */
    resumenSemanal: boolean;
  };
}

export const PLANES: Record<Plan, PlanInfo> = {
  sitio: {
    id: "sitio",
    nombre: "Sitio",
    precio: 14990,
    pitch: "Tu página web lista para vender, fácil de mantener.",
    features: [
      "Página web profesional",
      "Dominio y formulario de contacto",
      "Hecho-para-ti: la dejamos andando",
    ],
    limites: { maxFuentes: 0, pulso: false, sitio: true, resumenSemanal: false },
  },
  pulso: {
    id: "pulso",
    nombre: "Pulso",
    precio: 19990,
    pitch: "El panel que te dice, en 10 segundos, cómo va tu negocio.",
    destacado: true,
    features: [
      "Dashboard de ventas, gastos y flujo de caja",
      "Conecta Google Sheets o sube un CSV",
      "Resumen semanal por correo",
    ],
    limites: { maxFuentes: 3, pulso: true, sitio: false, resumenSemanal: true },
  },
  pro: {
    id: "pro",
    nombre: "Pro",
    precio: 29990,
    pitch: "Sitio y Pulso juntos. Tu negocio completo, claro.",
    features: [
      "Todo lo de Sitio + todo lo de Pulso",
      "Hasta 10 fuentes de datos",
      "Prioridad en soporte",
    ],
    limites: { maxFuentes: 10, pulso: true, sitio: true, resumenSemanal: true },
  },
};

export const PLANES_LISTA: PlanInfo[] = [
  PLANES.sitio,
  PLANES.pulso,
  PLANES.pro,
];

/** Helpers de gating (Fase 5). Centralizan las reglas de límites por plan. */
export function puedeUsarPulso(plan: Plan): boolean {
  return PLANES[plan].limites.pulso;
}

export function maxFuentes(plan: Plan): number {
  return PLANES[plan].limites.maxFuentes;
}

export function puedeAgregarFuente(plan: Plan, fuentesActuales: number): boolean {
  return fuentesActuales < maxFuentes(plan);
}

export function tieneResumenSemanal(plan: Plan): boolean {
  return PLANES[plan].limites.resumenSemanal;
}
