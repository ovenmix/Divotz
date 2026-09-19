import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { ClubShell } from "@/components/club/club-shell";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader, SectionLabel } from "@/components/ui/page";
import { resolveClub } from "@/lib/club-request";

export const metadata = { title: "About" };

export default async function AboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { club } = await resolveClub(slug);
  if (!club.navigation.includes("about")) notFound();

  return (
    <ClubShell>
      <PageHeader title={`About ${club.name}`} />
      {club.description ? (
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink-muted">{club.description}</p>
      ) : null}

      {club.contactEmail || club.contactPhone || club.location ? (
        <Card className="mt-7 max-w-md">
          <CardBody>
            <SectionLabel>Get in touch</SectionLabel>
            <ul className="mt-3 space-y-2.5 text-sm">
              {club.location ? (
                <li className="flex items-center gap-2.5 text-ink-muted">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  {club.location}
                </li>
              ) : null}
              {club.contactPhone ? (
                <li className="flex items-center gap-2.5 text-ink-muted">
                  <Phone className="size-4 shrink-0" aria-hidden />
                  <a href={`tel:${club.contactPhone}`} className="hover:text-ink">
                    {club.contactPhone}
                  </a>
                </li>
              ) : null}
              {club.contactEmail ? (
                <li className="flex items-center gap-2.5 text-ink-muted">
                  <Mail className="size-4 shrink-0" aria-hidden />
                  <a href={`mailto:${club.contactEmail}`} className="hover:text-ink">
                    {club.contactEmail}
                  </a>
                </li>
              ) : null}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </ClubShell>
  );
}
