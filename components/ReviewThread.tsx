"use client";

import { useActionState } from "react";
import { addRatingComment, deleteRatingComment } from "@/lib/event-experience-actions";

type Comment = {
  id: number;
  authorUserId: number;
  authorName: string;
  body: string;
  spoiler: boolean;
  createdAt: string;
};

export function ReviewThread({
  eventId,
  ratingUserId,
  comments,
  currentUserId,
  canComment,
}: {
  eventId: number;
  ratingUserId: number;
  comments: Comment[];
  currentUserId: number;
  canComment: boolean;
}) {
  const action = addRatingComment.bind(null, eventId, ratingUserId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <div className="mt-3 border-t border-riga/70 pt-3">
      {comments.length > 0 && (
        <ul className="grid gap-2">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-lg bg-notte-fonda/60 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-schermo">{comment.authorName}</span>
                {comment.authorUserId === currentUserId && (
                  <button
                    onClick={() => deleteRatingComment(comment.id)}
                    className="text-[11px] text-fumo hover:text-velluto"
                  >
                    elimina
                  </button>
                )}
              </div>
              {comment.spoiler ? (
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs text-proiettore">
                    Mostra spoiler
                  </summary>
                  <p className="mt-1 text-fumo">{comment.body}</p>
                </details>
              ) : (
                <p className="mt-1 text-fumo">{comment.body}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      {canComment && (
        <form action={formAction} className="mt-3 grid gap-2">
          <div className="flex gap-2">
            <input
              name="body"
              maxLength={400}
              required
              placeholder="Rispondi alla pagella…"
              className="min-w-0 flex-1 rounded-lg border border-riga bg-notte px-3 py-2 text-sm placeholder:text-fumo/50"
            />
            <button
              disabled={pending}
              className="rounded-lg border border-proiettore px-3 py-2 text-sm text-proiettore disabled:opacity-50"
            >
              {pending ? "…" : "Invia"}
            </button>
          </div>
          <label className="flex items-center gap-2 text-xs text-fumo">
            <input type="checkbox" name="spoiler" className="accent-[#e8b84b]" />
            Contiene spoiler
          </label>
          {state?.error && <p className="text-xs text-velluto">{state.error}</p>}
        </form>
      )}
    </div>
  );
}
