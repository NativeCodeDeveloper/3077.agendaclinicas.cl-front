"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Michroma } from "next/font/google";
import { Send, X } from "lucide-react";

const InteractiveNebulaOrb = dynamic(
  () => import("@/components/ui/InteractiveNebulaOrb").then((module) => module.InteractiveNebulaOrb),
  {
    ssr: false,
    loading: () => <span className="block h-full w-full rounded-full bg-transparent" />,
  },
);

const michroma = Michroma({ weight: "400", subsets: ["latin"], display: "swap" });
const THINKING_LABELS = [
  "haciendo sinapsis...",
  "propagacion neuronal...",
  "mielinizando...",
  "realizando cognicion...",
];

export default function CortexAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [mockConversation, setMockConversation] = useState([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [thinkingLabelIndex, setThinkingLabelIndex] = useState(0);
  const inputRef = useRef(null);
  const conversationEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    inputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mockConversation]);

  useEffect(() => {
    if (!isEvolving) return undefined;

    setThinkingLabelIndex(0);

    const labelTimer = window.setInterval(() => {
      setThinkingLabelIndex((current) => (current + 1) % THINKING_LABELS.length);
    }, 1500);

    const responseTimer = window.setTimeout(() => {
      setMockConversation((current) => [
        ...current,
        {
          role: "cortex",
          type: "capabilities",
        },
      ]);
      setIsEvolving(false);
      inputRef.current?.focus();
    }, 4000);

    return () => {
      window.clearInterval(labelTimer);
      window.clearTimeout(responseTimer);
    };
  }, [isEvolving]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const userMessage = message.trim();
    if (!userMessage || isEvolving) return;

    setMockConversation((current) => [
      ...current,
      { role: "user", content: userMessage },
    ]);
    setMessage("");
    setIsEvolving(true);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      <div className="absolute bottom-5 right-4 flex flex-col items-end sm:bottom-7 sm:right-7">
        {isOpen ? (
          <section
            id="cortex-assistant-dialog"
            role="dialog"
            aria-modal="false"
            aria-labelledby="cortex-assistant-title"
            className="pointer-events-auto flex h-[min(460px,calc(100vh-96px))] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] shadow-[0_18px_50px_-18px_rgba(15,23,42,0.55)] sm:w-[360px]"
            style={{ backgroundColor: "#111827" }}
          >
            <header
              className="flex items-center justify-between border-b border-slate-700 px-4 py-3.5"
              style={{ backgroundColor: "#111827" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-transparent">
                  <InteractiveNebulaOrb
                    isThinking={isEvolving}
                    className="absolute inset-0 h-full w-full rounded-full"
                  />
                </div>
                <div>
                  <h2
                    id="cortex-assistant-title"
                    className={`${michroma.className} relative inline-block text-[12px] font-bold tracking-[0.14em] text-white`}
                  >
                    <span className="absolute inset-0 translate-x-[0.55px] text-white" aria-hidden="true">
                      CORTEX A.I
                    </span>
                    <span className="absolute inset-0 -translate-x-[0.55px] text-white" aria-hidden="true">
                      CORTEX A.I
                    </span>
                    <span className="relative text-white">CORTEX A.I</span>
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar CORTEX A.I"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto bg-[#0F172A] px-4 py-5"
              style={{ backgroundColor: "#0F172A" }}
            >
              <div
                className="max-w-[86%] rounded-2xl rounded-tl-sm border border-slate-700 bg-[#1E293B] px-4 py-3 text-[13px] leading-relaxed text-slate-50 shadow-sm [&_*]:text-slate-50"
                style={{ backgroundColor: "#1E293B", color: "#F8FAFC" }}
              >
                Hola, soy el agente de IA de AgendaClínica. Haré todo el trabajo por ti, solo pídemelo.
              </div>

              {mockConversation.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`w-fit max-w-[86%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm [&_*]:text-slate-50 ${
                    item.role === "user"
                      ? "ml-auto rounded-tr-sm bg-[#21183D] text-white"
                      : "rounded-tl-sm border border-slate-700 bg-[#1E293B] text-slate-100"
                  }`}
                  style={{
                    backgroundColor: item.role === "user" ? "#21183D" : "#1E293B",
                    color: "#F8FAFC",
                  }}
                >
                  {item.type === "capabilities" ? (
                    <div className="text-slate-50 [&_*]:text-slate-50" style={{ color: "#F8FAFC" }}>
                      <p>De momento no estoy disponible en este plan, pero puedo:</p>
                      <ul className="mt-2.5 space-y-1.5 pl-4 text-left text-slate-50 [list-style-type:disc] marker:text-[#8B5CF6]">
                        <li>Agendar pacientes por ti.</li>
                        <li>Mejorar la redacción de tus fichas.</li>
                        <li>Realizar bloqueos específicos.</li>
                        <li>Responder tus dudas sobre la aplicación.</li>
                        <li>Enviar recordatorios y correos.</li>
                        <li>Entregarte reportes de tus agendas.</li>
                        <li>Generar resúmenes diagnósticos.</li>
                        <li>Y mucho más.</li>
                      </ul>
                      <p className="mt-3 border-t border-slate-600 pt-3 font-semibold text-slate-50">
                        Para usarme, adquiere el plan MAX 🔥 de Agenda Clínica.
                      </p>
                    </div>
                  ) : (
                    item.content
                  )}
                </div>
              ))}
              {isEvolving && (
                <div
                  className="w-fit px-1 py-2"
                  style={{ backgroundColor: "transparent" }}
                  aria-label="CORTEX A.I esta pensando"
                >
                  <svg
                    className="h-8 w-72 overflow-visible"
                    viewBox="0 0 330 42"
                    fill="none"
                    role="img"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 22H24L30 14L38 22H52L61 22L66 6L72 38L79 22H102L111 22L117 13L125 22H139L148 22L153 5L159 37L166 22H178"
                      className="cortex-heartbeat-trail"
                    />
                    <path
                      d="M2 22H24L30 14L38 22H52L61 22L66 6L72 38L79 22H102L111 22L117 13L125 22H139L148 22L153 5L159 37L166 22H178"
                      className="cortex-heartbeat-line"
                    />
                    <text x="204" y="25" className="cortex-synapse-word">
                      {THINKING_LABELS[thinkingLabelIndex]}
                    </text>
                  </svg>
                </div>
              )}
              <div ref={conversationEndRef} />
            </div>

            <footer
              className="border-t border-slate-700 bg-[#111827] p-3"
              style={{ backgroundColor: "#111827" }}
            >
              <form
                onSubmit={handleSubmit}
                className={`cortex-input-aura relative isolate flex items-end gap-2 rounded-xl border border-slate-700 bg-[#0F172A] p-1.5 pl-3 shadow-sm transition ${
                  isEvolving ? "is-thinking" : ""
                }`}
                style={{ backgroundColor: "#0F172A" }}
              >
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={isEvolving}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  rows={1}
                  aria-label="Mensaje para CORTEX A.I"
                  placeholder={isEvolving ? "CORTEX esta respondiendo..." : "Escribe un mensaje..."}
                  className="max-h-24 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-[13px] leading-5 text-slate-100 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  aria-label="Enviar mensaje"
                  disabled={!message.trim() || isEvolving}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#21183D] text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-2 text-center text-[9px] text-slate-500">
                Verifica siempre la información clínica.
              </p>
            </footer>
          </section>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir CORTEX A.I"
            aria-expanded={isOpen}
            aria-controls="cortex-assistant-dialog"
            className="pointer-events-auto rounded-full bg-transparent p-0 shadow-none transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-200/60"
          >
            <span className="relative block h-16 w-16 overflow-hidden rounded-full bg-transparent">
              <InteractiveNebulaOrb className="h-full w-full" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
