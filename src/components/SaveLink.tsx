"use client";

import { useState } from "react";

export default function SaveLink() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        });
    };

    return (
        <section className="save-section" id="save">
            <div className="section-divider" />
            <div className="animate-fade-in-up" style={{ marginTop: "2rem" }}>
                <button className="btn-secondary" onClick={handleCopy} id="btn-save">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="5"
                            y="5"
                            width="8"
                            height="8"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.2"
                        />
                        <path
                            d="M3 11V3.5C3 2.67157 3.67157 2 4.5 2H11"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                        />
                    </svg>
                    <span>Guardar ou Copiar Link da Simulação</span>
                </button>

                {copied && (
                    <div className="copied-toast">
                        <span>✓</span>
                        <span>Link copiado</span>
                    </div>
                )}

                <p className="save-text">
                    Revisite o seu cenário a qualquer momento.
                </p>
            </div>
        </section>
    );
}
