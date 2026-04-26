"use client";

import { useState } from "react";

export default function TrabalheConoscoPage() {
  const [clients, setClients] = useState(10);
  const monthly = 200;
  const commission = 0.5;
  const earned = clients * monthly * commission;

  return (
    <>
      <style>{CSS}</style>

      {/* NAV */}
      <nav className="tc-nav">
        <a href="/" className="tc-logo">🍔 Food Pronto</a>
        <a href="/sign-up" className="tc-nav-cta">Cadastrar meu truck</a>
      </nav>

      {/* HERO */}
      <section className="tc-hero">
        <div className="tc-hero-glow" />
        <div className="tc-hero-content">
          <div className="tc-badge">🤝 Programa de Parceiros</div>
          <h1 className="tc-h1">
            Venda Food Pronto.<br />
            <span className="tc-green">Ganhe 50% todo mês.</span>
          </h1>
          <p className="tc-sub">
            Comissão recorrente enquanto o cliente pagar. Sem teto de ganhos. Trabalhe de onde quiser.
          </p>
          <a
            href="https://wa.me/5513982032534?text=Olá, quero ser parceiro comercial do Food Pronto!"
            target="_blank"
            rel="noopener noreferrer"
            className="tc-btn-wa"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.535a.5.5 0 00.608.608l5.788-1.448A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.834 9.834 0 01-5.018-1.378l-.36-.214-3.732.933.976-3.618-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Falar com a equipe agora
          </a>
        </div>
      </section>

      {/* CARDS */}
      <section className="tc-cards">
        <div className="tc-card">
          <div className="tc-card-icon">💸</div>
          <h3>50% recorrente</h3>
          <p>R$&nbsp;100 por cliente, todo mês — enquanto ele pagar.</p>
        </div>
        <div className="tc-card highlight">
          <div className="tc-card-icon">🎟️</div>
          <h3>Cupom de 10%</h3>
          <p>Ofereça desconto exclusivo para fechar mais negócios.</p>
        </div>
        <div className="tc-card">
          <div className="tc-card-icon">🌎</div>
          <h3>Sem limite de ganhos</h3>
          <p>Quanto mais clientes, maior sua renda mensal fixa.</p>
        </div>
        <div className="tc-card">
          <div className="tc-card-icon">🚀</div>
          <h3>Produto fácil de vender</h3>
          <p>Substitui maquininha e painel LED — economia real para o cliente.</p>
        </div>
      </section>

      {/* SIMULATOR */}
      <section className="tc-sim">
        <div className="tc-sim-inner">
          <div className="tc-sim-label">Simulador de Ganhos</div>
          <h2 className="tc-sim-h2">Quanto você pode ganhar?</h2>
          <p className="tc-sim-sub">Arraste o slider para ver sua renda mensal estimada</p>

          <div className="tc-slider-wrap">
            <input
              type="range"
              min={1}
              max={100}
              value={clients}
              onChange={(e) => setClients(Number(e.target.value))}
              className="tc-slider"
            />
            <div className="tc-slider-labels">
              <span>1 cliente</span>
              <span>100 clientes</span>
            </div>
          </div>

          <div className="tc-sim-result">
            <div className="tc-sim-clients">
              <span className="tc-sim-num">{clients}</span>
              <span className="tc-sim-desc">clientes ativos</span>
            </div>
            <div className="tc-sim-arrow">→</div>
            <div className="tc-sim-earn">
              <span className="tc-sim-money">
                R$ {earned.toLocaleString("pt-BR")}
              </span>
              <span className="tc-sim-desc">por mês</span>
            </div>
          </div>

          <p className="tc-sim-note">
            Baseado em R$ 200/mês por cliente × 50% de comissão
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="tc-how">
        <h2 className="tc-how-h2">Como funciona?</h2>
        <div className="tc-steps">
          {[
            { n: "1", title: "Fale com a gente", desc: "Mande um WhatsApp e receba seu link e cupom de parceiro em minutos." },
            { n: "2", title: "Indique food trucks", desc: "Apresente o Food Pronto para donos de trucks. Use o cupom de 10% para facilitar o fechamento." },
            { n: "3", title: "Receba todo mês", desc: "Cada cliente ativo gera R$ 100/mês para você — automaticamente, todo mês." },
            { n: "4", title: "Escale sem limite", desc: "50 clientes = R$ 5.000/mês. 100 clientes = R$ 10.000/mês. Sem teto." },
          ].map((s) => (
            <div key={s.n} className="tc-step">
              <div className="tc-step-n">{s.n}</div>
              <div>
                <div className="tc-step-title">{s.title}</div>
                <div className="tc-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="tc-faq">
        <h2 className="tc-faq-h2">Perguntas frequentes</h2>
        <div className="tc-faq-list">
          {FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="tc-final">
        <div className="tc-final-glow" />
        <div className="tc-final-inner">
          <h2 className="tc-final-h2">
            Pronto para começar<br />
            <span className="tc-green">a ganhar comissão?</span>
          </h2>
          <p className="tc-final-sub">
            Fale com nossa equipe agora e receba seu código de parceiro em minutos.
          </p>
          <a
            href="https://wa.me/5513982032534?text=Olá, quero ser parceiro comercial do Food Pronto!"
            target="_blank"
            rel="noopener noreferrer"
            className="tc-btn-wa"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.535a.5.5 0 00.608.608l5.788-1.448A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.834 9.834 0 01-5.018-1.378l-.36-.214-3.732.933.976-3.618-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Quero ser parceiro →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="tc-footer">
        <a href="/" className="tc-footer-logo">🍔 Food Pronto</a>
        <div className="tc-footer-links">
          <a href="/precos">Preços</a>
          <a href="/termos">Termos</a>
          <a href="/privacidade">Privacidade</a>
          <a href="/contato">Contato</a>
          <a href="/trabalhe-conosco">Trabalhe conosco</a>
        </div>
        <p className="tc-footer-copy">© {new Date().getFullYear()} Food Pronto. Feito com ❤️ no Brasil.</p>
      </footer>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`tc-faq-item${open ? " open" : ""}`}>
      <button className="tc-faq-q" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <span className="tc-faq-arrow">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="tc-faq-a">{a}</div>}
    </div>
  );
}

const FAQ = [
  { q: "Como recebo minhas comissões?", a: "As comissões são pagas mensalmente via Pix, na data de vencimento das assinaturas dos seus clientes." },
  { q: "Preciso ter CNPJ para ser parceiro?", a: "Não. Qualquer pessoa física pode participar. Basta falar com a gente pelo WhatsApp para começar." },
  { q: "O que é o cupom de 10%?", a: "Você recebe um código exclusivo para oferecer 10% de desconto ao cliente no primeiro mês. Isso facilita o fechamento da venda sem afetar sua comissão dos meses seguintes." },
  { q: "Existe algum custo para ser parceiro?", a: "Zero. Não existe taxa de adesão, treinamento pago ou mensalidade. Você só ganha." },
  { q: "E se o cliente cancelar?", a: "A comissão é recorrente enquanto o cliente pagar. Se ele cancelar, a comissão daquele cliente para. Por isso, indicar bons clientes é o segredo do sucesso." },
  { q: "Posso indicar clientes de qualquer cidade?", a: "Sim! O Food Pronto funciona em todo o Brasil. Sem restrição geográfica." },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Nunito:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080810; --surface: #0f0f1a; --surface2: #16162a;
    --border: rgba(255,255,255,0.07); --orange: #FF6B35;
    --green: #22C55E; --green-dim: rgba(34,197,94,0.12);
    --text: #f0f0f8; --muted: rgba(240,240,248,0.48);
    --d: 'Syne', sans-serif; --b: 'Nunito', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--b); }
  a { text-decoration: none; color: inherit; }

  /* NAV */
  .tc-nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; background: rgba(8,8,16,0.92); backdrop-filter: blur(12px); }
  .tc-logo { font-family: var(--d); font-size: 17px; font-weight: 800; }
  .tc-nav-cta { background: var(--orange); color: #fff; padding: 9px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; transition: opacity .2s; }
  .tc-nav-cta:hover { opacity: .88; }

  /* HERO */
  .tc-hero { position: relative; padding: 90px 40px 70px; text-align: center; overflow: hidden; }
  .tc-hero-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 600px; height: 340px; background: radial-gradient(ellipse, rgba(34,197,94,0.14) 0%, transparent 70%); pointer-events: none; }
  .tc-hero-content { position: relative; z-index: 1; max-width: 780px; margin: 0 auto; }
  .tc-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--green-dim); border: 1px solid rgba(34,197,94,0.22); border-radius: 100px; padding: 6px 16px; font-size: 13px; color: var(--green); font-weight: 600; margin-bottom: 24px; }
  .tc-h1 { font-family: var(--d); font-size: clamp(36px,5vw,66px); font-weight: 900; line-height: 1.08; margin-bottom: 20px; }
  .tc-green { color: var(--green); }
  .tc-sub { font-size: 18px; color: var(--muted); line-height: 1.6; max-width: 560px; margin: 0 auto 36px; }

  /* WA Button */
  .tc-btn-wa { display: inline-flex; align-items: center; gap: 10px; background: #25D366; color: #fff; padding: 16px 32px; border-radius: 100px; font-size: 16px; font-weight: 800; font-family: var(--b); transition: transform .2s, box-shadow .2s; box-shadow: 0 6px 24px rgba(37,211,102,0.3); }
  .tc-btn-wa:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(37,211,102,0.4); }

  /* CARDS */
  .tc-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; padding: 0 40px 70px; max-width: 1000px; margin: 0 auto; }
  .tc-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; transition: border-color .2s; }
  .tc-card.highlight { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.06); }
  .tc-card:hover { border-color: rgba(34,197,94,0.25); }
  .tc-card-icon { font-size: 36px; margin-bottom: 16px; }
  .tc-card h3 { font-family: var(--d); font-size: 18px; font-weight: 800; margin-bottom: 10px; }
  .tc-card p { font-size: 14px; color: var(--muted); line-height: 1.55; }

  /* SIMULATOR */
  .tc-sim { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 40px; }
  .tc-sim-inner { max-width: 680px; margin: 0 auto; text-align: center; }
  .tc-sim-label { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--green); border: 1px solid rgba(34,197,94,0.22); border-radius: 100px; padding: 4px 14px; margin-bottom: 16px; }
  .tc-sim-h2 { font-family: var(--d); font-size: clamp(26px,4vw,42px); font-weight: 900; margin-bottom: 12px; }
  .tc-sim-sub { font-size: 15px; color: var(--muted); margin-bottom: 40px; }
  .tc-slider-wrap { margin-bottom: 40px; }
  .tc-slider { width: 100%; height: 6px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, var(--green) 0%, var(--green) calc(var(--v,50)*1%), var(--surface2) calc(var(--v,50)*1%), var(--surface2) 100%); border-radius: 100px; outline: none; cursor: pointer; }
  .tc-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 4px rgba(34,197,94,0.2); cursor: pointer; }
  .tc-slider-labels { display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: var(--muted); }
  .tc-sim-result { display: flex; align-items: center; justify-content: center; gap: 32px; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; padding: 32px; margin-bottom: 16px; }
  .tc-sim-clients, .tc-sim-earn { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .tc-sim-num { font-family: var(--d); font-size: 56px; font-weight: 900; color: var(--text); line-height: 1; }
  .tc-sim-money { font-family: var(--d); font-size: 56px; font-weight: 900; color: var(--green); line-height: 1; }
  .tc-sim-desc { font-size: 13px; color: var(--muted); font-weight: 600; }
  .tc-sim-arrow { font-size: 28px; color: var(--muted); }
  .tc-sim-note { font-size: 12px; color: var(--muted); }

  /* HOW */
  .tc-how { padding: 80px 40px; max-width: 700px; margin: 0 auto; }
  .tc-how-h2 { font-family: var(--d); font-size: clamp(26px,4vw,38px); font-weight: 900; margin-bottom: 36px; text-align: center; }
  .tc-steps { display: flex; flex-direction: column; gap: 24px; }
  .tc-step { display: flex; align-items: flex-start; gap: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
  .tc-step-n { width: 36px; height: 36px; border-radius: 50%; background: var(--green-dim); border: 1px solid rgba(34,197,94,0.25); color: var(--green); font-family: var(--d); font-size: 16px; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .tc-step-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .tc-step-desc { font-size: 14px; color: var(--muted); line-height: 1.5; }

  /* FAQ */
  .tc-faq { padding: 80px 40px; max-width: 700px; margin: 0 auto; }
  .tc-faq-h2 { font-family: var(--d); font-size: clamp(24px,3.5vw,36px); font-weight: 900; margin-bottom: 32px; text-align: center; }
  .tc-faq-list { display: flex; flex-direction: column; gap: 8px; }
  .tc-faq-item { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; transition: border-color .2s; }
  .tc-faq-item.open { border-color: rgba(34,197,94,0.25); }
  .tc-faq-q { width: 100%; background: none; border: none; color: var(--text); padding: 18px 20px; font-size: 15px; font-weight: 600; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-family: var(--b); }
  .tc-faq-arrow { font-size: 20px; color: var(--green); flex-shrink: 0; }
  .tc-faq-a { padding: 14px 20px 18px; font-size: 14px; color: var(--muted); line-height: 1.7; border-top: 1px solid var(--border); }

  /* FINAL */
  .tc-final { position: relative; padding: 100px 40px; text-align: center; overflow: hidden; }
  .tc-final-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(34,197,94,0.1) 0%, transparent 70%); pointer-events: none; }
  .tc-final-inner { position: relative; z-index: 1; }
  .tc-final-h2 { font-family: var(--d); font-size: clamp(30px,5vw,56px); font-weight: 900; line-height: 1.08; margin-bottom: 20px; }
  .tc-final-sub { font-size: 17px; color: var(--muted); margin-bottom: 36px; }

  /* FOOTER */
  .tc-footer { padding: 40px; border-top: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .tc-footer-logo { font-family: var(--d); font-size: 16px; font-weight: 700; opacity: .6; }
  .tc-footer-links { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
  .tc-footer-links a { font-size: 13px; color: var(--muted); transition: color .2s; }
  .tc-footer-links a:hover { color: var(--text); }
  .tc-footer-copy { font-size: 12px; color: rgba(255,255,255,.18); }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .tc-nav { padding: 16px 20px; }
    .tc-hero { padding: 70px 20px 50px; }
    .tc-cards { padding: 0 20px 50px; }
    .tc-sim { padding: 60px 20px; }
    .tc-sim-result { flex-direction: column; gap: 16px; }
    .tc-sim-arrow { transform: rotate(90deg); }
    .tc-how { padding: 60px 20px; }
    .tc-faq { padding: 60px 20px; }
    .tc-final { padding: 70px 20px; }
    .tc-footer { padding: 32px 20px; }
  }
`;
