import { getLedgerData } from "@/lib/sheets";
import { reconcileTotals } from "@/lib/totals";
import { TotalsSummary } from "@/components/transparency/TotalsSummary";
import { DataUnavailable } from "@/components/DataUnavailable";
import { LocalizedText } from "@/components/i18n/LocalizedText";

/** ISR: the page re-reads the Sheet at most once every 60 seconds. */
export const revalidate = 60;

/**
 * Transparency. Phase 0 renders reconciled totals as proof of the data
 * layer; Phase 1 adds the summary dashboard UI, impact map, Money In
 * list, and the Money Out expandable ledger.
 */
export default async function TransparencyPage() {
  const { data, error } = await getLedgerData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
        <LocalizedText es="Transparencia" en="Transparency" />
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        <LocalizedText
          es="Cada movimiento del fondo, calculado directamente de los registros publicados."
          en="Every movement of the fund, computed directly from the published records."
        />
      </p>

      <div className="mt-10">
        {error !== null || data === null ? (
          <DataUnavailable />
        ) : (
          <>
            <TotalsSummary
              totals={reconcileTotals(data.moneyIn, data.moneyOut)}
            />
            {/* TODO Phase 1 (Opus 4.8): impact map, Money Out expandable
                ledger with search and filter, receipt gallery.
                TODO Phase 1 (Sonnet 5): Money In aggregate plus anonymized
                list. Phase 0 shows published-row counts as data-layer proof. */}
            <p className="mt-6 text-sm text-muted">
              <LocalizedText
                es={`Registros publicados: ${data.moneyIn.length} donaciones, ${data.moneyOut.length} entregas.`}
                en={`Published records: ${data.moneyIn.length} donations, ${data.moneyOut.length} distributions.`}
              />
            </p>
          </>
        )}
      </div>
    </div>
  );
}
