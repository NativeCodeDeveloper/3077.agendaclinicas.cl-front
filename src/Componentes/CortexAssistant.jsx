"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";

const evolutionFrames = [
  "/1.png",
  "/2.png",
  "/3.png",
  "/4.png",
  "/5.png",
  "/6.png",
  "/7.png",
  "/9.png",
  "/10.png",
];

export default function CortexAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [mockConversation, setMockConversation] = useState([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [logoFrameIndex, setLogoFrameIndex] = useState(0);
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

    let currentFrame = 0;
    let responseTimer;
    setLogoFrameIndex(currentFrame);

    const evolutionTimer = window.setInterval(() => {
      currentFrame += 1;

      if (currentFrame >= evolutionFrames.length) {
        window.clearInterval(evolutionTimer);
        responseTimer = window.setTimeout(() => {
          setMockConversation((current) => [
            ...current,
            {
              role: "cortex",
              type: "capabilities",
            },
          ]);
          setIsEvolving(false);
          inputRef.current?.focus();
        }, 180);
        return;
      }

      setLogoFrameIndex(currentFrame);
    }, 95);

    return () => {
      window.clearInterval(evolutionTimer);
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
            className="pointer-events-auto flex h-[min(460px,calc(100vh-96px))] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-18px_rgba(15,23,42,0.28)] sm:w-[360px]"
          >
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white">
                  <img
                    src="/cortex_orb.png"
                    alt="Orbe de CORTEX A.I"
                    className={`absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-200 ease-linear ${
                      isEvolving ? "opacity-0" : "opacity-100"
                    }`}
                  />

                  {evolutionFrames.map((frame, index) => {
                    const isActiveFrame = isEvolving && index === logoFrameIndex;

                    return (
                      <img
                        key={frame}
                        src={frame}
                        alt=""
                        aria-hidden="true"
                        className={`absolute inset-0 h-full w-full scale-125 rounded-xl object-cover transition-opacity duration-200 ease-linear ${
                          isActiveFrame
                            ? "z-10 opacity-100"
                            : "z-0 opacity-0"
                        }`}
                      />
                    );
                  })}
                </div>
                <div>
                  <h2 id="cortex-assistant-title" className="text-[13px] font-bold tracking-[0.08em] text-slate-900">
                    CORTEX A.I
                  </h2>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    Agente Inteligencia Artificial
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar CORTEX A.I"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-4 py-5">
              <div className="max-w-[86%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-[13px] leading-relaxed text-slate-600 shadow-sm">
                Hola, soy CORTEX A.I., el agente de IA de Agenda Clínica. Haré todo el trabajo por ti.
              </div>

              {mockConversation.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`w-fit max-w-[86%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                    item.role === "user"
                      ? "ml-auto rounded-tr-sm bg-[#21183D] text-white"
                      : "rounded-tl-sm border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {item.type === "capabilities" ? (
                    <div>
                      <p>De momento no estoy disponible en este plan, pero puedo:</p>
                      <ul className="mt-2.5 space-y-1.5 pl-4 text-left [list-style-type:disc] marker:text-[#6E56CF]">
                        <li>Agendar pacientes por ti.</li>
                        <li>Mejorar la redacción de tus fichas.</li>
                        <li>Realizar bloqueos específicos.</li>
                        <li>Responder tus dudas sobre la aplicación.</li>
                        <li>Enviar recordatorios y correos.</li>
                        <li>Entregarte reportes de tus agendas.</li>
                        <li>Generar resúmenes diagnósticos.</li>
                        <li>Y mucho más.</li>
                      </ul>
                      <p className="mt-3 border-t border-slate-100 pt-3 font-semibold text-slate-800">
                        Para usarme, adquiere el plan MAX 🔥 de Agenda Clínica.
                      </p>
                    </div>
                  ) : (
                    item.content
                  )}
                </div>
              ))}
              {isEvolving && (
                <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                </div>
              )}
              <div ref={conversationEndRef} />
            </div>

            <footer className="border-t border-slate-100 bg-white p-3">
              <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pl-3 transition focus-within:border-slate-400"
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
                  placeholder={isEvolving ? "CORTEX está procesando..." : "Escribe un mensaje..."}
                  className="max-h-24 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-[13px] leading-5 text-slate-700 outline-none placeholder:text-slate-400"
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
              <p className="mt-2 text-center text-[9px] text-slate-400">
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
            className="cortex-orbit-button pointer-events-auto rounded-full border border-violet-300/80 bg-white p-1.5 shadow-[0_10px_28px_-12px_rgba(76,29,149,0.42)] transition hover:scale-105 hover:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-200/70"
          >
            <span className="relative block h-12 w-12 overflow-hidden rounded-full bg-white">
              <img
                src="/cortex_orb.png"
                alt=""
                aria-hidden="true"
                className="h-full w-full rounded-full object-cover"
              />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
