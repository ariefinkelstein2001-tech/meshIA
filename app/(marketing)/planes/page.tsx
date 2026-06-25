import type { Metadata } from "next";
import { Planes } from "@/components/marketing/Planes";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";

export const metadata: Metadata = {
  title: "Planes — meshIA",
  description:
    "Sitio, Pulso o Pro. Planes simples en CLP para independientes y pymes en Chile.",
};

export default function PlanesPage() {
  return (
    <section className="mx-auto max-w-page px-5 py-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Elige tu plan
        </h1>
        <p className="mt-3 text-muted">
          Parte por donde más te sirve: tu página web (Sitio), tu panel de
          números (Pulso), o los dos juntos (Pro). Precios en pesos, sin letra
          chica. Por ahora trabajamos hecho-para-ti con socios fundadores.
        </p>
      </div>

      <div className="mt-10">
        <Planes />
      </div>

      <div className="mx-auto mt-16 max-w-xl rounded-card border border-line bg-paper p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-ink">
          ¿No sabes cuál te conviene?
        </h2>
        <p className="mt-1 text-sm text-muted">
          Déjanos tu correo y te ayudamos a elegir según tu negocio.
        </p>
        <div className="mt-4">
          <WaitlistForm fuente="planes" />
        </div>
      </div>
    </section>
  );
}
