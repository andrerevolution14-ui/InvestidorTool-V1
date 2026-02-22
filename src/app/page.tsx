"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";
import { ArrowRight, ChevronDown, Check, X, TrendingUp, Shield, BarChart3, Clock, Layout, Zap, MessageCircle, Copy, ExternalLink, Info, AlertTriangle } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { savePartialLeadAction, saveCompleteLeadAction, upgradeLeadAction } from "./actions";

const PAGE_TRANSITION: any = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
};

const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

type Step = "hero" | "q1" | "q2" | "q3" | "processing" | "results" | "anchoring" | "rational" | "analysis" | "strategy" | "presentation" | "final";

const SESSION_KEY = "silvermont_funnel";
const WA_NUM = "351XXXXXXXXX";
const WA_MSG = encodeURIComponent("Olá, completei a simulação e gostaria de receber oportunidades fora de mercado em Aveiro.");
const WA_URL = `https://wa.me/${WA_NUM}?text=${WA_MSG}`;

function trackPixel(event: string, data?: any) {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", event, data);
  }
}

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
    <motion.img
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      src="/logo-dark-hz.png"
      alt="Silvermont Capital"
      className={`logo-img logo-blend logo-${size}`}
      draggable={false}
    />
  );
  if (onClick) return <div className="step-logo"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="logo-clickable" onClick={onClick}>{inner}</motion.button></div>;
  return <div className="step-logo">{inner}</div>;
}

/* WA pill link – visible but not green, used in steps 2-4 */
function WaLink({ id }: { id: string }) {
  const handleClick = () => trackPixel("Contact", { content_name: "whatsapp_pill" });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ textAlign: "center", marginTop: "1rem" }}>
      <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="wa-pill" id={id} onClick={handleClick}>
        <MessageCircle size={16} />
        <span>Receber oportunidades em Aveiro</span>
      </a>
    </motion.div>
  );
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
    // 1. Parse Meta Instant Form params — stored in memory only.
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

    // Ensure state is clean on mount
    setCapital("");
    setHorizon("");
    setMindset("");
    setStep("hero");

    // 2. Start 10-minute timer — inserts partial lead if Q3 is never completed.
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
    setStep(s);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
        // Timer already fired — partial row exists → upgrade it to complete
        upgradeLeadAction(leadIdRef.current, {
          ...metaParamsRef.current,
          capital: capitalLabel,
          horizonte: horizonLabel,
          preferencia: mindsetLabel,
        }).catch(() => { });
      } else {
        // Timer hasn't fired yet — cancel it and insert a complete row directly
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

  return (
    <main className="funnel">
      <AnimatePresence mode="wait">
        {step !== "hero" && step !== "processing" && (
          <ProgressBar key="progress" progress={getProgress(step)} stepInfo={userStepInfo} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "hero" && (
          <motion.section
            key="hero"
            {...PAGE_TRANSITION}
            className="step-view step-centered"
            id="hero"
          >
            <h1 className="headline-hero">Aveiro está a explodir.<br /><span className="gold-highlight">O seu dinheiro devia estar lá.</span></h1>
            <p className="subheadline">+12% valorização anual. Procura recorde. Stock limitado. Descubra em 30 segundos se faz sentido para si.</p>

            <div className="context-image-break" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <img src="/aveiro-1.png" alt="Aveiro" className="context-img-full" loading="eager" fetchPriority="high" />
            </div>

            <div className="hero-value-list">
              <motion.div variants={STAGGER_ITEM} initial="hidden" animate="show" className="hero-value-item">
                <span className="hv-icon"><BarChart3 size={20} className="gold-highlight" /></span>
                <span>Simulação personalizada de retorno</span>
              </motion.div>
              <motion.div variants={STAGGER_ITEM} initial="hidden" animate="show" transition={{ delay: 0.1 }} className="hero-value-item">
                <span className="hv-icon"><Shield size={20} className="gold-highlight" /></span>
                <span>Guia: Deve ou não investir em Aveiro</span>
              </motion.div>
              <motion.div variants={STAGGER_ITEM} className="hero-value-item">
                <span className="hv-icon"><ExternalLink size={20} className="gold-highlight" /></span>
                <span>Acesso a oportunidades fora de mercado</span>
              </motion.div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary btn-shimmer"
              onClick={() => { trackPixel("ViewContent", { content_name: "start_quiz_button" }); go("q1"); }}
              id="cta-start"
            >
              Iniciar a Minha Simulação Gratuita <ArrowRight size={20} />
            </motion.button>
            <p className="micro-text" style={{ marginTop: "0.75rem" }}>Sem compromisso · Resultado imediato</p>
          </motion.section>
        )}

        {/* ═══ QUIZ Q1-Q3 ═══ */}
        {step === "q1" && (
          <motion.section key="q1" {...PAGE_TRANSITION} className="step-view step-centered" id="step-q1">
            <Logo size="sm" />
            <div className="step-header"><span className="step-number">Pergunta 1 de 3</span><h2 className="step-question">Quanto capital tem disponível para investir?</h2></div>
            <div className="step-content">
              <motion.div variants={STAGGER_CONTAINER} initial="hidden" animate="show" className="options-grid">
                {CAPITAL_OPTIONS.map(o => (
                  <motion.button
                    variants={STAGGER_ITEM}
                    whileHover={{ x: 5 }}
                    key={o.value}
                    className={`option-card${capital === o.value ? " selected" : ""}`}
                    onClick={() => selectCapital(o.value)}
                  >
                    <span className="option-indicator" />
                    <div>
                      <div className="option-label">{o.label}</div>
                      <div className="option-sublabel">{o.sub}</div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        {step === "q2" && (
          <motion.section key="q2" {...PAGE_TRANSITION} className="step-view step-centered" id="step-q2">
            <Logo size="sm" />
            <div className="step-header"><span className="step-number">Pergunta 2 de 3</span><h2 className="step-question">Quando precisa de ver o retorno?</h2></div>
            <div className="step-content">
              <motion.div variants={STAGGER_CONTAINER} initial="hidden" animate="show" className="options-grid">
                {HORIZON_OPTIONS.map(o => (
                  <motion.button
                    variants={STAGGER_ITEM}
                    whileHover={{ x: 5 }}
                    key={o.value}
                    className={`option-card${horizon === o.value ? " selected" : ""}`}
                    onClick={() => selectHorizon(o.value)}
                  >
                    <span className="option-indicator" />
                    <div>
                      <div className="option-label">{o.label}</div>
                      <div className="option-sublabel">{o.sub}</div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        {step === "q3" && (
          <motion.section key="q3" {...PAGE_TRANSITION} className="step-view step-centered" id="step-q3">
            <Logo size="sm" />
            <div className="step-header"><span className="step-number">Pergunta 3 de 3</span><h2 className="step-question">Como prefere gerir o seu investimento?</h2></div>
            <div className="step-content">
              <motion.div variants={STAGGER_CONTAINER} initial="hidden" animate="show" className="options-grid">
                {MINDSET_OPTIONS.map(o => (
                  <motion.button
                    variants={STAGGER_ITEM}
                    whileHover={{ x: 5 }}
                    key={o.value}
                    className={`option-card${mindset === o.value ? " selected" : ""}`}
                    onClick={() => selectMindset(o.value)}
                  >
                    <span className="option-indicator" />
                    <div>
                      <div className="option-label">{o.label}</div>
                      <div className="option-sublabel">{o.sub}</div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* ═══ PROCESSING ═══ */}
        {step === "processing" && (
          <motion.section key="processing" {...PAGE_TRANSITION} className="step-view step-centered" id="step-processing">
            <Logo size="sm" />
            <div className="processing-bars">
              {[1, 2, 3, 4, 5].map(i => (
                <motion.div
                  key={i}
                  className="processing-bar"
                  animate={{
                    scaleY: [0.5, 1, 0.5],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <p className="processing-text">A analisar o seu perfil de investidor...</p>
          </motion.section>
        )}

        {/* ═══ STEP 2 — RESULTS ═══ */}
        {step === "results" && (
          <motion.section key="results" {...PAGE_TRANSITION} className="step-view step-scroll" id="step-results">
            <Logo size="md" />
            <div className="step-inner">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="verdict-card verdict-green"
              >
                <div className="verdict-icon"><Check className="text-green-500" /></div>
                <div>
                  <h2 className="verdict-title">Sim. Deve investir em Aveiro.</h2>
                  <p className="verdict-text">Com <strong>{capLabel}</strong>, está posicionado para capitalizar o boom. Aveiro vive procura sem precedentes — investidores, nómadas digitais, famílias. Todos disputam stock cada vez mais escasso.</p>
                  <p className="verdict-text" style={{ marginTop: "0.6rem" }}>Oferta qualificada? <strong>Criticamente baixa.</strong> Os melhores negócios nunca chegam aos portais. São fechados antes. <strong>Quem entra agora, entra cedo. Quem espera, paga o dobro.</strong></p>
                </div>
              </motion.div>

              <div className="spacer" />

              <motion.div variants={STAGGER_CONTAINER} initial="hidden" animate="show">
                <span className="label-text">📊 A Sua Simulação de Retorno</span>
                <div className="result-range-group">
                  <motion.div variants={STAGGER_ITEM} className="result-range">
                    <div className="result-range-header">
                      <span className="result-range-label">📈 Cenário Realista</span>
                      <span className="result-range-value">{returns.realistic.minP}% – {returns.realistic.maxP}%</span>
                    </div>
                    <div className="result-bar-track">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(returns.realistic.maxP / 25) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        className="result-bar-fill typical"
                      />
                    </div>
                    <div className="result-euro">{fmt(returns.realistic.minE)} – {fmt(returns.realistic.maxE)} por ano</div>
                  </motion.div>

                  <motion.div variants={STAGGER_ITEM} className="result-range">
                    <div className="result-range-header">
                      <span className="result-range-label">🚀 Cenário Otimizado</span>
                      <span className="result-range-value">{returns.optimized.minP}% – {returns.optimized.maxP}%</span>
                    </div>
                    <div className="result-bar-track">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(returns.optimized.maxP / 25) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 }}
                        className="result-bar-fill upper"
                      />
                    </div>
                    <div className="result-euro">{fmt(returns.optimized.minE)} – {fmt(returns.optimized.maxE)} por ano</div>
                  </motion.div>
                </div>
              </motion.div>

              <div className="verdict-card verdict-red" style={{ marginTop: "1.5rem" }}>
                <div className="verdict-icon"><X className="text-red-500" /></div>
                <div>
                  <h3 className="verdict-title-sm">Não invista se...</h3>
                  <ul className="verdict-list">
                    <li><span className="x-icon"><X size={14} /></span>Não tem capital realmente disponível</li>
                    <li><span className="x-icon"><X size={14} /></span>Espera lucros sem estrutura profissional</li>
                    <li><span className="x-icon"><X size={14} /></span>Não quer trabalhar com operadores no terreno</li>
                  </ul>
                </div>
              </div>

              <motion.p variants={STAGGER_ITEM} initial="hidden" animate="show" transition={{ delay: 1 }} className="result-note">Baseado em médias de mercado na região de Aveiro.</motion.p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-next btn-shimmer"
                onClick={() => go("anchoring")}
              >
                Ver Análise de Realidade <ArrowRight size={18} />
              </motion.button>
              <WaLink id="wa-results" />
            </div>
          </motion.section>
        )}

        {/* ═══ STEP 2.1 — ANCHORING ═══ */}
        {step === "anchoring" && (
          <motion.section key="anchoring" {...PAGE_TRANSITION} className="step-view step-scroll" id="step-anchoring">
            <Logo size="md" />
            <div className="step-inner">
              <h2 className="section-title">Realidade prática do mercado</h2>
              <motion.div variants={STAGGER_CONTAINER} initial="hidden" animate="show" className="info-grid">
                {[
                  { icon: <TrendingUp size={24} />, text: <>Retornos variam mais pela <strong>compra</strong> do que pela valorização</> },
                  { icon: <Clock size={24} />, text: <>Tempo impacta margens mais do que preço de venda</> },
                  { icon: <Layout size={24} />, text: <>Atrasos administrativos alteram completamente projeções</> },
                  { icon: <Zap size={24} />, text: <>Execução pesa mais do que cenário teórico</> }
                ].map((item, i) => (
                  <motion.div variants={STAGGER_ITEM} key={i} className="info-card">
                    <div className="info-icon gold-highlight">{item.icon}</div>
                    <p className="info-text">{item.text}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="context-image-break">
                <img src="/aveiro-2.jpg" alt="Aveiro Context" className="context-img-full" loading="lazy" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-next btn-shimmer"
                onClick={() => go("rational")}
              >
                Analisar Variáveis Críticas <ArrowRight size={18} />
              </motion.button>
              <WaLink id="wa-anchoring" />
            </div>
          </motion.section>
        )}

        {/* ═══ STEP 2.2 — RATIONAL ═══ */}
        {step === "rational" && (
          <motion.section key="rational" {...PAGE_TRANSITION} className="step-view step-scroll" id="step-rational">
            <Logo size="md" />
            <div className="step-inner">
              <h2 className="section-title">Variáveis que definem viabilidade real</h2>
              <motion.div variants={STAGGER_CONTAINER} initial="hidden" animate="show" className="staggered-grid">
                {[
                  { icon: "💧", title: "Liquidez de saída", desc: "Capacidade de vender rapidamente sem desvalorização. Mercados ilíquidos prendem capital.", side: "left" },
                  { icon: "🛡️", title: "Margem de contingência", desc: "Reserva para imprevistos. Operações sem buffer financeiro colapsam ao primeiro obstáculo.", side: "right" },
                  { icon: "📊", title: "Estructura fiscal", desc: "Como estrutura a operação define quanto fica no bolso. Fiscalidade mal planeada corroi 30%+ do retorno.", side: "left" },
                  { icon: "⏳", title: "Sensibilidade ao tempo", desc: "Cada mês extra tem custos (financiamento, oportunidade). Projetos sensíveis ao tempo exigem controlo rigoroso.", side: "right" },
                  { icon: "🏗️", title: "Viabilidade urbanística", desc: "Licenças, PDM, restrições. O que parece viável pode estar bloqueado por anos na Câmara.", side: "left" },
                  { icon: "⚖️", title: "Relação risco / capital / duração", desc: "Quanto risco assume, quanto capital imobiliza, por quanto tempo. O equilíbrio define se vale a pena.", side: "right" }
                ].map((item, i) => (
                  <motion.div variants={STAGGER_ITEM} key={i} className={`stagger-card stagger-${item.side}`}>
                    <div className="stagger-icon">{item.icon}</div>
                    <div>
                      <h4 className="stagger-title">{item.title}</h4>
                      <p className="stagger-desc">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="context-image-break">
                <img src="/aveiro-3.jpg" alt="Aveiro Analysis" className="context-img-full" loading="lazy" />
              </div>

              <div className="spacer-lg" />

              <h2 className="section-title" style={{ textAlign: "right" }}>Onde operações perdem margem</h2>
              <motion.div variants={STAGGER_CONTAINER} initial="hidden" animate="show" className="timeline-flow">
                {[
                  { icon: "💸", title: "Custos subestimados", desc: "Orçamentos irrealistas levam a margens negativas" },
                  { icon: "📝", title: "Atrasos de licenciamento", desc: "Cada mês de atraso corrói a rentabilidade" },
                  { icon: "🔨", title: "Alterações de obra", desc: "Imprevistos que disparam custos" },
                  { icon: "⚠️", title: "Problemas de execução", desc: "Falta de controlo no terreno" },
                  { icon: "📉", title: "Saída abaixo do esperado", desc: "Mercado muda ou avaliação foi otimista" }
                ].map((item, i) => (
                  <motion.div variants={STAGGER_ITEM} key={i} className="timeline-item">
                    <div className="timeline-marker">{item.icon}</div>
                    <div className="timeline-content">
                      <h4 className="timeline-title">{item.title}</h4>
                      <p className="timeline-desc">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-next btn-shimmer"
                onClick={() => go("analysis")}
              >
                Porquê Aveiro Agora? <ArrowRight size={18} />
              </motion.button>
              <WaLink id="wa-rational" />
            </div>
          </motion.section>
        )}

        {/* ═══ STEP 3 — ANALYSIS ═══ */}
        {step === "analysis" && (
          <motion.section key="analysis" {...PAGE_TRANSITION} className="step-view step-scroll" id="step-analysis">
            <Logo size="md" />
            <div className="step-inner">
              <h2 className="section-title">📍 Porquê Aveiro? Porquê agora?</h2>
              <p className="body-text" style={{ marginBottom: "1rem" }}>Investidores inteligentes já se movimentaram:</p>
              <motion.ul variants={STAGGER_CONTAINER} initial="hidden" animate="show" className="checklist">
                {[
                  { text: "Maior valorização imobiliária — em aceleração", icon: <Check size={18} className="text-green-500" /> },
                  { text: "Procura internacional recorde", icon: <Check size={18} className="text-green-500" /> },
                  { text: "Tech hub + universidade a crescer", icon: <Check size={18} className="text-green-500" /> },
                  { text: "Oferta residencial criticamente baixa", icon: <Check size={18} className="text-green-500" /> }
                ].map((item, i) => (
                  <motion.li variants={STAGGER_ITEM} key={i} className="checklist-item">
                    <span className="checklist-icon">{item.icon}</span>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <div className="spacer-lg" />
              <h2 className="section-title">⚠️ A maioria perde dinheiro</h2>
              <motion.ul variants={STAGGER_CONTAINER} initial="hidden" animate="show" className="insight-list">
                {[
                  "Compram caro — sem análise de valor real",
                  "Subestimam custos de obra e imprevistos",
                  "Perdem controlo sobre prazos e orçamentos"
                ].map((item, i) => (
                  <motion.li variants={STAGGER_ITEM} key={i} className="insight-item">
                    <span className="x-icon-lg"><X size={18} className="text-red-500" /></span>
                    <span className="insight-text">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-next btn-shimmer"
                onClick={() => go("strategy")}
              >
                Ver Recomendações Estratégicas <ArrowRight size={18} />
              </motion.button>
              <WaLink id="wa-analysis" />
            </div>
          </motion.section>
        )}

        {/* ═══ STEP 4 — RECOMMENDATIONS ═══ */}
        {step === "strategy" && (
          <motion.section key="strategy" {...PAGE_TRANSITION} className="step-view step-scroll" id="step-strategy">
            <Logo size="md" />
            <div className="step-inner">
              <h2 className="section-title">Recomendações Estratégicas</h2>
              <motion.div variants={STAGGER_CONTAINER} initial="hidden" animate="show">
                {[
                  { icon: "1", title: "Invista em ofertas fora de mercado", text: "Os melhores negócios em Aveiro são negociados em privado, antes de entrar no mercado público." },
                  { icon: "2", title: "Foco em reconversão rápida", text: "Ciclos curtos = melhor relação retorno/risco. Evite projetos longos sem equipa local." },
                  { icon: "3", title: "Capital protegido primeiro", text: "Margem de segurança em cada operação. Capital protegido > retorno especulativo." }
                ].map((item, i) => (
                  <motion.div variants={STAGGER_ITEM} key={i} className="rec-card">
                    <span className="rec-icon">{item.icon}</span>
                    <div>
                      <h3 className="rec-title">{item.title}</h3>
                      <p className="rec-text">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-next btn-shimmer"
                onClick={() => go("presentation")}
              >
                Ver Abordagem no Terreno <ArrowRight size={18} />
              </motion.button>
              <WaLink id="wa-strategy" />
            </div>
          </motion.section>
        )}

        {/* ═══ STEP 4.1 — PRESENTATION ═══ */}
        {step === "presentation" && (
          <motion.section key="presentation" {...PAGE_TRANSITION} className="step-view step-scroll" id="step-presentation">
            <Logo size="md" />
            <div className="step-inner">
              <h2 className="section-title">A nossa abordagem operacional em Aveiro</h2>
              <motion.div variants={STAGGER_CONTAINER} initial="hidden" animate="show" className="approach-detailed">
                {[
                  { icon: "🔎", title: "Seleção criteriosa", desc: "Apenas ativos com potencial comprovado. Fora de mercado. Zonas de valorização acelerada. Filtramos 95% antes de apresentar." },
                  { icon: "🏛", title: "Estruturação conservadora", desc: "Capital protegido primeiro. Retorno depois. Margens de segurança em todos os cenários — mesmo nos pessimistas." },
                  { icon: "🛡", title: "Margens de segurança", desc: "Buffer para imprevistos, atrasos, correções de mercado. Nunca trabalhamos com orçamentos justos." },
                  { icon: "🗺", title: "Planeamento de saída", desc: "Estratégia de saída definida antes da compra. Sabemos a quem vender, quando, por quanto — antes de entrar." },
                  { icon: "✓", title: "Controlo de execução", desc: "Equipa local em Aveiro. Acompanhamento semanal: obra, licenciamentos, prazos. Problemas resolvidos antes de escalarem." }
                ].map((item, i) => (
                  <motion.div variants={STAGGER_ITEM} key={i} className="approach-item">
                    <div className="approach-header">
                      <span className="approach-icon">{item.icon}</span>
                      <h3 className="approach-title">{item.title}</h3>
                    </div>
                    <p className="approach-desc">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="context-image-break">
                <img src="/aveiro-4.png" alt="Aveiro Territory" className="context-img-full" loading="lazy" />
              </div>

              <div className="spacer-lg" />

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="user-photo-card"
              >
                <div className="photo-with-logo">
                  <img src="/user-photo.jpg" alt="Estrategista" className="user-photo-img" loading="lazy" />
                  <img src="/logo-horizontal.png" alt="Silvermont Capital" className="photo-logo-xl" loading="lazy" />
                </div>
                <div className="user-photo-info">
                  <span className="user-photo-name">Estrategista de Operações</span>
                  <span className="user-photo-tag">Silvermont Capital</span>
                </div>
              </motion.div>

              <div className="solution-block">
                <h3 className="section-title">Metodologia Silvermont</h3>
                <p className="body-text-lg">Não trabalhamos como os outros. <strong>Zero portais. Zero ofertas públicas.</strong></p>
                <p className="body-text-lg" style={{ marginTop: "0.75rem" }}>Cada operação é estruturada ao detalhe. Cada variável, controlada. Cada risco, mitigado. <strong>Não vendemos sonhos. Entregamos operações blindadas.</strong></p>
                <p className="body-text-lg" style={{ marginTop: "0.75rem" }}>Reconversão inteligente. Ciclos rápidos. Risco controlado. <strong>Esta é a diferença entre amadores e operadores profissionais.</strong></p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-next btn-shimmer"
                onClick={() => go("final")}
              >
                Aceder às Oportunidades Exclusivas <ArrowRight size={18} />
              </motion.button>
              <WaLink id="wa-presentation" />
            </div>
          </motion.section>
        )}

        {/* ═══ STEP 5 — FINAL ═══ */}
        {step === "final" && (
          <motion.section key="final" {...PAGE_TRANSITION} className="step-view step-centered" id="step-final">
            <Logo size="lg" onClick={restart} />
            <div className="step-inner" style={{ textAlign: "center", maxWidth: "520px" }}>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="section-title"
                style={{ textAlign: "center" }}
              >
                Oportunidades <span className="gold-highlight">Fora de Mercado</span>
              </motion.h2>
              <p className="body-text-lg" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                Imóveis que nunca chegam aos portais. Operações validadas.
              </p>
              <p className="urgency-text">⚡ Apenas investidores qualificados</p>

              <div style={{ marginTop: "2.5rem" }}>
                <div className="cta-context-text">Comunicação direta. Sem envios massificados.</div>
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-final-wa btn-shimmer"
                  id="wa-final"
                  onClick={() => trackPixel("Contact", { content_name: "final_whatsapp_button" })}
                >
                  <MessageCircle size={22} />
                  <span>Receber Oportunidades Selecionadas</span>
                </motion.a>
              </div>
              <button
                className="btn-save"
                onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); }}
              >
                {copied ? <><Check size={14} style={{ display: 'inline', marginRight: '4px' }} /> Link copiado!</> : <><Copy size={14} style={{ display: 'inline', marginRight: '4px' }} /> Guardar link para consultar depois</>}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Scroll Hint ── */}
      <AnimatePresence>
        {showScrollHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="scroll-hint"
            aria-hidden="true"
          >
            <div className="scroll-hint-ring">
              <ChevronDown size={18} />
            </div>
            <span className="scroll-hint-label">scroll</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
