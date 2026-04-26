"use client";

import { useState } from "react";

// Pricing constants
// Normal monthly: R$200 | With voucher: R$180 | Commission: R$90/mo
// Normal annual:  R$1920 | With voucher: R$1728 | Commission: R$864/yr
const MONTHLY_CLIENT = 180;  // after 10% voucher
const MONTHLY_COMM   = 90;   // 50% of 180
const ANNUAL_CLIENT  = 1728; // after 10% voucher
const ANNUAL_COMM    = 864;  // 50% of 1728

export default function TrabalheConoscoPage() {
  const [clients, setClients] = useState(10);
  const [annual, setAnnual]   = useState(false);

  const commPerClient = annual ? ANNUAL_COMM    : MONTHLY_COMM;
  const clientPays    = annual ? ANNUAL_CLIENT  : MONTHLY_CLIENT;
  const period        = annual ? "por ano"      : "por mês";
  const total         = clients * commPerClient;

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
          <h3>50% do que o cliente paga</h3>
          <p>Plano mensal com voucher: cliente paga R$&nbsp;180 → você ganha <strong>R$&nbsp;90/mês</strong>, todo mês — a partir do 2º mês, após os 30 dias grátis.</p>
        </div>
        <div className="tc-card highlight">
          <div className="tc-card-icon">🎟️</div>
          <h3>Voucher de 10% para seu cliente</h3>
          <p>Seu cliente paga menos, você fecha mais vendas — e ganha 50% do valor real pago.</p>
        </div>
        <div className="tc-card">
          <div className="tc-card-icon">📅</div>
          <h3>Plano anual = comissão maior</h3>
          <p>Cliente anual com voucher: R$&nbsp;1.728/ano → você ganha <strong>R$&nbsp;864 de uma vez</strong>.</p>
        </div>
        <div className="tc-card">
          <div className="tc-card-icon">🚀</div>
          <h3>Sem limite de ganhos</h3>
          <p>10 clientes mensais = R$&nbsp;900/mês. 50 clientes = R$&nbsp;4.500/mês. Sem teto.</p>
        </div>
      </section>

      {/* SIMULATOR */}
      <section className="tc-sim">
        <div className="tc-sim-inner">
          <div className="tc-sim-label">Simulador de Ganhos</div>
          <h2 className="tc-sim-h2">Quanto você pode ganhar?</h2>

          {/* Toggle mensal / anual */}
          <div className="tc-toggle-row">
            <span className={!annual ? "tc-toggle-lbl active" : "tc-toggle-lbl"}>Mensal</span>
            <button
              className={`tc-toggle${annual ? " on" : ""}`}
              onClick={() => setAnnual(v => !v)}
            >
              <div className="tc-toggle-knob" />
            </button>
            <span className={annual ? "tc-toggle-lbl active" : "tc-toggle-lbl"}>
              Anual <span className="tc-save-badge">Comissão maior</span>
            </span>
          </div>

          {/* Breakdown box */}
          <div className="tc-breakdown">
            <div className="tc-bk-item">
              <span className="tc-bk-label">Preço normal</span>
              <span className="tc-bk-val muted">{annual ? "R$ 1.920/ano" : "R$ 200/mês"}</span>
            </div>
            <div className="tc-bk-item">
              <span className="tc-bk-label">Com voucher 10%</span>
              <span className="tc-bk-val">{annual ? "R$ 1.728/ano" : "R$ 180/mês"}</span>
            </div>
            <div className="tc-bk-item">
              <span className="tc-bk-label">Sua comissão (50%)</span>
              <span className="tc-bk-val green">{annual ? "R$ 864/ano" : "R$ 90/mês"}</span>
            </div>
          </div>

          <p className="tc-sim-sub" style={{marginBottom: 24}}>Arraste para ver seu ganho total</p>

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
              <span className="tc-sim-desc">clientes</span>
            </div>
            <div className="tc-sim-arrow">→</div>
            <div className="tc-sim-earn">
              <span className="tc-sim-money">R$ {total.toLocaleString("pt-BR")}</span>
              <span className="tc-sim-desc">{period}</span>
            </div>
          </div>

          <p className="tc-sim-note">
            {annual
              ? `${clients} clientes × R$ 864 comissão/ano (50% de R$ 1.728) — a partir do 1º pagamento`
              : `${clients} clientes × R$ 90 comissão/mês (50% de R$ 180) — a partir do 31º dia`
            }
          </p>
          <p className="tc-sim-trial-note">⚠️ Os primeiros 30 dias são gratuitos para o cliente. Sua comissão começa quando ele faz o primeiro pagamento.</p>
        </div>
      </section>

      {/* MEI / CNPJ INFO BOX */}
      <section className="tc-mei">
        <div className="tc-mei-inner">
          <div className="tc-mei-icon">📄</div>
          <div className="tc-mei-text">
            <h3>Parceria formal com contrato de prestação de serviços</h3>
            <p>
              Para ser parceiro comercial do Food Pronto, é obrigatório ter um <strong>CNPJ ativo</strong>.
              Após a aprovação, enviamos um <strong>contrato de prestação de serviços</strong> para assinatura digital.
              Não tem CNPJ ainda? Recomendamos a abertura de uma <strong>MEI</strong> — gratuito, 100% online e leva menos de 10 minutos.
            </p>
            <div className="tc-mei-cnae">
              <div className="tc-cnae-badge">CNAE recomendado para MEI</div>
              <div className="tc-cnae-code">7490-1/04</div>
              <div className="tc-cnae-desc">
                <strong>Atividades de intermediação e agenciamento de serviços e negócios em geral</strong><br />
                <span>Este CNAE enquadra perfeitamente a atividade de representante comercial que indica e intermedia contratos de serviços de tecnologia como o Food Pronto.</span>
              </div>
            </div>
            <a
              href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei"
              target="_blank"
              rel="noopener noreferrer"
              className="tc-mei-link"
            >
              🔗 Abrir minha MEI no portal do governo (gratuito)
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="tc-how">
        <h2 className="tc-how-h2">Como funciona?</h2>
        <div className="tc-steps">
          {[
            { n: "1", title: "Fale com a gente", desc: "Mande um WhatsApp. Nossa equipe vai te explicar tudo e verificar seu CNPJ ativo." },
            { n: "2", title: "Assine o contrato de parceria", desc: "Enviamos um contrato de prestação de serviços para assinatura digital. Simples e rápido. Sem MEI? Te ajudamos a abrir um." },
            { n: "3", title: "Ofereça o voucher ao cliente", desc: "Apresente o Food Pronto com o voucher de 10%: o cliente tem 30 dias grátis para testar. Depois paga R$180/mês (ou R$1.728/ano)." },
            { n: "4", title: "Comissão começa após os 30 dias grátis", desc: "Quando o cliente faz o 1º pagamento, sua comissão é gerada: R$90/mês (plano mensal) ou R$864 (plano anual)." },
            { n: "5", title: "Escale sem limite", desc: "10 clientes = R$900/mês. 50 clientes = R$4.500/mês. 100 clientes = R$9.000/mês. Sem teto, sem custo fixo." },
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
  { q: "Quanto eu ganho exatamente?", a: "Você ganha 50% do valor que o cliente paga. Com o voucher de 10%: plano mensal → cliente paga R$180, você ganha R$90/mês. Plano anual → cliente paga R$1.728/ano, você ganha R$864 de uma vez." },
  { q: "Quando começa minha comissão?", a: "O cliente tem 30 dias grátis para testar o Food Pronto. Sua comissão começa quando ele faz o primeiro pagamento — ou seja, a partir do 31º dia. Para clientes anuais, você recebe R$864 assim que o pagamento anual é confirmado." },
  { q: "Preciso de CNPJ para ser parceiro?", a: "Sim. É obrigatório ter CNPJ ativo para assinar o contrato de prestação de serviços. A forma mais simples é abrir uma MEI — é gratuito, online e leva menos de 10 minutos no portal do governo. O CNAE indicado para a atividade de representante comercial é o 7490-1/04 (Atividades de intermediação e agenciamento de serviços e negócios em geral)." },
  { q: "Como funciona o contrato?", a: "Enviamos um contrato de prestação de serviços para assinatura digital após a aprovação do seu cadastro. Ele formaliza a parceria, define as comissões e garante os seus direitos." },
  { q: "O voucher de 10% reduz minha comissão?", a: "Não. O voucher é aplicado no preço do cliente, e você ganha 50% do valor real pago. Ou seja, quanto mais barato para o cliente, mais fácil você fecha — e você ainda ganha 50%." },
  { q: "Como recebo minhas comissões?", a: "As comissões são pagas mensalmente via Pix para a conta vinculada ao seu CNPJ. Para clientes anuais, você recebe R$864 no momento em que o cliente confirma o pagamento anual." },
  { q: "Existe algum custo para ser parceiro?", a: "Zero. Não existe taxa de adesão, treinamento pago ou mensalidade. Você só ganha." },
  { q: "E se o cliente cancelar durante os 30 dias grátis?", a: "Sem problema — nenhuma comissão foi gerada ainda. A comissão só existe quando há pagamento real." },
  { q: "E se o cliente cancelar depois de pagar?", a: "A comissão é recorrente enquanto o cliente pagar. Se ele cancelar, a comissão daquele cliente para. Clientes anuais são mais vantajosos — você recebe tudo de uma vez." },
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

  /* MEI INFO BOX */
  .tc-mei { padding: 0 40px 60px; }
  .tc-mei-inner { max-width: 860px; margin: 0 auto; background: var(--surface); border: 1px solid rgba(255,193,7,0.2); border-radius: 20px; padding: 32px; display: flex; gap: 24px; align-items: flex-start; }
  .tc-mei-icon { font-size: 36px; flex-shrink: 0; margin-top: 4px; }
  .tc-mei-text h3 { font-family: var(--d); font-size: 18px; font-weight: 800; margin-bottom: 10px; color: var(--text); }
  .tc-mei-text p { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 20px; }
  .tc-mei-text strong { color: var(--text); }
  .tc-mei-cnae { background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; margin-bottom: 18px; }
  .tc-cnae-badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,193,7,0.9); border: 1px solid rgba(255,193,7,0.25); border-radius: 100px; padding: 3px 12px; margin-bottom: 10px; }
  .tc-cnae-code { font-family: var(--d); font-size: 28px; font-weight: 900; color: rgba(255,193,7,0.9); margin-bottom: 8px; }
  .tc-cnae-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }
  .tc-cnae-desc strong { color: var(--text); }
  .tc-mei-link { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: rgba(255,193,7,0.9); border: 1px solid rgba(255,193,7,0.25); border-radius: 10px; padding: 10px 18px; background: rgba(255,193,7,0.06); transition: background .2s; }
  .tc-mei-link:hover { background: rgba(255,193,7,0.12); }

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
  .tc-sim-h2 { font-family: var(--d); font-size: clamp(26px,4vw,42px); font-weight: 900; margin-bottom: 24px; }
  .tc-sim-sub { font-size: 15px; color: var(--muted); }
  /* Toggle */
  .tc-toggle-row { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 28px; }
  .tc-toggle-lbl { font-size: 14px; color: var(--muted); font-weight: 600; display: flex; align-items: center; gap: 8px; transition: color .2s; }
  .tc-toggle-lbl.active { color: var(--text); }
  .tc-toggle { width: 48px; height: 26px; border-radius: 100px; border: none; cursor: pointer; padding: 3px; display: flex; align-items: center; background: rgba(255,255,255,0.1); transition: background .25s; }
  .tc-toggle.on { background: var(--green); justify-content: flex-end; }
  .tc-toggle-knob { width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
  .tc-save-badge { background: rgba(34,197,94,0.15); color: var(--green); border-radius: 100px; padding: 2px 10px; font-size: 11px; font-weight: 700; }
  /* Breakdown */
  .tc-breakdown { background: var(--surface2); border: 1px solid var(--border); border-radius: 16px; padding: 20px 24px; margin-bottom: 28px; display: flex; flex-direction: column; gap: 12px; text-align: left; }
  .tc-bk-item { display: flex; justify-content: space-between; align-items: center; }
  .tc-bk-label { font-size: 13px; color: var(--muted); }
  .tc-bk-val { font-size: 14px; font-weight: 700; }
  .tc-bk-val.muted { color: var(--muted); text-decoration: line-through; }
  .tc-bk-val.green { color: var(--green); font-size: 16px; }
  /* Slider */
  .tc-slider-wrap { margin-bottom: 32px; }
  .tc-slider { width: 100%; height: 6px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, var(--green) 0%, var(--green) 50%, var(--surface2) 50%, var(--surface2) 100%); border-radius: 100px; outline: none; cursor: pointer; }
  .tc-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 4px rgba(34,197,94,0.2); cursor: pointer; }
  .tc-slider-labels { display: flex; justify-content: space-between; margin-top: 10px; font-size: 12px; color: var(--muted); }
  .tc-sim-result { display: flex; align-items: center; justify-content: center; gap: 32px; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; padding: 32px; margin-bottom: 16px; }
  .tc-sim-clients, .tc-sim-earn { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .tc-sim-num { font-family: var(--d); font-size: 56px; font-weight: 900; color: var(--text); line-height: 1; }
  .tc-sim-money { font-family: var(--d); font-size: 56px; font-weight: 900; color: var(--green); line-height: 1; }
  .tc-sim-desc { font-size: 13px; color: var(--muted); font-weight: 600; }
  .tc-sim-arrow { font-size: 28px; color: var(--muted); }
  .tc-sim-note { font-size: 12px; color: var(--muted); margin-bottom: 10px; }
  .tc-sim-trial-note { font-size: 12px; color: rgba(255,193,7,0.8); background: rgba(255,193,7,0.07); border: 1px solid rgba(255,193,7,0.15); border-radius: 10px; padding: 10px 16px; margin-top: 8px; line-height: 1.5; }

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
