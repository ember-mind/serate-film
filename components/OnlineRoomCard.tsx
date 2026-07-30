import Link from "next/link";

type Props = {
  eventId: number;
  viewingMode: "in_person" | "youtube" | "watch_along" | "licensed_public";
  roomConfigured: boolean;
  canManage?: boolean;
  licenseStatus?: "draft" | "submitted" | "verified" | "rejected" | "expired" | null;
};

const LABELS = {
  in_person: "Serata in presenza",
  youtube: "Sala YouTube",
  watch_along: "Watch-along",
  licensed_public: "Proiezione con licenza",
};

export function OnlineRoomCard({
  eventId,
  viewingMode,
  roomConfigured,
  canManage = false,
  licenseStatus,
}: Props) {
  const licenseBlocked =
    viewingMode === "licensed_public" && licenseStatus !== "verified";
  const title = roomConfigured ? LABELS[viewingMode] : "Sala online";

  return (
    <section className="ticket p-5" aria-labelledby={`online-room-${eventId}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="step-title" id={`online-room-${eventId}`}>
            {title}
          </p>
          <p className="mt-2 text-sm text-fumo">
            {!roomConfigured && "Prepara YouTube, watch-along o proiezione autorizzata."}
            {viewingMode === "youtube" &&
              "Player incorporato, presenza, chat e timecode condiviso."}
            {viewingMode === "watch_along" &&
              "Ognuno apre propria copia legale. Serate Film sincronizza solo timecode."}
            {viewingMode === "licensed_public" &&
              (licenseBlocked
                ? "Ingresso bloccato finché verifica licenza non è completa."
                : "Licenza verificata. Sala pronta per partecipanti autorizzati.")}
          </p>
        </div>
        <Link
          href={`/serate/${eventId}/sala`}
          className="shrink-0 rounded-lg bg-proiettore px-4 py-2.5 text-center text-sm font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso"
        >
          {roomConfigured
            ? licenseBlocked
              ? canManage
                ? "Completa verifica"
                : "Controlla stato"
              : "Entra in sala"
            : canManage
              ? "Prepara sala"
              : "Controlla sala"}
        </Link>
      </div>
    </section>
  );
}
