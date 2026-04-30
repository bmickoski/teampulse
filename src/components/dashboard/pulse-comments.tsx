"use client";

import {
  type KeyboardEvent,
  useActionState,
  useCallback,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { createPulseComment } from "@/lib/actions/pulseComments";
import { getPulseComments } from "@/lib/pulses";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { type PulseCommentActionState } from "@/lib/validations/pulseComments";
import { type Member } from "@/lib/types";

type Comment = Awaited<ReturnType<typeof getPulseComments>>[number];

function getActiveMention(value: string, cursor: number) {
  const beforeCursor = value.slice(0, cursor);
  const match = /(^|\s)@([^\s@]*)$/.exec(beforeCursor);

  if (!match) return null;

  return {
    start: beforeCursor.length - match[2].length - 1,
    query: match[2].toLowerCase(),
  };
}

function renderContent(
  content: string,
  mentions: { userId: string; name: string | null }[],
) {
  const mentionNames = mentions
    .map((m) => m.name)
    .filter((n): n is string => Boolean(n));

  if (mentionNames.length === 0) return content;

  const escaped = mentionNames.map((n) =>
    n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(`(${escaped.map((n) => `@${n}`).join("|")})`, "g");
  const parts = content.split(pattern);

  return parts.map((part, i) =>
    mentionNames.some((n) => `@${n}` === part) ? (
      <span key={i} className="font-medium text-indigo-600">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [selectedMentions, setSelectedMentions] = useState<Member[]>([]);
  const [mentionSearch, setMentionSearch] = useState<{
    start: number;
    query: string;
  } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [membersError, setMembersError] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const membersLoadRequested = useRef(false);

  const loadMembers = useCallback(async () => {
    if (membersLoadRequested.current) return;
    membersLoadRequested.current = true;
    try {
      const res = await fetch("/api/team");
      if (!res.ok) throw new Error("Failed to load team");
      const data = (await res.json()) as Member[];
      setMembers(data);
    } catch {
      setMembersError(true);
    } finally {
      setMembersLoaded(true);
    }
  }, []);

  const suggestedMembers = useMemo(() => {
    if (!mentionSearch) return [];

    return members
      .filter((member) => {
        const query = mentionSearch.query;
        return (
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
        );
      })
      .slice(0, 6);
  }, [members, mentionSearch]);

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    initialComments,
    (state: Comment[], newComment: Comment) => [newComment, ...state],
  );

  const [state, formAction, pending] = useActionState(
    async (_prev: PulseCommentActionState, formData: FormData) => {
      const nextContent = formData.get("content") as string;
      if (!nextContent?.trim()) {
        return { errors: { content: ["Cannot be empty"] } };
      }

      addOptimisticComment({
        id: `optimistic-${Date.now()}`,
        content: nextContent,
        createdAt: new Date(),
        authorName,
        mentions: selectedMentions.map((m) => ({ userId: m.userId, name: m.name })),
      });
      formRef.current?.reset();
      setContent("");
      setSelectedMentions([]);
      setMentionSearch(null);
      setActiveSuggestionIndex(0);

      return createPulseComment(_prev, formData);
    },
    {} as PulseCommentActionState,
  );

  function handleContentChange(value: string, cursor: number) {
    const nextMentionSearch = getActiveMention(value, cursor);

    setContent(value);
    setSelectedMentions((mentions) =>
      mentions.filter((member) => value.includes(`@${member.name}`)),
    );
    setMentionSearch(nextMentionSearch);
    setActiveSuggestionIndex(0);
    if (nextMentionSearch) loadMembers();
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!mentionSearch) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMentionSearch(null);
      return;
    }

    if (suggestedMembers.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((index) => (index + 1) % suggestedMembers.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex(
        (index) =>
          (index - 1 + suggestedMembers.length) % suggestedMembers.length,
      );
      return;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      selectMention(suggestedMembers[activeSuggestionIndex]);
    }
  }

  function selectMention(member: Member) {
    if (!mentionSearch) return;

    const textarea = textareaRef.current;
    const cursor = textarea?.selectionStart ?? content.length;
    const beforeMention = content.slice(0, mentionSearch.start);
    const afterMention = content.slice(cursor);
    const nextContent = `${beforeMention}@${member.name} ${afterMention}`;
    const nextCursor = beforeMention.length + member.name.length + 2;

    setContent(nextContent);
    setSelectedMentions((mentions) =>
      mentions.some((mention) => mention.userId === member.userId)
        ? mentions
        : [...mentions, member],
    );
    setMentionSearch(null);

    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  return (
    <div className="space-y-5">
      <form ref={formRef} action={formAction} className="space-y-2">
        <input type="hidden" name="pulseId" value={pulseId} />
        <input
          type="hidden"
          name="mentionedUserIds"
          value={JSON.stringify(selectedMentions.map((m) => m.userId))}
        />

        <div className="relative">
          <textarea
            ref={textareaRef}
            name="content"
            value={content}
            onChange={(event) =>
              handleContentChange(
                event.target.value,
                event.target.selectionStart,
              )
            }
            onKeyUp={(event) => {
              if (
                ["ArrowDown", "ArrowUp", "Enter", "Tab", "Escape"].includes(
                  event.key,
                )
              ) {
                return;
              }

              handleContentChange(
                event.currentTarget.value,
                event.currentTarget.selectionStart,
              );
            }}
            onKeyDown={handleTextareaKeyDown}
            onBlur={() => {
              window.setTimeout(() => setMentionSearch(null), 120);
            }}
            placeholder="Add a comment..."
            rows={3}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {mentionSearch && (
            <div className="absolute left-0 top-full z-20 mt-1 w-full max-w-sm overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
              {!membersLoaded && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Loading teammates...
                </div>
              )}
              {membersLoaded && membersError && (
                <div className="px-3 py-2 text-sm text-red-500">
                  Could not load teammates.
                </div>
              )}
              {membersLoaded && !membersError && suggestedMembers.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No teammates found.
                </div>
              )}
              {suggestedMembers.map((member, index) => (
                <button
                  key={member.userId}
                  type="button"
                  data-active={index === activeSuggestionIndex}
                  onMouseEnter={() => setActiveSuggestionIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectMention(member);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 data-[active=true]:bg-indigo-50"
                >
                  <Avatar size="sm" className="bg-indigo-100 text-indigo-700">
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-gray-800">
                      {member.name}
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      {member.email}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {member.role}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        {state?.errors?.content && (
          <p className="text-xs text-red-500">{state.errors.content[0]}</p>
        )}
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Posting..." : "Post comment"}
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
              <p className="text-sm text-gray-600">
                {renderContent(c.content, c.mentions)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
