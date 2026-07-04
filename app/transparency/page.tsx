import { getLedgerData } from "@/lib/sheets";
import { reconcileTotals } from "@/lib/totals";
import { enrichPublicationPreviews, type MoneyOutWithPreview } from "@/lib/og";
import type { MoneyIn } from "@/lib/sheets/types";
import { TotalsSummary } from "@/components/transparency/TotalsSummary";
import { ChannelSplit } from "@/components/transparency/ChannelSplit";
import { MoneyInList } from "@/components/transparency/MoneyInList";
import { MoneyInSummary } from "@/components/transparency/MoneyInSummary";
import { ImpactMap } from "@/components/map/ImpactMap";
import { MoneyOutLedger } from "@/components/ledger/MoneyOutLedger";
import { DataUnavailable } from "@/components/DataUnavailable";
import { LocalizedText } from "@/components/i18n/LocalizedText";

/** ISR: the page re-reads the Sheet at most once every 60 seconds. */
export const revalidate = 60;

function SectionHeading({ es, en }: { es: string; en?: string }) {
  return (
    <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
      <LocalizedText es={es} en={en} />
    </h2>
  );
}

/**
 * Transparency. Reconciled totals, a city-level impact map, the anonymized
 * Money In summary, and the Money Out ledger with receipts. Every figure is
 * recomputed from the published rows, so the page reconciles with the
 * receipts it shows.
 */
export default async function TransparencyPage() {
  const { data, error } = await getLedgerData();
  const moneyOut =
    data !== null ? await enrichPublicationPreviews(data.moneyOut) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
        <LocalizedText es="Transparencia" en="Transparency" />
      </h1>
      <p className="mt-3 max-w-xl text-body">
        <LocalizedText
          es="Cada movimiento del fondo, calculado directamente de los registros publicados. Cada entrega se muestra con su recibo."
          en="Every movement of the fund, computed directly from the published records. Each distribution is shown with its receipt."
        />
      </p>

      {error !== null || data === null ? (
        <div className="mt-10">
          <DataUnavailable />
        </div>
      ) : (
        <TransparencyContent moneyIn={data.moneyIn} moneyOut={moneyOut} />
      )}
    </div>
  );
}

function TransparencyContent({
  moneyIn,
  moneyOut,
}: {
  moneyIn: MoneyIn[];
  moneyOut: MoneyOutWithPreview[];
}) {
  const totals = reconcileTotals(moneyIn, moneyOut);

  return (
    <div className="mt-10 space-y-16">
      <section>
        <TotalsSummary totals={totals} />
        <ChannelSplit moneyIn={moneyIn} moneyOut={moneyOut} />
      </section>

      <section className="space-y-5">
        <div>
          <SectionHeading es="Mapa de impacto" en="Impact map" />
          <p className="mt-2 max-w-xl text-sm text-muted">
            <LocalizedText
              es="Dónde llegaron las entregas, a nivel de ciudad. Sin nombres, solo lugares."
              en="Where distributions arrived, at the city level. No names, only places."
            />
          </p>
        </div>
        <ImpactMap rows={moneyOut} />
      </section>

      <section className="space-y-5">
        <div>
          <SectionHeading es="Entradas" en="Money in" />
          <MoneyInSummary count={moneyIn.length} totalUsd={totals.raisedUsd} />
        </div>
        <MoneyInList rows={moneyIn} />
      </section>

      <section className="space-y-5">
        <div>
          <SectionHeading es="Salidas" en="Money out" />
          <p className="mt-2 max-w-xl text-sm text-muted">
            <LocalizedText
              es="Cada entrega, con su categoría, descripción y recibos. Toca una fila para ver el detalle."
              en="Each distribution, with its category, description, and receipts. Tap a row to see the detail."
            />
          </p>
        </div>
        <MoneyOutLedger rows={moneyOut} />
      </section>
    </div>
  );
}
