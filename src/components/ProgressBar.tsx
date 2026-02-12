"use client";

interface ProgressBarProps {
    progress: number;
    stepInfo: { n: number; t: number } | null;
}

export default function ProgressBar({ progress, stepInfo }: ProgressBarProps) {
    return (
        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
            {stepInfo && (
                <div className="progress-label">
                    Etapa {stepInfo.n} de {stepInfo.t}
                </div>
            )}
        </div>
    );
}
