const fmtLong = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const fmtShort = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const fmtFull = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function parse(iso: string) {
  return new Date(iso + "T12:00:00");
}

export const formatDateLong = (iso: string) => fmtLong.format(parse(iso));
export const formatDateShort = (iso: string) => fmtShort.format(parse(iso));
export const formatDateFull = (iso: string) => fmtFull.format(parse(iso));
