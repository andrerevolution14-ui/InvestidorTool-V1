"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import ProgressBar from "@/components/ProgressBar";
import { saveLeadAction } from "./actions";

type Step = "hero" | "q1" | "q2" | "q3" | "processing" | "results" | "analysis" | "strategy" | "final";

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
  if (s === "q1" || s === "q2" || s === "q3") return { n: 1, t: 5 };
  if (s === "results") return { n: 2, t: 5 };
  if (s === "analysis") return { n: 3, t: 5 };
  if (s === "strategy") return { n: 4, t: 5 };
  return { n: 5, t: 5 };
}
function getProgress(s: Step): number {
  const m: Record<Step, number> = { hero: 0, q1: 10, q2: 18, q3: 26, processing: 38, results: 52, analysis: 68, strategy: 84, final: 100 };
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
  const w = size === "lg" ? 440 : size === "md" ? 340 : 260;
  const img = <Image src="/logo-dark-hz.png" alt="Silvermont Capital" width={w} height={Math.round(w * 0.35)} className={`logo-img logo-blend logo-${size}`} priority />;
  if (onClick) return <div className="step-logo"><button className="logo-clickable" onClick={onClick}>{img}</button></div>;
  return <div className="step-logo">{img}</div>;
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
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(SESSION_KEY); if (raw) { const s = JSON.parse(raw); if (s.step && s.step !== "processing") { setStep(s.step); setCapital(s.capital || ""); setHorizon(s.horizon || ""); setMindset(s.mindset || ""); } } } catch { }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ step, capital, horizon, mindset, ts: Date.now() })); } catch { }
  }, [step, capital, horizon, mindset, ready]);

  const go = useCallback((s: Step) => { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const restart = useCallback(() => { localStorage.removeItem(SESSION_KEY); setCapital(""); setHorizon(""); setMindset(""); go("hero"); }, [go]);
  const selectCapital = useCallback((v: string) => { setCapital(v); setTimeout(() => go("q2"), 200); }, [go]);
  const selectHorizon = useCallback((v: string) => { setHorizon(v); setTimeout(() => go("q3"), 200); }, [go]);
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
          <Logo size="lg" />
          <h1 className="headline-hero">Aveiro está a explodir.<br /><span className="gold-highlight">O seu dinheiro devia estar lá.</span></h1>
          <p className="subheadline">+12% valorização anual. Procura recorde. Stock limitado. Descubra em 30 segundos se faz sentido para si.</p>
          <div className="hero-value-list">
            <div className="hero-value-item"><span className="hv-icon">📊</span><span>Simulação personalizada de retorno</span></div>
            <div className="hero-value-item"><span className="hv-icon">🟢</span><span>Guia: Deve ou não investir em Aveiro</span></div>
            <div className="hero-value-item"><span className="hv-icon">🔑</span><span>Acesso a oportunidades fora de mercado</span></div>
          </div>
          <button className="btn-primary" onClick={() => go("q1")} id="cta-start">Iniciar JÁ a Minha Simulação Gratuita →</button>
          <p className="micro-text" style={{ marginTop: "0.75rem" }}>Sem compromisso · Resultado imediato</p>
        </section>
      )}

      {/* ═══ QUIZ Q1-Q3 ═══ */}
      {step === "q1" && (
        <section className="step-view step-centered animate-step" id="step-q1">
          <Logo size="sm" />
          <div className="step-header"><span className="step-number">Pergunta 1 de 3</span><h2 className="step-question">Quanto capital tem disponível para investir?</h2></div>
          <div className="step-content"><div className="options-grid stagger-children">
            {CAPITAL_OPTIONS.map(o => (<button key={o.value} className={`option-card${capital === o.value ? " selected" : ""}`} onClick={() => selectCapital(o.value)}><span className="option-indicator" /><div><div className="option-label">{o.label}</div><div className="option-sublabel">{o.sub}</div></div></button>))}
          </div></div>
        </section>
      )}
      {step === "q2" && (
        <section className="step-view step-centered animate-step" id="step-q2">
          <Logo size="sm" />
          <div className="step-header"><span className="step-number">Pergunta 2 de 3</span><h2 className="step-question">Quando precisa de ver o retorno?</h2></div>
          <div className="step-content"><div className="options-grid stagger-children">
            {HORIZON_OPTIONS.map(o => (<button key={o.value} className={`option-card${horizon === o.value ? " selected" : ""}`} onClick={() => selectHorizon(o.value)}><span className="option-indicator" /><div><div className="option-label">{o.label}</div><div className="option-sublabel">{o.sub}</div></div></button>))}
          </div></div>
        </section>
      )}
      {step === "q3" && (
        <section className="step-view step-centered animate-step" id="step-q3">
          <Logo size="sm" />
          <div className="step-header"><span className="step-number">Pergunta 3 de 3</span><h2 className="step-question">Como prefere gerir o seu investimento?</h2></div>
          <div className="step-content"><div className="options-grid stagger-children">
            {MINDSET_OPTIONS.map(o => (<button key={o.value} className={`option-card${mindset === o.value ? " selected" : ""}`} onClick={() => selectMindset(o.value)}><span className="option-indicator" /><div><div className="option-label">{o.label}</div><div className="option-sublabel">{o.sub}</div></div></button>))}
          </div></div>
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
            <button className="btn-next" onClick={() => go("analysis")}>📊 Ver a Análise Completa do Mercado →</button>
            <WaLink id="wa-results" />
          </div>
        </section>
      )}

      {/* ═══ STEP 3 — ANALYSIS ═══ */}
      {step === "analysis" && (
        <section className="step-view step-scroll animate-step" id="step-analysis">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">📍 Porquê Aveiro? Porquê agora?</h2>
            <p className="body-text" style={{ marginBottom: "1rem" }}>Os investidores mais inteligentes já estão a movimentar-se. Estes são os factos:</p>
            <ul className="checklist stagger-children">
              <li className="checklist-item"><span className="checklist-icon">✅</span>Maior valorização imobiliária de Portugal — e a acelerar</li>
              <li className="checklist-item"><span className="checklist-icon">✅</span>Procura internacional recorde — stock a esgotar rapidamente</li>
              <li className="checklist-item"><span className="checklist-icon">✅</span>Tech hub + universidade = emprego e talento a crescer</li>
              <li className="checklist-item"><span className="checklist-icon">✅</span>Oferta residencial criticamente baixa — preços vão subir mais</li>
              <li className="checklist-item"><span className="checklist-icon">✅</span>Rentabilidade consistentemente acima da média nacional</li>
            </ul>
            <div className="spacer-lg" />
            <h2 className="section-title">⚠️ A maioria dos investidores <span style={{ color: "#e85d5d" }}>perde dinheiro</span></h2>
            <p className="body-text" style={{ marginBottom: "1rem" }}>Não cometa estes erros. Saiba o que separa quem ganha de quem perde:</p>
            <ul className="insight-list stagger-children">
              <li className="insight-item"><span className="x-icon-lg">✕</span><span className="insight-text">Compram caro — sem análise real do valor do imóvel</span></li>
              <li className="insight-item"><span className="x-icon-lg">✕</span><span className="insight-text">Subestimam custos — obras e imprevistos destroem a margem</span></li>
              <li className="insight-item"><span className="x-icon-lg">✕</span><span className="insight-text">Perdem controlo — prazos derrapam, orçamentos explodem</span></li>
              <li className="insight-item"><span className="x-icon-lg">✕</span><span className="insight-text">Vendem mal — timing errado, sem comprador, sem liquidez</span></li>
            </ul>
            <button className="btn-next" onClick={() => go("strategy")}>🎯 Ver as Recomendações Para Si →</button>
            <WaLink id="wa-analysis" />
          </div>
        </section>
      )}

      {/* ═══ STEP 4 — RECOMMENDATIONS ═══ */}
      {step === "strategy" && (
        <section className="step-view step-scroll animate-step" id="step-strategy">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">🎯 Recomendações Para Si</h2>
            <p className="body-text" style={{ marginBottom: "1.25rem" }}>Com base no seu perfil, estas são as nossas recomendações concretas:</p>

            <div className="rec-card">
              <span className="rec-icon">1️⃣</span>
              <div>
                <h3 className="rec-title">Invista apenas em ofertas fora de mercado</h3>
                <p className="rec-text">Os melhores negócios em Aveiro nunca chegam aos portais. São negociados em privado, antes de entrar no mercado público. Só assim consegue comprar abaixo do valor real.</p>
              </div>
            </div>
            <div className="rec-card">
              <span className="rec-icon">2️⃣</span>
              <div>
                <h3 className="rec-title">Aposte em reconversão de imóveis com ciclos rápidos</h3>
                <p className="rec-text">Comprar, reabilitar e vender em ciclos curtos é a estratégia com melhor relação retorno/risco em Aveiro. Evite projetos longos sem equipa estruturada.</p>
              </div>
            </div>
            <div className="rec-card">
              <span className="rec-icon">3️⃣</span>
              <div>
                <h3 className="rec-title">Trabalhe com quem conhece o mercado local</h3>
                <p className="rec-text">Sem rede no terreno, perde oportunidades e comete erros caros. Ter uma equipa com operações ativas em Aveiro é a diferença entre lucrar e perder.</p>
              </div>
            </div>
            <div className="rec-card">
              <span className="rec-icon">4️⃣</span>
              <div>
                <h3 className="rec-title">Proteja o seu capital antes de pensar em retorno</h3>
                <p className="rec-text">Cada operação deve ser estruturada com margem de segurança. O capital tem de estar protegido primeiro — o retorno vem a seguir, de forma natural.</p>
              </div>
            </div>

            <div className="spacer-lg" />
            <div className="solution-block">
              <Logo size="sm" />
              <h3 className="section-title">É exatamente isto que fazemos</h3>
              <p className="body-text-lg">A Silvermont Capital opera exclusivamente com <strong>ofertas fora de mercado em Aveiro</strong>. A nossa metodologia: reconversão inteligente, ciclos rápidos, retornos acima da média, risco controlado.</p>
              <p className="body-text-lg" style={{ marginTop: "0.6rem", color: "var(--gold-light)" }}>Cada recomendação acima é o que praticamos diariamente. Trabalhamos apenas com investidores qualificados.</p>
            </div>

            <button className="btn-next" onClick={() => go("final")}>🔑 Ver Oportunidades Exclusivas →</button>
            <WaLink id="wa-strategy" />
          </div>
        </section>
      )}

      {/* ═══ STEP 5 — FINAL ═══ */}
      {step === "final" && (
        <section className="step-view step-centered animate-step" id="step-final">
          <Logo size="lg" onClick={restart} />
          <div className="step-inner" style={{ textAlign: "center", maxWidth: "520px" }}>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Oportunidades Exclusivas <span className="gold-highlight">Fora de Mercado</span> em Aveiro
            </h2>
            <p className="body-text-lg" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              Imóveis que nunca chegam aos portais. Operações validadas. Retornos acima da média.
            </p>
            <p className="urgency-text">⚡ Vagas limitadas por trimestre — apenas investidores qualificados</p>
            <div style={{ marginTop: "1.25rem" }}>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-final-wa" id="wa-final">
                <WaIcon s={22} />
                <span>Receber Oportunidades Fora de Mercado</span>
              </a>
            </div>
            <p className="micro-text" style={{ marginTop: "1rem" }}>Resposta em menos de 2h · Sem compromisso · Gratuito</p>
            <button className="btn-save" onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); }}>
              {copied ? "✓ Link copiado!" : "📎 Guardar link para consultar depois"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
