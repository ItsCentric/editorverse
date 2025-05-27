import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { XIcon } from "lucide-react";
import { forwardRef, useEffect, useState, useRef } from "react";
import type { z } from "zod";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";

// Utility to parse and validate tags
const parseTagOpt = (params: { tag: string; tagValidator: z.ZodString }) => {
  const { tag, tagValidator } = params;
  const parsed = tagValidator.safeParse(tag);
  return parsed.success ? parsed.data : null;
};

type Tag = {
  id: string | null;
  name: string;
};

type TagInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  value?: readonly Tag[];
  onChange: (value: readonly Tag[]) => void;
  tagValidator?: z.ZodString;
  onSearch?: (query: string) => Promise<Tag[]>;
  onPaste?: (values: string[]) => Promise<Tag[]>;
  debounceDelay?: number;
};

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (props, forwardedRef) => {
    const {
      className,
      value = [],
      onChange,
      tagValidator,
      onSearch,
      onPaste,
      debounceDelay = 200,
      placeholder,
      ...domProps
    } = props;

    const [pending, setPending] = useState("");
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const debounceRef = useRef<number | undefined>(undefined);
    const suggestionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Merge forwarded ref with internal inputRef
    const handleInputRef = (el: HTMLInputElement) => {
      inputRef.current = el;
      if (typeof forwardedRef === "function") {
        forwardedRef(el);
      } else if (forwardedRef) {
        forwardedRef.current = el;
      }
    };

    // Fetch suggestions (debounced)
    useEffect(() => {
      if (!onSearch || pending.trim() === "") {
        setSuggestions([]);
        return;
      }
      if (debounceRef.current !== undefined) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        const runSearch = async () => {
          const q = pending.startsWith("@") ? pending.slice(1) : pending;
          try {
            const results = await onSearch(q);
            setSuggestions(results);
          } catch {
            setSuggestions([]);
          }
        };
        runSearch();
      }, debounceDelay);
      return () => {
        if (debounceRef.current !== undefined) {
          window.clearTimeout(debounceRef.current);
        }
      };
    }, [pending, onSearch, debounceDelay]);

    // Reset activeIndex when suggestions change
    useEffect(() => {
      if (suggestions.length > 0) {
        setActiveIndex(0);
      } else {
        setActiveIndex(null);
      }
    }, [suggestions]);

    // Focus the active suggestion or input
    useEffect(() => {
      if (activeIndex !== null && suggestionRefs.current[activeIndex]) {
        suggestionRefs.current[activeIndex]?.focus();
      } else if (activeIndex === null) {
        inputRef.current?.focus();
      }
    }, [activeIndex]);

    const addTag = (tag: Tag) => {
      let candidateName = tag.name.trim();
      if (!candidateName) return;
      if (tagValidator) {
        const validated = parseTagOpt({ tag: candidateName, tagValidator });
        if (!validated) return;
        candidateName = validated;
      }
      if (value.some((t) => t.name === candidateName)) return;
      onChange([...value, tag]);
      setPending("");
      setSuggestions([]);
    };

    // Handle comma-split paste
    useEffect(() => {
      const handlePaste = async () => {
        if (pending.includes(",")) {
          const splitPending = pending
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          if (splitPending.length === 0) return;
          if (!onPaste) {
            const mapped = splitPending.map((name) => ({ id: null, name }));
            onChange([...value, ...mapped]);
            return;
          }
          const candidateTags = await onPaste(splitPending);
          candidateTags.forEach(addTag);
        }
      };
      handlePaste();
    }, [pending]);

    return (
      <Popover modal open={suggestions.length > 0}>
        <div
          className={cn(
            "focus-within:border-ring focus-within:ring-ring/50 selection:bg-primary selection:text-primary-foreground relative flex flex-wrap items-center justify-start gap-2 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]",
            className,
          )}
        >
          {value.map((item, idx) => (
            <Badge key={`${item.name}-${idx}`} variant="secondary">
              {item.name}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-2 h-3 w-3"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
              >
                <XIcon className="w-3" />
              </Button>
            </Badge>
          ))}

          <div className="flex-1">
            <input
              {...domProps}
              ref={handleInputRef}
              value={pending}
              placeholder={placeholder ?? "Add a tag..."}
              onChange={(e) => setPending(e.target.value)}
              onKeyDown={(e) => {
                const key = e.key;
                if (key === "ArrowDown") {
                  e.preventDefault();
                  if (suggestions.length === 0) return;
                  setActiveIndex((prev) =>
                    prev === null || prev >= suggestions.length - 1
                      ? 0
                      : prev + 1,
                  );
                } else if (key === "ArrowUp") {
                  e.preventDefault();
                  if (suggestions.length === 0) return;
                  setActiveIndex((prev) => (prev === 0 ? null : prev! - 1));
                } else if (key === "Enter" || key === ",") {
                  e.preventDefault();
                  if (activeIndex !== null && suggestions[activeIndex]) {
                    addTag(suggestions[activeIndex]);
                  } else {
                    addTag({ id: null, name: pending });
                  }
                } else if (
                  key === "Backspace" &&
                  pending === "" &&
                  value.length > 0
                ) {
                  e.preventDefault();
                  onChange(value.slice(0, -1));
                }
              }}
              className="placeholder:text-muted-foreground min-w-[6rem] outline-none"
            />
            <PopoverAnchor />
          </div>

          <PopoverContent align="start" className="px-2 py-2">
            {suggestions.map((sugg, idx) => (
              <Button
                key={sugg.id ?? idx}
                ref={(el) => {
                  suggestionRefs.current[idx] = el;
                }}
                className={cn("w-full justify-start rounded-sm", {
                  "bg-primary text-primary-foreground": idx === activeIndex,
                })}
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  addTag(sugg);
                }}
              >
                {sugg.name}
              </Button>
            ))}
          </PopoverContent>
        </div>
      </Popover>
    );
  },
);

TagInput.displayName = "TagInput";
