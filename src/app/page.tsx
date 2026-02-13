"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import ProgressBar from "@/components/ProgressBar";
import { saveLeadAction } from "./actions";

type Step = "hero" | "q1" | "q2" | "q3" | "processing" | "results" | "anchoring" | "rational" | "analysis" | "strategy" | "presentation" | "final";

const SESSION_KEY = "silvermont_funnel";
const WA_NUM = "351XXXXXXXXX";
const WA_MSG = encodeURIComponent("Olá, completei a simulação e gostaria de receber oportunidades fora de mercado em Aveiro.");
const WA_URL = `https://wa.me/${WA_NUM}?text=${WA_MSG}`;

const CAPITAL_OPTIONS = [
  { value: "under_100k", label: "Menos de €100.000", sub: "Entrada estratégica", avg: 75000 },
  { value: "100k_300k", label: "€100.000 – €300.000", sub: "Capital sólido", avg: 200000 },
  { value: "300k_800k", label: "€300.000 – €800.000", sub: "Operações de escala", avg: 500000 },
  { value: "800k_plus", label: "Mais de €800.000", sub: "Capital institucional", avg: 1000000 },
];
const HORIZON_OPTIONS = [
  { value: "short", label: "Retorno rápido", sub: "Até 12 meses" },
  { value: "medium", label: "Paciência moderada", sub: "1 a 3 anos" },
  { value: "long", label: "Longo prazo", sub: "3+ anos" },
];
const MINDSET_OPTIONS = [
  { value: "passive", label: "Investir e não me preocupar", sub: "Totalmente delegado" },
  { value: "active", label: "Gosto de acompanhar e decidir", sub: "Envolvido no processo" },
  { value: "hybrid", label: "Acompanhar com equipa profissional", sub: "Visibilidade total, execução delegada" },
];

function fmt(n: number) { return "€" + n.toLocaleString("pt-PT"); }
function getUserStep(s: Step): { n: number; t: number } | null {
  if (s === "hero" || s === "processing") return null;
  if (s === "q1" || s === "q2" || s === "q3") return { n: 1, t: 7 };
  if (s === "results") return { n: 2, t: 7 };
  if (s === "anchoring") return { n: 3, t: 7 };
  if (s === "rational") return { n: 4, t: 7 };
  if (s === "analysis") return { n: 5, t: 7 };
  if (s === "strategy") return { n: 6, t: 7 };
  return { n: 7, t: 7 };
}
function getProgress(s: Step): number {
  const m: Record<Step, number> = {
    hero: 0,
    q1: 10, q2: 20, q3: 30,
    processing: 40,
    results: 52,
    anchoring: 64,
    rational: 74,
    analysis: 84,
    strategy: 92,
    presentation: 96,
    final: 100
  };
  return m[s];
}
function getReturns(cap: string, hor: string) {
  const avg = CAPITAL_OPTIONS.find(o => o.value === cap)?.avg || 200000;
  let rMin = 7, rMax = 12, oMin = 14, oMax = 22;
  if (hor === "long") { rMin += 2; rMax += 2; oMin += 2; oMax += 3; }
  if (hor === "short") { rMin -= 1; rMax -= 1; oMin -= 2; oMax -= 2; }
  if (cap === "800k_plus" || cap === "300k_800k") { rMin += 1; rMax += 1; oMin += 1; oMax += 1; }
  return {
    realistic: { minP: rMin, maxP: rMax, minE: Math.round(avg * rMin / 100), maxE: Math.round(avg * rMax / 100) },
    optimized: { minP: oMin, maxP: oMax, minE: Math.round(avg * oMin / 100), maxE: Math.round(avg * oMax / 100) },
  };
}

function WaIcon({ s = 18 }: { s?: number }) { return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>; }

function Logo({ size = "md", onClick }: { size?: "lg" | "md" | "sm"; onClick?: () => void }) {
  /* eslint-disable @next/next/no-img-element */
  const inner = (
    <img
      src="/logo-dark-hz.png"
      alt="Silvermont Capital"
      className={`logo-img logo-blend logo-${size}`}
      draggable={false}
    />
  );
  if (onClick) return <div className="step-logo"><button className="logo-clickable" onClick={onClick}>{inner}</button></div>;
  return <div className="step-logo">{inner}</div>;
}

/* WA pill link – visible but not green, used in steps 2-4 */
function WaLink({ id }: { id: string }) {
  return <div style={{ textAlign: "center", marginTop: "0.75rem" }}><a href={WA_URL} target="_blank" rel="noopener noreferrer" className="wa-pill" id={id}><WaIcon s={15} /><span>Receber oportunidades fora de mercado</span></a></div>;
}

export default function Home() {
  const [step, setStep] = useState<Step>("hero");
  const [capital, setCapital] = useState("");
  const [horizon, setHorizon] = useState("");
  const [mindset, setMindset] = useState("");
  const [profile, setProfile] = useState("");
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.step && s.step !== "processing") {
          setStep(s.step);
          setCapital(s.capital || "");
          setHorizon(s.horizon || "");
          setMindset(s.mindset || "");
          setProfile(s.profile || "");
        }
      }
    } catch { }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        step, capital, horizon, mindset, profile, ts: Date.now()
      }));
    } catch { }
  }, [step, capital, horizon, mindset, profile, ready]);

  const go = useCallback((s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const restart = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCapital("");
    setHorizon("");
    setMindset("");
    setProfile("");
    go("hero");
  }, [go]);

  const selectCapital = useCallback((v: string) => {
    setCapital(v);
    setTimeout(() => go("q2"), 200);
  }, [go]);

  const selectHorizon = useCallback((v: string) => {
    setHorizon(v);
    setTimeout(() => go("q3"), 200);
  }, [go]);

  const selectMindset = useCallback(async (v: string) => {
    setMindset(v);
    setTimeout(async () => {
      go("processing");
      try { await saveLeadAction({ capital, horizonte: horizon, preferencia: v }); } catch { }
      setTimeout(() => go("results"), 1800);
    }, 200);
  }, [capital, horizon, go]);

  const returns = useMemo(() => getReturns(capital, horizon), [capital, horizon]);
  const capLabel = CAPITAL_OPTIONS.find(o => o.value === capital)?.label || "";
  const userStepInfo = getUserStep(step);

  if (!ready) return null;

  return (
    <main className="funnel">
      {step !== "hero" && step !== "processing" && <ProgressBar progress={getProgress(step)} stepInfo={userStepInfo} />}

      {/* ═══ HERO ═══ */}
      {step === "hero" && (
        <section className="step-view step-centered animate-step" id="hero">
          <h1 className="headline-hero">Aveiro está a explodir.<br /><span className="gold-highlight">O seu dinheiro devia estar lá.</span></h1>
          <p className="subheadline">+12% valorização anual. Procura recorde. Stock limitado. Descubra em 30 segundos se faz sentido para si.</p>

          <div className="context-image-break" style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
            <img src="/aveiro-1.png" alt="Aveiro" className="context-img-full" />
          </div>

          <div className="hero-value-list">
            <div className="hero-value-item"><span className="hv-icon">📊</span><span>Simulação personalizada de retorno</span></div>
            <div className="hero-value-item"><span className="hv-icon">🟢</span><span>Guia: Deve ou não investir em Aveiro</span></div>
            <div className="hero-value-item"><span className="hv-icon">🔑</span><span>Acesso a oportunidades fora de mercado</span></div>
          </div>
          <button className="btn-primary" onClick={() => go("q1")} id="cta-start">Iniciar JÁ a Minha Simulação Gratuita →</button>
          <p className="micro-text" style={{ marginTop: "0.75rem" }}>Sem compromisso · Resultado imediato</p>
        </section>
      )}

      {/* ═══ QUIZ Q1-Q4 ═══ */}
      {step === "q1" && (
        <section className="step-view step-centered animate-step" id="step-q1">
          <Logo size="sm" />
          <div className="step-header"><span className="step-number">Pergunta 1 de 3</span><h2 className="step-question">Quanto capital tem disponível para investir?</h2></div>
          <div className="step-content">
            <div className="options-grid stagger-children">
              {CAPITAL_OPTIONS.map(o => (
                <button key={o.value} className={`option-card${capital === o.value ? " selected" : ""}`} onClick={() => selectCapital(o.value)}>
                  <span className="option-indicator" />
                  <div>
                    <div className="option-label">{o.label}</div>
                    <div className="option-sublabel">{o.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === "q2" && (
        <section className="step-view step-centered animate-step" id="step-q2">
          <Logo size="sm" />
          <div className="step-header"><span className="step-number">Pergunta 2 de 3</span><h2 className="step-question">Quando precisa de ver o retorno?</h2></div>
          <div className="step-content">
            <div className="options-grid stagger-children">
              {HORIZON_OPTIONS.map(o => (
                <button key={o.value} className={`option-card${horizon === o.value ? " selected" : ""}`} onClick={() => selectHorizon(o.value)}>
                  <span className="option-indicator" />
                  <div>
                    <div className="option-label">{o.label}</div>
                    <div className="option-sublabel">{o.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === "q3" && (
        <section className="step-view step-centered animate-step" id="step-q3">
          <Logo size="sm" />
          <div className="step-header"><span className="step-number">Pergunta 3 de 3</span><h2 className="step-question">Como prefere gerir o seu investimento?</h2></div>
          <div className="step-content">
            <div className="options-grid stagger-children">
              {MINDSET_OPTIONS.map(o => (
                <button key={o.value} className={`option-card${mindset === o.value ? " selected" : ""}`} onClick={() => selectMindset(o.value)}>
                  <span className="option-indicator" />
                  <div>
                    <div className="option-label">{o.label}</div>
                    <div className="option-sublabel">{o.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ PROCESSING ═══ */}
      {step === "processing" && (
        <section className="step-view step-centered animate-step" id="step-processing">
          <Logo size="sm" />
          <div className="processing-bars">{[1, 2, 3, 4, 5].map(i => <div key={i} className="processing-bar" />)}</div>
          <p className="processing-text">A analisar o seu perfil de investidor...</p>
        </section>
      )}

      {/* ═══ STEP 2 — RESULTS ═══ */}
      {step === "results" && (
        <section className="step-view step-scroll animate-step" id="step-results">
          <Logo size="md" />
          <div className="step-inner">
            <div className="verdict-card verdict-green">
              <div className="verdict-icon">🟢</div>
              <div>
                <h2 className="verdict-title">Sim, você deve investir em Aveiro.</h2>
                <p className="verdict-text">Com o seu capital de <strong>{capLabel}</strong>, está numa posição privilegiada. Aveiro vive um <strong>boom de procura sem precedentes</strong> — investidores, nómadas digitais e famílias disputam um stock de imóveis cada vez mais escasso.</p>
                <p className="verdict-text" style={{ marginTop: "0.6rem" }}>A oferta qualificada é <strong>criticamente baixa</strong>. Os melhores negócios nunca chegam aos portais — são fechados antes. <strong>Quem entra agora, entra na janela certa. Quem espera, paga mais caro.</strong></p>
              </div>
            </div>
            <div className="verdict-card verdict-red">
              <div className="verdict-icon">🔴</div>
              <div>
                <h3 className="verdict-title-sm">Não invista se...</h3>
                <ul className="verdict-list">
                  <li><span className="x-icon">✕</span>Não tem o capital realmente disponível</li>
                  <li><span className="x-icon">✕</span>Espera lucros sem qualquer estrutura</li>
                  <li><span className="x-icon">✕</span>Não quer trabalhar com profissionais no terreno</li>
                </ul>
              </div>
            </div>
            <div className="spacer" />
            <span className="label-text">📊 A Sua Simulação de Retorno</span>
            <div className="result-range-group">
              <div className="result-range">
                <div className="result-range-header"><span className="result-range-label">📈 Cenário Realista</span><span className="result-range-value">{returns.realistic.minP}% – {returns.realistic.maxP}%</span></div>
                <div className="result-bar-track"><div className="result-bar-fill typical" style={{ width: `${(returns.realistic.maxP / 25) * 100}%` }} /></div>
                <div className="result-euro">{fmt(returns.realistic.minE)} – {fmt(returns.realistic.maxE)} por ano</div>
              </div>
              <div className="result-range">
                <div className="result-range-header"><span className="result-range-label">🚀 Cenário Otimizado</span><span className="result-range-value">{returns.optimized.minP}% – {returns.optimized.maxP}%</span></div>
                <div className="result-bar-track"><div className="result-bar-fill upper" style={{ width: `${(returns.optimized.maxP / 25) * 100}%` }} /></div>
                <div className="result-euro">{fmt(returns.optimized.minE)} – {fmt(returns.optimized.maxE)} por ano</div>
              </div>
            </div>
            <p className="result-note">Baseado em médias de mercado na região de Aveiro.</p>
            <button className="btn-next" onClick={() => go("anchoring")}>⚓ Ver Análise de Realidade →</button>
            <WaLink id="wa-results" />
          </div>
        </section>
      )}

      {/* ═══ STEP 2.1 — ANCHORING ═══ */}
      {step === "anchoring" && (
        <section className="step-view step-scroll animate-step" id="step-anchoring">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">⚓ Realidade prática do mercado</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">💰</div>
                <p className="info-text">Retornos variam mais pela <strong>compra</strong> do que pela valorização</p>
              </div>
              <div className="info-card">
                <div className="info-icon">⏱️</div>
                <p className="info-text">Tempo impacta margens mais do que preço de venda</p>
              </div>
              <div className="info-card">
                <div className="info-icon">📋</div>
                <p className="info-text">Atrasos administrativos alteram completamente projeções</p>
              </div>
              <div className="info-card">
                <div className="info-icon">🎯</div>
                <p className="info-text">Execução pesa mais do que cenário teórico</p>
              </div>
            </div>

            <div className="context-image-break">
              <img src="/aveiro-2.jpg" alt="Aveiro Context" className="context-img-full" />
            </div>

            <button className="btn-next" onClick={() => go("rational")}>🔍 Analisar Variáveis Críticas →</button>
            <WaLink id="wa-anchoring" />
          </div>
        </section>
      )}

      {/* ═══ STEP 2.2 — RATIONAL ═══ */}
      {step === "rational" && (
        <section className="step-view step-scroll animate-step" id="step-rational">
          <Logo size="md" />
          <div className="step-inner">

            {/* Asymmetric staggered layout */}
            <h2 className="section-title" style={{ textAlign: "left" }}>🔍 Variáveis que definem a viabilidade real</h2>
            <div className="staggered-grid">
              <div className="stagger-card stagger-left">
                <div className="stagger-icon">💧</div>
                <div>
                  <h4 className="stagger-title">Liquidez de saída</h4>
                  <p className="stagger-desc">Capacidade de vender rapidamente sem desvalorização. Mercados ilíquidos prendem capital.</p>
                </div>
              </div>
              <div className="stagger-card stagger-right">
                <div className="stagger-icon">🛡️</div>
                <div>
                  <h4 className="stagger-title">Margem de contingência</h4>
                  <p className="stagger-desc">Reserva para imprevistos. Operações sem buffer financeiro colapsam ao primeiro obstáculo.</p>
                </div>
              </div>
              <div className="stagger-card stagger-left">
                <div className="stagger-icon">📊</div>
                <div>
                  <h4 className="stagger-title">Estructura fiscal</h4>
                  <p className="stagger-desc">Como estrutura a operação define quanto fica no bolso. Fiscalidade mal planeada corroi 30%+ do retorno.</p>
                </div>
              </div>
              <div className="stagger-card stagger-right">
                <div className="stagger-icon">⏳</div>
                <div>
                  <h4 className="stagger-title">Sensibilidade ao tempo</h4>
                  <p className="stagger-desc">Cada mês extra tem custos (financiamento, oportunidade). Projetos sensíveis ao tempo exigem controlo rigoroso.</p>
                </div>
              </div>
              <div className="stagger-card stagger-left">
                <div className="stagger-icon">🏗️</div>
                <div>
                  <h4 className="stagger-title">Viabilidade urbanística</h4>
                  <p className="stagger-desc">Licenças, PDM, restrições. O que parece viável pode estar bloqueado por anos na Câmara.</p>
                </div>
              </div>
              <div className="stagger-card stagger-right">
                <div className="stagger-icon">⚖️</div>
                <div>
                  <h4 className="stagger-title">Relação risco / capital / duração</h4>
                  <p className="stagger-desc">Quanto risco assume, quanto capital imobiliza, por quanto tempo. O equilíbrio define se vale a pena.</p>
                </div>
              </div>
            </div>

            <div className="context-image-break">
              <img src="/aveiro-3.jpg" alt="Aveiro Analysis" className="context-img-full" />
            </div>

            <div className="spacer-lg" />

            {/* Timeline vertical flow */}
            <h2 className="section-title" style={{ textAlign: "right" }}>⚠️ Onde muitas operações perdem margem</h2>
            <div className="timeline-flow">
              <div className="timeline-item">
                <div className="timeline-marker">💸</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Custos subestimados</h4>
                  <p className="timeline-desc">Orçamentos irrealistas levam a margens negativas</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">📝</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Atrasos de licenciamento</h4>
                  <p className="timeline-desc">Cada mês de atraso corrói a rentabilidade</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">🔨</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Alterações de obra</h4>
                  <p className="timeline-desc">Imprevistos que disparam custos</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">⚠️</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Problemas de execução</h4>
                  <p className="timeline-desc">Falta de controlo no terreno</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">📉</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Saída abaixo do esperado</h4>
                  <p className="timeline-desc">Mercado muda ou avaliação foi otimista</p>
                </div>
              </div>
            </div>
            <button className="btn-next" onClick={() => go("analysis")}>📍 Porquê Aveiro Agora? →</button>
            <WaLink id="wa-rational" />
          </div>
        </section>
      )}

      {/* ═══ STEP 3 — ANALYSIS ═══ */}
      {step === "analysis" && (
        <section className="step-view step-scroll animate-step" id="step-analysis">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">📍 Porquê Aveiro? Porquê agora?</h2>
            <p className="body-text" style={{ marginBottom: "1rem" }}>Os investidores inteligentes já estão a movimentar-se:</p>
            <ul className="checklist stagger-children">
              <li className="checklist-item"><span className="checklist-icon">✅</span>Maior valorização imobiliária — em aceleração</li>
              <li className="checklist-item"><span className="checklist-icon">✅</span>Procura internacional recorde</li>
              <li className="checklist-item"><span className="checklist-icon">✅</span>Tech hub + universidade a crescer</li>
              <li className="checklist-item"><span className="checklist-icon">✅</span>Oferta residencial criticamente baixa</li>
            </ul>
            <div className="spacer-lg" />
            <h2 className="section-title">⚠️ A maioria perde dinheiro</h2>
            <ul className="insight-list stagger-children">
              <li className="insight-item"><span className="x-icon-lg">✕</span><span className="insight-text">Compram caro — sem análise de valor real</span></li>
              <li className="insight-item"><span className="x-icon-lg">✕</span><span className="insight-text">Subestimam custos de obra e imprevistos</span></li>
              <li className="insight-item"><span className="x-icon-lg">✕</span><span className="insight-text">Perdem controlo sobre prazos e orçamentos</span></li>
            </ul>
            <button className="btn-next" onClick={() => go("strategy")}>🎯 Ver Recomendações Estratégicas →</button>
            <WaLink id="wa-analysis" />
          </div>
        </section>
      )}

      {/* ═══ STEP 4 — RECOMMENDATIONS ═══ */}
      {step === "strategy" && (
        <section className="step-view step-scroll animate-step" id="step-strategy">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">🎯 Recomendações Estratégicas</h2>
            <div className="rec-card">
              <span className="rec-icon">1️⃣</span>
              <div>
                <h3 className="rec-title">Invista em ofertas fora de mercado</h3>
                <p className="rec-text">Os melhores negócios em Aveiro são negociados em privado, antes de entrar no mercado público.</p>
              </div>
            </div>
            <div className="rec-card">
              <span className="rec-icon">2️⃣</span>
              <div>
                <h3 className="rec-title">Foco em reconversão com ciclos rápidos</h3>
                <p className="rec-text">Ciclos curtos oferecem melhor relação retorno/risco. Evite projetos longos sem equipa local.</p>
              </div>
            </div>
            <div className="rec-card">
              <span className="rec-icon">3️⃣</span>
              <div>
                <h3 className="rec-title">Proteja o capital antes do retorno</h3>
                <p className="rec-text">Cada operação deve ter margem de segurança. O capital tem de estar protegido primeiro.</p>
              </div>
            </div>

            <button className="btn-next" onClick={() => go("presentation")}>🏗️ Ver Abordagem no Terreno →</button>
            <WaLink id="wa-strategy" />
          </div>
        </section>
      )}

      {/* ═══ STEP 4.1 — PRESENTATION ═══ */}
      {step === "presentation" && (
        <section className="step-view step-scroll animate-step" id="step-presentation">
          <Logo size="md" />
          <div className="step-inner">

            <h2 className="section-title">🎯 Abordagem operacional em Aveiro</h2>
            <div className="approach-detailed">
              <div className="approach-item">
                <div className="approach-header">
                  <span className="approach-icon">🔎</span>
                  <h3 className="approach-title">Seleção criteriosa de ativos</h3>
                </div>
                <p className="approach-desc">Apenas ativos com potencial comprovado, fora de mercado, em zonas de valorização acelerada. Filtramos 95% das oportunidades antes de apresentar.</p>
              </div>
              <div className="approach-item">
                <div className="approach-header">
                  <span className="approach-icon">🏛️</span>
                  <h3 className="approach-title">Estruturação conservadora</h3>
                </div>
                <p className="approach-desc">Capital protegido primeiro, retorno depois. Margens de segurança em todos os cenários, mesmo nos pessimistas.</p>
              </div>
              <div className="approach-item">
                <div className="approach-header">
                  <span className="approach-icon">🛡️</span>
                  <h3 className="approach-title">Margens de segurança</h3>
                </div>
                <p className="approach-desc">Buffer financeiro para imprevistos, atrasos e correções de mercado. Não trabalhamos com orçamentos justos.</p>
              </div>
              <div className="approach-item">
                <div className="approach-header">
                  <span className="approach-icon">🗺️</span>
                  <h3 className="approach-title">Planeamento de saída</h3>
                </div>
                <p className="approach-desc">Estratégia de saída definida antes da compra. Sabemos a quem vender, quando e por quanto, antes de entrar.</p>
              </div>
              <div className="approach-item">
                <div className="approach-header">
                  <span className="approach-icon">✅</span>
                  <h3 className="approach-title">Controlo de execução no terreno</h3>
                </div>
                <p className="approach-desc">Equipa local em Aveiro. Acompanhamento semanal de obra, licenciamentos e prazos. Problemas resolvidos antes de escalarem.</p>
              </div>
            </div>

            <div className="context-image-break">
              <img src="/aveiro-4.png" alt="Aveiro Territory" className="context-img-full" />
            </div>

            <div className="spacer-lg" />

            <div className="user-photo-card">
              <div className="photo-with-logo">
                <img src="/user-photo.jpg" alt="Estrategista" className="user-photo-img" />
                <img src="/logo-horizontal.png" alt="Silvermont Capital" className="photo-logo-xl" />
              </div>
              <div className="user-photo-info">
                <span className="user-photo-name">Estrategista de Operações</span>
                <span className="user-photo-tag">Silvermont Capital</span>
              </div>
            </div>

            <div className="solution-block">
              <h3 className="section-title">Metodologia Silvermont</h3>
              <p className="body-text-lg">Operamos exclusivamente com <strong>ofertas fora de mercado</strong>. Reconversão inteligente, ciclos rápidos e risco controlado.</p>
            </div>

            <button className="btn-next" onClick={() => go("final")}>🔑 Aceder às Oportunidades Exclusivas →</button>
            <WaLink id="wa-presentation" />
          </div>
        </section>
      )}

      {/* ═══ STEP 5 — FINAL ═══ */}
      {step === "final" && (
        <section className="step-view step-centered animate-step" id="step-final">
          <Logo size="lg" onClick={restart} />
          <div className="step-inner" style={{ textAlign: "center", maxWidth: "520px" }}>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Oportunidades <span className="gold-highlight">Fora de Mercado</span>
            </h2>
            <p className="body-text-lg" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              Imóveis que nunca chegam aos portais. Operações validadas.
            </p>
            <p className="urgency-text">⚡ Apenas investidores qualificados</p>

            <div style={{ marginTop: "2.5rem" }}>
              <div className="cta-context-text">Comunicação direta. Sem envios massificados.</div>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-final-wa" id="wa-final">
                <WaIcon s={22} />
                <span>Receber Oportunidades Selecionadas</span>
              </a>
            </div>
            <button className="btn-save" onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); }}>
              {copied ? "✓ Link copiado!" : "📎 Guardar link para consultar depois"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
