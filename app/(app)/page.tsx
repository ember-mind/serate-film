import Link from "next/link";
import { HomeArtwork } from "@/components/HomeArtwork";
import { requireUser } from "@/lib/auth";
import { formatDateFull } from "@/lib/dates";
import { filmSlug } from "@/lib/films";
import { generatedPosterFor } from "@/lib/generatedPosters";
import { genreSlug } from "@/lib/genreArt";
import { getHomeDashboard, type HomeTask } from "@/lib/home-dashboard";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

function TaskList({ tasks }: { tasks: HomeTask[] }) {
  const icons = { vote: "◷", runoff: "◷", review: "☆", circle: "◎", journey: "↗" };
  return (
    <ul className={styles.taskList}>
      {tasks.map((task) => (
        <li key={task.id} className={styles.task}>
          <span aria-hidden="true" className={styles.taskIcon}>{icons[task.kind]}</span>
          <div className={styles.taskBody}>
            <h3 id={`home-${task.id}`}>{task.title}</h3>
            <p className={styles.sub}>{task.detail}</p>
          </div>
          <Link href={task.href} className={styles.button} aria-label={`${task.label} · ${task.title}`}>
            {task.label}<span aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function HomePage() {
  const me = await requireUser();
  const { featured, tasks, watchlist } = await getHomeDashboard(me);
  const hero = featured?.event;
  const movie = featured?.movie;
  const poster = movie ? generatedPosterFor(movie.title, movie.year) : null;
  // A pending event featured in the hero does not need a second, identical CTA.
  const remainingTasks = tasks.filter((task) => task.id !== featured?.task?.id);

  return (
    <div className={styles.home}>
      <header className={styles.pageHead}>
        <div>
          <p className={styles.overline}>Bentornato, {me.name}</p>
          <h1 className={styles.title}>Il tuo cineclub.</h1>
          <p className={styles.sub}>La prossima serata e le cose da decidere insieme.</p>
        </div>
        {hero && <Link href="/serate/nuova" className={styles.button}>+ Crea una serata</Link>}
      </header>

      {hero ? (
        <section aria-labelledby="home-featured" className={`${styles.hero} ${!movie ? styles.emptyHero : ""}`}>
          {movie && <HomeArtwork src={poster ?? movie.posterUrl} fallback={`/generi/${genreSlug(movie.genres)}.svg`}
            className={styles.heroArt} credit={poster ? null : movie.posterCredit} priority />}
          <div className={styles.heroBody}>
            <p className={styles.overline}>{hero.status === "scheduled" ? "La prossima serata" : "La prossima serata da decidere"}</p>
            <span className={`${styles.status} ${hero.status !== "scheduled" ? styles.openStatus : ""}`}>
              {hero.status === "scheduled" ? "Confermata" : hero.status === "runoff" ? "Ballottaggio" : "Votazioni aperte"}
            </span>
            <h2 id="home-featured" className={styles.heroTitle}>{movie?.title || hero.title || "Serata da decidere"}</h2>
            {hero.status === "scheduled" && hero.chosenDate ? (
              <p className={styles.sub}><time dateTime={hero.chosenDate}>{formatDateFull(hero.chosenDate)}</time>{hero.startTime ? ` · ore ${hero.startTime}` : ""}</p>
            ) : <p className={styles.sub}>{featured?.task?.detail ?? "Hai già inviato il tuo voto. Puoi rivedere la serata e le risposte del gruppo."}</p>}
            {hero.location && <p className={styles.sub}>{hero.location}</p>}
            {movie && hero.title && <p className={styles.sub}>{hero.title}</p>}
            <Link href={featured?.task?.href ?? `/serate/${hero.id}`} className={`${styles.button} ${styles.primary}`}>
              {featured?.task?.label ?? "Vedi la serata"}<span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      ) : (
        <section aria-labelledby="home-start" className={`${styles.hero} ${styles.emptyHero}`}>
          <div className={styles.heroBody}>
            <p className={styles.overline}>Il cinema, insieme</p>
            <h2 id="home-start" className={styles.heroTitle}>La prossima serata inizia da qui.</h2>
            <p className={styles.sub}>Nessun appuntamento in programma. Proponi date e film alle persone con cui ti va di guardarli.</p>
            <Link href="/serate/nuova" className={`${styles.button} ${styles.primary}`}>Crea una serata<span aria-hidden="true">→</span></Link>
          </div>
        </section>
      )}

      <section aria-labelledby="home-tasks" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 id="home-tasks">{featured?.task ? "Altre cose per te" : "Da completare"}</h2>
          {remainingTasks.length > 0 && <span className={styles.smallNote}>{remainingTasks.length} {remainingTasks.length === 1 ? "cosa per te" : "cose per te"}</span>}
        </div>
        {remainingTasks.length ? (
          <>
            <TaskList tasks={remainingTasks.slice(0, 3)} />
            {remainingTasks.length > 3 && (
              <details className={styles.moreTasks}>
                <summary>Mostra le altre {remainingTasks.length - 3} attività</summary>
                <TaskList tasks={remainingTasks.slice(3)} />
              </details>
            )}
          </>
        ) : <p className={styles.sub}>Per ora non ci sono {featured?.task ? "altre " : ""}azioni da completare. <Link href="/serate" className={styles.textLink}>Rivedi le tue serate →</Link></p>}
      </section>

      <section aria-labelledby="home-watchlist" className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 id="home-watchlist">Da vedere insieme</h2>
          <Link href="/watchlist" className={styles.textLink}>Tutta la watchlist<span aria-hidden="true">→</span></Link>
        </div>
        {watchlist.length ? (
          <ul className={styles.posterGrid}>
            {watchlist.map((film) => {
              const artwork = generatedPosterFor(film.title, film.year);
              return (
                <li key={film.id} className={styles.movieCard}>
                  <Link href={`/film/${filmSlug(film)}`}>
                    <HomeArtwork src={artwork ?? film.posterUrl} fallback={`/generi/${genreSlug(film.genres)}.svg`}
                      className={styles.movieArt} credit={artwork ? null : film.posterCredit} />
                    <h3>{film.title}</h3>
                    <p>{film.year ?? "Anno non disponibile"}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : <p className={styles.sub}>La watchlist condivisa è vuota. <Link href="/film" className={styles.textLink}>Scegli un film in Cineteca →</Link></p>}
      </section>

      <div className={`${styles.section} ${styles.activity}`}>
        <strong>Dal tuo giro</strong><span>Le conversazioni e le pagelle del gruppo.</span>
        <Link href="/attivita" className={styles.textLink}>Altre attività<span aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}
