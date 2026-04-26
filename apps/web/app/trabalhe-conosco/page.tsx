"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function TrabalheConoscoPage() {
  return (
    <>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <span className="logo-icon">🍔</span>
          <span className="logo-text">Food Pronto</span>
        </a>
        <div className="nav-actions">
          <SignedOut>
            <a href="/sign-in" className="btn-ghost">Entrar</a>
            <a href="/sign-up" className="btn-primary-sm">Cadastrar meu truck</a>
          </SignedOut>
          <SignedIn>
            <a href="/onboarding" className="btn-primary-sm">Acessar Painel</a>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-glow" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">Seja um Parceiro Oficial</div>
          <h1 className="hero-title">
            Venda o Food Pronto e ganhe <br/>
            <span className="hero-accent">50% de comissão recorrente</span>
          </h1>
          <p className="hero-subtitle">
            Construa uma renda passiva sólida ajudando food trucks a modernizarem seus negócios. 
            Você ganha metade do valor da mensalidade — todos os meses, enquanto o cliente usar o sistema.
          </p>
          <a 
            href="https://wa.me/5513982032534?text=Olá, quero ser um parceiro comercial do Food Pronto!" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-whatsapp-hero"
          >
            Falar com a equipe no WhatsApp
          </a>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="benefits">
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">💸</div>
            <h3>50% Recorrente</h3>
            <p>Se o cliente paga R$ 200/mês, <strong>R$ 100 são seus</strong>. Todo mês. 50 clientes ativos = R$ 5.000 mensais no seu bolso.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎟️</div>
            <h3>Cupom de 10%</h3>
            <p>Para ajudar você a fechar mais vendas, você recebe um código de desconto exclusivo de 10% para oferecer aos seus clientes.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🚀</div>
            <h3>Mercado Gigante</h3>
            <p>O mercado de comida de rua cresce a cada dia. Os food trucks precisam de uma solução moderna sem pagar caro por maquininhas.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🌎</div>
            <h3>Liberdade Total</h3>
            <p>Trabalhe de onde quiser, na sua própria cidade. Sem chefes, sem horários. Você é dono dos seus resultados.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span>🍔</span> Food Pronto
          </div>
          <div className="footer-links">
            <a href="/precos">Preços</a>
            <a href="/termos">Termos</a>
            <a href="/privacidade">Privacidade</a>
            <a href="/contato">Contato</a>
            <a href="/trabalhe-conosco">Trabalhe conosco</a>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Food Pronto. Feito com ❤️ no Brasil.</p>
        </div>
      </footer>
    </>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Nunito:wght@400;500;600;700&display=swap');

  :root {
    --bg: #080810;
    --surface: #12121a;
    --border: rgba(255,255,255,0.07);
    --orange: #FF6B35;
    --green: #22C55E;
    --text: #f0f0f8;
    --muted: rgba(240,240,248,0.5);
    --font-display: 'Syne', sans-serif;
    --font-body: 'Nunito', sans-serif;
  }

  /* ── NAV ── */
  .nav {
    position: absolute; top: 0; left: 0; right: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
  }
  .nav-logo { display: flex; align-items: center; gap: 10px; color: var(--text); }
  .logo-icon { font-size: 24px; }
  .logo-text { font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
  .nav-actions { display: flex; gap: 12px; align-items: center; }
  .btn-ghost { color: var(--muted); font-size: 14px; text-decoration: none; padding: 8px 16px; border-radius: 8px; transition: color 0.2s; font-family: var(--font-body); }
  .btn-ghost:hover { color: var(--text); }
  .btn-primary-sm {
    background: var(--orange); color: #fff; font-size: 13px; font-weight: 700;
    padding: 9px 20px; border-radius: 10px; text-decoration: none; font-family: var(--font-body);
    transition: opacity 0.2s;
  }
  .btn-primary-sm:hover { opacity: 0.88; }

  @media (max-width: 600px) {
    .nav { padding: 16px 20px; }
    .btn-ghost { padding: 8px 10px; }
    .btn-primary-sm { padding: 8px 14px; font-size: 12px; }
  }

  /* ── HERO ── */
  .hero {
    position: relative; 
    min-height: 80vh;
    display: flex; 
    flex-direction: column;
    justify-content: center; 
    align-items: center;
    padding: 120px 20px 60px;
    text-align: center;
    overflow: hidden;
  }
  .hero-glow {
    position: absolute; top: 30%; left: 50%;
    transform: translate(-50%, -50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(34,197,94,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-content { position: relative; z-index: 1; max-width: 800px; }
  .hero-badge {
    display: inline-flex; align-items: center;
    background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
    border-radius: 100px; padding: 6px 16px; font-size: 13px;
    color: var(--green); font-weight: 600; margin-bottom: 24px;
    animation: fadeUp 0.6s ease both;
  }
  .hero-title {
    font-family: var(--font-display); 
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 900; line-height: 1.1; 
    margin-bottom: 24px; color: var(--text);
    animation: fadeUp 0.6s 0.1s ease both;
  }
  .hero-accent { color: var(--green); }
  .hero-subtitle {
    font-size: 18px; color: var(--muted); line-height: 1.6;
    max-width: 640px; margin: 0 auto 40px;
    animation: fadeUp 0.6s 0.2s ease both;
  }
  .btn-whatsapp-hero {
    display: inline-block;
    background: #25D366;
    color: #fff;
    font-size: 18px;
    font-weight: 800;
    text-decoration: none;
    padding: 16px 36px;
    border-radius: 100px;
    transition: transform 0.2s, box-shadow 0.2s;
    animation: fadeUp 0.6s 0.3s ease both;
  }
  .btn-whatsapp-hero:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(37, 211, 102, 0.3);
  }

  /* ── BENEFITS ── */
  .benefits {
    padding: 60px 20px 100px;
    max-width: 1000px;
    margin: 0 auto;
  }
  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  }
  .benefit-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 30px;
    animation: fadeUp 0.6s 0.4s ease both;
  }
  .benefit-icon {
    font-size: 40px;
    margin-bottom: 20px;
  }
  .benefit-card h3 {
    font-family: var(--font-display);
    font-size: 20px;
    color: var(--text);
    margin-bottom: 12px;
  }
  .benefit-card p {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.6;
  }
  .benefit-card strong {
    color: var(--green);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── FOOTER ── */
  .footer { border-top: 1px solid var(--border); background: var(--bg); padding: 40px; margin-top: auto; }
  .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 24px; }
  .footer-logo { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text); }
  .footer-links { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
  .footer-links a { color: var(--muted); font-size: 14px; font-weight: 600; text-decoration: none; transition: color 0.2s; }
  .footer-links a:hover { color: var(--text); }
  .footer-copy { color: rgba(255,255,255,0.2); font-size: 13px; margin-top: 12px; text-align: center; }
  
  @media (max-width: 600px) {
    .footer { padding: 40px 20px; }
    .footer-links { flex-direction: column; align-items: center; gap: 16px; }
  }
`;
