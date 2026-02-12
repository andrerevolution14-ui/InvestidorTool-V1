"use client";

import Image from "next/image";

interface HeroSectionProps {
    onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
    return (
        <section className="hero" id="hero">
            <div className="hero-logo animate-fade-in">
                <Image
                    src="/logo-dark.png"
                    alt="Silvermont Capital"
                    width={220}
                    height={220}
                    className="logo-hero"
                    priority
                />
            </div>

            <h1 className="headline-hero animate-fade-in-up delay-1">
                Aveiro está a explodir.{" "}
                <span className="gold-highlight">O seu dinheiro devia estar lá.</span>
            </h1>

            <p className="subheadline animate-fade-in-up delay-2">
                Valorização de 12% ao ano. Procura recorde. Janela de oportunidade
                que não vai durar para sempre. Descubra se faz sentido para si.
            </p>

            <div className="hero-value-list animate-fade-in-up delay-3">
                <div className="hero-value-item">
                    <span className="hero-value-icon">📊</span>
                    <span>Simulação personalizada de retorno</span>
                </div>
                <div className="hero-value-item">
                    <span className="hero-value-icon">🟢</span>
                    <span>Guia: Deve ou não investir em Aveiro?</span>
                </div>
                <div className="hero-value-item">
                    <span className="hero-value-icon">🔑</span>
                    <span>Estratégias exclusivas de baixo risco</span>
                </div>
            </div>

            <div className="animate-fade-in-up delay-4">
                <button className="btn-primary" onClick={onStart} id="cta-start">
                    <span>Iniciar Simulação Gratuita</span>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <p className="micro-text" style={{ marginTop: "0.75rem" }}>
                    30 segundos · Sem compromisso · Resultado imediato
                </p>
            </div>
        </section>
    );
}
