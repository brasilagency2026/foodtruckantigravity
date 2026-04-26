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
                className="btn-whatsapp-bubble"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Conversar
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

  .btn-whatsapp-bubble {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--whatsapp);
    color: #fff;
    font-weight: 700;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 100px;
    transition: transform 0.2s, box-shadow 0.2s;
    font-size: 16px;
    margin-top: 10px;
  }
  .btn-whatsapp-bubble svg {
    margin-bottom: 2px;
  }
  .btn-whatsapp-bubble:hover {
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
