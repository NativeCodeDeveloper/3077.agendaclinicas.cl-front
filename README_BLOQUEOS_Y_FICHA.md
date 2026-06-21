# Actualización: Bloqueo de Agenda, Edición de Ficha Clínica y Notificaciones

Este documento describe en detalle los cambios implementados en tres módulos del dashboard. Está pensado para que otro desarrollador (o instancia de Claude) entienda exactamente qué se hizo, por qué, y cómo funciona.

---

## 1. Bloqueo de Agenda — `/dashboard/bloqueosAgenda`

**Archivo:** `src/app/dashboard/bloqueosAgenda/page.jsx`

### 1.1 Qué había antes

La página anterior usaba un selector de rango de fechas (fecha inicio → fecha fin) que generaba **un único registro de bloqueo** en la base de datos abarcando todo el rango. Esto impedía al usuario liberar días individuales dentro de ese rango sin eliminar el bloqueo completo.

### 1.2 Qué se hizo

Se rediseñó completamente el flujo. Ahora **cada día seleccionado genera un registro independiente** en la base de datos (`fechaInicio = fechaFinalizacion = ese día`). Esto permite que el usuario elimine un día específico sin afectar los demás.

### 1.3 Dos modos de selección

#### Modo "Días específicos"
- Muestra un calendario `react-day-picker` con `mode="multiple"`.
- El usuario hace clic en los días que quiere bloquear (pueden ser no consecutivos, ej: solo los miércoles del mes).
- El calendario tiene `disabled={{ before: hoy }}` para impedir seleccionar fechas pasadas.

#### Modo "Rango de fechas"
- El usuario define una fecha de inicio y fin.
- Selecciona los días de la semana (L M X J V S D) que deben incluirse dentro de ese rango.
- Al hacer clic en "Generar días →" se ejecuta `generarDiasDesdeRango()` que usa `eachDayOfInterval` de `date-fns` + filtro `getDay()` para extraer solo los días que coincidan con los días de semana seleccionados.
- Los días generados se **fusionan** con los ya seleccionados sin duplicar (usando `Set` de `toDateString()`).
- Se muestra un toast con cuántos días se agregaron.

> **Caso de uso típico:** bloquear todos los miércoles de junio a diciembre en un solo paso, sin hacer clic uno por uno.

### 1.4 Estado del formulario

```js
const [diasSeleccionados, setDiasSeleccionados] = useState([]);  // Date[]
const [horaInicio, setHoraInicio] = useState("");
const [horaFinalizacion, setHoraFinalizacion] = useState("");
const [motivo, setMotivo] = useState("");
const [id_profesional, setId_profesional] = useState("");
const [modoSeleccion, setModoSeleccion] = useState("especifico"); // "especifico" | "rango"
const [rangoDesde, setRangoDesde] = useState("");
const [rangoHasta, setRangoHasta] = useState("");
const [diasSemanaSeleccionados, setDiasSemanaSeleccionados] = useState([]); // [0..6]
const [cargandoInsercion, setCargandoInsercion] = useState(false);
const [modalEliminarTodos, setModalEliminarTodos] = useState(false); // false | "paso1" | "paso2"
const [cargandoEliminarTodos, setCargandoEliminarTodos] = useState(false);
```

### 1.5 Función de inserción: `insertarBloqueosMultiples()`

- Valida que haya profesional, horas, motivo y al menos un día seleccionado.
- Valida que `horaFinalizacion > horaInicio`.
- Ordena los días ascendente antes de iterar.
- Por cada día ejecuta un `POST /bloqueoAgenda/InsertarBloqueo` con:
  ```json
  {
    "id_profesional": "...",
    "fechaInicio": "2026-06-18",
    "horaInicio": "09:00:00",
    "fechaFinalizacion": "2026-06-18",
    "horaFinalizacion": "14:00:00",
    "motivo": "Vacaciones"
  }
  ```
- Contabiliza `exitosos`, `conflictoReserva` (hay pacientes agendados), `conflictoBloqueo` (ya existe bloqueo).
- Al terminar muestra un toast con el resumen.
- Limpia el formulario completo.

### 1.6 Chips de días seleccionados

Debajo del calendario se muestran chips con el formato `mié 18 jun` (usando `format(dia, "EEE d MMM", { locale: es })`). Cada chip tiene un botón `×` para eliminar ese día individualmente. También hay un botón "Limpiar todo".

### 1.7 Banner de resumen

Cuando hay días seleccionados + horas definidas aparece un banner:

> Se crearán **N** bloqueo(s) independiente(s)
> Horario: 09:00 — 14:00 · Cada día se puede eliminar por separado

### 1.8 Tabla de bloqueos activos

Columnas: **Profesional | Motivo | Día | Horario | Ver**

- Cada fila es un bloqueo independiente.
- Al hacer clic en una fila (o el botón Ver) abre un modal de detalle.
- El filtro de profesional (`useEffect([id_profesional])`) actualiza la tabla automáticamente al seleccionar un profesional.
- La función `recargarBloqueos()` respeta el filtro activo: si hay un profesional seleccionado llama `filtrarPorProfesional(id)`, si no llama `verTodosLosBloqueos()`.

### 1.9 Botón "Eliminar todos" con modal de dos pasos

**Condición de visibilidad:** solo aparece cuando `id_profesional` está seleccionado Y `listaBloqueos.length > 0`. Esto garantiza que nunca se eliminen bloqueos de todos los profesionales por accidente.

**Paso 1 (confirmación):**
- Muestra el nombre del profesional: `listaProfesionales.find(p => String(p.id_profesional) === String(id_profesional))?.nombreProfesional`
- Texto explícito: "Los demás profesionales no serán afectados."

**Paso 2 (confirmación definitiva):**
- Fondo y borde rose para indicar acción destructiva.
- Botón con spinner durante la operación.

**Función `eliminarTodosLosBloqueos()`:**
- Itera `listaBloqueos` haciendo un `POST /bloqueoAgenda/eliminarBloqueo` por cada registro.
- Contabiliza eliminados y errores.
- Al finalizar llama `recargarBloqueos()` para refrescar la tabla respetando el filtro.

### 1.10 Bugs corregidos durante la auditoría

| Bug | Causa | Fix |
|-----|-------|-----|
| Crash al deseleccionar todos los días | `onSelect` de react-day-picker pasa `undefined` cuando el array queda vacío | `onSelect={(days) => setDiasSeleccionados(days ?? [])}` |
| Fechas desfasadas un día en modo rango | `parseISO("2026-06-15")` crea medianoche UTC, que en UTC-3/4 es el día anterior | Reemplazado por `new Date(rangoDesde + "T00:00:00")` para hora local |
| Post-delete mostraba todos los profesionales | `eliminarBloqueo` y `eliminarTodosLosBloqueos` llamaban `verTodosLosBloqueos()` ignorando el filtro activo | Creada función `recargarBloqueos(profId?)` que respeta `id_profesional` |
| Errores de red silenciosos | `verTodosLosBloqueos` y `filtrarPorProfesional` sin `res.ok` check | Agregados los checks con `toast.error` |

### 1.11 Compatibilidad con el calendario público

La lógica del calendario público (`/agendaEspecificaProfersional/[id_profesional]`) que bloquea un día completo si `horaInicio <= "09:00"` y `horaFinalizacion >= "22:00"` **sigue funcionando correctamente**. Con el nuevo esquema de bloqueos por día individual, el while loop del calendario itera una sola vez por registro, lo que produce el mismo resultado que antes.

---

## 2. Edición de Ficha Clínica — `/dashboard/EdicionFicha/[id_ficha]`

**Archivo:** `src/app/dashboard/EdicionFicha/[id_ficha]/page.jsx`

### 2.1 Qué había antes

La página usaba un sistema de estilos antiguo con:
- Fondo con gradiente radial complejo (`radial-gradient` + `linear-gradient`).
- Header de la card con gradiente oscuro `#0f172a → #312e81 → #0891b2`.
- Botón guardar con gradiente `from-indigo-700 to-teal-600`.
- Cards con `border-slate-300`, `shadow-[0_18px_50px_rgba(15,23,42,0.12)]`, `rounded-[24px]`.
- Color primario `text-indigo-700` / `focus:ring-indigo-500`.
- Labels `text-sm font-medium`.

### 2.2 Qué se hizo

Se actualizó únicamente el bloque `return` (JSX) al sistema de diseño actual del dashboard. **La lógica de negocio no fue modificada.**

### 2.3 Sistema de diseño aplicado (consistente con todo el dashboard)

| Elemento | Antes | Ahora |
|----------|-------|-------|
| Fondo | `radial-gradient` complejo | `bg-[#FAFAFB]` |
| Cards | `rounded-[24px] border-slate-300 shadow-[0_18px_50px...]` | `rounded-3xl border-slate-200 shadow-sm` |
| Header de card | Gradiente oscuro `#0f172a→#312e81` | Blanco con ícono en `bg-violet-50` / `bg-amber-50` |
| Color primario | `indigo-700` / `teal-600` | `#6E56CF` |
| Botón principal | Gradiente `from-indigo-700 to-teal-600` | `bg-[#6E56CF] hover:bg-[#5b45bc]` sólido |
| Botón secundario | `border-slate-300 rounded-xl` | `rounded-2xl border-slate-200` |
| Labels | `text-sm font-medium text-slate-700` | `text-[11px] font-bold uppercase tracking-wider text-slate-500` |
| Inputs / Select | `border-slate-300 rounded-lg focus:ring-indigo-500/20` | `rounded-xl border-slate-200 focus:ring-[#6E56CF]/30 focus:border-[#6E56CF]` |
| Separadores de sección | `bg-slate-100/80` con `text-sm uppercase` | `bg-slate-50/60` con punto `●` violeta + label |
| Textarea | `border-slate-300 focus:border-indigo-500` | `rounded-xl border-slate-200 focus:border-[#6E56CF] focus:ring-[#6E56CF]/20` |
| Chips de plantilla/profesional | `bg-indigo-100 border-indigo-200 text-indigo-800` | `bg-violet-50 border-violet-100 text-[#6E56CF]` |

### 2.4 Estructura de la página (sin cambios de lógica)

```
EdicionFichaClinica
├── Header (título + botón Volver)
├── Card "Datos Actuales" (lectura)
│   ├── Header: ícono violeta + Ficha #ID + fecha
│   ├── Badges: plantilla/motivo + profesional
│   └── Grid de campos por categoría (si tiene plantilla dinámica)
├── Card "Actualizar Información" (formulario)
│   ├── Header: ícono amber + título
│   ├── Select plantilla *
│   ├── Grid fecha + profesional
│   ├── [Si plantilla seleccionada] Secciones dinámicas por categoría
│   │   └── Textarea por campo
│   └── [Si sin plantilla] Formulario legacy
│       ├── Motivo de consulta
│       ├── Diagnóstico + Indicaciones
│       └── Anotaciones clínicas
└── Botones: Cancelar + Actualizar Ficha
```

### 2.5 Lógica de negocio (sin cambios)

- **Fichas con plantilla dinámica:** carga `datosDinamicos` (JSON enriquecido) desde la API, extrae los valores simples para el formulario, y al guardar reconstruye el JSON enriquecido con `nombreCampo`, `nombreCategoria`, `categoriaOrden`, `campoOrden`.
- **Fichas legacy (sin plantilla):** usa los campos `tipoAtencion`, `diagnostico`, `indicaciones`, `anotacionConsulta`.
- **Campo `observaciones`:** almacena el nombre del profesional a cargo.
- **Validación:** campos con `requerido === 1` bloquean el guardado y muestran toast con los nombres faltantes.
- **Endpoint guardar:** `POST /ficha/editarFichaPaciente`
- **Endpoint cargar:** `POST /ficha/seleccionarFichaID`
- **Endpoint plantillas:** `GET /fichaPlantilla/listarPlantillas` + `POST /fichaPlantilla/obtenerPlantillaCompleta`

---

## 3. Notificaciones de citas próximas

### 3.1 Qué se hizo

Se implementó un sistema de notificaciones nativas del navegador (Opción A — sin Service Worker, solo mientras la pestaña está abierta) que avisa al usuario 30 minutos antes de cada cita del día.

### 3.2 Archivos creados

| Archivo | Rol |
|---------|-----|
| `src/hooks/useAppointmentNotifications.js` | Hook de polling — lógica de detección y disparo |
| `src/components/NotificationProvider.jsx` | Componente client — banner de permiso + activa el hook |

**Dónde se montó:** `src/app/dashboard/layout.jsx` — se agregó `<NotificationProvider />` justo antes del cierre de `</ClerkProvider>`, fuera del div principal para que no afecte el layout.

### 3.3 Cómo funciona el flujo completo

```
1. Usuario entra al dashboard
2. NotificationProvider monta → lee Notification.permission
   ├─ "granted"  → arranca polling directamente, sin banner
   ├─ "default"  → espera 3 segundos → muestra banner
   │    ├─ "Activar"    → Notification.requestPermission() → si granted → arranca polling
   │    └─ "Ahora no"   → guarda descarte en localStorage por 7 días → sin banner
   └─ "denied"   → no hace nada
3. Polling cada 5 minutos → GET /reservaPacientes/seleccionarReservados
4. Filtra citas de hoy con horaInicio en los próximos 30 min
5. Por cada cita no notificada → new Notification(...)
6. Guarda id_reserva en sessionStorage para no repetir
```

### 3.4 Hook: `useAppointmentNotifications(enabled)`

**Parámetro:** `enabled: boolean` — el hook no hace nada si es `false`.

**Constantes configurables** (líneas 4-5 del hook):
```js
const POLL_INTERVAL_MS = 5 * 60 * 1000  // intervalo de polling (default: 5 min)
const ANTICIPACION_MIN = 30              // minutos de anticipación (default: 30)
```

**Lógica de tiempo:**
- Convierte `horaInicio` ("HH:MM:SS" o "HH:MM") a minutos totales.
- Calcula `minutosAhora` y `limite = minutosAhora + ANTICIPACION_MIN`.
- Solo notifica si `minutosAhora <= minutosCita <= limite`.
- Filtra también por `fechaInicio === hoy` (formato `"YYYY-MM-DD"`).

**Deduplicación:**
- Usa `sessionStorage` con la key `"notif_mostradas"` — persiste dentro de la sesión del tab pero se limpia al cerrar.
- Además usa el atributo `tag` de la Notification API para que el OS no apile la misma notificación.

**Campos que consume de la API** (`GET /reservaPacientes/seleccionarReservados`):
```js
r.id_reserva        // clave de deduplicación
r.fechaInicio       // "YYYY-MM-DD..." — compara slice(0,10) con hoyISO()
r.horaInicio        // "HH:MM" o "HH:MM:SS"
r.nombrePaciente    // cuerpo de la notificación
r.apellidoPaciente  // cuerpo de la notificación
r.nombreProfesional // cuerpo de la notificación
```

**Texto de la notificación:**
```
Título: "Cita próxima — AgendaClínica"
Cuerpo: "En ~30 min · Juan Pérez con Dra. Andrea Moran a las 10:00"
Ícono:  "/logo.png"
```

### 3.5 Componente: `NotificationProvider`

- Es un componente client (`"use client"`) que no renderiza nada visible excepto el banner.
- El banner solo aparece cuando `Notification.permission === "default"` y el usuario no lo ha descartado recientemente.
- Al hacer clic en "Ahora no" guarda en `localStorage` la key `"notif_banner_dismissed_until"` con un timestamp Unix de expiración (7 días). La próxima vez que cargue el dashboard, `bannerFueDescartado()` comprueba si ese timestamp aún está vigente.
- Si el usuario hace clic en "Activar" y luego deniega en el prompt del navegador, el estado queda `"denied"` y el componente no hace nada más.

### 3.6 Bugs encontrados y corregidos en auditoría

| Bug | Causa | Fix |
|-----|-------|-----|
| Banner reaparecía en cada refresh | "Ahora no" solo actualizaba estado React, que se resetea | Persistir descarte en `localStorage` con TTL de 7 días |
| `"use client"` innecesario en el hook | Los hooks no son componentes, no necesitan la directiva | Removido |

### 3.7 Dependencias requeridas

- `tw-animate-css` — para la animación `animate-in slide-in-from-bottom-4` del banner. Ya instalado en el proyecto (`"tw-animate-css": "^1.4.0"`) e importado en `globals.css` con `@import "tw-animate-css"`.
- **No requiere cambios en el backend.**
- **No requiere Service Worker.**

### 3.8 Limitaciones conocidas (Opción A)

- Las notificaciones solo funcionan mientras la pestaña del dashboard está abierta.
- En iOS Safari solo funciona si la app está instalada como PWA (iOS 16.4+).
- Si se desea notificaciones con pestaña cerrada, se debe implementar Opción B (Web Push + Service Worker + backend que almacene suscripciones VAPID y dispare pushes al crear/recordar reservas).

---

## Tokens de diseño comunes (todo el dashboard)

Para mantener consistencia en cualquier página nueva o modificada:

```
Color primario:     #6E56CF
Hover primario:     #5b45bc
Fondo de página:    #FAFAFB
Card border:        border-slate-200
Card shadow:        shadow-sm
Card radius:        rounded-3xl
Card header:        px-6 py-5 border-b border-slate-100
Ícono contenedor:   h-10 w-10 rounded-xl bg-{color}-50 flex items-center justify-center text-{color}
Label campo:        text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1
Input base:         rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-700
Input focus:        focus:outline-none focus:ring-2 focus:ring-[#6E56CF]/30 focus:border-[#6E56CF] transition-all
Botón primario:     bg-[#6E56CF] text-white font-bold rounded-2xl hover:bg-[#5b45bc] shadow-lg shadow-indigo-200 active:scale-[0.98]
Botón secundario:   rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98]
Botón destructivo:  rounded-2xl bg-rose-600 text-white font-semibold hover:bg-rose-700 active:scale-[0.98]
Section separator:  px-6 py-3 border-t border-slate-100 bg-slate-50/60 + dot violeta + label uppercase
```
