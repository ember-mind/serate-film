// Mappa i generi (stringa libera) su uno dei 13 artwork in public/generi/.
export function genreSlug(genres: string | null | undefined): string {
  const g = (genres ?? "").toLowerCase();
  if (g.includes("animazione")) return "animazione";
  if (g.includes("horror") || g.includes("gotico")) return "horror";
  if (g.includes("western")) return "western";
  if (g.includes("fantascienza")) return "fantascienza";
  if (g.includes("fantasy") || g.includes("wuxia")) return "fantasy";
  if (g.includes("guerra") || g.includes("storico")) return "storico";
  if (
    g.includes("thriller") ||
    g.includes("crime") ||
    g.includes("noir") ||
    g.includes("giallo") ||
    g.includes("mistero") ||
    g.includes("spy")
  )
    return "thriller";
  if (g.includes("musical") || g.includes("musica")) return "musica";
  if (g.includes("romantico")) return "romantico";
  if (g.includes("commedia")) return "commedia";
  if (
    g.includes("azione") ||
    g.includes("avventura") ||
    g.includes("supereroi") ||
    g.includes("sport")
  )
    return "azione";
  if (g.includes("biografico") || g.includes("giornalismo")) return "biografico";
  return "drammatico";
}
