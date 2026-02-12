"use client";

import { useMemo } from "react";
import Image from "next/image";

interface ResultsSectionProps {
    capital: string;
    horizon: string;
    mindset: string;
}

function getResultRanges(capital: string, horizon: string) {
    let conservative = { min: 3, max: 5 };
    let typical = { min: 6, max: 9 };
    let upper = { min: 10, max: 14 };

    if (capital === "800k_plus") {
        conservative = { min: 5, max: 7 };
        typical = { min: 8, max: 13 };
        upper = { min: 14, max: 20 };
    } else if (capital === "300k_800k") {
        conservative = { min: 4, max: 6 };
        typical = { min: 7, max: 11 };
        upper = { min: 12, max: 17 };
    } else if (capital === "100k_300k") {
        conservative = { min: 3.5, max: 5.5 };
        typical = { min: 6, max: 10 };
        upper = { min: 10, max: 15 };
    }

    if (horizon === "long") {
        conservative.min += 1; conservative.max += 1;
        typical.min += 1; typical.max += 2;
        upper.min += 1; upper.max += 2;
    } else if (horizon === "short") {
        conservative.min -= 0.5; conservative.max -= 0.5;
        typical.max -= 1;
        upper.min -= 1; upper.max -= 1;
    }

    return { conservative, typical, upper };
}

const WHATSAPP_NUMBER = "351XXXXXXXXX";
const WHATSAPP_MSG = encodeURIComponent("Olá, completei a simulação e quero saber mais sobre oportunidades em Aveiro.");
const WA_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

function WhatsAppIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

export default function ResultsSection({ capital, horizon, mindset }: ResultsSectionProps) {
    const ranges = useMemo(() => getResultRanges(capital, horizon), [capital, horizon]);

    return (
        <section className="results-container" id="results">
            <div className="results-content">
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }} className="animate-fade-in">
                    <Image src="/logo-dark.png" alt="Silvermont Capital" width={120} height={120} className="logo-results" />
                </div>

                {/* GREEN TRAFFIC LIGHT */}
                <div className="verdict-card verdict-green animate-fade-in-up">
                    <div className="verdict-icon">🟢</div>
                    <div>
                        <h2 className="verdict-title">Sim, deve investir em Aveiro.</h2>
                        <p className="verdict-text">
                            Aveiro é a cidade com maior crescimento imobiliário em Portugal.
                            +12% valorização anual, procura recorde, e oferta limitada.
                            A janela de oportunidade está aberta — mas não para sempre.
                        </p>
                    </div>
                </div>

                {/* RED - When NOT to invest */}
                <div className="verdict-card verdict-red animate-fade-in-up delay-1">
                    <div className="verdict-icon">🔴</div>
                    <div>
                        <h3 className="verdict-title-sm">Não deve investir em Aveiro se...</h3>
                        <ul className="verdict-list">
                            <li><span className="x-icon">✕</span> Não tem capital disponível e vai precisar de crédito agressivo</li>
                            <li><span className="x-icon">✕</span> Não tem paciência para o processo burocrático português</li>
                            <li><span className="x-icon">✕</span> Espera lucros em semanas sem qualquer estrutura</li>
                            <li><span className="x-icon">✕</span> Quer fazer tudo sozinho sem equipa profissional</li>
                        </ul>
                    </div>
                </div>

                {/* RESULTS RANGES */}
                <div className="animate-fade-in-up delay-2" style={{ marginTop: "2.5rem" }}>
                    <span className="label-text">📊 Os Seus Resultados Simulados</span>
                    <h2 className="section-title" style={{ marginTop: "0.5rem" }}>
                        Quanto pode <span className="gold-highlight">realmente</span> render
                    </h2>
                </div>

                <div className="result-range-group animate-fade-in-up delay-2">
                    <div className="result-range">
                        <div className="result-range-header">
                            <span className="result-range-label">🛡️ Cenário Cauteloso</span>
                            <span className="result-range-value">
                                {ranges.conservative.min.toFixed(1)}% – {ranges.conservative.max.toFixed(1)}% / ano
                            </span>
                        </div>
                        <div className="result-bar-track">
                            <div className="result-bar-fill conservative" style={{ width: `${(ranges.conservative.max / 22) * 100}%` }} />
                        </div>
                    </div>

                    <div className="result-range">
                        <div className="result-range-header">
                            <span className="result-range-label">📈 Cenário Realista</span>
                            <span className="result-range-value">
                                {ranges.typical.min.toFixed(1)}% – {ranges.typical.max.toFixed(1)}% / ano
                            </span>
                        </div>
                        <div className="result-bar-track">
                            <div className="result-bar-fill typical" style={{ width: `${(ranges.typical.max / 22) * 100}%` }} />
                        </div>
                    </div>

                    <div className="result-range">
                        <div className="result-range-header">
                            <span className="result-range-label">🚀 Cenário Otimizado</span>
                            <span className="result-range-value">
                                {ranges.upper.min.toFixed(1)}% – {ranges.upper.max.toFixed(1)}% / ano
                            </span>
                        </div>
                        <div className="result-bar-track">
                            <div className="result-bar-fill upper" style={{ width: `${(ranges.upper.max / 22) * 100}%` }} />
                        </div>
                    </div>
                </div>

                <div className="result-disclaimer animate-fade-in-up delay-3">
                    <p>
                        Baseado em operações residenciais reais na região de Aveiro.
                        Resultados dependem da execução e condições de mercado.
                    </p>
                </div>

                {/* CTA after results */}
                <div className="cta-block animate-fade-in-up delay-3">
                    <p className="cta-micro">🔑 Quer acesso às melhores oportunidades fora do mercado em Aveiro?</p>
                    <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" id="btn-wa-results">
                        <WhatsAppIcon size={22} />
                        <span>Falar com a Equipa</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
