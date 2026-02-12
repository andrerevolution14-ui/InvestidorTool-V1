"use client";

const WA_NUM = "351XXXXXXXXX";
const WA_MSG = encodeURIComponent("Olá, completei a simulação de investimento em Aveiro e quero acesso às melhores oportunidades.");
const WA_URL = `https://wa.me/${WA_NUM}?text=${WA_MSG}`;

function WhatsAppIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

export default function WhatsAppCTA() {
    return (
        <section className="whatsapp-final" id="whatsapp-final">
            <div className="whatsapp-final-inner animate-fade-in-up">
                <h2 className="section-title" style={{ marginBottom: "0.75rem" }}>
                    🔑 Quer acesso às melhores oportunidades <span className="gold-highlight">fora do mercado</span> em Aveiro?
                </h2>
                <p className="body-text" style={{ marginBottom: "0.5rem", maxWidth: "520px", margin: "0 auto 1.25rem" }}>
                    Oportunidades exclusivas que não aparecem nos portais.
                    Estratégia personalizada. Acompanhamento completo. Sem compromisso.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
                    <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-whatsapp btn-whatsapp-lg" id="btn-wa-final-1">
                        <WhatsAppIcon size={24} />
                        <span>Falar com a Equipa Agora</span>
                    </a>

                    <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" id="btn-wa-final-2">
                        <WhatsAppIcon size={20} />
                        <span>Receber Oportunidades Exclusivas</span>
                    </a>

                    <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" id="btn-wa-final-3">
                        <WhatsAppIcon size={20} />
                        <span>Agendar Conversa Gratuita</span>
                    </a>
                </div>

                <p className="micro-text" style={{ marginTop: "1rem" }}>
                    Resposta em menos de 2 horas · Sem compromisso · 100% gratuito
                </p>
            </div>
        </section>
    );
}
