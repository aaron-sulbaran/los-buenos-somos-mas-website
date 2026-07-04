"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { formatUsd } from "@/lib/format";
import type { MoneyIn, MoneyOut } from "@/lib/sheets/types";

type Channel = { name: string; raised: number; distributed: number };

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Splits raised (by MoneyIn.through) and distributed (by MoneyOut.purchaser)
 * across the named organizing channels. Organizers run the fund and are
 * publicly named; this never exposes a donor or recipient identity. Renders
 * nothing unless at least one channel is present in the data.
 */
function buildChannels(moneyIn: MoneyIn[], moneyOut: MoneyOut[]): Channel[] {
  const byName = new Map<string, Channel>();
  const ensure = (name: string): Channel => {
    const existing = byName.get(name);
    if (existing) return existing;
    const created: Channel = { name, raised: 0, distributed: 0 };
    byName.set(name, created);
    return created;
  };

  for (const row of moneyIn) {
    if (row.through) ensure(row.through).raised += row.amountUsd;
  }
  for (const row of moneyOut) {
    if (row.purchaser) ensure(row.purchaser).distributed += row.amountUsd;
  }

  return [...byName.values()]
    .map((channel) => ({
      name: channel.name,
      raised: round2(channel.raised),
      distributed: round2(channel.distributed),
    }))
    .sort((a, b) => b.raised - a.raised);
}

export function ChannelSplit({
  moneyIn,
  moneyOut,
}: {
  moneyIn: MoneyIn[];
  moneyOut: MoneyOut[];
}) {
  const { lang } = useLanguage();
  const channels = useMemo(
    () => buildChannels(moneyIn, moneyOut),
    [moneyIn, moneyOut],
  );

  if (channels.length === 0) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="px-5 py-3 font-medium">
              <LocalizedText es="Canal" en="Channel" />
            </th>
            <th scope="col" className="px-5 py-3 text-right font-medium">
              <LocalizedText es="Recaudado" en="Raised" />
            </th>
            <th scope="col" className="px-5 py-3 text-right font-medium">
              <LocalizedText es="Distribuido" en="Distributed" />
            </th>
          </tr>
        </thead>
        <tbody>
          {channels.map((channel) => (
            <tr
              key={channel.name}
              className="border-b border-border last:border-b-0"
            >
              <th scope="row" className="px-5 py-3 text-left font-normal text-body">
                {channel.name}
              </th>
              <td className="px-5 py-3 text-right tabular-nums text-body">
                {formatUsd(channel.raised, lang)}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-body">
                {formatUsd(channel.distributed, lang)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
