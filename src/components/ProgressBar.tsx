"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
    progress: number;
    stepInfo: { n: number; t: number } | null;
}

export default function ProgressBar({ progress, stepInfo }: ProgressBarProps) {
    return (
        <div className="progress-container">
            <motion.div
                className="progress-bar"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {stepInfo && (
                <motion.div
                    className="progress-label"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={stepInfo.n}
                >
                    Etapa {stepInfo.n} de {stepInfo.t}
                </motion.div>
            )}
        </div>
    );
}
