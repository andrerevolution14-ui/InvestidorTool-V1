"use client";

export default function PositioningSection() {
    return (
        <section className="content-block" id="positioning">
            <div className="content-block-inner">
                <div className="animate-fade-in-up">
                    <h2 className="section-title">
                        🎯 A nossa estratégia <span className="gold-highlight">exclusiva</span>
                    </h2>
                    <p className="body-text" style={{ marginBottom: "1.25rem" }}>
                        Compramos abaixo do mercado. Reabilitamos com controlo total de custos.
                        Vendemos acima do mercado. O risco é mínimo porque a margem de segurança
                        é construída antes de gastar um cêntimo.
                    </p>
                </div>

                <div className="strategy-grid stagger-children">
                    <div className="strategy-card">
                        <span className="strategy-icon">🛡️</span>
                        <h4 className="strategy-title">Risco Controlado</h4>
                        <p className="strategy-desc">Cada operação tem margem de segurança embutida. Se algo correr mal, o capital está protegido.</p>
                    </div>
                    <div className="strategy-card">
                        <span className="strategy-icon">📐</span>
                        <h4 className="strategy-title">Compra Inteligente</h4>
                        <p className="strategy-desc">Só compramos 20-30% abaixo do valor de mercado. O lucro começa na aquisição.</p>
                    </div>
                    <div className="strategy-card">
                        <span className="strategy-icon">⚡</span>
                        <h4 className="strategy-title">Execução Rápida</h4>
                        <p className="strategy-desc">Obra controlada, prazos definidos, sem surpresas. Ciclos curtos = capital a rodar.</p>
                    </div>
                    <div className="strategy-card">
                        <span className="strategy-icon">💰</span>
                        <h4 className="strategy-title">Retornos Reais</h4>
                        <p className="strategy-desc">Lucros entre 10-20%+ por operação, com estrutura conservadora. Sem promessas — resultados.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
