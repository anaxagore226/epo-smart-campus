"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage, TypingIndicator } from "./chat-message";
import { Icon } from "@/components/icon";
import { useCampus } from "@/components/providers/campus-provider";
import { assistantSuggestions } from "@/lib/assistant";
import { connectedSensors } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const recentConversations = ["Bilan énergétique hebdomadaire", "Alertes du laboratoire", "Occupation des salles"];

export function ChatWindow() {
  const { state, ask, resetChat } = useCampus();
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const { chat, typing } = state;

  // Garde la dernière réponse visible (la conversation est conservée d'une page à l'autre).
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [chat.length, typing]);

  const send = (question: string) => {
    if (!question.trim() || typing) return;
    ask(question);
    setInput("");
  };

  const sources = [
    ["Capteurs IoT", `${connectedSensors} en ligne`],
    ["Historique énergie", "24 mois"],
    ["Journal des événements", `${state.events.length} entrées`],
    ["Alertes en cours", String(state.alerts.length)],
  ];

  return (
    <section className="grid min-h-[680px] gap-5 xl:grid-cols-[290px_1fr]">
      <aside className="order-2 space-y-5 xl:order-1">
        <article className="panel p-5">
          <button
            type="button"
            onClick={resetChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-800 px-4 py-3 text-xs font-bold text-white"
          >
            <Icon name="bot" size={17} /> Nouvelle conversation
          </button>
          <h2 className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa39e]">Conversations récentes</h2>
          <div className="mt-3 space-y-1">
            {recentConversations.map((item, i) => (
              <button
                key={item}
                type="button"
                className={cn(
                  "w-full rounded-xl px-3 py-3 text-left text-xs",
                  i === 0 ? "bg-[#eef4f1] font-semibold text-forest-800" : "text-[#758079] hover:bg-[#f5f7f6]",
                )}
              >
                {item}
                <span className="mt-1 block text-[9px] text-[#a0a8a3]">{i === 0 ? "Aujourd’hui" : "Hier"}</span>
              </button>
            ))}
          </div>
        </article>
        <article className="panel p-5">
          <div className="flex items-center gap-2">
            <Icon name="chart" size={17} />
            <h2 className="text-xs font-bold">Sources consultées</h2>
          </div>
          <div className="mt-4 space-y-3">
            {sources.map(([name, value]) => (
              <div key={name} className="flex justify-between text-[11px]">
                <span className="text-[#7f8983]">{name}</span>
                <b className="text-brand">{value}</b>
              </div>
            ))}
          </div>
        </article>
        <article className="panel p-5 text-xs leading-5 text-muted">
          <h2 className="mb-2 text-xs font-bold text-ink">Comment ça marche</h2>
          La question est comparée aux mesures, alertes et documents indexés ; l’assistant rédige ensuite une réponse sourcée. Les consignes
          (« éteins le restaurant ») sont traduites en commandes MQTT vers les relais ESP32.
        </article>
      </aside>

      <article className="panel order-1 flex min-h-[680px] flex-col overflow-hidden shadow-soft xl:order-2">
        <div className="flex items-center justify-between border-b border-[#e8edea] p-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-forest-800">
              <Icon name="bot" />
            </div>
            <div>
              <p className="text-sm font-bold">EPO Intelligence</p>
              <p className="text-[10px] text-[#829088]">{typing ? "Rédige une réponse…" : "Assistant de supervision · RAG"}</p>
            </div>
          </div>
          <button type="button" aria-label="Plus d’options" className="rounded-lg p-2 text-[#78847d]">
            <Icon name="dots" />
          </button>
        </div>

        <div ref={scroller} className="max-h-[560px] flex-1 space-y-5 overflow-y-auto bg-[#f8faf9] p-4 sm:p-6" aria-live="polite">
          {chat.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}
          {typing && <TypingIndicator />}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[#e8edea] px-4 pt-3 sm:px-5">
          {assistantSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => send(item)}
              disabled={typing}
              className="rounded-full border border-[#dfe7e2] bg-white px-3 py-1.5 text-[11px] font-medium text-[#5f6d65] transition hover:border-[#99b9a8] hover:text-brand disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-end gap-2 rounded-2xl border border-[#dce5e0] bg-[#f8faf9] p-2 focus-within:border-[#7aa88f]">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              aria-label="Votre question"
              placeholder="Posez une question ou donnez une consigne (ex. : éteins le restaurant)…"
              className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[#a0aaa4]"
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              aria-label="Envoyer le message"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime text-forest-800 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="chevron" size={18} />
            </button>
          </div>
          <p className="mt-2 text-center text-[9px] text-[#a0a8a3]">Les réponses sont générées à partir des données opérationnelles du campus.</p>
        </div>
      </article>
    </section>
  );
}
