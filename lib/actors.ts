import profiles from "./actor-profiles.json";

export type ActorCredit = {
  name: string;
  note: string | null;
};

export type ActorProfile = {
  name: string;
  wikidataId?: string | null;
  description?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  birthPlace?: string | null;
  citizenship?: string[] | null;
  imageUrl?: string | null;
  imageCredit?: string | null;
  imageSource?: string | null;
  biographySource?: string | null;
  wikidataSource?: string | null;
};

const actorProfiles = profiles as Record<string, ActorProfile>;

export function parseActors(value: string | null | undefined): ActorCredit[] {
  if (!value) return [];

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((credit) => {
      const match = credit.match(/^(.*?)\s+\((voce|voci)\)$/i);
      return {
        name: (match?.[1] ?? credit).trim(),
        note: match?.[2]?.toLowerCase() ?? null,
      };
    });
}

export function actorSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function actorProfile(name: string): ActorProfile | null {
  return actorProfiles[name] ?? null;
}
