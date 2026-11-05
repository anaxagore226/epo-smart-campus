import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { ChatMessage as Message } from "@/types/event";

function Avatar() {
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-forest-800 text-lime">
      <Icon name="bot" size={16} />
    </div>
  );
}

export function ChatMessage({ role, text, source }: Message) {
  const fromUser = role === "user";
  return (
    <div className={cn("flex gap-3", fromUser ? "justify-end" : "justify-start")}>
      {!fromUser && <Avatar />}
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6",
          fromUser ? "rounded-br-md bg-forest-800 text-white" : "rounded-tl-md border border-[#e5ebe7] bg-white text-[#536059]",
        )}
      >
        {text}
        {source && <span className="mt-2 block border-t border-dashed border-[#dfe6e2] pt-2 text-[11px] text-faint">{source}</span>}
      </div>
    </div>
  );
}

/** Indicateur « l'assistant rédige sa réponse ». */
export function TypingIndicator() {
  return (
    <div className="flex gap-3" aria-label="L’assistant rédige sa réponse">
      <Avatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-[#e5ebe7] bg-white px-4 py-4">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a0aaa4]" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
    </div>
  );
}
