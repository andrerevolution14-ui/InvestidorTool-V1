"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import ProgressBar from "@/components/ProgressBar";
import { savePartialLeadAction, saveCompleteLeadAction, upgradeLeadAction } from "./actions";

type Step = "hero" | "q1" | "q2" | "q3" | "processing" | "results" | "anchoring" | "rational" | "analysis" | "strategy" | "presentation" | "final";

const SESSION_KEY = "silvermont_funnel";
const WA_NUM = "351XXXXXXXXX";
const WA_MSG = encodeURIComponent("Ol├í, completei a simula├º├úo e gostaria de receber oportunidades fora de mercado em Aveiro.");
const WA_URL = `https://wa.me/${WA_NUM}?text=${WA_MSG}`;

function trackPixel(event: string, data?: any) {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", event, data);
  }
}

const CAPITAL_OPTIONS = [
  { value: "under_100k", label: "Menos de Ôé¼100.000", sub: "Entrada estrat├®gica", avg: 75000 },
  { value: "100k_300k", label: "Ôé¼100.000 ÔÇô Ôé¼300.000", sub: "Capital s├│lido", avg: 200000 },
  { value: "300k_800k", label: "Ôé¼300.000 ÔÇô Ôé¼800.000", sub: "Opera├º├Áes de escala", avg: 500000 },
  { value: "800k_plus", label: "Mais de Ôé¼800.000", sub: "Capital institucional", avg: 1000000 },
];
const HORIZON_OPTIONS = [
  { value: "short", label: "Retorno r├ípido", sub: "At├® 12 meses" },
  { value: "medium", label: "Paci├¬ncia moderada", sub: "1 a 3 anos" },
  { value: "long", label: "Longo prazo", sub: "3+ anos" },
];
const MINDSET_OPTIONS = [
  { value: "passive", label: "Investir e n├úo me preocupar", sub: "Totalmente delegado" },
  { value: "active", label: "Gosto de acompanhar e decidir", sub: "Envolvido no processo" },
  { value: "hybrid", label: "Acompanhar com equipa profissional", sub: "Visibilidade total, execu├º├úo delegada" },
];

function fmt(n: number) { return "Ôé¼" + n.toLocaleString("pt-PT"); }
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

/* WA pill link ÔÇô visible but not green, used in steps 2-4 */
function WaLink({ id }: { id: string }) {
  const handleClick = () => trackPixel("Contact", { content_name: "whatsapp_pill", content_category: "lead_generation" });
  return <div style={{ textAlign: "center", marginTop: "0.75rem" }}><a href={WA_URL} target="_blank" rel="noopener noreferrer" className="wa-pill" id={id} onClick={handleClick}><WaIcon s={15} /><span>Receber oportunidades fora de mercado</span></a></div>;
}

const SCROLL_STEPS: Step[] = ["results", "anchoring", "rational", "analysis", "strategy", "presentation"];

export default function Home() {
  const [step, setStep] = useState<Step>("hero");
  const [capital, setCapital] = useState("");
  const [horizon, setHorizon] = useState("");
  const [mindset, setMindset] = useState("");
  const [profile, setProfile] = useState("");
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [exiting, setExiting] = useState(false);
  // Refs for Supabase lead tracking
  const metaParamsRef = useRef<{
    name?: string; email?: string; phone?: string;
    fb_lead_id?: string; fbclid?: string;
    utm_source?: string; utm_campaign?: string;
  }>({});
  const leadIdRef = useRef<number | null>(null);  // set after partial insert (timer fired)
  const timerFiredRef = useRef(false);               // true after the 10-min timeout fires
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 1. Parse Meta Instant Form params ÔÇö stored in memory only.
    const params = new URLSearchParams(window.location.search);
    metaParamsRef.current = {
      name: params.get("full_name") || params.get("first_name") || params.get("name") || undefined,
      email: params.get("email") || undefined,
      phone: params.get("phone_number") || params.get("phone") || undefined,
      fb_lead_id: params.get("lead_id") || params.get("fb_lead_id") || undefined,
      fbclid: params.get("fbclid") || undefined,
      utm_source: params.get("utm_source") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
    };

    // 2. Start 10-minute timer ÔÇö inserts partial lead if Q3 is never completed.
    timerRef.current = setTimeout(() => {
      timerFiredRef.current = true;
      savePartialLeadAction(metaParamsRef.current)
        .then(({ id }) => { if (id) leadIdRef.current = id; })
        .catch(() => { });
    }, 10 * 60 * 1000); // 10 minutes

    setReady(true);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
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
    setShowScrollHint(false);
    setExiting(true);
    setTimeout(() => {
      setStep(s);
      setExiting(false);
      window.scrollTo(0, 0);
    }, 260);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    trackPixel("CustomizeProduct", { content_name: "select_capital", content_value: v });
    setTimeout(() => go("q2"), 200);
  }, [go]);

  const selectHorizon = useCallback((v: string) => {
    setHorizon(v);
    trackPixel("CustomizeProduct", { content_name: "select_horizon", content_value: v });
    setTimeout(() => go("q3"), 200);
  }, [go]);

  const selectMindset = useCallback(async (v: string) => {
    setMindset(v);
    trackPixel("SubmitApplication", { content_name: "complete_quiz", mindset: v });
    setTimeout(async () => {
      go("processing");
      const capitalLabel = CAPITAL_OPTIONS.find(o => o.value === capital)?.label || capital;
      const horizonLabel = HORIZON_OPTIONS.find(o => o.value === horizon)?.label || horizon;
      const mindsetLabel = MINDSET_OPTIONS.find(o => o.value === v)?.label || v;

      if (timerFiredRef.current && leadIdRef.current) {
        // Timer already fired ÔÇö partial row exists ÔåÆ upgrade it to complete
        upgradeLeadAction(leadIdRef.current, {
          ...metaParamsRef.current,
          capital: capitalLabel,
          horizonte: horizonLabel,
          preferencia: mindsetLabel,
        }).catch(() => { });
      } else {
        // Timer hasn't fired yet ÔÇö cancel it and insert a complete row directly
        if (timerRef.current) clearTimeout(timerRef.current);
        saveCompleteLeadAction({
          ...metaParamsRef.current,
          capital: capitalLabel,
          horizonte: horizonLabel,
          preferencia: mindsetLabel,
        }).catch(() => { });
      }
      setTimeout(() => {
        trackPixel("ViewContent", { content_name: "view_results" });
        go("results");
      }, 1800);
    }, 200);
  }, [capital, horizon, go]);

  const returns = useMemo(() => getReturns(capital, horizon), [capital, horizon]);
  const capLabel = CAPITAL_OPTIONS.find(o => o.value === capital)?.label || "";
  const userStepInfo = getUserStep(step);

  // Show scroll hint on long pages, hide when user scrolls
  useEffect(() => {
    if (SCROLL_STEPS.includes(step)) {
      setShowScrollHint(true);
      const hide = () => {
        if (window.scrollY > 80) {
          setShowScrollHint(false);
          window.removeEventListener("scroll", hide);
        }
      };
      window.addEventListener("scroll", hide, { passive: true });
      return () => window.removeEventListener("scroll", hide);
    } else {
      setShowScrollHint(false);
    }
  }, [step]);

  if (!ready) return null;

  const centerCls = `step-view step-centered animate-step${exiting ? " step-exit" : ""}`;
  const scrollCls = `step-view step-scroll animate-step${exiting ? " step-exit" : ""}`;

  return (
    <main className="funnel">
      {step !== "hero" && step !== "processing" && <ProgressBar progress={getProgress(step)} stepInfo={userStepInfo} />}

      {/* ÔöÇÔöÇ Scroll Hint ÔöÇÔöÇ */}
      {showScrollHint && (
        <div className="scroll-hint" aria-hidden="true">
          <div className="scroll-hint-ring">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <span className="scroll-hint-label">scroll</span>
        </div>
      )}

      {/* ÔòÉÔòÉÔòÉ HERO ÔòÉÔòÉÔòÉ */}
      {step === "hero" && (
        <section className={centerCls} id="hero">
          <h1 className="headline-hero">Aveiro est├í a explodir.<br /><span className="gold-highlight">O seu dinheiro devia estar l├í.</span></h1>
          <p className="subheadline">+12% valoriza├º├úo anual. Procura recorde. Stock limitado. Descubra em 30 segundos se faz sentido para si.</p>

          <div className="context-image-break" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <img src="/aveiro-1.png" alt="Aveiro" className="context-img-full" loading="eager" fetchPriority="high" />
          </div>

          <div className="hero-value-list">
            <div className="hero-value-item"><span className="hv-icon">­ƒôè</span><span>Simula├º├úo personalizada de retorno</span></div>
            <div className="hero-value-item"><span className="hv-icon">­ƒƒó</span><span>Guia: Deve ou n├úo investir em Aveiro</span></div>
            <div className="hero-value-item"><span className="hv-icon">­ƒöæ</span><span>Acesso a oportunidades fora de mercado</span></div>
          </div>
          <button className="btn-primary" onClick={() => { trackPixel("ViewContent", { content_name: "start_quiz_button" }); go("q1"); }} id="cta-start">Iniciar a Minha Simula├º├úo Gratuita ÔåÆ</button>
          <p className="micro-text" style={{ marginTop: "0.75rem" }}>Sem compromisso ┬À Resultado imediato</p>
        </section>
      )}

      {/* ÔòÉÔòÉÔòÉ QUIZ Q1-Q4 ÔòÉÔòÉÔòÉ */}
      {step === "q1" && (
        <section className={centerCls} id="step-q1">
          <Logo size="sm" />
          <div className="step-header"><span className="step-number">Pergunta 1 de 3</span><h2 className="step-question">Quanto capital tem dispon├¡vel para investir?</h2></div>
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
        <section className={centerCls} id="step-q2">
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
        <section className={centerCls} id="step-q3">
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

      {/* ÔòÉÔòÉÔòÉ PROCESSING ÔòÉÔòÉÔòÉ */}
      {step === "processing" && (
        <section className={centerCls} id="step-processing">
          <Logo size="sm" />
          <div className="processing-bars">{[1, 2, 3, 4, 5].map(i => <div key={i} className="processing-bar" />)}</div>
          <p className="processing-text">A analisar o seu perfil de investidor...</p>
        </section>
      )}

      {/* ÔòÉÔòÉÔòÉ STEP 2 ÔÇö RESULTS ÔòÉÔòÉÔòÉ */}
      {step === "results" && (
        <section className={scrollCls} id="step-results">
          <Logo size="md" />
          <div className="step-inner">
            <div className="verdict-card verdict-green">
              <div className="verdict-icon">Ô£ô</div>
              <div>
                <h2 className="verdict-title">Sim. Deve investir em Aveiro.</h2>
                <p className="verdict-text">Com <strong>{capLabel}</strong>, est├í posicionado para capitalizar o boom. Aveiro vive procura sem precedentes ÔÇö investidores, n├│madas digitais, fam├¡lias. Todos disputam stock cada vez mais escasso.</p>
                <p className="verdict-text" style={{ marginTop: "0.6rem" }}>Oferta qualificada? <strong>Criticamente baixa.</strong> Os melhores neg├│cios nunca chegam aos portais. S├úo fechados antes. <strong>Quem entra agora, entra cedo. Quem espera, paga o dobro.</strong></p>
              </div>
            </div>
            <div className="verdict-card verdict-red">
              <div className="verdict-icon">Ô£ò</div>
              <div>
                <h3 className="verdict-title-sm">N├úo invista se...</h3>
                <ul className="verdict-list">
                  <li><span className="x-icon">Ô£ò</span>N├úo tem capital realmente dispon├¡vel</li>
                  <li><span className="x-icon">Ô£ò</span>Espera lucros sem estrutura profissional</li>
                  <li><span className="x-icon">Ô£ò</span>N├úo quer trabalhar com operadores no terreno</li>
                </ul>
              </div>
            </div>
            <div className="spacer" />
            <span className="label-text">­ƒôè A Sua Simula├º├úo de Retorno</span>
            <div className="result-range-group">
              <div className="result-range">
                <div className="result-range-header"><span className="result-range-label">­ƒôê Cen├írio Realista</span><span className="result-range-value">{returns.realistic.minP}% ÔÇô {returns.realistic.maxP}%</span></div>
                <div className="result-bar-track"><div className="result-bar-fill typical" style={{ width: `${(returns.realistic.maxP / 25) * 100}%` }} /></div>
                <div className="result-euro">{fmt(returns.realistic.minE)} ÔÇô {fmt(returns.realistic.maxE)} por ano</div>
              </div>
              <div className="result-range">
                <div className="result-range-header"><span className="result-range-label">­ƒÜÇ Cen├írio Otimizado</span><span className="result-range-value">{returns.optimized.minP}% ÔÇô {returns.optimized.maxP}%</span></div>
                <div className="result-bar-track"><div className="result-bar-fill upper" style={{ width: `${(returns.optimized.maxP / 25) * 100}%` }} /></div>
                <div className="result-euro">{fmt(returns.optimized.minE)} ÔÇô {fmt(returns.optimized.maxE)} por ano</div>
              </div>
            </div>
            <p className="result-note">Baseado em m├®dias de mercado na regi├úo de Aveiro.</p>
            <button className="btn-next" onClick={() => go("anchoring")}>Ver An├ílise de Realidade ÔåÆ</button>
            <WaLink id="wa-results" />
          </div>
        </section>
      )}

      {/* ÔòÉÔòÉÔòÉ STEP 2.1 ÔÇö ANCHORING ÔòÉÔòÉÔòÉ */}
      {step === "anchoring" && (
        <section className={scrollCls} id="step-anchoring">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">Realidade pr├ítica do mercado</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">­ƒÆ░</div>
                <p className="info-text">Retornos variam mais pela <strong>compra</strong> do que pela valoriza├º├úo</p>
              </div>
              <div className="info-card">
                <div className="info-icon">ÔÅ▒´©Å</div>
                <p className="info-text">Tempo impacta margens mais do que pre├ºo de venda</p>
              </div>
              <div className="info-card">
                <div className="info-icon">­ƒôï</div>
                <p className="info-text">Atrasos administrativos alteram completamente proje├º├Áes</p>
              </div>
              <div className="info-card">
                <div className="info-icon">­ƒÄ»</div>
                <p className="info-text">Execu├º├úo pesa mais do que cen├írio te├│rico</p>
              </div>
            </div>

            <div className="context-image-break">
              <img src="/aveiro-2.jpg" alt="Aveiro Context" className="context-img-full" loading="lazy" />
            </div>

            <button className="btn-next" onClick={() => go("rational")}>Analisar Vari├íveis Cr├¡ticas ÔåÆ</button>
            <WaLink id="wa-anchoring" />
          </div>
        </section>
      )}

      {/* ÔòÉÔòÉÔòÉ STEP 2.2 ÔÇö RATIONAL ÔòÉÔòÉÔòÉ */}
      {step === "rational" && (
        <section className={scrollCls} id="step-rational">
          <Logo size="md" />
          <div className="step-inner">

            {/* Asymmetric staggered layout */}
            <h2 className="section-title" style={{ textAlign: "left" }}>Vari├íveis que definem viabilidade real</h2>
            <div className="staggered-grid">
              <div className="stagger-card stagger-left">
                <div className="stagger-icon">­ƒÆº</div>
                <div>
                  <h4 className="stagger-title">Liquidez de sa├¡da</h4>
                  <p className="stagger-desc">Capacidade de vender rapidamente sem desvaloriza├º├úo. Mercados il├¡quidos prendem capital.</p>
                </div>
              </div>
              <div className="stagger-card stagger-right">
                <div className="stagger-icon">­ƒøí´©Å</div>
                <div>
                  <h4 className="stagger-title">Margem de conting├¬ncia</h4>
                  <p className="stagger-desc">Reserva para imprevistos. Opera├º├Áes sem buffer financeiro colapsam ao primeiro obst├ículo.</p>
                </div>
              </div>
              <div className="stagger-card stagger-left">
                <div className="stagger-icon">­ƒôè</div>
                <div>
                  <h4 className="stagger-title">Estructura fiscal</h4>
                  <p className="stagger-desc">Como estrutura a opera├º├úo define quanto fica no bolso. Fiscalidade mal planeada corroi 30%+ do retorno.</p>
                </div>
              </div>
              <div className="stagger-card stagger-right">
                <div className="stagger-icon">ÔÅ│</div>
                <div>
                  <h4 className="stagger-title">Sensibilidade ao tempo</h4>
                  <p className="stagger-desc">Cada m├¬s extra tem custos (financiamento, oportunidade). Projetos sens├¡veis ao tempo exigem controlo rigoroso.</p>
                </div>
              </div>
              <div className="stagger-card stagger-left">
                <div className="stagger-icon">­ƒÅù´©Å</div>
                <div>
                  <h4 className="stagger-title">Viabilidade urban├¡stica</h4>
                  <p className="stagger-desc">Licen├ºas, PDM, restri├º├Áes. O que parece vi├ível pode estar bloqueado por anos na C├ómara.</p>
                </div>
              </div>
              <div className="stagger-card stagger-right">
                <div className="stagger-icon">ÔÜû´©Å</div>
                <div>
                  <h4 className="stagger-title">Rela├º├úo risco / capital / dura├º├úo</h4>
                  <p className="stagger-desc">Quanto risco assume, quanto capital imobiliza, por quanto tempo. O equil├¡brio define se vale a pena.</p>
                </div>
              </div>
            </div>

            <div className="context-image-break">
              <img src="/aveiro-3.jpg" alt="Aveiro Analysis" className="context-img-full" loading="lazy" />
            </div>

            <div className="spacer-lg" />

            {/* Timeline vertical flow */}
            <h2 className="section-title" style={{ textAlign: "right" }}>Onde opera├º├Áes perdem margem</h2>
            <div className="timeline-flow">
              <div className="timeline-item">
                <div className="timeline-marker">­ƒÆ©</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Custos subestimados</h4>
                  <p className="timeline-desc">Or├ºamentos irrealistas levam a margens negativas</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">­ƒôØ</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Atrasos de licenciamento</h4>
                  <p className="timeline-desc">Cada m├¬s de atraso corr├│i a rentabilidade</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">­ƒö¿</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Altera├º├Áes de obra</h4>
                  <p className="timeline-desc">Imprevistos que disparam custos</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">ÔÜá´©Å</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Problemas de execu├º├úo</h4>
                  <p className="timeline-desc">Falta de controlo no terreno</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">­ƒôë</div>
                <div className="timeline-content">
                  <h4 className="timeline-title">Sa├¡da abaixo do esperado</h4>
                  <p className="timeline-desc">Mercado muda ou avalia├º├úo foi otimista</p>
                </div>
              </div>
            </div>
            <button className="btn-next" onClick={() => go("analysis")}>Porqu├¬ Aveiro Agora? ÔåÆ</button>
            <WaLink id="wa-rational" />
          </div>
        </section>
      )}

      {/* ÔòÉÔòÉÔòÉ STEP 3 ÔÇö ANALYSIS ÔòÉÔòÉÔòÉ */}
      {step === "analysis" && (
        <section className={scrollCls} id="step-analysis">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">­ƒôì Porqu├¬ Aveiro? Porqu├¬ agora?</h2>
            <p className="body-text" style={{ marginBottom: "1rem" }}>Investidores inteligentes j├í se movimentaram:</p>
            <ul className="checklist stagger-children">
              <li className="checklist-item"><span className="checklist-icon">Ô£à</span>Maior valoriza├º├úo imobili├íria ÔÇö em acelera├º├úo</li>
              <li className="checklist-item"><span className="checklist-icon">Ô£à</span>Procura internacional recorde</li>
              <li className="checklist-item"><span className="checklist-icon">Ô£à</span>Tech hub + universidade a crescer</li>
              <li className="checklist-item"><span className="checklist-icon">Ô£à</span>Oferta residencial criticamente baixa</li>
            </ul>
            <div className="spacer-lg" />
            <h2 className="section-title">ÔÜá´©Å A maioria perde dinheiro</h2>
            <ul className="insight-list stagger-children">
              <li className="insight-item"><span className="x-icon-lg">Ô£ò</span><span className="insight-text">Compram caro ÔÇö sem an├ílise de valor real</span></li>
              <li className="insight-item"><span className="x-icon-lg">Ô£ò</span><span className="insight-text">Subestimam custos de obra e imprevistos</span></li>
              <li className="insight-item"><span className="x-icon-lg">Ô£ò</span><span className="insight-text">Perdem controlo sobre prazos e or├ºamentos</span></li>
            </ul>
            <button className="btn-next" onClick={() => go("strategy")}>Ver Recomenda├º├Áes Estrat├®gicas ÔåÆ</button>
            <WaLink id="wa-analysis" />
          </div>
        </section>
      )}

      {/* ÔòÉÔòÉÔòÉ STEP 4 ÔÇö RECOMMENDATIONS ÔòÉÔòÉÔòÉ */}
      {step === "strategy" && (
        <section className={scrollCls} id="step-strategy">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">Recomenda├º├Áes Estrat├®gicas</h2>
            <div className="rec-card">
              <span className="rec-icon">1</span>
              <div>
                <h3 className="rec-title">Invista em ofertas fora de mercado</h3>
                <p className="rec-text">Os melhores neg├│cios em Aveiro s├úo negociados em privado, antes de entrar no mercado p├║blico.</p>
              </div>
            </div>
            <div className="rec-card">
              <span className="rec-icon">2</span>
              <div>
                <h3 className="rec-title">Foco em reconvers├úo r├ípida</h3>
                <p className="rec-text">Ciclos curtos = melhor rela├º├úo retorno/risco. Evite projetos longos sem equipa local.</p>
              </div>
            </div>
            <div className="rec-card">
              <span className="rec-icon">3</span>
              <div>
                <h3 className="rec-title">Capital protegido primeiro</h3>
                <p className="rec-text">Margem de seguran├ºa em cada opera├º├úo. Capital protegido {'>'} retorno especulativo.</p>
              </div>
            </div>

            <button className="btn-next" onClick={() => go("presentation")}>Ver Abordagem no Terreno ÔåÆ</button>
            <WaLink id="wa-strategy" />
          </div>
        </section>
      )}

      {/* ÔòÉÔòÉÔòÉ STEP 4.1 ÔÇö PRESENTATION ÔòÉÔòÉÔòÉ */}
      {step === "presentation" && (
        <section className={scrollCls} id="step-presentation">
          <Logo size="md" />
          <div className="step-inner">

            <h2 className="section-title">A nossa abordagem operacional em Aveiro</h2>
            <div className="approach-detailed">
              <div className="approach-item">
                <div className="approach-header">
                  <span className="approach-icon">­ƒöÄ</span>
                  <h3 className="approach-title">Sele├º├úo criteriosa</h3>
                </div>
                <p className="approach-desc">Apenas ativos com potencial comprovado. Fora de mercado. Zonas de valoriza├º├úo acelerada. Filtramos 95% antes de apresentar.</p>
              </div>
              <div className="approach-item">
                <div className="approach-header">
                  <span className="approach-icon">­ƒÅø</span>
                  <h3 className="approach-title">Estrutura├º├úo conservadora</h3>
                </div>
                <p className="approach-desc">Capital protegido primeiro. Retorno depois. Margens de seguran├ºa em todos os cen├írios ÔÇö mesmo nos pessimistas.</p>
              </div>
              <div className="approach-item">
                <div className="approach-header">
                  <span className="approach-icon">­ƒøí</span>
                  <h3 className="approach-title">Margens de seguran├ºa</h3>
                </div>
                <p className="approach-desc">Buffer para imprevistos, atrasos, corre├º├Áes de mercado. Nunca trabalhamos com or├ºamentos justos.</p>
              </div>
              <div className="approach-item">
                <div className="approach-header">
                  <span className="approach-icon">­ƒù║</span>
                  <h3 className="approach-title">Planeamento de sa├¡da</h3>
                </div>
                <p className="approach-desc">Estrat├®gia de sa├¡da definida antes da compra. Sabemos a quem vender, quando, por quanto ÔÇö antes de entrar.</p>
              </div>
              <div className="approach-item">
                <div className="approach-header">
                  <span className="approach-icon">Ô£ô</span>
                  <h3 className="approach-title">Controlo de execu├º├úo</h3>
                </div>
                <p className="approach-desc">Equipa local em Aveiro. Acompanhamento semanal: obra, licenciamentos, prazos. Problemas resolvidos antes de escalarem.</p>
              </div>
            </div>

            <div className="context-image-break">
              <img src="/aveiro-4.png" alt="Aveiro Territory" className="context-img-full" loading="lazy" />
            </div>

            <div className="spacer-lg" />

            <div className="user-photo-card">
              <div className="photo-with-logo">
                <img src="/user-photo.jpg" alt="Estrategista" className="user-photo-img" loading="lazy" />
                <img src="/logo-horizontal.png" alt="Silvermont Capital" className="photo-logo-xl" loading="lazy" />
              </div>
              <div className="user-photo-info">
                <span className="user-photo-name">Estrategista de Opera├º├Áes</span>
                <span className="user-photo-tag">Silvermont Capital</span>
              </div>
            </div>

            <div className="solution-block">
              <h3 className="section-title">Metodologia Silvermont</h3>
              <p className="body-text-lg">N├úo trabalhamos como os outros. <strong>Zero portais. Zero ofertas p├║blicas.</strong></p>
              <p className="body-text-lg" style={{ marginTop: "0.75rem" }}>Cada opera├º├úo ├® estruturada ao detalhe. Cada vari├ível, controlada. Cada risco, mitigado. <strong>N├úo vendemos sonhos. Entregamos opera├º├Áes blindadas.</strong></p>
              <p className="body-text-lg" style={{ marginTop: "0.75rem" }}>Reconvers├úo inteligente. Ciclos r├ípidos. Risco controlado. <strong>Esta ├® a diferen├ºa entre amadores e operadores profissionais.</strong></p>
            </div>

            <button className="btn-next" onClick={() => go("final")}>Aceder ├ás Oportunidades Exclusivas ÔåÆ</button>
            <WaLink id="wa-presentation" />
          </div>
        </section>
      )}

      {/* ÔòÉÔòÉÔòÉ STEP 5 ÔÇö FINAL ÔòÉÔòÉÔòÉ */}
      {step === "final" && (
        <section className={centerCls} id="step-final">
          <Logo size="lg" onClick={restart} />
          <div className="step-inner" style={{ textAlign: "center", maxWidth: "520px" }}>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Oportunidades <span className="gold-highlight">Fora de Mercado</span>
            </h2>
            <p className="body-text-lg" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              Im├│veis que nunca chegam aos portais. Opera├º├Áes validadas.
            </p>
            <p className="urgency-text">ÔÜí Apenas investidores qualificados</p>

            <div style={{ marginTop: "2.5rem" }}>
              <div className="cta-context-text">Comunica├º├úo direta. Sem envios massificados.</div>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-final-wa" id="wa-final" onClick={() => trackPixel("Contact", { content_name: "final_whatsapp_button" })}>
                <WaIcon s={22} />
                <span>Receber Oportunidades Selecionadas</span>
              </a>
            </div>
            <button className="btn-save" onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); }}>
              {copied ? "Ô£ô Link copiado!" : "­ƒôÄ Guardar link para consultar depois"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
