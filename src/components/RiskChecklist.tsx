"use client";

export default function RiskChecklist() {
    const items = [
        { icon: "✅", text: "Aveiro tem a maior taxa de valorização imobiliária do país" },
        { icon: "✅", text: "A procura supera a oferta — preços continuam a subir" },
        { icon: "✅", text: "Nova universidade e tech hub a atrair talento internacional" },
        { icon: "✅", text: "Falta de oferta residencial qualificada = oportunidade" },
        { icon: "✅", text: "Rentabilidade de arrendamento acima da média nacional" },
    ];

    return (
        <section className="content-block" id="checklist">
            <div className="content-block-inner">
                <div className="animate-fade-in-up">
                    <h2 className="section-title">
                        📍 Porquê Aveiro? <span className="gold-highlight">Porquê agora?</span>
                    </h2>
                </div>

                <ul className="checklist stagger-children">
                    {items.map((item, index) => (
                        <li className="checklist-item" key={index}>
                            <span className="checklist-icon">{item.icon}</span>
                            <span>{item.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
