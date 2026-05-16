"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  approveSuggestion,
  markSuggestionReviewed,
  rejectSuggestion,
} from "./actions";

const initialState = {
  success: false,
  message: "",
};

interface SuggestionModerationFormProps {
  suggestionId: string;
  disabled?: boolean;
  reviewerNotes?: string | null;
}

export function SuggestionModerationForm({
  suggestionId,
  disabled = false,
  reviewerNotes,
}: SuggestionModerationFormProps) {
  const [notes, setNotes] = useState(reviewerNotes || "");
  const [approveState, approveAction, isApproving] = useActionState(
    approveSuggestion,
    initialState,
  );
  const [rejectState, rejectAction, isRejecting] = useActionState(
    rejectSuggestion,
    initialState,
  );
  const [reviewState, reviewAction, isMarkingReviewed] = useActionState(
    markSuggestionReviewed,
    initialState,
  );

  const message =
    approveState.message || rejectState.message || reviewState.message;
  const isPending = isApproving || isRejecting || isMarkingReviewed;

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        disabled={disabled || isPending}
        rows={3}
        placeholder="Notas internas de revisión..."
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-xs leading-5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)] disabled:opacity-60"
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <form id={`suggestion-approve-${suggestionId}`} action={approveAction}>
          <input type="hidden" name="suggestionId" value={suggestionId} />
          <input type="hidden" name="reviewerNotes" value={notes} />
          <button
            type="submit"
            disabled={disabled || isPending}
            className="admin-button-primary w-full px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            Aprobar y crear borrador
          </button>
        </form>

        <form action={reviewAction}>
          <input type="hidden" name="suggestionId" value={suggestionId} />
          <input type="hidden" name="reviewerNotes" value={notes} />
          <button
            type="submit"
            disabled={disabled || isPending}
            className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-xs font-bold text-[var(--color-text-secondary)] transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Marcar revisada
          </button>
        </form>

        <form action={rejectAction}>
          <input type="hidden" name="suggestionId" value={suggestionId} />
          <input type="hidden" name="reviewerNotes" value={notes} />
          <button
            type="submit"
            disabled={disabled || isPending}
            className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Rechazar
          </button>
        </form>
      </div>

      {message && (
        <p
          className="text-xs font-semibold"
          style={{
            color:
              approveState.success || rejectState.success || reviewState.success
                ? "var(--color-brand-blue)"
                : "var(--color-brand-red)",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
