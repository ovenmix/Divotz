import { notFound } from "next/navigation";
import { ClubShell } from "@/components/club/club-shell";
import { PageHeader } from "@/components/ui/page";
import { resolveClub } from "@/lib/club-request";

export const metadata = { title: "Rules" };

export default async function RulesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club } = await resolveClub(slug);
  if (!club.rules) notFound();

  return (
    <ClubShell>
      <PageHeader title="Club rules" description={`How we play at ${club.name}.`} />
      <div className="max-w-2xl space-y-3">
        {club.rules.split(/\.\s+/).filter(Boolean).map((line, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-ink-muted">
            {line.endsWith(".") ? line : `${line}.`}
          </p>
        ))}
      </div>
    </ClubShell>
  );
}
