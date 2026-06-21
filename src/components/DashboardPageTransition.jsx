"use client"

import { motion, AnimatePresence } from "motion/react"
import { usePathname } from "next/navigation"

export default function DashboardPageTransition({ children }) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
