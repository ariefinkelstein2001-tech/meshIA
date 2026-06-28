import { Card, ButtonLink } from "@/components/ui";
import { Planes } from "@/components/marketing/Planes";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";
import { HeroPulso } from "@/components/marketing/HeroPulso";

export default function Landing() {
  return (
    <>
      {/* HERO — la tesis: el desorden se ordena en un Pulso */}
      <section className="mx-auto max-w-page px-5 pb-20 pt-14 sm:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="eyebrow">Para pymes e independientes · Chile</p>
            <h1 className="mt-5 font-display text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-ink">
              Tu plata,
              <br />
              clara en <span className="text-brand">10 segundos</span>.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Pulso junta tus ventas, gastos y cuentas en un solo panel. Entras y
              al tiro sabes si estás ganando, cuánto te queda y qué está
              creciendo. En pesos, en chileno, desde el celular.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/probar">Probar con tu Excel</ButtonLink>
              <ButtonLink href="#waitlist" variant="secondary">
                Quiero un cupo
              </ButtonLink>
            </div>
            <p className="eyebrow mt-6">
              Sin cuenta · suelta tu planilla y mira tu Pulso al toque
            </p>
          </div>
          <HeroPulso />
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="border-y border-line/70 bg-paper/50">
        <div className="mx-auto max-w-page px-5 py-16">
          <p className="eyebrow">El problema</p>
          <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
            Tu plata vive en mil partes y al final del mes nadie sabe cómo va.
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
            {[
              ["Hoy", "Ventas en una planilla, gastos en otra, el banco por su lado."],
              ["Con meshIA", "Todo junto en un panel que se actualiza con tus datos."],
              ["Resultado", "Sabes qué crece, qué te cuesta y cuánto te queda."],
            ].map(([t, d]) => (
              <div key={t} className="bg-paper p-5">
                <h3 className="eyebrow">{t}</h3>
                <p className="mt-2 text-ink">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA — secuencia real (hecho-para-ti), por eso va numerada */}
      <section className="mx-auto max-w-page px-5 py-16">
        <p className="eyebrow">Cómo funciona</p>
        <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
          Lo hacemos por ti, de principio a fin
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            ["01", "Nos pasas tu planilla", "Tu Excel o Google Sheet, como lo tengas. Nosotros lo ordenamos."],
            ["02", "Te armamos tu Pulso", "Conectamos tus datos y dejamos el panel andando."],
            ["03", "Lo miras cuando quieras", "Entras y en 10 segundos sabes cómo va tu negocio."],
          ].map(([n, t, d]) => (
            <li key={n}>
              <span className="tabular block text-3xl font-bold text-brand">
                {n}
              </span>
              <span className="mt-3 block h-px w-10 bg-accent" />
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* QUÉ VES EN PULSO */}
      <section className="border-y border-line/70 bg-paper/50">
        <div className="mx-auto max-w-page px-5 py-16">
          <p className="eyebrow">Qué ves en Pulso</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
            Los números que de verdad importan
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              ["Ingresos y gastos del mes", "Cuánto entró, cuánto salió. Todo en CLP."],
              ["Flujo de caja", "Lo que realmente te queda en el bolsillo."],
              ["Crecimiento vs mes anterior", "Si vas subiendo o bajando, de una mirada."],
              ["Ventas por categoría", "Qué producto o servicio te está moviendo."],
            ].map(([t, d]) => (
              <Card key={t} hover>
                <h3 className="font-display text-base font-bold text-ink">{t}</h3>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRACIONES */}
      <section className="mx-auto max-w-page px-5 py-16">
        <p className="eyebrow">De dónde salen tus datos</p>
        <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold text-ink sm:text-3xl">
          Empieza con lo que ya tienes
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Hoy conectamos tus datos desde Google Sheets o un CSV. Banco, SII y
          pagos vienen en camino.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            ["Google Sheets", true],
            ["Excel / CSV", true],
            ["Banco (Fintoc)", false],
            ["SII", false],
            ["Pagos (Flow / Webpay)", false],
          ].map(([n, listo]) => (
            <span
              key={n as string}
              className={`inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-sm ${
                listo
                  ? "border-brand/30 bg-brand/5 text-brand-deep"
                  : "border-line bg-paper text-muted"
              }`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${listo ? "bg-brand" : "bg-line"}`}
              />
              {n}
              <span className="eyebrow !text-[9px] !tracking-[0.14em]">
                {listo ? "listo" : "pronto"}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="border-y border-line/70 bg-paper/50">
        <div className="mx-auto max-w-page px-5 py-16">
          <p className="eyebrow">Planes</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">
            Parte por donde más te sirve
          </h2>
          <p className="mt-2 max-w-2xl text-muted">Sin letra chica.</p>
          <div className="mt-10">
            <Planes />
          </div>
        </div>
      </section>

      {/* SOCIOS FUNDADORES + WAITLIST */}
      <section id="waitlist" className="mx-auto max-w-page px-5 py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">Socios fundadores</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Estamos abriendo cupos
          </h2>
          <p className="mt-3 text-muted">
            Trabajamos hecho-para-ti con un grupo chico de negocios: conectamos
            tus datos y dejamos Pulso andando. Déjanos tu correo y te avisamos
            cuando haya un cupo para ti.
          </p>
          <div className="mt-7 text-left">
            <WaitlistForm fuente="landing" />
          </div>
        </div>
      </section>
    </>
  );
}
