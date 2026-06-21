"use client"

import { useState, useEffect, useRef } from "react"

const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTOS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

export function TimePicker({ value = "", onChange, placeholder = "00:00", label = "" }) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)
    const horasRef = useRef(null)
    const minutosRef = useRef(null)

    const [hora, minuto] = value ? value.split(":") : ["", ""]

    // Cerrar al hacer clic fuera
    useEffect(() => {
        if (!open) return
        function onClickOutside(e) {
            if (!containerRef.current?.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", onClickOutside)
        return () => document.removeEventListener("mousedown", onClickOutside)
    }, [open])

    // Scroll automático al valor seleccionado cuando se abre
    useEffect(() => {
        if (!open) return
        setTimeout(() => {
            if (hora && horasRef.current) {
                const el = horasRef.current.querySelector(`[data-h="${hora}"]`)
                el?.scrollIntoView({ block: "center", behavior: "instant" })
            }
            if (minuto && minutosRef.current) {
                const el = minutosRef.current.querySelector(`[data-m="${minuto}"]`)
                el?.scrollIntoView({ block: "center", behavior: "instant" })
            }
        }, 0)
    }, [open])

    function seleccionarHora(h) {
        onChange(`${h}:${minuto || "00"}`)
    }

    function seleccionarMinuto(m) {
        onChange(`${hora || "00"}:${m}`)
    }

    return (
        <div ref={containerRef} className="relative w-full">

            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[13px] font-medium transition-all flex items-center justify-between gap-2
                    ${open
                        ? "border-[#6E56CF] ring-2 ring-[#6E56CF]/30 text-slate-700"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }
                    ${!value ? "text-slate-400" : ""}
                `}
            >
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 shrink-0 ${value ? "text-[#6E56CF]" : "text-slate-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={value ? "text-slate-700 font-semibold" : "text-slate-400 font-medium"}>
                        {value || placeholder}
                    </span>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1.5 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

                    {/* Header */}
                    <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/70">
                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
                            Hora
                        </div>
                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center border-l border-slate-100">
                            Minuto
                        </div>
                    </div>

                    {/* Columnas */}
                    <div className="grid grid-cols-2">

                        {/* Horas */}
                        <div
                            ref={horasRef}
                            className="h-52 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                        >
                            <div className="py-1">
                                {HORAS.map(h => (
                                    <button
                                        key={h}
                                        type="button"
                                        data-h={h}
                                        onClick={() => seleccionarHora(h)}
                                        className={`w-full px-4 py-[7px] text-[13px] font-semibold text-center transition-all
                                            ${hora === h
                                                ? "bg-[#6E56CF] text-white"
                                                : "text-slate-600 hover:bg-violet-50 hover:text-[#6E56CF]"
                                            }`}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Minutos */}
                        <div
                            ref={minutosRef}
                            className="h-52 overflow-y-auto border-l border-slate-100 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                        >
                            <div className="py-1">
                                {MINUTOS.map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        data-m={m}
                                        onClick={() => seleccionarMinuto(m)}
                                        className={`w-full px-4 py-[7px] text-[13px] font-semibold text-center transition-all
                                            ${minuto === m
                                                ? "bg-[#6E56CF] text-white"
                                                : "text-slate-600 hover:bg-violet-50 hover:text-[#6E56CF]"
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer con valor seleccionado */}
                    <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">
                            {value ? `Seleccionado: ` : "Sin seleccionar"}
                            {value && <span className="font-bold text-[#6E56CF]">{value}</span>}
                        </span>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-[11px] font-bold text-[#6E56CF] hover:text-[#5b45bc] transition-colors"
                        >
                            Listo ✓
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
