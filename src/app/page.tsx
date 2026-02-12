"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import ProgressBar from "@/components/ProgressBar";
import { saveLeadAction } from "./actions";

type Step =
  "hero" | "q1" | "q2" | "q3" | "processing" |
  "results" | "anchor" | "trigger" | "authority" | "frictions" | "strategy" | "final";

const SESSION_KEY = "silvermont_funnel";
const WA_NUM = "351XXXXXXXXX";
const WA_MSG = encodeURIComponent("Olá, vi os vossos critérios internos e gostaria de discutir o acesso a oportunidades off-market em Aveiro.");
const WA_URL = `https://wa.me/${WA_NUM}?text=${WA_MSG}`;

const CAPITAL_OPTIONS = [
  { value: "under_100k", label: "Menos de €100.000", sub: "Ticket de entrada", avg: 75000 },
  { value: "100k_300k", label: "€100.000 – €300.000", sub: "Capacidade unitária sólida", avg: 200000 },
  { value: "300k_800k", label: "€300.000 – €800.000", sub: "Múltiplas operações paralelas", avg: 500000 },
  { value: "800k_plus", label: "Mais de €800.000", sub: "Escala institucional", avg: 1000000 },
];
const HORIZON_OPTIONS = [
  { value: "short", label: "Ciclos curtos", sub: "Até 12 meses (Reversão rápida)" },
  { value: "medium", label: "Médio prazo", sub: "1 a 3 anos (Estruturação)" },
  { value: "long", label: "Longo prazo", sub: "3+ anos (Equity building)" },
];
const TRIGGER_OPTIONS = [
  { value: "preservation", label: "Preservação de capital", sub: "Foco em risco mínimo e ativos resilientes" },
  { value: "growth", label: "Crescimento gradual", sub: "Valorização estável e yield recorrente" },
  { value: "opportunistic", label: "Estratégias oportunísticas", sub: "Compra forçada, distressed e reconversão" },
  { value: "analysis", label: "Ainda em fase de análise", sub: "Estudo de viabilidade de mercado" },
];

function fmt(n: number) { return "€" + n.toLocaleString("pt-PT"); }

function getUserStep(s: Step): { n: number; t: number } | null {
  const steps: Step[] = ["q1", "q2", "q3", "results", "anchor", "trigger", "authority", "frictions", "strategy", "final"];
  const idx = steps.indexOf(s);
  if (idx === -1) return null;
  return { n: idx + 1, t: steps.length };
}

function getProgress(s: Step): number {
  const m: Record<Step, number> = {
    hero: 0, q1: 10, q2: 18, q3: 26, processing: 35,
    results: 45, anchor: 55, trigger: 65, authority: 75,
    frictions: 85, strategy: 95, final: 100
  };
  return m[s];
}

function getReturns(cap: string, hor: string) {
  const avg = CAPITAL_OPTIONS.find(o => o.value === cap)?.avg || 200000;
  let rMin = 6.5, rMax = 11, oMin = 13, oMax = 19;
  if (hor === "long") { rMin += 1.5; rMax += 2; oMin += 2; oMax += 3; }
  if (hor === "short") { rMin -= 1; rMax -= 0.5; oMin -= 1.5; oMax -= 1.5; }
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

function WaPill({ id, label }: { id: string, label: string }) {
  return (
    <div style={{ textAlign: "center", marginTop: "1rem" }}>
      <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="wa-pill" id={id}>
        <WaIcon s={15} />
        <span>{label}</span>
      </a>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("hero");
  const [capital, setCapital] = useState("");
  const [horizon, setHorizon] = useState("");
  const [trigger, setTrigger] = useState("");
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.step && !["processing"].includes(s.step)) {
          setStep(s.step);
          setCapital(s.capital || "");
          setHorizon(s.horizon || "");
          setTrigger(s.trigger || "");
        }
      }
    } catch { }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ step, capital, horizon, trigger, ts: Date.now() })); } catch { }
  }, [step, capital, horizon, trigger, ready]);

  const go = useCallback((s: Step) => { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const restart = useCallback(() => { localStorage.removeItem(SESSION_KEY); setCapital(""); setHorizon(""); setTrigger(""); go("hero"); }, [go]);

  const selectCapital = useCallback((v: string) => { setCapital(v); setTimeout(() => go("q2"), 200); }, [go]);
  const selectHorizon = useCallback((v: string) => { setHorizon(v); setTimeout(() => go("q3"), 200); }, [go]);
  const selectMindset = useCallback(async (v: string) => {
    setTimeout(async () => {
      go("processing");
      try { await saveLeadAction({ capital, horizonte: horizon, preferencia: v }); } catch { }
      setTimeout(() => go("results"), 1800);
    }, 200);
  }, [capital, horizon, go]);

  const selectTrigger = useCallback((v: string) => { setTrigger(v); setTimeout(() => go("authority"), 200); }, [go]);

  const returns = useMemo(() => getReturns(capital, horizon), [capital, horizon]);
  const capLabel = CAPITAL_OPTIONS.find(o => o.value === capital)?.label || "";
  const userStepInfo = getUserStep(step);

  if (!ready) return null;

  return (
    <main className="funnel">
      {step !== "hero" && step !== "processing" && <ProgressBar progress={getProgress(step)} stepInfo={userStepInfo} />}

      {/* ═══ 1. HERO ═══ */}
      {step === "hero" && (
        <section className="step-view step-centered animate-step" id="hero">
          <Logo size="lg" />
          <h1 className="headline-hero">O mercado imobiliário em Aveiro apresenta <span className="gold-highlight">janela de oportunidade técnica.</span></h1>
          <p className="subheadline">Valorização de capital suportada por escassez real de stock residencial e pressão de procura internacional. Valide o seu perfil de alocação em 30 segundos.</p>
          <div className="hero-value-list">
            <div className="hero-value-item"><span className="hv-icon">📊</span><span>Simulação de rentabilidade por escalão de capital</span></div>
            <div className="hero-value-item"><span className="hv-icon">📌</span><span>Identificação de fricções de mercado locais</span></div>
            <div className="hero-value-item"><span className="hv-icon">🔑</span><span>Critérios de seleção para ativos off-market</span></div>
          </div>
          <button className="btn-primary" onClick={() => go("q1")} id="cta-start">Iniciar Validação de Perfil →</button>
          <p className="micro-text" style={{ marginTop: "0.75rem" }}>Análise baseada em dados reais de operação · Sem custo</p>
        </section>
      )}

      {/* ═══ QUIZ ═══ */}
      {step === "q1" && (
        <section className="step-view step-centered animate-step" id="step-q1">
          <Logo size="sm" />
          <div className="step-header"><span className="step-number">Configuração de Alocação</span><h2 className="step-question">Qual o capital disponível para operação imobiliária?</h2></div>
          <div className="step-content"><div className="options-grid stagger-children">
            {CAPITAL_OPTIONS.map(o => (<button key={o.value} className={`option-card${capital === o.value ? " selected" : ""}`} onClick={() => selectCapital(o.value)}><span className="option-indicator" /><div><div className="option-label">{o.label}</div><div className="option-sublabel">{o.sub}</div></div></button>))}
          </div></div>
        </section>
      )}
      {step === "q2" && (
        <section className="step-view step-centered animate-step" id="step-q2">
          <Logo size="sm" />
          <div className="step-header"><span className="step-number">Timeline de Operação</span><h2 className="step-question">Qual o horizonte temporal pretendido para o retorno?</h2></div>
          <div className="step-content"><div className="options-grid stagger-children">
            {HORIZON_OPTIONS.map(o => (<button key={o.value} className={`option-card${horizon === o.value ? " selected" : ""}`} onClick={() => selectHorizon(o.value)}><span className="option-indicator" /><div><div className="option-label">{o.label}</div><div className="option-sublabel">{o.sub}</div></div></button>))}
          </div></div>
        </section>
      )}
      {step === "q3" && (
        <section className="step-view step-centered animate-step" id="step-q3">
          <Logo size="sm" />
          <div className="step-header"><span className="step-number">Modelo de Execução</span><h2 className="step-question">Qual a sua experiência preferencial de gestão?</h2></div>
          <div className="step-content"><div className="options-grid stagger-children">
            <button className="option-card" onClick={() => selectMindset("passive")}><span className="option-indicator" /><div><div className="option-label">Totalmente delegada</div><div className="option-sublabel">Gestão integral da operação por equipa de terreno</div></div></button>
            <button className="option-card" onClick={() => selectMindset("active")}><span className="option-indicator" /><div><div className="option-label">Acompanhamento direto</div><div className="option-sublabel">Envolvimento na tomada de decisão estratégica</div></div></button>
            <button className="option-card" onClick={() => selectMindset("hybrid")}><span className="option-indicator" /><div><div className="option-label">Monitorização estruturada</div><div className="option-sublabel">Reporte técnico frequente com execução externa</div></div></button>
          </div></div>
        </section>
      )}

      {/* ═══ PROCESSING ═══ */}
      {step === "processing" && (
        <section className="step-view step-centered animate-step" id="step-processing">
          <Logo size="sm" />
          <div className="processing-bars">{[1, 2, 3, 4, 5].map(i => <div key={i} className="processing-bar" />)}</div>
          <p className="processing-text">A cruzar dados de alocação com realidade de stock em Aveiro...</p>
        </section>
      )}

      {/* ═══ 2. RESULTS ═══ */}
      {step === "results" && (
        <section className="step-view step-scroll animate-step" id="step-results">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">Enquadramento de Mercado</h2>
            <div className="verdict-card verdict-green" style={{ background: "rgba(37,211,102,0.05)", border: "1px solid rgba(37,211,102,0.2)" }}>
              <div className="verdict-icon">📊</div>
              <div>
                <h2 className="verdict-title" style={{ color: "var(--gold-light)" }}>Contexto para {capLabel}</h2>
                <p className="verdict-text">O seu escalão de capital permite acesso a operações de reconversão em zonas consolidadas de Aveiro. Atualmente, o mercado local apresenta uma <strong>taxa de absorção de stock superior a 85%</strong> nos primeiros 60 dias de exposição pública.</p>
                <p className="verdict-text" style={{ marginTop: "0.6rem" }}>A valorização não é dependente apenas do mercado. A margem real é gerada na <strong>identificação de ativos subvalorizados por condicionantes físicas ou jurídicas</strong> que podem ser retificadas operativamente.</p>
              </div>
            </div>

            <div className="spacer" />

            <div className="result-range-group">
              <div className="result-range">
                <div className="result-range-header"><span className="result-range-label">Projeção Base (Conservadora)</span><span className="result-range-value">{returns.realistic.minP}% – {returns.realistic.maxP}%</span></div>
                <div className="result-bar-track"><div className="result-bar-fill typical" style={{ width: `${(returns.realistic.maxP / 25) * 100}%` }} /></div>
                <div className="result-euro">{fmt(returns.realistic.minE)} – {fmt(returns.realistic.maxE)} anuais exp.</div>
              </div>
              <div className="result-range">
                <div className="result-range-header"><span className="result-range-label">Projeção Optimizada (Operacional)</span><span className="result-range-value">{returns.optimized.minP}% – {returns.optimized.maxP}%</span></div>
                <div className="result-bar-track"><div className="result-bar-fill upper" style={{ width: `${(returns.optimized.maxP / 25) * 100}%` }} /></div>
                <div className="result-euro">{fmt(returns.optimized.minE)} – {fmt(returns.optimized.maxE)} anuais exp.</div>
              </div>
            </div>
            <p className="result-note">Dados suportados por transações reais e custos de obra atuais no distrito.</p>

            <button className="btn-next" onClick={() => go("anchor")}>Ponto de Situação Operacional →</button>
          </div>
        </section>
      )}

      {/* ═══ 3. REALITY ANCHOR ═══ */}
      {step === "anchor" && (
        <section className="step-view step-scroll animate-step" id="step-anchor">
          <Logo size="md" />
          <div className="step-inner">
            <div className="image-context-wrapper">
              <Image src="/aveiro-context.png" alt="Contexto Urbano Aveiro" width={600} height={340} className="context-img" />
            </div>
            <div className="spacer" />
            <h2 className="section-title">O que o mercado normalmente não mostra</h2>
            <p className="body-text" style={{ marginBottom: "1.5rem" }}>Investimento imobiliário real não é sobre folhas de cálculo otimistas. A rentabilidade é determinada por fatores que raramente aparecem em apresentações comerciais.</p>

            <div className="fact-grid">
              <div className="fact-card">
                <h4 className="fact-title">A margem está na compra</h4>
                <p className="fact-desc">Contar com a valorização do mercado é especulação. O lucro deve ser garantido no momento da entrada, através de negociação direta ou correção de ineficiências do ativo.</p>
              </div>
              <div className="fact-card">
                <h4 className="fact-title">Timeline vs Margem</h4>
                <p className="fact-desc">O tempo impacta as margens mais do que o preço final de venda. Cada mês de atraso administrativo ou operacional reduz o ROI exponencialmente.</p>
              </div>
              <div className="fact-card">
                <h4 className="fact-title">Fricção Administrativa</h4>
                <p className="fact-desc">Atrasos em licenciamentos ou retificações de áreas são a realidade do terreno em Aveiro. Ignorar estas timelines altera completamente qualquer projeção inicial.</p>
              </div>
              <div className="fact-card">
                <h4 className="fact-title">Risco de Execução</h4>
                <p className="fact-desc">O principal fator de insucesso não é o mercado, é a execução. A gestão de orçamentos de obra e prazos de empreitada é onde se protege ou perde o capital.</p>
              </div>
            </div>

            <button className="btn-next" onClick={() => go("trigger")}>Definir Abordagem Pessoal →</button>
          </div>
        </section>
      )}

      {/* ═══ 4. SELF-IDENTIFICATION TRIGGER ═══ */}
      {step === "trigger" && (
        <section className="step-view step-centered animate-step" id="step-trigger">
          <Logo size="sm" />
          <div className="step-header">
            <h2 className="step-question">Como costuma abordar investimento imobiliário?</h2>
            <p className="body-text" style={{ marginTop: "0.5rem", textAlign: "center" }}>A estratégia a aplicar depende da prioridade do capital neste ciclo.</p>
          </div>
          <div className="step-content"><div className="options-grid stagger-children">
            {TRIGGER_OPTIONS.map(o => (
              <button key={o.value} className={`option-card${trigger === o.value ? " selected" : ""}`} onClick={() => selectTrigger(o.value)}>
                <span className="option-indicator" />
                <div><div className="option-label">{o.label}</div><div className="option-sublabel">{o.sub}</div></div>
              </button>
            ))}
          </div></div>
        </section>
      )}

      {/* ═══ 5. SILENT AUTHORITY BUILDER ═══ */}
      {step === "authority" && (
        <section className="step-view step-scroll animate-step" id="step-authority">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">Critérios normalmente ignorados em operações residenciais</h2>
            <p className="body-text" style={{ marginBottom: "1.5rem" }}>Uma operação sustentável em Aveiro deve validar estes pontos técnicos antes de qualquer compromisso de capital.</p>

            <div className="criteria-list">
              <div className="criteria-item"><span>Liquidez de saída</span><p>Análise de profundidade de mercado para o produto final pós-intervenção.</p></div>
              <div className="criteria-item"><span>Margem de contingência</span><p>Reserva técnica real para variações de custos de construção e materiais.</p></div>
              <div className="criteria-item"><span>Estrutura fiscal</span><p>Impacto de impostos (IMT, IS) e otimização em operações de reconversão.</p></div>
              <div className="criteria-item"><span>Viabilidade urbanística</span><p>Cunformidade com o PDM atual e potencial de alteração de uso (ex: serviços para habitação).</p></div>
              <div className="criteria-item"><span>Relação risco / tempo / capital</span><p>Cálculo de exposição ponderada ao longo de todo o ciclo operativo.</p></div>
            </div>

            <button className="btn-next" onClick={() => go("frictions")}>Analisar Fatores de Insucesso →</button>
          </div>
        </section>
      )}

      {/* ═══ 6. TIME & FRICTION REALITY ═══ */}
      {step === "frictions" && (
        <section className="step-view step-scroll animate-step" id="step-frictions">
          <Logo size="md" />
          <div className="step-inner">
            <h2 className="section-title">Porque muitas operações falham fora do Excel</h2>
            <p className="body-text" style={{ marginBottom: "1.5rem" }}>A teoria aceita tudo. A realidade do terreno impõe fricção que destrói margens teóricas.</p>

            <div className="friction-grid">
              <div className="friction-point">
                <span className="f-icon">⚠️</span>
                <div><strong>Custos subestimados</strong><p>Orçamentos de obra sem detalhe técnico resultam em derrapagens médias de 20% a 30%.</p></div>
              </div>
              <div className="friction-point">
                <span className="f-icon">⏳</span>
                <div><strong>Licenciamentos demorados</strong><p>Expectativas de timelines administrativos irreais bloqueiam o capital e aumentam custos financeiros.</p></div>
              </div>
              <div className="friction-point">
                <span className="f-icon">🏗️</span>
                <div><strong>Obra descontrolada</strong><p>Falta de fiscalização ativa permite falhas de execução que exigem retrabalho caro e atrasos de entrega.</p></div>
              </div>
              <div className="friction-point">
                <span className="f-icon">📉</span>
                <div><strong>Saída abaixo do esperado</strong><p>Produto final desajustado à procura real da zona obriga a correções de preço e perda de liquidez.</p></div>
              </div>
            </div>

            <button className="btn-next" onClick={() => go("strategy")}>Visualizar Abordagem Operacional →</button>
          </div>
        </section>
      )}

      {/* ═══ 7. DIFFERENTIATION / STRATEGY ═══ */}
      {step === "strategy" && (
        <section className="step-view step-scroll animate-step" id="step-strategy">
          <Logo size="md" />
          <div className="step-inner">
            <div className="solution-block">
              <Logo size="sm" />
              <h2 className="section-title">Abordagem operacional Silvermont</h2>
              <p className="body-text" style={{ marginBottom: "1.5rem" }}>Não operamos no mercado público. A nossa estrutura está focada na resolução técnica e jurídica de ativos para criação de valor real.</p>

              <ul className="op-list">
                <li><span>Seleção cirúrgica de ativos</span>: Apenas ativos com ineficiências corrigíveis e margem de segurança mínima de 15% na compra.</li>
                <li><span>Estruturação conservadora</span>: Projeções baseadas no pior cenário de timeline e custos.</li>
                <li><span>Plaeamento de saída</span>: Buyer persona identificada antes da aquisição do imóvel.</li>
                <li><span>Controlo de execução</span>: Gestão direta de equipas de obra e processos administrativos.</li>
              </ul>
            </div>

            <button className="btn-next" onClick={() => go("final")}>Solicitar Acesso a Oportunidades →</button>
          </div>
        </section>
      )}

      {/* ═══ 8. FINAL CTA ═══ */}
      {step === "final" && (
        <section className="step-view step-centered animate-step" id="step-final">
          <Logo size="lg" onClick={restart} />
          <div className="step-inner" style={{ textAlign: "center", maxWidth: "520px" }}>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Acesso a oportunidades que passam nos nossos <span className="gold-highlight">critérios internos</span>
            </h2>
            <p className="body-text-lg" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              Ativos off-market validados pela nossa equipa de terreno. Sem listas públicas. Sem envios massificados.
            </p>
            <p className="urgency-text">⚡ Capacidade de análise limitada por trimestre</p>
            <div style={{ marginTop: "1.5rem" }}>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-final-wa" id="wa-final">
                <WaIcon s={22} />
                <span>Discutir Oportunidades Off-Market</span>
              </a>
            </div>
            <p className="micro-text" style={{ marginTop: "1rem" }}>Apenas para investidores com capital verificado e horizonte temporal definido.</p>
            <button className="btn-save" onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2500); }}>
              {copied ? "✓ Link copiado!" : "📎 Guardar acesso para consulta posterior"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
