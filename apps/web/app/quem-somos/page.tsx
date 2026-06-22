"use client";

import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Capacitor } from "@capacitor/core";

export default function QuemSomosPage() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  return (
    <>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <a href="/" className="nav-logo" style={{ textDecoration: "none" }}>
          <span className="logo-icon">🍔</span>
          <span className="logo-text">Food Pronto</span>
        </a>
        {!isNative && (
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
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="qs-hero">
        <div className="qs-hero-glow" />
        <div className="qs-hero-content">
          <div className="qs-eyebrow">ECOSSISTEMA FOOD PRONTO</div>
          <h1 className="qs-title">Quem Somos?</h1>
          <p className="qs-subtitle">
            Somos um ecossistema completo de soluções digitais dedicadas à{" "}
            <strong>gestão e pagamento para o setor de alimentação</strong>. Nosso objetivo é simples:
            modernizar e simplificar o comércio de restauração no Brasil.
          </p>
        </div>
      </section>

      {/* ── MISSÃO ── */}
      <section className="qs-mission">
        <div className="qs-mission-card">
          <p>
            Acreditamos que <strong>qualquer estabelecimento</strong> — seja um food truck ambulante,
            um quiosque à beira-mar ou um restaurante no centro da cidade — merece
            acesso a ferramentas modernas, acessíveis e fáceis de usar. Sem burocracia,
            sem maquininha obrigatória, sem barreiras técnicas.
          </p>
        </div>
      </section>

      {/* ── NOSSAS APLICAÇÕES ── */}
      <section className="qs-apps">
        <div className="qs-apps-header">
          <h2 className="qs-section-title">Nossas Aplicações</h2>
          <p className="qs-section-desc">
            Quatro plataformas independentes. Todas conectadas no mesmo ecossistema.
          </p>
        </div>

        <div className="qs-apps-grid">
          {/* Food Trucks */}
          <div className="qs-app-card">
            <div className="qs-app-icon" style={{ background: "rgba(255,107,53,0.1)", color: "#FF6B35" }}>🚚</div>
            <h3>Food Trucks</h3>
            <p>
              Solução completa para food trucks ambulantes:
              cardápio digital via QR Code, pedidos por celular,
              gestão de filas e pagamentos sem maquininhas.
            </p>
            <a href="/" className="qs-app-link" style={{ color: "#FF6B35" }}>
              foodpronto.com.br
            </a>
          </div>

          {/* Quiosques de Praia */}
          <div className="qs-app-card">
            <div className="qs-app-icon" style={{ background: "rgba(56,189,248,0.1)", color: "#38BDF8" }}>🏖️</div>
            <h3>Quiosques de Praia</h3>
            <p>
              Feito para quiosques à beira-mar: pedidos na areia,
              cardápio sul-americano, e atendimento ágil sem papel.
            </p>
            <a href="#" className="qs-app-link" style={{ color: "#38BDF8" }}>
              Em breve
            </a>
          </div>

          {/* Delivery de Restaurantes */}
          <div className="qs-app-card">
            <div className="qs-app-icon" style={{ background: "rgba(168,85,247,0.1)", color: "#A855F7" }}>🛵</div>
            <h3>Delivery de Restaurantes</h3>
            <p>
              Plataforma de delivery próprio para restaurantes:
              aceite pedidos online, gerencie entregas e assuma
              sem depender de grandes marketplaces.
            </p>
            <a href="#" className="qs-app-link" style={{ color: "#A855F7" }}>
              Em breve
            </a>
          </div>

          {/* Cardápio Digital & Gestão */}
          <div className="qs-app-card">
            <div className="qs-app-icon" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>📱</div>
            <h3>Cardápio Digital &amp; Gestão</h3>
            <p>
              Menu digital com QR Code, NFC e link direto +
              gestão completa de mesa, comandas, cozinha
              (KDS) e relatórios de vendas.
            </p>
            <a href="#" className="qs-app-link" style={{ color: "#22C55E" }}>
              Em breve
            </a>
          </div>
        </div>

        {/* Portal Geolocalizado */}
        <div className="qs-portal-card">
          <div className="qs-portal-icon">🌍</div>
          <div className="qs-portal-text">
            <h3>Portal Geolocalizado</h3>
            <p>
              Todas as nossas aplicações estão interligadas através de um{" "}
              <strong>portal com geolocalização</strong>. O cliente acessa
              o portal, vê os estabelecimentos próximos da sua localização e pode navegar, pedir, configurar e fazer
              pedidos em segundos. Uma vitrine digital de proximidade para impulsionar sua comunidade local.
            </p>
          </div>
        </div>
      </section>

      {/* ── GOOGLE PLAY ── */}
      <section className="qs-playstore">
        <div className="qs-playstore-inner">
          <div className="qs-playstore-icon">📱</div>
          <div className="qs-playstore-text">
            <h3>Disponível no Google Play</h3>
            <p>
              Nossa aplicação Android oferece uma experiência ainda mais fluida para os clientes realizarem pedidos
              e acompanharem entregas diretamente pelo smartphone.
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=br.com.foodpronto"
              target="_blank"
              rel="noopener noreferrer"
              className="qs-playstore-btn"
            >
              🟢 Ver no Google Play
            </a>
          </div>
        </div>
      </section>

      {/* ── POR QUE ESCOLHER ── */}
      <section className="qs-why">
        <h2 className="qs-section-title">Por que escolher o Food Pronto?</h2>
        <p className="qs-section-desc">
          Tudo pensado para simplificar, não complicar.
        </p>

        <div className="qs-why-grid">
          <div className="qs-why-card">
            <div className="qs-why-icon">⚡</div>
            <h4>Sem instalação</h4>
            <p>Tudo funciona diretamente no navegador. Sem app para baixar, sem cadastro demorado.</p>
          </div>
          <div className="qs-why-card">
            <div className="qs-why-icon">💻</div>
            <h4>Qualquer dispositivo</h4>
            <p>Computador, smartphone ou tablet — a plataforma se adapta a qualquer tela.</p>
          </div>
          <div className="qs-why-card">
            <div className="qs-why-icon">🚫</div>
            <h4>Sem maquininha</h4>
            <p>Diga adeus às taxas. Sem app para baixar, sem cadastro demorado.</p>
          </div>
          <div className="qs-why-card">
            <div className="qs-why-icon">📍</div>
            <h4>Portal geolocalizado</h4>
            <p>Conectamos o cliente a um portal com geolocalização dos estabelecimentos.</p>
          </div>
          <div className="qs-why-card">
            <div className="qs-why-icon">🚀</div>
            <h4>Rápido de implantar</h4>
            <p>Cadastre-se e esteja pronto para receber pedidos em minutos, sem necessidade de espera.</p>
          </div>
          <div className="qs-why-card">
            <div className="qs-why-icon">🤖</div>
            <h4>App Android</h4>
            <p>Disponível na Google Play para a experiência mais fluida do mercado. Avalie ML, chatbot e análises.</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="qs-cta">
        <div className="qs-cta-card">
          <h2>Pronto para modernizar seu estabelecimento?</h2>
          <p>Comece com 30 dias grátis, sem cartão de crédito. Em menos de 10 minutos, está no ar.</p>
          <div className="qs-cta-buttons">
            <a href="/sign-up" className="qs-cta-btn primary">Começar grátis</a>
            <a
              href="https://wa.me/5513982032534?text=Olá, gostaria de saber mais sobre o Food Pronto!"
              target="_blank"
              rel="noopener noreferrer"
              className="qs-cta-btn secondary"
            >
              Falar com a gente
            </a>
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
            <a href="/">Início</a>
            {!isNative && <a href="/precos">Preços</a>}
            <a href="/quem-somos">Quem Somos</a>
            <a href="/contato">Contato</a>
            <a href="/termos">Termos de Uso</a>
            <a href="/politica-de-privacidade">Privacidade</a>
            {!isNative && <a href="/trabalhe-conosco">Trabalhe Conosco</a>}
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Food Pronto. Feito com ❤️ no Brasil.</p>
        </div>
      </footer>
    </>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap');

  :root {
    --bg: #080810;
    --surface: #12121a;
    --border: rgba(255,255,255,0.07);
    --orange: #FF6B35;
    --text: #f0f0f8;
    --muted: rgba(240,240,248,0.5);
    --font-display: 'Syne', sans-serif;
    --font-body: 'Nunito', sans-serif;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    background: rgba(8,8,16,0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
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

  /* ── HERO ── */
  .qs-hero {
    position: relative;
    padding: 160px 40px 80px;
    text-align: center;
    overflow: hidden;
  }
  .qs-hero-glow {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .qs-hero-content { position: relative; max-width: 700px; margin: 0 auto; }
  .qs-eyebrow {
    font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--orange); margin-bottom: 16px;
  }
  .qs-title {
    font-family: var(--font-display); font-size: clamp(48px, 8vw, 72px);
    font-weight: 900; margin-bottom: 24px; letter-spacing: -0.03em;
  }
  .qs-subtitle {
    font-size: 18px; line-height: 1.7; color: var(--muted); max-width: 600px; margin: 0 auto;
  }
  .qs-subtitle strong { color: var(--text); }

  /* ── MISSÃO ── */
  .qs-mission { padding: 0 40px 80px; display: flex; justify-content: center; }
  .qs-mission-card {
    max-width: 800px; width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px 48px;
    text-align: center;
    font-size: 17px;
    line-height: 1.8;
    color: var(--muted);
  }
  .qs-mission-card strong { color: var(--text); }

  /* ── SECTION COMMON ── */
  .qs-section-title {
    font-family: var(--font-display); font-size: clamp(32px, 5vw, 44px);
    font-weight: 900; text-align: center; letter-spacing: -0.02em; margin-bottom: 12px;
  }
  .qs-section-desc {
    text-align: center; color: var(--muted); font-size: 16px; margin-bottom: 48px;
  }

  /* ── NOSSAS APLICAÇÕES ── */
  .qs-apps { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
  .qs-apps-header { margin-bottom: 48px; }
  .qs-apps-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px; margin-bottom: 32px;
  }
  .qs-app-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px 28px;
    transition: border-color 0.3s, transform 0.2s;
  }
  .qs-app-card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
  .qs-app-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 20px;
  }
  .qs-app-card h3 {
    font-family: var(--font-display); font-size: 20px; font-weight: 800;
    margin-bottom: 12px; letter-spacing: -0.01em;
  }
  .qs-app-card p {
    font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 16px;
  }
  .qs-app-link {
    font-size: 13px; font-weight: 700; text-decoration: none;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .qs-app-link:hover { text-decoration: underline; }

  /* Portal card */
  .qs-portal-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px 36px;
    display: flex; gap: 24px; align-items: flex-start;
  }
  .qs-portal-icon { font-size: 36px; flex-shrink: 0; }
  .qs-portal-text h3 {
    font-family: var(--font-display); font-size: 20px; font-weight: 800;
    margin-bottom: 12px;
  }
  .qs-portal-text p { font-size: 15px; color: var(--muted); line-height: 1.7; }
  .qs-portal-text strong { color: var(--text); }

  /* ── GOOGLE PLAY ── */
  .qs-playstore {
    padding: 80px 40px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .qs-playstore-inner {
    max-width: 800px; margin: 0 auto;
    display: flex; gap: 28px; align-items: flex-start;
  }
  .qs-playstore-icon { font-size: 40px; flex-shrink: 0; }
  .qs-playstore-text h3 {
    font-family: var(--font-display); font-size: 22px; font-weight: 800; margin-bottom: 12px;
  }
  .qs-playstore-text p {
    font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 20px;
  }
  .qs-playstore-btn {
    display: inline-block;
    background: #22C55E; color: #fff;
    padding: 12px 24px; border-radius: 100px;
    font-size: 14px; font-weight: 700;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .qs-playstore-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(34,197,94,0.3);
  }

  /* ── POR QUE ESCOLHER ── */
  .qs-why { padding: 80px 40px; max-width: 1100px; margin: 0 auto; }
  .qs-why-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
  }
  .qs-why-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 32px 28px;
    text-align: center;
    transition: border-color 0.3s;
  }
  .qs-why-card:hover { border-color: rgba(255,107,53,0.25); }
  .qs-why-icon {
    font-size: 32px; margin-bottom: 16px;
  }
  .qs-why-card h4 {
    font-family: var(--font-display); font-size: 17px; font-weight: 800;
    margin-bottom: 10px;
  }
  .qs-why-card p {
    font-size: 14px; color: var(--muted); line-height: 1.6;
  }

  /* ── CTA ── */
  .qs-cta { padding: 80px 40px; }
  .qs-cta-card {
    max-width: 800px; margin: 0 auto;
    background: linear-gradient(135deg, rgba(255,107,53,0.08) 0%, rgba(255,107,53,0.02) 100%);
    border: 1px solid rgba(255,107,53,0.2);
    border-radius: 24px;
    padding: 56px 40px;
    text-align: center;
  }
  .qs-cta-card h2 {
    font-family: var(--font-display); font-size: clamp(24px, 4vw, 32px);
    font-weight: 900; margin-bottom: 16px; letter-spacing: -0.02em;
  }
  .qs-cta-card p {
    color: var(--muted); font-size: 16px; margin-bottom: 32px;
  }
  .qs-cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .qs-cta-btn {
    padding: 14px 28px; border-radius: 14px; font-size: 15px; font-weight: 700;
    text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
  }
  .qs-cta-btn.primary {
    background: var(--orange); color: #fff;
    box-shadow: 0 8px 24px rgba(255,107,53,0.3);
  }
  .qs-cta-btn.primary:hover { transform: translateY(-2px); }
  .qs-cta-btn.secondary {
    background: transparent; color: var(--text);
    border: 1px solid rgba(255,255,255,0.15);
  }
  .qs-cta-btn.secondary:hover { background: rgba(255,255,255,0.05); }

  /* ── FOOTER ── */
  .footer { border-top: 1px solid var(--border); background: var(--bg); padding: 40px; margin-top: auto; }
  .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 24px; }
  .footer-logo { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text); }
  .footer-links { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
  .footer-links a { color: var(--muted); font-size: 14px; font-weight: 600; text-decoration: none; transition: color 0.2s; }
  .footer-links a:hover { color: var(--text); }
  .footer-copy { color: rgba(255,255,255,0.2); font-size: 13px; margin-top: 12px; text-align: center; }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .qs-hero-content { animation: fadeUp 0.6s ease both; }
  .qs-mission-card { animation: fadeUp 0.6s 0.1s ease both; }
  .qs-apps-header { animation: fadeUp 0.6s 0.15s ease both; }
  .qs-app-card { animation: fadeUp 0.5s 0.2s ease both; }
  .qs-portal-card { animation: fadeUp 0.5s 0.3s ease both; }
  .qs-why-card { animation: fadeUp 0.5s 0.2s ease both; }
  .qs-cta-card { animation: fadeUp 0.6s 0.2s ease both; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .nav { padding: 16px 20px; }
    .qs-hero { padding: 130px 20px 60px; }
    .qs-mission { padding: 0 20px 60px; }
    .qs-mission-card { padding: 28px 24px; }
    .qs-apps { padding: 60px 20px; }
    .qs-portal-card { flex-direction: column; padding: 28px 24px; }
    .qs-playstore { padding: 60px 20px; }
    .qs-playstore-inner { flex-direction: column; }
    .qs-why { padding: 60px 20px; }
    .qs-cta { padding: 60px 20px; }
    .qs-cta-card { padding: 40px 24px; }
    .footer { padding: 40px 20px; }
    .footer-links { flex-direction: column; align-items: center; gap: 16px; }
  }

  @media (max-width: 480px) {
    .nav-actions { gap: 8px; }
    .btn-ghost { padding: 6px 10px; font-size: 13px; }
    .btn-primary-sm { padding: 8px 14px; font-size: 12px; }
    .qs-apps-grid { grid-template-columns: 1fr; }
    .qs-why-grid { grid-template-columns: 1fr; }
  }
`;
