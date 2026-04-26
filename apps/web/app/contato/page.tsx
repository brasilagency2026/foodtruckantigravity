"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function ContatoPage() {
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

      {/* ── CONTENT ── */}
      <main className="contact-main">
        <div className="contact-container">
          <div className="contact-header">
            <h1 className="contact-title">Fale Conosco</h1>
            <p className="contact-subtitle">
              Estamos aqui para ajudar. Entre em contato através dos nossos canais oficiais.
            </p>
          </div>

          <div className="contact-cards">
            {/* WhatsApp Card */}
            <div className="contact-card whatsapp-card">
              <div className="card-icon whatsapp-icon">💬</div>
              <h2 className="card-title">WhatsApp</h2>
              <p className="card-desc">Atendimento rápido via WhatsApp.</p>
              <div className="card-value">(13) 98203-2534</div>
              <a 
                href="https://wa.me/5513982032534" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-whatsapp"
              >
                Conversar no WhatsApp
              </a>
            </div>

            {/* Email Card */}
            <div className="contact-card">
              <div className="card-icon">✉️</div>
              <h2 className="card-title">E-mail</h2>
              <p className="card-desc">Para dúvidas gerais e suporte.</p>
              <div className="card-value">contato@foodpronto.com.br</div>
              <a href="mailto:contato@foodpronto.com.br" className="btn-outline">
                Enviar E-mail
              </a>
            </div>
          </div>

          <div className="company-info">
            <h3>Dados da Empresa</h3>
            <p>Food Pronto</p>
            <p>CNPJ: 64.465.357/0001-28</p>
          </div>
        </div>
      </main>

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
    --text: #f0f0f8;
    --muted: rgba(240,240,248,0.5);
    --font-display: 'Syne', sans-serif;
    --font-body: 'Nunito', sans-serif;
    --whatsapp: #25D366;
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

  /* ── CONTENT ── */
  .contact-main {
    min-height: 100vh;
    padding: 120px 20px 80px;
    display: flex;
    justify-content: center;
  }
  
  .contact-container {
    width: 100%;
    max-width: 800px;
  }

  .contact-header {
    text-align: center;
    margin-bottom: 50px;
    animation: fadeUp 0.5s ease both;
  }
  
  .contact-title {
    font-family: var(--font-display);
    font-size: clamp(40px, 6vw, 56px);
    font-weight: 900;
    margin-bottom: 16px;
    color: var(--text);
  }
  
  .contact-subtitle {
    font-size: 18px;
    color: var(--muted);
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .contact-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .contact-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px 30px;
    text-align: center;
    animation: fadeUp 0.6s 0.2s ease both;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .whatsapp-card {
    border-color: rgba(37, 211, 102, 0.2);
    background: linear-gradient(180deg, rgba(37, 211, 102, 0.03) 0%, transparent 100%);
  }

  .card-icon {
    font-size: 40px;
    margin-bottom: 20px;
  }

  .card-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .card-desc {
    color: var(--muted);
    font-size: 15px;
    margin-bottom: 24px;
  }

  .card-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 30px;
    font-family: monospace;
    letter-spacing: 0.05em;
  }

  .btn-whatsapp {
    display: inline-block;
    width: 100%;
    background: var(--whatsapp);
    color: #fff;
    font-weight: 700;
    text-decoration: none;
    padding: 14px 24px;
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-whatsapp:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(37, 211, 102, 0.25);
  }

  .btn-outline {
    display: inline-block;
    width: 100%;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.15);
    color: var(--text);
    font-weight: 600;
    text-decoration: none;
    padding: 14px 24px;
    border-radius: 12px;
    transition: background 0.2s;
  }
  .btn-outline:hover {
    background: rgba(255,255,255,0.05);
  }

  .company-info {
    text-align: center;
    color: var(--muted);
    font-size: 14px;
    padding-top: 40px;
    border-top: 1px solid var(--border);
    animation: fadeUp 0.6s 0.3s ease both;
  }
  
  .company-info h3 {
    font-family: var(--font-display);
    font-size: 16px;
    color: var(--text);
    margin-bottom: 12px;
  }
  .company-info p {
    margin-bottom: 4px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── FOOTER ── */
  .footer { border-top: 1px solid var(--border); background: var(--bg); padding: 40px; margin-top: auto; }
  .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 24px; }
  .footer-logo { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text); }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { color: var(--muted); font-size: 14px; font-weight: 600; text-decoration: none; transition: color 0.2s; }
  .footer-links a:hover { color: var(--text); }
  .footer-copy { color: rgba(255,255,255,0.2); font-size: 13px; margin-top: 12px; text-align: center; }
  
  @media (max-width: 600px) {
    .footer { padding: 40px 20px; }
    .footer-links { flex-direction: column; align-items: center; gap: 16px; }
  }
`;
