import profiles from "./director-profiles.json";
import { generatedDirectorPortraitFor } from "./generatedDirectorPortraits";

export type DirectorProfile = {
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

const directorProfiles = profiles as Record<string, DirectorProfile>;

export function parseDirectors(value: string | null | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function directorSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function directorProfile(name: string): DirectorProfile | null {
  const profile = directorProfiles[name];
  const generatedImage = generatedDirectorPortraitFor(name);
  if (!profile && !generatedImage) return null;

  return {
    ...profile,
    name: profile?.name ?? name,
    imageUrl: generatedImage ?? profile?.imageUrl ?? null,
  };
}
