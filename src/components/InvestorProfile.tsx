"use client";

import { useMemo } from "react";

interface InvestorProfileProps {
    capital: string;
    horizon: string;
    mindset: string;
}

function getStrategies(capital: string, horizon: string, mindset: string): Array<{ icon: string; text: string }> {
    const strategies: Array<{ icon: string; text: string }> = [];

    if (capital === "under_100k" || capital === "100k_300k") {
        strategies.push({ icon: "🏠", text: "Conversões compactas — transformar espaços em unidades rentáveis" });
        strategies.push({ icon: "📊", text: "Reposicionamento — comprar barato, valorizar com disciplina" });
    } else {
        strategies.push({ icon: "🏗️", text: "Operações multiunidade — escala para maximizar retorno por m²" });
        strategies.push({ icon: "📍", text: "Aquisições em zonas premium de crescimento em Aveiro" });
    }

    if (horizon === "short") {
        strategies.push({ icon: "⚡", text: "Flip rápido — reabilitação e venda em menos de 12 meses" });
    } else if (horizon === "medium") {
        strategies.push({ icon: "🔄", text: "Ciclo de reabilitação com saída planeada e previsível" });
    } else {
        strategies.push({ icon: "📈", text: "Rendimento recorrente + valorização patrimonial a longo prazo" });
    }

    if (mindset === "passive") {
        strategies.push({ icon: "🤝", text: "Gestão chave-na-mão — nós tratamos de tudo, você recebe o retorno" });
    } else if (mindset === "active") {
        strategies.push({ icon: "🎯", text: "Acompanhamento ativo — decisões conjuntas em cada fase" });
    } else {
        strategies.push({ icon: "👁️", text: "Visibilidade total com execução profissional delegada" });
    }

    return strategies;
}

function getProfileSummary(capital: string, horizon: string, mindset: string): string {
    if (mindset === "passive") {
        return "O tipo de investidor que quer resultados sem dores de cabeça. A solução ideal é uma operação chave-na-mão, onde tratamos de tudo — da aquisição à venda — e você recebe o retorno.";
    }
    if (mindset === "active") {
        return "Gosta de estar envolvido e de tomar decisões. A abordagem certa combina a sua visão com a nossa execução no terreno — controlo total em cada fase.";
    }
    return "Quer acompanhar sem perder tempo. Tem visibilidade total sobre cada operação, mas a execução é profissional e delegada. O melhor dos dois mundos.";
}

const WA_URL = "https://wa.link/iafuq8";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

export default function InvestorProfile({ capital, horizon, mindset }: InvestorProfileProps) {
    const strategies = useMemo(() => getStrategies(capital, horizon, mindset), [capital, horizon, mindset]);
    const summary = useMemo(() => getProfileSummary(capital, horizon, mindset), [capital, horizon, mindset]);

    return (
        <section className="content-block" id="profile">
            <div className="content-block-inner">
                <div className="animate-fade-in-up">
                    <h2 className="section-title">
                        🗺️ O Seu Guia de Investimento <span className="gold-highlight">Personalizado</span>
                    </h2>
                </div>

                <div className="profile-card animate-fade-in-up delay-1">
                    <div className="profile-section">
                        <p className="profile-label">O Que Identificámos</p>
                        <p className="profile-value">{summary}</p>
                    </div>

                    <div className="profile-section">
                        <p className="profile-label">Estratégias Recomendadas Para Si</p>
                        <ul className="profile-strategies">
                            {strategies.map((strategy, index) => (
                                <li className="profile-strategy" key={index}>
                                    <span style={{ fontSize: "1.1rem" }}>{strategy.icon}</span>
                                    <span>{strategy.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* CTA */}
                <div className="cta-block animate-fade-in-up delay-2">
                    <p className="cta-micro">🔑 Quer uma estratégia desenhada à medida do seu perfil?</p>
                    <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" id="btn-wa-profile">
                        <WhatsAppIcon size={20} />
                        <span>Receber Estratégia Personalizada</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
