import { Badge, Card, ButtonLink } from "@/components/ui";
import { Planes } from "@/components/marketing/Planes";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";
import { MeshPanelVisual } from "@/components/marketing/MeshPanelVisual";

export default function Landing() {
  return (
    <>
      {/* HERO */}
      <section className="mx-auto max-w-page px-5 pb-16 pt-12 sm:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Badge>Para independientes y pymes en Chile</Badge>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Tu negocio, claro en{" "}
              <span className="text-brand">10 segundos</span>.
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted">
              Pulso junta tus ventas, gastos y cuentas en un panel simple.
              Entras y al tiro sabes si estás ganando plata, cuánto te queda y
              qué está creciendo. Todo en pesos, en español, desde el celular.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="#waitlist">Quiero un cupo</ButtonLink>
              <ButtonLink href="/planes" variant="secondary">
                Ver planes
              </ButtonLink>
            </div>
          </div>
          <MeshPanelVisual />
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="border-y border-line/70 bg-paper/50">
        <div className="mx-auto max-w-page px-5 py-14">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            ¿Tu plata vive en mil partes?
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Ventas en una planilla, gastos en otra, el banco por su lado. Al
            final del mes nadie sabe bien cómo va el negocio. meshIA junta todo
            en un solo lugar, ordenado y claro.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Antes", "Planillas sueltas, números que no calzan, decisiones a ojo."],
              ["Con meshIA", "Un panel ordenado que se actualiza solo con tus datos."],
              ["Resultado", "Sabes qué crece, qué te cuesta y cuánto te queda."],
            ].map(([t, d]) => (
              <Card key={t}>
                <h3 className="font-display text-base font-bold text-ink">{t}</h3>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* QUÉ VES EN PULSO */}
      <section className="mx-auto max-w-page px-5 py-14">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Qué ves en Pulso
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["Ingresos y gastos del mes", "Cuánto entró, cuánto salió, todo en CLP."],
            ["Flujo de caja", "Lo que realmente te queda en el bolsillo."],
            ["Crecimiento vs mes anterior", "Si vas subiendo o bajando, de una mirada."],
            ["Ventas por categoría", "Qué producto o servicio te está moviendo."],
          ].map(([t, d]) => (
            <Card key={t} className="flex gap-3">
              <span aria-hidden className="text-2xl text-brand">
                ◳
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-ink">{t}</h3>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* INTEGRACIONES */}
      <section className="border-y border-line/70 bg-paper/50">
        <div className="mx-auto max-w-page px-5 py-14">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Empieza con lo que ya tienes
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Hoy conectamos tus datos por ti desde Google Sheets o un CSV. Banco,
            SII y pagos vienen en camino — dejamos todo preparado.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              ["Google Sheets", true],
              ["CSV", true],
              ["Banco (Fintoc)", false],
              ["SII", false],
              ["Pagos (Flow / Webpay)", false],
            ].map(([n, listo]) => (
              <span
                key={n as string}
                className={`rounded-pill border px-3 py-1.5 text-sm ${
                  listo
                    ? "border-brand/30 bg-brand/5 text-brand-deep"
                    : "border-line bg-paper text-muted"
                }`}
              >
                {n} {listo ? "· listo" : "· pronto"}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="mx-auto max-w-page px-5 py-14">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Planes simples
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Parte por donde más te sirve. Sin letra chica.
        </p>
        <div className="mt-8">
          <Planes />
        </div>
      </section>

      {/* SOCIOS FUNDADORES + WAITLIST */}
      <section
        id="waitlist"
        className="border-t border-line/70 bg-gradient-to-b from-paper/60 to-canvas"
      >
        <div className="mx-auto max-w-page px-5 py-16">
          <div className="mx-auto max-w-xl text-center">
            <Badge>Socios fundadores</Badge>
            <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">
              Estamos abriendo cupos
            </h2>
            <p className="mt-2 text-muted">
              Trabajamos hecho-para-ti con un grupo chico de negocios: conectamos
              tus datos y dejamos Pulso andando. Déjanos tu correo y te avisamos
              cuando haya un cupo para ti.
            </p>
            <div className="mt-6 text-left">
              <WaitlistForm fuente="landing" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
