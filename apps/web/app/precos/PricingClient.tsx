"use client";

import { useState } from "react";
import Link from "next/link";

export default function PricingClient() {
  const [annual, setAnnual] = useState(false);
  const monthly = 200;
  const annualMonthly = 160;
  const price = annual ? annualMonthly : monthly;

  return (
    <>
      <style>{CSS}</style>
      <div className="pr-page">

        {/* NAV */}
        <nav className="pr-nav">
          <Link href="/" className="pr-logo">
            <span>🍔</span> Food Pronto
          </Link>
          <Link href="/onboarding" className="pr-nav-cta">
            Começar grátis →
          </Link>
        </nav>

        {/* HERO */}
        <section className="pr-hero">
          <div className="pr-hero-glow" />
          <div className="pr-tag">💰 Preço simples, sem surpresa</div>
          <h1 className="pr-h1">
            Tudo que seu food truck<br />
            precisa por{" "}
            <span className="pr-accent">
              R$ {price.toLocaleString("pt-BR")}<span className="pr-mo">/mês</span>
            </span>
          </h1>
          <p className="pr-sub">
            Primeiro mês completamente grátis. Sem contrato. Cancele quando quiser.
          </p>

          {/* Toggle mensal / anual */}
          <div className="pr-toggle-row">
            <span className={!annual ? "pr-toggle-label active" : "pr-toggle-label"}>
              Mensal
            </span>
            <button
              className={`pr-toggle ${annual ? "on" : ""}`}
              onClick={() => setAnnual((v) => !v)}
            >
              <div className="pr-toggle-knob" />
            </button>
            <span className={annual ? "pr-toggle-label active" : "pr-toggle-label"}>
              Anual
              <span className="pr-save-badge">Economize 20%</span>
            </span>
          </div>
        </section>

        {/* MAIN PRICING CARD */}
        <section className="pr-card-section">
          <div className="pr-card">

            <div className="pr-card-header">
              <div>
                <div className="pr-plan-name">Plano Food Truck</div>
                <div className="pr-price-row">
                  <span className="pr-currency">R$</span>
                  <span className="pr-price-num">{price.toLocaleString("pt-BR")}</span>
                  <span className="pr-per">/mês</span>
                </div>
                {annual && (
                  <div className="pr-annual-note">
                    Cobrado anualmente — R$ {(annualMonthly * 12).toLocaleString("pt-BR")}/ano
                  </div>
                )}
              </div>
              <div className="pr-free-badge">
                <span className="pr-free-n">30</span>
                <span className="pr-free-l">dias grátis</span>
              </div>
            </div>

            <div className="pr-divider" />

            {/* Features */}
            <ul className="pr-features">
              {FEATURES.map((f, i) => (
                <li key={i} className="pr-feat">
                  <span className="pr-feat-check">✓</span>
                  <div>
                    <span className="pr-feat-title">{f.title}</span>
                    {f.desc && <span className="pr-feat-desc">{f.desc}</span>}
                  </div>
                </li>
              ))}
            </ul>

            <div className="pr-divider" />

            <Link href="/onboarding" className="pr-cta-btn">
              Começar 30 dias grátis — sem cartão
            </Link>
            <p className="pr-cta-note">
              Após o período gratuito, apenas R$ {price.toLocaleString("pt-BR")}/mês. Cancele a qualquer momento.
            </p>
          </div>
        </section>

        {/* ZERO HARDWARE SECTION */}
        <section className="pr-zero">
          <div className="pr-zero-inner">
            <div className="pr-zero-tag">Esqueça o hardware caro</div>
            <h2 className="pr-zero-h2">
              Zero equipamento.<br />
              <span className="pr-accent">100% pelo celular.</span>
            </h2>

            <div className="pr-compare">
              {/* Antes */}
              <div className="pr-compare-col bad">
                <div className="pr-compare-header">
                  <span className="pr-compare-emoji">😓</span>
                  <span className="pr-compare-title">Jeito antigo</span>
                </div>
                {OLD_WAY.map((item, i) => (
                  <div key={i} className="pr-compare-item bad">
                    <span className="pr-compare-x">✕</span>
                    <div>
                      <div className="pr-compare-main">{item.title}</div>
                      {item.cost && <div className="pr-compare-cost">{item.cost}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pr-compare-vs">VS</div>

              {/* Depois */}
              <div className="pr-compare-col good">
                <div className="pr-compare-header">
                  <span className="pr-compare-emoji">🚀</span>
                  <span className="pr-compare-title">Food Pronto</span>
                </div>
                {NEW_WAY.map((item, i) => (
                  <div key={i} className="pr-compare-item good">
                    <span className="pr-compare-ok">✓</span>
                    <div>
                      <div className="pr-compare-main">{item.title}</div>
                      {item.note && <div className="pr-compare-note">{item.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MERCADO PAGO SECTION */}
        <section className="pr-mp">
          <div className="pr-mp-inner">
            <div className="pr-mp-left">
              <div className="pr-mp-badge">Pagamentos integrados</div>
              <h2 className="pr-mp-h2">
                Receba pelo<br />
                <span className="pr-accent">Mercado Pago</span>
              </h2>
              <p className="pr-mp-body">
                Você já usa o Mercado Pago do Mercado Livre no dia a dia? Então já tem tudo que precisa.
                Conecte sua conta em segundos e comece a receber <strong>Pix, cartão de crédito e débito</strong> direto no app — sem maquininha, sem aluguel, sem taxa fixa.
              </p>
              <div className="pr-mp-perks">
                {MP_PERKS.map((p, i) => (
                  <div key={i} className="pr-mp-perk">
                    <span className="pr-mp-perk-icon">{p.icon}</span>
                    <div>
                      <div className="pr-mp-perk-t">{p.title}</div>
                      <div className="pr-mp-perk-d">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pr-mp-right">
              <div className="pr-mp-card">
                <div className="pr-mp-logo-row">
                  <div className="pr-mp-logo-icon">🔵</div>
                  <div>
                    <div className="pr-mp-logo-name">Mercado Pago</div>
                    <div className="pr-mp-logo-sub">by Mercado Livre</div>
                  </div>
                </div>
                <div className="pr-mp-methods">
                  {[
                    { icon: "⚡", label: "Pix", rate: "1% de taxa", color: "#22C55E" },
                    { icon: "💳", label: "Crédito", rate: "4,99% por transação", color: "#3B82F6" },
                    { icon: "🏦", label: "Débito", rate: "3,49% por transação", color: "#8B5CF6" },
                  ].map((m) => (
                    <div key={m.label} className="pr-mp-method">
                      <span className="pr-mp-m-icon">{m.icon}</span>
                      <span className="pr-mp-m-label">{m.label}</span>
                      <span className="pr-mp-m-rate" style={{ color: m.color }}>{m.rate}</span>
                    </div>
                  ))}
                </div>
                <div className="pr-mp-note">
                  Sem mensalidade de maquininha.<br />
                  Sem aluguel de equipamento.<br />
                  Sem taxa de adesão.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FREEDOM SECTION */}
        <section className="pr-freedom">
          <div className="pr-freedom-inner">
            <div className="pr-freedom-visual">
              <div className="pr-freedom-ring pr-ring-1" />
              <div className="pr-freedom-ring pr-ring-2" />
              <div className="pr-freedom-ring pr-ring-3" />
              <div className="pr-freedom-center">
                <span className="pr-freedom-truck">🍔</span>
                <div className="pr-freedom-radius-label">até centenas de metros</div>
              </div>
              <div className="pr-freedom-person" style={{ top: "12%", left: "55%" }}>
                <span>🧍</span><span className="pr-person-label">Na fila do banheiro</span>
              </div>
              <div className="pr-freedom-person" style={{ top: "62%", left: "72%" }}>
                <span>🧍</span><span className="pr-person-label">Na sombra</span>
              </div>
              <div className="pr-freedom-person" style={{ top: "72%", left: "20%" }}>
                <span>🧍</span><span className="pr-person-label">No banco do parque</span>
              </div>
              <div className="pr-freedom-person" style={{ top: "22%", left: "18%" }}>
                <span>🧍</span><span className="pr-person-label">Tomando cerveja</span>
              </div>
            </div>

            <div className="pr-freedom-text">
              <div className="pr-freedom-tag">Liberdade total</div>
              <h2 className="pr-freedom-h2">
                Esqueça a fila.<br />
                <span className="pr-accent">Seu celular avisa.</span>
              </h2>
              <p className="pr-freedom-body">
                Com painel LED ou senhas em papel, o cliente fica preso perto do truck com medo de perder a vez. Com o Food Pronto, quando o pedido ficar pronto, o celular do cliente <strong>vibra e toca um som</strong> — seja onde ele estiver.
              </p>
              <div className="pr-freedom-feats">
                {[
                  { icon: "📳", title: "Vibração + som simultâneos", desc: "Impossível não perceber, mesmo em locais barulhentos" },
                  { icon: "📡", title: "Funciona a centenas de metros", desc: "O cliente pode passear, sentar na sombra, ir ao banheiro" },
                  { icon: "🔇", title: "Penetra o modo silencioso", desc: "O app pede permissão especial para tocar mesmo com o celular no silencioso" },
                  { icon: "🎯", title: "Mais rotatividade no seu truck", desc: "Clientes satisfeitos voltam — e indicam para amigos" },
                ].map((f, i) => (
                  <div key={i} className="pr-freedom-feat">
                    <span className="pr-freedom-feat-icon">{f.icon}</span>
                    <div>
                      <div className="pr-freedom-feat-t">{f.title}</div>
                      <div className="pr-freedom-feat-d">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pr-faq">
          <h2 className="pr-faq-h2">Perguntas frequentes</h2>
          <div className="pr-faq-list">
            {FAQ.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="pr-final">
          <div className="pr-final-glow" />
          <div className="pr-final-inner">
            <h2 className="pr-final-h2">
              30 dias grátis.<br />
              <span className="pr-accent">Sem cartão, sem compromisso.</span>
            </h2>
            <p className="pr-final-sub">
              Cadastre seu food truck agora e comece a receber pedidos hoje mesmo.
            </p>
            <Link href="/onboarding" className="pr-final-btn">
              Quero testar grátis por 30 dias →
            </Link>
            <p className="pr-final-note">
              Depois apenas R$ 200/mês. Cancele quando quiser.
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pr-footer">
          <Link href="/" className="pr-footer-logo">🍔 Food Pronto</Link>
          <div className="pr-footer-links">
            <Link href="/termos">Termos</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/contato">Contato</Link>
          </div>
          <p className="pr-footer-copy">© {new Date().getFullYear()} Food Pronto. Feito com ❤️ no Brasil.</p>
        </footer>
      </div>
    </>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`pr-faq-item ${open ? "open" : ""}`}>
      <button className="pr-faq-q" onClick={() => setOpen((v) => !v)}>
        <span>{q}</span>
        <span className="pr-faq-arrow">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pr-faq-a">{a}</div>}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  { title: "Cardápio digital com QR Code", desc: "Cliente escaneia e já pede — sem app, sem cadastro obrigatório" },
  { title: "Pedidos em tempo real", desc: "Você vê e gerencia cada pedido ao vivo no celular ou tablet" },
  { title: "Pagamento via Mercado Pago", desc: "Pix, crédito e débito — sem maquininha" },
  { title: "Alerta sonoro + vibração no celular do cliente", desc: "Quando o pedido fica pronto, o celular toca e vibra onde quer que o cliente esteja" },
  { title: "Painel da cozinha mobile", desc: "App exclusivo para gerenciar a fila de pedidos em campo" },
  { title: "Mapa no app para clientes", desc: "Seu truck aparece no mapa para quem está por perto" },
  { title: "Dashboard com estatísticas", desc: "Faturamento e pedidos mais vendidos" },
  { title: "QR Code em alta resolução para impressão", desc: "Cole no balcão e pronto" },
  { title: "URL SEO-friendly do cardápio", desc: "foodpronto.com.br/menu/sp/sua-cidade/seu-truck" },
  { title: "Suporte via WhatsApp", desc: "Ajuda humana, não robô" },
];

const OLD_WAY = [
  { title: "Maquininha de cartão", cost: "R$ 80–150/mês de aluguel" },
  { title: "Painel LED de senha", cost: "R$ 300–800 de equipamento" },
  { title: "Impressora de senhas", cost: "R$ 200–500 + papel" },
  { title: "Cliente preso perto do truck", cost: "Experiência ruim, menor rotatividade" },
  { title: "Cardápio em quadro ou lousa", cost: "Difícil atualizar preços" },
  { title: "Controle manual de pedidos", cost: "Erros, confusão na correria" },
];

const NEW_WAY = [
  { title: "Sem maquininha", note: "Pague com Pix, crédito ou débito no celular" },
  { title: "Sem painel LED", note: "O celular do cliente vibra e toca onde ele estiver" },
  { title: "Sem impressora de senhas", note: "Tudo digital, zero papel" },
  { title: "Cliente livre para passear", note: "Melhor experiência, mais fidelização" },
  { title: "Cardápio online atualizado", note: "Mude preços em segundos pelo painel" },
  { title: "Fila de pedidos organizada", note: "Tudo no celular, em tempo real" },
];

const MP_PERKS = [
  { icon: "✅", title: "Você já usa o Mercado Pago?", desc: "Então já tem tudo. É só conectar sua conta — leva 2 minutos." },
  { icon: "📲", title: "Receba na hora no celular", desc: "O dinheiro cai diretamente na sua conta Mercado Pago." },
  { icon: "🔐", title: "Seguro e confiável", desc: "A mesma plataforma de pagamentos do Mercado Livre — usada por milhões no Brasil." },
  { icon: "💸", title: "Sem taxa fixa", desc: "Paga apenas quando vende. Pix tem taxa de 1% — cartão tem taxa por transação." },
];

const FAQ = [
  {
    q: "Preciso de maquininha de cartão?",
    a: "Não! Todos os pagamentos são feitos pelo celular do cliente, integrado ao Mercado Pago. O cliente paga com Pix (taxa 1%), cartão de crédito (4,99%) ou débito (3,49%) direto no app ou na página web do cardápio.",
  },
  {
    q: "Preciso comprar algum equipamento?",
    a: "Zero. Tudo que você precisa é de um celular com internet para gerenciar os pedidos. Nada de maquininha, painel LED, impressora de senhas ou tablet especial.",
  },
  {
    q: "Como o cliente sabe que o pedido ficou pronto?",
    a: "O celular do cliente vibra e toca um som — seja lá onde ele estiver. Pode estar a 200 metros, sentado na sombra, na fila do banheiro, tomando uma cerveja. O app pede permissão especial para tocar mesmo com o celular no silencioso.",
  },
  {
    q: "Como funciona o primeiro mês grátis?",
    a: "Você cadastra seu truck, cria o cardápio e começa a receber pedidos. São 30 dias completos sem cobrar nada, sem precisar de cartão de crédito. Depois, o plano é R$ 200/mês (ou R$ 160/mês no plano anual).",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Sem multa, sem contrato de fidelidade. Se quiser cancelar, é só avisar por WhatsApp e pronto.",
  },
  {
    q: "Meu cliente precisa baixar um app para pedir?",
    a: "Não. O cliente escaneia o QR Code com a câmera do celular e já vê o cardápio no navegador — sem download. Se quiser baixar o app (iOS ou Android), tem a vantagem do alerta sonoro mais potente e do mapa de trucks próximos.",
  },
  {
    q: "Funciona em qualquer cidade do Brasil?",
    a: "Sim! O app funciona em todo o Brasil. Seu truck aparece no mapa para clientes na sua cidade, e a URL do cardápio inclui o estado e a cidade para ajudar no Google.",
  },
  {
    q: "Já tenho conta no Mercado Pago. Funciona?",
    a: "Perfeitamente. É só conectar sua conta existente — não precisa criar uma nova nem transferir saldo. O dinheiro dos pedidos cai diretamente na sua conta Mercado Pago normal.",
  },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Nunito:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080810; --surface: #0f0f1a; --surface2: #16162a;
    --border: rgba(255,255,255,0.07); --orange: #FF6B35;
    --orange-dim: rgba(255,107,53,0.12); --green: #22C55E;
    --text: #f0f0f8; --muted: rgba(240,240,248,0.45);
    --display: 'Syne', sans-serif; --body: 'Nunito', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--body); }
  a { text-decoration: none; color: inherit; }
  strong { color: var(--text); }

  .pr-page { min-height: 100vh; background: var(--bg); }
  .pr-accent { color: var(--orange); }

  /* NAV */
  .pr-nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; background: rgba(8,8,16,0.9); backdrop-filter: blur(12px); }
  .pr-logo { display: flex; align-items: center; gap: 8px; font-family: var(--display); font-size: 17px; font-weight: 800; }
  .pr-nav-cta { background: var(--orange); color: #fff; padding: 9px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; transition: opacity 0.2s; }
  .pr-nav-cta:hover { opacity: 0.88; }

  /* HERO */
  .pr-hero { position: relative; padding: 80px 40px 60px; text-align: center; overflow: hidden; }
  .pr-hero-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(255,107,53,0.12) 0%, transparent 70%); pointer-events: none; }
  .pr-tag { display: inline-flex; align-items: center; gap: 6px; background: var(--orange-dim); border: 1px solid rgba(255,107,53,0.22); border-radius: 100px; padding: 6px 16px; font-size: 13px; color: var(--orange); font-weight: 600; margin-bottom: 24px; }
  .pr-h1 { font-family: var(--display); font-size: clamp(36px, 5vw, 68px); font-weight: 900; line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 20px; }
  .pr-mo { font-size: 0.45em; color: var(--muted); font-weight: 700; vertical-align: super; }
  .pr-sub { font-size: 18px; color: var(--muted); max-width: 480px; margin: 0 auto 32px; line-height: 1.6; }

  /* Toggle anual */
  .pr-toggle-row { display: flex; align-items: center; justify-content: center; gap: 14px; }
  .pr-toggle-label { font-size: 14px; color: var(--muted); font-weight: 600; display: flex; align-items: center; gap: 8px; transition: color 0.2s; }
  .pr-toggle-label.active { color: var(--text); }
  .pr-toggle { width: 48px; height: 26px; border-radius: 100px; border: none; cursor: pointer; padding: 3px; display: flex; align-items: center; background: rgba(255,255,255,0.1); transition: background 0.25s; }
  .pr-toggle.on { background: var(--orange); justify-content: flex-end; }
  .pr-toggle-knob { width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3); transition: none; }
  .pr-save-badge { background: rgba(34,197,94,0.15); color: var(--green); border-radius: 100px; padding: 2px 10px; font-size: 11px; font-weight: 700; }

  /* MAIN CARD */
  .pr-card-section { padding: 0 20px 80px; max-width: 560px; margin: 0 auto; }
  .pr-card { background: var(--surface); border: 1px solid rgba(255,107,53,0.2); border-radius: 24px; padding: 36px; box-shadow: 0 0 60px rgba(255,107,53,0.08); }
  .pr-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .pr-plan-name { font-size: 13px; font-weight: 700; color: var(--orange); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
  .pr-price-row { display: flex; align-items: baseline; gap: 4px; }
  .pr-currency { font-size: 22px; font-weight: 800; color: var(--muted); }
  .pr-price-num { font-family: var(--display); font-size: 64px; font-weight: 900; line-height: 1; color: var(--text); }
  .pr-per { font-size: 18px; color: var(--muted); font-weight: 600; }
  .pr-annual-note { font-size: 12px; color: var(--muted); margin-top: 6px; }
  .pr-free-badge { display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); border-radius: 16px; padding: 14px 18px; text-align: center; }
  .pr-free-n { font-family: var(--display); font-size: 36px; font-weight: 900; color: var(--green); line-height: 1; }
  .pr-free-l { font-size: 11px; font-weight: 700; color: var(--green); text-transform: uppercase; letter-spacing: 0.05em; }
  .pr-divider { height: 1px; background: var(--border); margin: 24px 0; }
  .pr-features { list-style: none; display: flex; flex-direction: column; gap: 14px; margin-bottom: 8px; }
  .pr-feat { display: flex; align-items: flex-start; gap: 12px; }
  .pr-feat-check { color: var(--green); font-weight: 800; font-size: 14px; margin-top: 1px; flex-shrink: 0; }
  .pr-feat-title { font-size: 14px; font-weight: 600; display: block; }
  .pr-feat-desc { font-size: 12px; color: var(--muted); display: block; margin-top: 2px; line-height: 1.4; }
  .pr-cta-btn { display: block; background: var(--orange); color: #fff; text-align: center; padding: 18px; border-radius: 14px; font-size: 16px; font-weight: 800; transition: opacity 0.2s; box-shadow: 0 8px 28px rgba(255,107,53,0.35); font-family: var(--body); }
  .pr-cta-btn:hover { opacity: 0.88; }
  .pr-cta-note { font-size: 12px; color: var(--muted); text-align: center; margin-top: 12px; line-height: 1.5; }

  /* ZERO HARDWARE */
  .pr-zero { padding: 80px 40px; background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .pr-zero-inner { max-width: 900px; margin: 0 auto; }
  .pr-zero-tag { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--orange); border: 1px solid rgba(255,107,53,0.22); border-radius: 100px; padding: 4px 14px; margin-bottom: 16px; }
  .pr-zero-h2 { font-family: var(--display); font-size: clamp(28px, 4vw, 48px); font-weight: 900; margin-bottom: 40px; line-height: 1.1; }
  .pr-compare { display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; align-items: start; }
  .pr-compare-col { background: var(--surface2); border-radius: 18px; overflow: hidden; border: 1px solid var(--border); }
  .pr-compare-col.good { border-color: rgba(255,107,53,0.2); }
  .pr-compare-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
  .pr-compare-emoji { font-size: 20px; }
  .pr-compare-title { font-size: 15px; font-weight: 800; }
  .pr-compare-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 20px; border-bottom: 1px solid var(--border); }
  .pr-compare-item:last-child { border-bottom: none; }
  .pr-compare-x { color: var(--red, #EF4444); font-weight: 800; font-size: 13px; margin-top: 1px; flex-shrink: 0; }
  .pr-compare-ok { color: var(--green); font-weight: 800; font-size: 13px; margin-top: 1px; flex-shrink: 0; }
  .pr-compare-main { font-size: 13px; font-weight: 600; }
  .pr-compare-cost { font-size: 11px; color: rgba(239,68,68,0.8); margin-top: 2px; }
  .pr-compare-note { font-size: 11px; color: rgba(34,197,94,0.8); margin-top: 2px; }
  .pr-compare-vs { display: flex; align-items: center; justify-content: center; font-family: var(--display); font-size: 20px; font-weight: 900; color: var(--muted); padding-top: 40px; }

  /* MERCADO PAGO */
  .pr-mp { padding: 80px 40px; }
  .pr-mp-inner { max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .pr-mp-badge { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--orange); border: 1px solid rgba(255,107,53,0.22); border-radius: 100px; padding: 4px 14px; margin-bottom: 16px; }
  .pr-mp-h2 { font-family: var(--display); font-size: clamp(28px, 3.5vw, 44px); font-weight: 900; line-height: 1.1; margin-bottom: 18px; }
  .pr-mp-body { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 28px; }
  .pr-mp-perks { display: flex; flex-direction: column; gap: 16px; }
  .pr-mp-perk { display: flex; align-items: flex-start; gap: 12px; }
  .pr-mp-perk-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
  .pr-mp-perk-t { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .pr-mp-perk-d { font-size: 13px; color: var(--muted); line-height: 1.4; }
  .pr-mp-card { background: var(--surface); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 28px; }
  .pr-mp-logo-row { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
  .pr-mp-logo-icon { font-size: 36px; }
  .pr-mp-logo-name { font-size: 18px; font-weight: 800; }
  .pr-mp-logo-sub { font-size: 12px; color: var(--muted); }
  .pr-mp-methods { display: flex; flex-direction: column; gap: 2px; margin-bottom: 20px; }
  .pr-mp-method { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--surface2); border-radius: 12px; margin-bottom: 6px; }
  .pr-mp-m-icon { font-size: 20px; width: 28px; text-align: center; flex-shrink: 0; }
  .pr-mp-m-label { font-size: 14px; font-weight: 700; flex: 1; }
  .pr-mp-m-rate { font-size: 13px; font-weight: 700; }
  .pr-mp-note { font-size: 13px; color: var(--muted); line-height: 1.7; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--border); }

  /* FREEDOM */
  .pr-freedom { padding: 80px 40px; background: var(--surface); border-top: 1px solid var(--border); }
  .pr-freedom-inner { max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .pr-freedom-visual { position: relative; width: 100%; aspect-ratio: 1; max-width: 380px; }
  .pr-freedom-ring { position: absolute; border-radius: 50%; border: 1px solid; top: 50%; left: 50%; transform: translate(-50%, -50%); }
  .pr-ring-1 { width: 30%; height: 30%; border-color: rgba(255,107,53,0.6); background: rgba(255,107,53,0.08); }
  .pr-ring-2 { width: 60%; height: 60%; border-color: rgba(255,107,53,0.25); border-style: dashed; }
  .pr-ring-3 { width: 90%; height: 90%; border-color: rgba(255,107,53,0.1); border-style: dashed; }
  .pr-freedom-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
  .pr-freedom-truck { font-size: 32px; display: block; }
  .pr-freedom-radius-label { font-size: 9px; color: var(--orange); font-weight: 700; text-align: center; margin-top: 4px; white-space: nowrap; }
  .pr-freedom-person { position: absolute; text-align: center; }
  .pr-freedom-person span:first-child { font-size: 20px; display: block; }
  .pr-person-label { font-size: 9px; color: var(--muted); white-space: nowrap; display: block; margin-top: 2px; }
  .pr-freedom-tag { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--orange); border: 1px solid rgba(255,107,53,0.22); border-radius: 100px; padding: 4px 14px; margin-bottom: 16px; }
  .pr-freedom-h2 { font-family: var(--display); font-size: clamp(28px, 3.5vw, 44px); font-weight: 900; line-height: 1.1; margin-bottom: 18px; }
  .pr-freedom-body { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 28px; }
  .pr-freedom-feats { display: flex; flex-direction: column; gap: 16px; }
  .pr-freedom-feat { display: flex; align-items: flex-start; gap: 12px; }
  .pr-freedom-feat-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
  .pr-freedom-feat-t { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .pr-freedom-feat-d { font-size: 13px; color: var(--muted); line-height: 1.4; }

  /* FAQ */
  .pr-faq { padding: 80px 40px; max-width: 700px; margin: 0 auto; }
  .pr-faq-h2 { font-family: var(--display); font-size: clamp(24px, 3.5vw, 36px); font-weight: 900; margin-bottom: 32px; text-align: center; }
  .pr-faq-list { display: flex; flex-direction: column; gap: 2px; }
  .pr-faq-item { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; transition: border-color 0.2s; }
  .pr-faq-item.open { border-color: rgba(255,107,53,0.25); }
  .pr-faq-q { width: 100%; background: none; border: none; color: var(--text); padding: 18px 20px; font-size: 15px; font-weight: 600; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-family: var(--body); }
  .pr-faq-arrow { font-size: 20px; color: var(--orange); flex-shrink: 0; }
  .pr-faq-a { padding: 0 20px 18px; font-size: 14px; color: var(--muted); line-height: 1.7; border-top: 1px solid var(--border); padding-top: 14px; }

  /* FINAL CTA */
  .pr-final { position: relative; padding: 100px 40px; text-align: center; overflow: hidden; }
  .pr-final-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 700px; height: 300px; background: radial-gradient(ellipse, rgba(255,107,53,0.1) 0%, transparent 70%); pointer-events: none; }
  .pr-final-inner { position: relative; z-index: 1; }
  .pr-final-h2 { font-family: var(--display); font-size: clamp(32px, 5vw, 60px); font-weight: 900; line-height: 1.05; margin-bottom: 20px; }
  .pr-final-sub { font-size: 17px; color: var(--muted); margin-bottom: 36px; line-height: 1.6; }
  .pr-final-btn { display: inline-block; background: var(--orange); color: #fff; padding: 18px 40px; border-radius: 14px; font-size: 17px; font-weight: 800; transition: opacity 0.2s; box-shadow: 0 8px 32px rgba(255,107,53,0.4); font-family: var(--body); }
  .pr-final-btn:hover { opacity: 0.88; }
  .pr-final-note { font-size: 13px; color: var(--muted); margin-top: 16px; }

  /* FOOTER */
  .pr-footer { padding: 32px 40px; border-top: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .pr-footer-logo { display: flex; align-items: center; gap: 8px; font-family: var(--display); font-weight: 700; font-size: 15px; opacity: 0.6; }
  .pr-footer-links { display: flex; gap: 24px; }
  .pr-footer-links a { font-size: 13px; color: var(--muted); transition: color 0.2s; }
  .pr-footer-links a:hover { color: var(--text); }
  .pr-footer-copy { font-size: 12px; color: rgba(255,255,255,0.18); }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .pr-nav { padding: 16px 20px; }
    .pr-hero { padding: 60px 20px 40px; }
    .pr-zero { padding: 60px 20px; }
    .pr-compare { grid-template-columns: 1fr; gap: 16px; }
    .pr-compare-vs { display: none; }
    .pr-mp { padding: 60px 20px; }
    .pr-mp-inner { grid-template-columns: 1fr; gap: 40px; }
    .pr-freedom { padding: 60px 20px; }
    .pr-freedom-inner { grid-template-columns: 1fr; gap: 40px; }
    .pr-freedom-visual { max-width: 280px; margin: 0 auto; }
    .pr-faq { padding: 60px 20px; }
    .pr-final { padding: 60px 20px; }
    .pr-footer { padding: 28px 20px; }
  }
`;
