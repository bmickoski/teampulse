"use client";

import { useActionState, useOptimistic, useRef } from "react";
import { createPulseComment } from "@/lib/actions/pulseComments";
import { getPulseComments } from "@/lib/pulses";
import { Button } from "@/components/ui/button";

import { type PulseCommentActionState } from "@/lib/validations/pulseComments";

type Comment = Awaited<ReturnType<typeof getPulseComments>>[number];

export function PulseComments({
  pulseId,
  initialComments,
  authorName,
}: {
  pulseId: string;
  initialComments: Comment[];
  authorName: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    initialComments,
    (state: Comment[], newComment: Comment) => [newComment, ...state],
  );

  const [state, formAction, pending] = useActionState(
    async (_prev: PulseCommentActionState, formData: FormData) => {
      const content = formData.get("content") as string;
      if (!content?.trim()) return { errors: { content: ["Cannot be empty"] } };
      addOptimisticComment({
        id: `optimistic-${Date.now()}`,
        content,
        createdAt: new Date(),
        authorName,
      });
      formRef.current?.reset();
      return createPulseComment(_prev, formData);
    },
    {} as PulseCommentActionState,
  );

  return (
    <div className="space-y-5">
      <form ref={formRef} action={formAction} className="space-y-2">
        <input type="hidden" name="pulseId" value={pulseId} />
        <textarea
          name="content"
          placeholder="Add a comment…"
          rows={3}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {state?.errors?.content && (
          <p className="text-xs text-red-500">{state.errors.content[0]}</p>
        )}
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Posting…" : "Post comment"}
        </Button>
      </form>

      {optimisticComments.length === 0 ? (
        <p className="text-sm text-gray-400">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {optimisticComments.map((c) => (
            <li key={c.id} className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">
                  {c.authorName ?? "Unknown"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
