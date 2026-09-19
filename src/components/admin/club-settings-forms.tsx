"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/form";
import { SettingGroup, SettingRow } from "@/components/ui/setting";
import { Card, CardBody } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/page";
import {
  FEATURE_LABELS,
  PAYMENT_DESCRIPTIONS,
  PAYMENT_LABELS,
  REGISTRATION_DESCRIPTIONS,
  REGISTRATION_LABELS,
} from "@/lib/domain/settings";
import type { Club, ClubFeature, ClubNavItem, PaymentMode, RegistrationMode } from "@/lib/domain/types";

const NAV_ITEMS: { id: ClubNavItem; label: string; requires?: ClubFeature }[] = [
  { id: "home", label: "Home" },
  { id: "tournaments", label: "Tournaments", requires: "publicTournaments" },
  { id: "leagues", label: "Leagues", requires: "leagues" },
  { id: "members", label: "Members" },
  { id: "about", label: "About" },
  { id: "rules", label: "Rules" },
  { id: "contact", label: "Contact" },
];

const REGISTRATION_OPTIONS: RegistrationMode[] = [
  "public",
  "publicWithApproval",
  "membersOnly",
  "inviteOnly",
  "staffManaged",
];

export function ClubSettingsForms({
  club,
  basePath,
  actions,
}: {
  club: Club;
  basePath: string;
  actions: {
    profile: (formData: FormData) => void;
    features: (formData: FormData) => void;
    defaults: (formData: FormData) => void;
    navigation: (formData: FormData) => void;
  };
}) {
  const hidden = (
    <>
      <input type="hidden" name="clubSlug" value={club.slug} />
      <input type="hidden" name="basePath" value={basePath} />
    </>
  );

  const paymentOptions: PaymentMode[] = club.features.onlinePayments
    ? ["none", "clubDirect", "divotzCheckout"]
    : ["none"];

  return (
    <div className="space-y-2">
      <form action={actions.profile}>
        {hidden}
        <SettingGroup title="Club" description="How your club introduces itself.">
          <SettingRow label="Name">
            <Input name="name" defaultValue={club.name} />
          </SettingRow>
          <SettingRow label="Location">
            <Input name="location" defaultValue={club.location ?? ""} placeholder="Town, Province" />
          </SettingRow>
          <SettingRow
            label="Description"
            description="Shown on your About page and your club home."
          >
            <Textarea name="description" rows={3} defaultValue={club.description ?? ""} />
          </SettingRow>
          <SettingRow label="Welcome message" description="The line across your club home page.">
            <Textarea name="welcomeMessage" rows={2} defaultValue={club.welcomeMessage ?? ""} />
          </SettingRow>
          <SettingRow label="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="contactEmail">
                <Input id="contactEmail" name="contactEmail" type="email" defaultValue={club.contactEmail ?? ""} />
              </Field>
              <Field label="Phone" htmlFor="contactPhone">
                <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={club.contactPhone ?? ""} />
              </Field>
            </div>
          </SettingRow>
        </SettingGroup>
        <div className="-mt-4 mb-8">
          <Button type="submit" variant="outline" size="sm">
            Save club details
          </Button>
        </div>
      </form>

      <form action={actions.features}>
        {hidden}
        <SettingGroup
          title="What this club uses"
          description="Turn off anything you don't do. Divotz stops asking about it - it won't appear in event setup, in your navigation, or anywhere else."
        >
          {(Object.keys(FEATURE_LABELS) as ClubFeature[]).map((feature) => (
            <SettingRow
              key={feature}
              label={FEATURE_LABELS[feature].title}
              description={FEATURE_LABELS[feature].description}
              consequence={FEATURE_LABELS[feature].consequence}
              control={
                <Toggle
                  name={`feature.${feature}`}
                  defaultChecked={club.features[feature]}
                  label={FEATURE_LABELS[feature].title}
                />
              }
            />
          ))}
        </SettingGroup>
        <div className="-mt-4 mb-8">
          <Button type="submit" variant="outline" size="sm">
            Save features
          </Button>
        </div>
      </form>

      <form action={actions.defaults}>
        {hidden}
        <SettingGroup
          title="Event defaults"
          description="What a new tournament starts out as. Organisers can still change any of it for a particular event."
        >
          <SettingRow
            label="Default registration"
            description={REGISTRATION_DESCRIPTIONS[club.defaults.registration]}
            consequence="New tournaments inherit this. Changing it here doesn't touch events that have already overridden it."
          >
            <Select name="registration" defaultValue={club.defaults.registration} className="max-w-xs">
              {REGISTRATION_OPTIONS.filter(
                (mode) => club.features.memberRegistration || mode !== "membersOnly",
              ).map((mode) => (
                <option key={mode} value={mode}>
                  {REGISTRATION_LABELS[mode]}
                </option>
              ))}
            </Select>
          </SettingRow>

          {/*
           * The payment default is only offered when the club takes payment
           * online. Otherwise there is nothing to choose between, and asking
           * would be asking somebody to re-decide something they've decided.
           */}
          {club.features.onlinePayments ? (
            <SettingRow
              label="Default payment"
              description={PAYMENT_DESCRIPTIONS[club.defaults.payment]}
            >
              <Select name="payment" defaultValue={club.defaults.payment} className="max-w-xs">
                {paymentOptions.map((mode) => (
                  <option key={mode} value={mode}>
                    {PAYMENT_LABELS[mode]}
                  </option>
                ))}
              </Select>
            </SettingRow>
          ) : null}

          {club.features.partnerRequests ? (
            <SettingRow
              label="Partner requests by default"
              description="Ask golfers who they'd like to play with when they register."
              control={
                <Toggle
                  name="partnerRequests"
                  defaultChecked={club.defaults.partnerRequests}
                  label="Partner requests by default"
                />
              }
            />
          ) : null}
        </SettingGroup>
        <div className="-mt-4 mb-8">
          <Button type="submit" variant="outline" size="sm">
            Save defaults
          </Button>
        </div>
      </form>

      <form action={actions.navigation}>
        {hidden}
        <SectionLabel>Navigation</SectionLabel>
        <p className="mt-1 mb-3 max-w-2xl text-sm text-ink-muted">
          Which sections appear on your club&apos;s site. Sections for features you&apos;ve turned
          off don&apos;t appear at all.
        </p>
        <Card className="divide-y divide-line">
          {NAV_ITEMS.map((item) => {
            const blocked = item.requires ? !club.features[item.requires] : false;
            return (
              <CardBody key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  {blocked ? (
                    <p className="mt-0.5 text-[13px] text-ink-subtle">
                      Turn on {FEATURE_LABELS[item.requires!].title.toLowerCase()} to use this.
                    </p>
                  ) : null}
                </div>
                <Toggle
                  name={`nav.${item.id}`}
                  defaultChecked={club.navigation.includes(item.id) && !blocked}
                  disabled={blocked}
                  label={item.label}
                />
              </CardBody>
            );
          })}
        </Card>
        <div className="mt-4 mb-8">
          <Button type="submit" variant="outline" size="sm">
            Save navigation
          </Button>
        </div>
      </form>
    </div>
  );
}
