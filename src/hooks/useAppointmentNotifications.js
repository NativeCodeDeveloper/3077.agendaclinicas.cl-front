import { useEffect, useRef } from "react"

const POLL_INTERVAL_MS = 5 * 60 * 1000  // cada 5 minutos
const ANTICIPACION_MIN = 30              // avisar con 30 min de anticipación
const STORAGE_KEY = "notif_mostradas"

function hoyISO() {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

function horaAMinutos(horaStr) {
    // "HH:MM" o "HH:MM:SS"
    const [h, m] = horaStr.split(":").map(Number)
    return h * 60 + m
}

function getMostradas() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY)
        return new Set(JSON.parse(raw) || [])
    } catch {
        return new Set()
    }
}

function saveMostradas(set) {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
    } catch {}
}

export function useAppointmentNotifications(enabled) {
    const timerRef = useRef(null)
    const API = process.env.NEXT_PUBLIC_API_URL

    async function verificarCitasProximas() {
        if (Notification.permission !== "granted") return

        try {
            const res = await fetch(`${API}/reservaPacientes/seleccionarReservados`, {
                method: "GET",
                headers: { Accept: "application/json" },
                mode: "cors"
            })
            if (!res.ok) return
            const reservas = await res.json()
            if (!Array.isArray(reservas)) return

            const hoy = hoyISO()
            const ahora = new Date()
            const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()
            const limite = minutosAhora + ANTICIPACION_MIN

            const mostradas = getMostradas()

            for (const r of reservas) {
                const fechaReserva = (r.fechaInicio || "").slice(0, 10)
                if (fechaReserva !== hoy) continue
                if (!r.horaInicio) continue

                const minutosCita = horaAMinutos(r.horaInicio)
                // Solo citas que están entre ahora y ahora+30min
                if (minutosCita < minutosAhora || minutosCita > limite) continue

                const key = `${r.id_reserva ?? r.fechaInicio + r.horaInicio}`
                if (mostradas.has(key)) continue

                const nombre = `${r.nombrePaciente ?? ""} ${r.apellidoPaciente ?? ""}`.trim()
                const profesional = r.nombreProfesional ?? ""
                const hora = (r.horaInicio ?? "").slice(0, 5)

                new Notification("Cita próxima — AgendaClínica", {
                    body: `En ~${ANTICIPACION_MIN} min · ${nombre} con ${profesional} a las ${hora}`,
                    icon: "/logo.png",
                    tag: key,         // evita duplicados a nivel del OS
                    renotify: false,
                })

                mostradas.add(key)
            }

            saveMostradas(mostradas)
        } catch {
            // silencioso — no interrumpir el flujo del dashboard
        }
    }

    useEffect(() => {
        if (!enabled) return
        if (typeof Notification === "undefined") return

        // Verificar inmediatamente al activarse
        verificarCitasProximas()

        timerRef.current = setInterval(verificarCitasProximas, POLL_INTERVAL_MS)

        return () => clearInterval(timerRef.current)
    }, [enabled])
}
