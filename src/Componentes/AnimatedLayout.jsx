// src/components/AnimatedLayout.jsx
"use client";

import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

export function AnimatedLayout({ children }) {
    const pathname = usePathname();

    // Usamos solo el segmento raíz como key de animación.
    // Así navegar dentro de /dashboard/* NO remonta el layout (ni el sidebar).
    // La animación solo ocurre al cambiar de sección raíz (ej: / → /dashboard).
    const rootSegment = "/" + pathname.split("/")[1];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={rootSegment}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="min-h-screen"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}