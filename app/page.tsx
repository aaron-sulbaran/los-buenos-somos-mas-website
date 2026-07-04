import { getLedgerData } from "@/lib/sheets";
import { reconcileTotals } from "@/lib/totals";
import type { Totals } from "@/lib/totals";
import { HomeExplorationProvider } from "@/components/home/HomeExploration";
import { Hero } from "@/components/hero/Hero";
import { OriginSection } from "@/components/hero/OriginSection";
import { TeamSection } from "@/components/home/TeamSection";
import { SummaryTeaser } from "@/components/home/SummaryTeaser";
import { InstagramSection } from "@/components/home/InstagramSection";

/** ISR: the summary teaser re-reads the Sheet at most once every 60 seconds. */
export const revalidate = 60;

/**
 * Home. Warm Archive direction: a split hero, the origin story, the team, a
 * live summary teaser reconciled from the published records, and the Instagram
 * slots. Placeholder copy is marked with TODO for the organizers.
 */
export default async function HomePage() {
  const { data, error } = await getLedgerData();
  const totals: Totals | null =
    error !== null || data === null
      ? null
      : reconcileTotals(data.moneyIn, data.moneyOut);

  return (
    <HomeExplorationProvider>
      <Hero />
      <OriginSection />
      <TeamSection />
      <SummaryTeaser totals={totals} />
      <InstagramSection />
    </HomeExplorationProvider>
  );
}
