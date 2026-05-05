import { Priority } from "@/lib/types";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import { priorityColor, statusColor } from "@/lib/utils/pulse";
import { ArrowUp, Search } from "lucide-react";

type SearchResult = {
  id: string;
  title: string;
  status: string;
  priority: Priority;
};

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  function handleClose() {
    setQuery("");
    setResults([]);
    setActiveIndex(0);
    setLoading(false);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      router.push(`/dashboard/pulses/${results[activeIndex].id}`);
      handleClose();
    }
  }

  useEffect(() => {
    if (!query.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.pulses);
        setActiveIndex(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setQuery(e.target.value);
              setResults([]);
              if (e.target.value.trim()) setLoading(true);
              else setLoading(false);
            }}
            placeholder="Search pulses..."
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
          />
        </div>
        {/* empty state */}
        {!query && (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            Start typing to search...
          </div>
        )}
        {loading && (
          <p className="px-3 py-2 text-sm text-gray-400">Searching...</p>
        )}

        {/* results */}
        <div className="max-h-80 overflow-y-auto pb-2">
          {results.map((pulse, i) => (
            <button
              key={pulse.id}
              data-active={i === activeIndex}
              onClick={() => {
                router.push(`/dashboard/pulses/${pulse.id}`);
                handleClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm rounded-md hover:bg-gray-50 data-[active=true]:bg-indigo-50"
            >
              <Badge
                className={
                  statusColor[pulse.status as keyof typeof statusColor]
                }
              >
                {pulse.status}
              </Badge>
              <Badge
                className={
                  priorityColor[pulse.priority as keyof typeof priorityColor]
                }
              >
                <ArrowUp size={10} className="mr-0.5" />
                {pulse.priority}
              </Badge>
              {pulse.title}
            </button>
          ))}
        </div>
        {/* no results */}
        {query && results.length === 0 && !loading && <p>No pulses found</p>}
      </DialogContent>
    </Dialog>
  );
}
