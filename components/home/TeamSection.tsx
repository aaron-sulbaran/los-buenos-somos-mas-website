import { LocalizedText } from "@/components/i18n/LocalizedText";
import { Reveal } from "./Reveal";

type Member = {
  name: string;
  initial: string;
  roleEs: string;
  roleEn: string;
};

/**
 * The four people behind the fund. Only these names appear anywhere on the
 * site. No faces yet: each portrait is a tonal plate with the person's initial
 * until an organizer-owned headshot is provided.
 */
const MEMBERS: Member[] = [
  { name: "Barbara", initial: "B", roleEs: "Organizadora", roleEn: "Organizer" },
  { name: "Kelly", initial: "K", roleEs: "Organizadora", roleEn: "Organizer" },
  { name: "Isabela", initial: "I", roleEs: "Organizadora", roleEn: "Organizer" },
  {
    name: "Aaron",
    initial: "A",
    roleEs: "Desarrollador web",
    roleEn: "Web developer",
  },
];

export function TeamSection() {
  return (
    <section className="border-t border-border px-6 py-16 sm:px-10 sm:py-20 min-[860px]:px-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-normal tracking-[-0.015em]">
          <LocalizedText es="Quiénes lo llevan" en="Who keeps it" />
        </h2>
        <p className="mt-3 max-w-[48ch] text-body">
          <LocalizedText
            es="Un grupo pequeño, con nombre y responsabilidad. Cada quien responde por su parte del registro."
            en="A small group, named and accountable. Each person answers for their part of the record."
          />
        </p>

        <Reveal className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 min-[720px]:grid-cols-4">
          {MEMBERS.map((member) => (
            <div key={member.name} className="flex flex-col">
              {/* TODO organizers: swap the initial plate for an organizer-owned
                  headshot, rendered grayscale and credited. */}
              <div className="flex aspect-square w-full items-center justify-center rounded-md border border-border bg-card">
                <span className="font-display text-4xl text-muted/70">
                  {member.initial}
                </span>
              </div>
              <p className="mt-3.5 font-display text-lg leading-tight">
                {member.name}
              </p>
              <p className="mt-1 text-sm text-muted">
                <LocalizedText es={member.roleEs} en={member.roleEn} />
              </p>
              {/* TODO organizers: real social handles, links only to accounts
                  already public that chose to post. */}
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted/70">
                <LocalizedText es="redes: pendiente" en="socials: pending" />
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
