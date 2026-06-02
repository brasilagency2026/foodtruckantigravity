import base64

with open('/mnt/user-data/uploads/logocanal.png', 'rb') as f:
    logo_b64 = base64.b64encode(f.read()).decode('utf-8')

html = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FoodPronto Brasil — Seu Foodtruck no Digital em 30 Minutos</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #0d1e3a;
    --navy2: #162848;
    --gold: #f5c518;
    --gold2: #e8a900;
    --green: #1a7a2e;
    --green2: #22a33d;
    --white: #ffffff;
    --gray: #f4f6fa;
    --text: #1a1a2e;
    --muted: #5a6070;
    --radius: 16px;
    --radius-sm: 10px;
  }
  html { scroll-behavior: smooth; }
  body { font-family: "Nunito", sans-serif; color: var(--text); background: #fff; overflow-x: hidden; }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(13,30,58,0.97);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 5%;
    height: 70px;
    border-bottom: 2px solid var(--gold);
  }
  nav .logo-nav { display: flex; align-items: center; gap: 12px; }
  nav .logo-nav img { height: 48px; border-radius: 50%; }
  nav .logo-nav span { font-family: "Bebas Neue", sans-serif; font-size: 1.6rem; color: var(--white); letter-spacing: 1px; }
  nav .logo-nav span em { color: var(--gold); font-style: normal; }
  nav .nav-cta {
    background: var(--gold); color: var(--navy); font-weight: 800; font-size: 0.9rem;
    border: none; border-radius: 50px; padding: 10px 24px; cursor: pointer;
    text-decoration: none; transition: background 0.2s;
  }
  nav .nav-cta:hover { background: var(--gold2); }

  /* HERO */
  .hero {
    min-height: 100vh;
    background: var(--navy);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column;
    text-align: center;
    padding: 100px 5% 60px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: "";
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 30%, #1e3a6e 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(245,197,24,0.15); border: 1.5px solid var(--gold);
    color: var(--gold); font-size: 0.85rem; font-weight: 700;
    border-radius: 50px; padding: 6px 18px; margin-bottom: 28px;
    letter-spacing: 0.5px;
  }
  .hero-badge span { width: 8px; height: 8px; background: var(--gold); border-radius: 50%; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
  .hero h1 {
    font-family: "Bebas Neue", sans-serif;
    font-size: clamp(3rem, 8vw, 6.5rem);
    color: var(--white); line-height: 1;
    margin-bottom: 10px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .hero h1 .accent { color: var(--gold); }
  .hero h1 .accent2 { color: #4ade80; }
  .hero .subtitle {
    font-size: clamp(1.1rem, 2.5vw, 1.4rem);
    color: rgba(255,255,255,0.8); max-width: 700px;
    line-height: 1.6; margin-bottom: 40px;
  }
  .hero-logo { width: min(260px, 60vw); margin-bottom: 32px; filter: drop-shadow(0 8px 30px rgba(0,0,0,0.5)); }
  .hero-btns { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 56px; }
  .btn-primary {
    background: var(--gold); color: var(--navy); font-weight: 800; font-size: 1rem;
    border-radius: 50px; padding: 16px 36px; text-decoration: none;
    transition: transform 0.15s, background 0.2s;
    box-shadow: 0 4px 20px rgba(245,197,24,0.4);
  }
  .btn-primary:hover { transform: translateY(-2px); background: var(--gold2); }
  .btn-secondary {
    background: transparent; color: var(--white); font-weight: 700; font-size: 1rem;
    border: 2px solid rgba(255,255,255,0.4); border-radius: 50px; padding: 16px 36px;
    text-decoration: none; transition: border-color 0.2s, background 0.2s;
  }
  .btn-secondary:hover { border-color: var(--white); background: rgba(255,255,255,0.08); }
  .hero-stats {
    display: flex; gap: 40px; flex-wrap: wrap; justify-content: center;
    border-top: 1px solid rgba(255,255,255,0.1); padding-top: 40px;
  }
  .hero-stat { text-align: center; }
  .hero-stat .num { font-family: "Bebas Neue", sans-serif; font-size: 2.6rem; color: var(--gold); line-height: 1; }
  .hero-stat .lbl { font-size: 0.8rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

  /* SECTION BASE */
  section { padding: 80px 5%; }
  .section-tag {
    display: inline-block; background: rgba(245,197,24,0.12); color: var(--gold2);
    font-weight: 800; font-size: 0.75rem; letter-spacing: 1.5px; text-transform: uppercase;
    border-radius: 50px; padding: 5px 16px; margin-bottom: 14px;
  }
  .section-title {
    font-family: "Bebas Neue", sans-serif; font-size: clamp(2rem, 5vw, 3.2rem);
    line-height: 1.1; margin-bottom: 16px;
  }
  .section-desc { font-size: 1.05rem; color: var(--muted); max-width: 600px; line-height: 1.7; }
  .center { text-align: center; }
  .center .section-desc { margin: 0 auto; }

  /* HOW IT WORKS */
  .steps-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 28px; margin-top: 50px;
  }
  .step-card {
    background: var(--gray); border-radius: var(--radius); padding: 32px 24px;
    position: relative; border: 2px solid transparent;
    transition: border-color 0.2s, transform 0.2s;
  }
  .step-card:hover { border-color: var(--gold); transform: translateY(-4px); }
  .step-num {
    font-family: "Bebas Neue", sans-serif; font-size: 4rem; color: var(--gold);
    opacity: 0.2; line-height: 1; margin-bottom: 8px;
  }
  .step-icon { font-size: 2.2rem; margin-bottom: 14px; }
  .step-card h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 10px; color: var(--navy); }
  .step-card p { font-size: 0.92rem; color: var(--muted); line-height: 1.6; }
  .step-time {
    display: inline-block; background: var(--gold); color: var(--navy);
    font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 50px;
    margin-top: 12px;
  }

  /* FEATURES */
  .features-bg { background: var(--navy); color: var(--white); }
  .features-bg .section-tag { background: rgba(245,197,24,0.2); color: var(--gold); }
  .features-bg .section-title { color: var(--white); }
  .features-bg .section-desc { color: rgba(255,255,255,0.65); }
  .features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px; margin-top: 50px;
  }
  .feat-card {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius); padding: 28px 24px;
    transition: background 0.2s, border-color 0.2s;
  }
  .feat-card:hover { background: rgba(255,255,255,0.09); border-color: rgba(245,197,24,0.5); }
  .feat-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(245,197,24,0.15); display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem; margin-bottom: 18px;
  }
  .feat-card h3 { font-size: 1.05rem; font-weight: 800; margin-bottom: 10px; color: var(--white); }
  .feat-card p { font-size: 0.9rem; color: rgba(255,255,255,0.6); line-height: 1.65; }
  .feat-badge {
    display: inline-block; margin-top: 12px; font-size: 0.72rem; font-weight: 700;
    padding: 4px 12px; border-radius: 50px;
  }
  .feat-badge.gold { background: rgba(245,197,24,0.2); color: var(--gold); }
  .feat-badge.green { background: rgba(34,163,61,0.2); color: #4ade80; }

  /* PAYMENT */
  .payment-wrap {
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
    align-items: center; margin-top: 20px;
  }
  @media(max-width:768px) { .payment-wrap { grid-template-columns:1fr; } .hero h1 { font-size: 3rem; } }
  .payment-methods {
    display: flex; flex-direction: column; gap: 14px; margin-top: 28px;
  }
  .pay-item {
    display: flex; align-items: center; gap: 16px;
    background: var(--gray); border-radius: var(--radius-sm); padding: 16px 20px;
    border-left: 4px solid var(--gold);
  }
  .pay-item .ico { font-size: 1.8rem; }
  .pay-item h4 { font-weight: 800; font-size: 0.95rem; margin-bottom: 2px; color: var(--navy); }
  .pay-item p { font-size: 0.82rem; color: var(--muted); }
  .no-machine {
    background: linear-gradient(135deg, var(--navy), #1e3a6e);
    border-radius: var(--radius); padding: 36px; color: var(--white); text-align: center;
  }
  .no-machine .big { font-family: "Bebas Neue", sans-serif; font-size: 2.5rem; color: var(--gold); margin-bottom: 10px; }
  .no-machine p { font-size: 0.95rem; color: rgba(255,255,255,0.75); line-height: 1.6; }
  .no-machine .checkmark { font-size: 1.2rem; margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
  .no-machine .checkmark span { display: flex; align-items: center; gap: 10px; justify-content: center; font-size: 0.9rem; color: rgba(255,255,255,0.85); }
  .no-machine .checkmark span::before { content: "✅"; }

  /* ALERT SECTION */
  .alert-section { background: var(--gray); }
  .alert-demo {
    background: var(--navy); border-radius: var(--radius); padding: 40px;
    color: var(--white); text-align: center; max-width: 500px; margin: 0 auto;
    border: 2px solid var(--gold);
  }
  .phone-mock {
    background: #1a1a1a; border-radius: 28px; padding: 20px;
    margin: 24px auto; max-width: 260px;
    border: 6px solid #333; position: relative;
  }
  .phone-notch {
    width: 100px; height: 24px; background: #1a1a1a; border-radius: 0 0 16px 16px;
    margin: -20px auto 16px; position: relative; z-index: 1;
  }
  .notif-card {
    background: rgba(255,255,255,0.95); border-radius: 14px; padding: 14px 16px;
    color: #1a1a1a; text-align: left;
    animation: bounceIn 0.5s ease;
  }
  @keyframes bounceIn { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
  .notif-card .notif-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .notif-card .notif-app { font-size: 0.7rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
  .notif-card .notif-time { font-size: 0.65rem; color: #999; margin-left: auto; }
  .notif-card .notif-title { font-weight: 800; font-size: 0.85rem; color: #1a1a1a; }
  .notif-card .notif-body { font-size: 0.78rem; color: #555; margin-top: 2px; }
  .notif-icon { font-size: 1.8rem; }
  .vibrate { animation: vibrate 0.3s linear 3; }
  @keyframes vibrate { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-4px,0)} 75%{transform:translate(4px,0)} }

  /* PRICING */
  .pricing-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 28px; margin-top: 50px; max-width: 900px; margin-left: auto; margin-right: auto;
  }
  .price-card {
    border-radius: var(--radius); padding: 36px 28px; text-align: center;
    border: 2px solid transparent; position: relative; transition: transform 0.2s;
  }
  .price-card:hover { transform: translateY(-4px); }
  .price-card.free { background: var(--gray); border-color: #ddd; }
  .price-card.monthly { background: var(--navy); color: var(--white); border-color: var(--gold); }
  .price-card.annual { background: var(--navy); color: var(--white); border-color: var(--green2); }
  .price-badge {
    position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
    background: var(--gold); color: var(--navy); font-size: 0.7rem; font-weight: 800;
    padding: 4px 18px; border-radius: 50px; white-space: nowrap;
  }
  .price-badge.green-badge { background: var(--green2); color: var(--white); }
  .price-card .plan-name { font-family: "Bebas Neue", sans-serif; font-size: 1.6rem; margin-bottom: 8px; }
  .price-card.free .plan-name { color: var(--navy); }
  .price-card .price-amount { font-family: "Bebas Neue", sans-serif; font-size: 3.8rem; line-height: 1; color: var(--gold); margin: 12px 0 4px; }
  .price-card.free .price-amount { color: var(--green); }
  .price-card .price-period { font-size: 0.82rem; margin-bottom: 24px; }
  .price-card.free .price-period { color: var(--muted); }
  .price-card.monthly .price-period, .price-card.annual .price-period { color: rgba(255,255,255,0.6); }
  .price-features { list-style: none; text-align: left; margin-bottom: 28px; display: flex; flex-direction: column; gap: 10px; }
  .price-features li { display: flex; align-items: flex-start; gap: 10px; font-size: 0.88rem; }
  .price-features li::before { content: "✓"; font-weight: 800; color: var(--gold); flex-shrink: 0; margin-top: 1px; }
  .price-card.free .price-features li { color: var(--muted); }
  .price-card.free .price-features li::before { color: var(--green); }
  .price-card.monthly .price-features li, .price-card.annual .price-features li { color: rgba(255,255,255,0.8); }
  .price-btn {
    display: block; width: 100%; padding: 14px; border-radius: 50px;
    font-weight: 800; font-size: 0.95rem; text-decoration: none; text-align: center;
    transition: opacity 0.2s;
  }
  .price-btn:hover { opacity: 0.88; }
  .price-btn.gold-btn { background: var(--gold); color: var(--navy); }
  .price-btn.white-btn { background: var(--white); color: var(--navy); }
  .price-btn.green-btn { background: var(--green2); color: var(--white); }

  /* RESELLER */
  .reseller-section { background: linear-gradient(135deg, #0a1628, #1a3a6e); color: var(--white); }
  .reseller-section .section-tag { background: rgba(74,222,128,0.15); color: #4ade80; }
  .reseller-section .section-title { color: var(--white); }
  .reseller-section .section-desc { color: rgba(255,255,255,0.7); }
  .reseller-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; margin-top: 40px; }
  @media(max-width:768px) { .reseller-grid { grid-template-columns: 1fr; } }
  .commission-big {
    background: rgba(245,197,24,0.1); border: 2px solid var(--gold);
    border-radius: var(--radius); padding: 36px; text-align: center;
  }
  .commission-big .pct { font-family: "Bebas Neue", sans-serif; font-size: 6rem; color: var(--gold); line-height: 1; }
  .commission-big .label { font-size: 0.9rem; color: rgba(255,255,255,0.7); }
  .commission-big .sub { font-size: 0.82rem; color: rgba(255,255,255,0.5); margin-top: 8px; }
  .reseller-perks { display: flex; flex-direction: column; gap: 16px; }
  .reseller-perk {
    display: flex; align-items: flex-start; gap: 16px;
    background: rgba(255,255,255,0.06); border-radius: var(--radius-sm); padding: 18px;
  }
  .reseller-perk .perk-icon { font-size: 1.8rem; flex-shrink: 0; }
  .reseller-perk h4 { font-weight: 800; font-size: 0.95rem; margin-bottom: 4px; color: var(--white); }
  .reseller-perk p { font-size: 0.83rem; color: rgba(255,255,255,0.6); line-height: 1.5; }

  /* ECOSYSTEM */
  .eco-section { background: var(--gray); }
  .eco-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-top: 50px; }
  .eco-card {
    background: var(--white); border-radius: var(--radius); padding: 28px 24px;
    border: 2px solid #e8eaf0; transition: border-color 0.2s, transform 0.2s;
  }
  .eco-card:hover { border-color: var(--navy); transform: translateY(-4px); }
  .eco-icon { font-size: 2.4rem; margin-bottom: 14px; }
  .eco-tag { display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 50px; margin-bottom: 10px; }
  .eco-tag.truck { background: rgba(245,197,24,0.15); color: var(--gold2); }
  .eco-tag.delivery { background: rgba(26,122,46,0.12); color: var(--green); }
  .eco-tag.beach { background: rgba(56,189,248,0.15); color: #0369a1; }
  .eco-tag.menu { background: rgba(167,139,250,0.15); color: #7c3aed; }
  .eco-card h3 { font-size: 1.05rem; font-weight: 800; margin-bottom: 8px; color: var(--navy); }
  .eco-card p { font-size: 0.85rem; color: var(--muted); line-height: 1.6; margin-bottom: 14px; }
  .eco-link { font-size: 0.82rem; font-weight: 700; color: var(--navy); text-decoration: none; border-bottom: 2px solid var(--gold); padding-bottom: 2px; }
  .eco-link:hover { color: var(--gold2); }

  /* CTA FINAL */
  .final-cta {
    background: var(--navy); color: var(--white); text-align: center;
    padding: 100px 5%;
  }
  .final-cta .section-title { color: var(--white); margin: 0 auto 16px; }
  .final-cta .section-desc { color: rgba(255,255,255,0.7); margin: 0 auto 40px; }
  .final-cta .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .yt-btn {
    display: inline-flex; align-items: center; gap: 10px;
    background: #ff0000; color: #fff; font-weight: 800; font-size: 0.95rem;
    border-radius: 50px; padding: 16px 32px; text-decoration: none;
    transition: opacity 0.2s;
  }
  .yt-btn:hover { opacity: 0.88; }

  /* FOOTER */
  footer {
    background: #060e1d; color: rgba(255,255,255,0.4);
    text-align: center; padding: 28px 5%;
    font-size: 0.82rem; border-top: 1px solid rgba(245,197,24,0.2);
  }
  footer a { color: var(--gold); text-decoration: none; }

  /* MANUAL ORDER */
  .manual-section { background: var(--white); }
  .manual-wrap {
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  }
  @media(max-width:768px) { .manual-wrap { grid-template-columns: 1fr; } }
  .manual-card {
    background: var(--navy); border-radius: var(--radius); padding: 36px;
    color: var(--white); border: 2px solid var(--gold);
  }
  .manual-card h3 { font-family: "Bebas Neue", sans-serif; font-size: 2rem; color: var(--gold); margin-bottom: 16px; }
  .manual-card p { font-size: 0.92rem; color: rgba(255,255,255,0.75); line-height: 1.65; }
  .scenario-list { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
  .scenario-item {
    display: flex; align-items: flex-start; gap: 14px;
    background: rgba(255,255,255,0.07); border-radius: var(--radius-sm); padding: 14px 16px;
  }
  .scenario-item .s-icon { font-size: 1.4rem; flex-shrink: 0; }
  .scenario-item p { font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.5; }
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="logo-nav">
    <img src="data:image/png;base64,LOGO_BASE64_PLACEHOLDER" alt="FoodPronto Brasil">
    <span>FOOD<em>PRONTO</em></span>
  </div>
  <a href="#cadastro" class="nav-cta">🚀 Teste Grátis 30 Dias</a>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-badge"><span></span> Novo • Instale em 30 minutos</div>
  <img src="data:image/png;base64,LOGO_BASE64_PLACEHOLDER" alt="FoodPronto Brasil Logo" class="hero-logo">
  <h1>Seu <span class="accent">Foodtruck</span><br>no Digital em<br><span class="accent2">30 Minutos</span></h1>
  <p class="subtitle">Cardápio digital, pedidos online, pagamentos pelo Mercado Pago e alerta sonoro no celular do cliente quando o pedido estiver pronto. Tudo sem maquininha!</p>
  <div class="hero-btns">
    <a href="#cadastro" class="btn-primary">🎉 Começar Grátis</a>
    <a href="https://www.youtube.com/@foodpronto" target="_blank" class="btn-secondary">▶ Ver no YouTube</a>
  </div>
  <div class="hero-stats">
    <div class="hero-stat"><div class="num">30min</div><div class="lbl">Para começar a vender</div></div>
    <div class="hero-stat"><div class="num">30dias</div><div class="lbl">Teste 100% gratuito</div></div>
    <div class="hero-stat"><div class="num">R$0</div><div class="lbl">Sem maquininha de cartão</div></div>
    <div class="hero-stat"><div class="num">50%</div><div class="lbl">Comissão recorrente</div></div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section>
  <div class="center">
    <div class="section-tag">⚡ Como Funciona</div>
    <h2 class="section-title">Da instalação ao <em>primeiro pedido</em><br>em menos de 30 minutos</h2>
    <p class="section-desc">Simples, rápido e sem precisar de conhecimento técnico. Siga os passos e comece a vender agora.</p>
  </div>
  <div class="steps-grid">
    <div class="step-card">
      <div class="step-num">01</div>
      <div class="step-icon">📋</div>
      <h3>Cadastro rápido e gratuito</h3>
      <p>Crie sua conta em minutos. Sem cartão de crédito, sem burocracia. 30 dias de teste completo gratuito.</p>
      <span class="step-time">⏱ 5 minutos</span>
    </div>
    <div class="step-card">
      <div class="step-num">02</div>
      <div class="step-icon">🍔</div>
      <h3>Monte seu cardápio digital</h3>
      <p>Adicione produtos, categorias e fotos sem limite. Menu bonito e profissional com arrastar e soltar.</p>
      <span class="step-time">⏱ 10 minutos</span>
    </div>
    <div class="step-card">
      <div class="step-num">03</div>
      <div class="step-icon">💳</div>
      <h3>Conecte sua conta Mercado Pago</h3>
      <p>Integre em segundos. Se não tiver conta, criar é grátis e rápido. Sem maquininha necessária!</p>
      <span class="step-time">⏱ 5 minutos</span>
    </div>
    <div class="step-card">
      <div class="step-num">04</div>
      <div class="step-icon">📱</div>
      <h3>Compartilhe o link ou QR Code</h3>
      <p>Envie o link direto do seu foodtruck para seus clientes via WhatsApp, Instagram ou imprima o QR Code.</p>
      <span class="step-time">⏱ 2 minutos</span>
    </div>
    <div class="step-card">
      <div class="step-num">05</div>
      <div class="step-icon">🎉</div>
      <h3>Receba pedidos e pagamentos</h3>
      <p>Os pedidos chegam no seu painel de cozinha em tempo real. Quando pronto, o cliente recebe alerta sonoro no celular.</p>
      <span class="step-time">⏱ Imediato!</span>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features-bg">
  <div class="center">
    <div class="section-tag">✨ Funcionalidades</div>
    <h2 class="section-title" style="color:white;">Tudo que seu foodtruck<br>precisa em um só lugar</h2>
    <p class="section-desc">Tecnologia pensada para o dia a dia de quem trabalha na rua.</p>
  </div>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon">🔔</div>
      <h3>Alerta Sonoro para o Cliente</h3>
      <p>Quando o pedido fica pronto, o celular do cliente vibra e toca um som de alerta. Sem precisar de painel LED ou ficha numerada!</p>
      <span class="feat-badge gold">🚀 Inovação exclusiva</span>
    </div>
    <div class="feat-card">
      <div class="feat-icon">📍</div>
      <h3>Geolocalizacão Inteligente</h3>
      <p>O app mostra automaticamente os foodtrucks próximos ao cliente. Mais visibilidade, mais clientes descobrindo você!</p>
      <span class="feat-badge green">📍 Localização em tempo real</span>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🍽️</div>
      <h3>Cardápio Ilimitado</h3>
      <p>Produtos, categorias e fotos sem limite. Monte um menu visualmente atraente que converte visitantes em pedidos.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">👨‍🍳</div>
      <h3>Painel de Cozinha</h3>
      <p>Visualize e gerencie todos os pedidos em tempo real. Organize o fluxo de preparo com facilidade, mesmo nos horários de pico.</p>
    </div>
    <div class="feat-card">
      <div class="feat-icon">📲</div>
      <h3>Android + Web App</h3>
      <p>Disponível no Google Play Store e como web app. Seus clientes acessam sem precisar baixar nada, direto pelo navegador.</p>
      <span class="feat-badge gold">📲 Google Play Store</span>
    </div>
    <div class="feat-card">
      <div class="feat-icon">🔗</div>
      <h3>Link Direto + QR Code</h3>
      <p>Compartilhe seu link personalizado ou imprima o QR Code. Seus clientes fiéis acessam direto ao seu cardápio sem precisar buscar no app.</p>
    </div>
  </div>
</section>

<!-- PAYMENT -->
<section>
  <div class="payment-wrap">
    <div>
      <div class="section-tag">💳 Pagamentos</div>
      <h2 class="section-title">Simples, rápido e<br>sem maquininha</h2>
      <p class="section-desc">Aceite pagamentos pelo Mercado Pago. Criar uma conta é grátis e leva poucos minutos.</p>
      <div class="payment-methods">
        <div class="pay-item">
          <div class="ico">💳</div>
          <div>
            <h4>Cartão de Crédito</h4>
            <p>Todas as bandeiras, parcelamento disponível</p>
          </div>
        </div>
        <div class="pay-item">
          <div class="ico">🏦</div>
          <div>
            <h4>Cartão de Débito</h4>
            <p>Aprovação instantânea, dinheiro na hora</p>
          </div>
        </div>
        <div class="pay-item">
          <div class="ico">⚡</div>
          <div>
            <h4>PIX</h4>
            <p>Pagamento instantâneo 24/7, sem taxas extras</p>
          </div>
        </div>
        <div class="pay-item">
          <div class="ico">💵</div>
          <div>
            <h4>Dinheiro no Balcão</h4>
            <p>O balconista lança o pedido manualmente para clientes sem smartphone</p>
          </div>
        </div>
      </div>
    </div>
    <div class="no-machine">
      <div style="font-size:4rem;margin-bottom:16px;">🚫📟</div>
      <div class="big">SEM MAQUININHA!</div>
      <p>Abra uma conta no Mercado Pago em minutos e já comece a aceitar pagamentos. Zero investimento inicial em equipamentos.</p>
      <div class="checkmark">
        <span>Conta Mercado Pago gratuita</span>
        <span>Receba em conta na hora (PIX)</span>
        <span>Taxas competitivas por transação</span>
        <span>Funciona no smartphone do balconista</span>
      </div>
    </div>
  </div>
</section>

<!-- ALERT SECTION -->
<section class="alert-section">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;">
    <div>
      <div class="section-tag">🔔 Alerta Sonoro</div>
      <h2 class="section-title">Chame seu cliente<br><em>sem LED, sem ficha,<br>sem gritaria!</em></h2>
      <p class="section-desc">Quando o pedido ficar pronto, o celular do seu cliente vibra e toca um alerta sonoro automaticamente. Tecnologia que elimina painéis LED caros e filas confusas.</p>
      <div style="margin-top:28px;display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;font-size:0.92rem;color:var(--muted);">
          <span style="font-size:1.4rem;">❌</span> Sem painel LED numérico
        </div>
        <div style="display:flex;align-items:center;gap:12px;font-size:0.92rem;color:var(--muted);">
          <span style="font-size:1.4rem;">❌</span> Sem ficha de papel numerada
        </div>
        <div style="display:flex;align-items:center;gap:12px;font-size:0.92rem;color:var(--muted);">
          <span style="font-size:1.4rem;">❌</span> Sem gritar o nome do cliente
        </div>
        <div style="display:flex;align-items:center;gap:12px;font-size:0.92rem;color:var(--navy);font-weight:700;">
          <span style="font-size:1.4rem;">✅</span> Alerta automático no celular do cliente!
        </div>
      </div>
    </div>
    <div>
      <div class="alert-demo">
        <p style="font-size:0.85rem;color:rgba(255,255,255,0.6);margin-bottom:8px;">Simulação de notificação</p>
        <div class="phone-mock" id="phoneMock">
          <div class="phone-notch"></div>
          <div class="notif-card" id="notifCard">
            <div class="notif-header">
              <span style="font-size:1.1rem;">🍔</span>
              <span class="notif-app">FoodPronto</span>
              <span class="notif-time">Agora</span>
            </div>
            <div class="notif-title">🔔 Seu pedido está pronto!</div>
            <div class="notif-body">Venha buscar no balcão. Bom apetite! 😋</div>
          </div>
        </div>
        <button onclick="triggerAlert()" style="background:var(--gold);color:var(--navy);border:none;border-radius:50px;padding:12px 28px;font-weight:800;font-size:0.9rem;cursor:pointer;margin-top:8px;">
          🔔 Simular Alerta
        </button>
      </div>
    </div>
  </div>
</section>

<!-- MANUAL ORDER -->
<section class="manual-section">
  <div class="manual-wrap">
    <div>
      <div class="section-tag">👋 Atendimento Presencial</div>
      <h2 class="section-title">E o cliente que não tem<br>smartphone?</h2>
      <p class="section-desc">Nenhum cliente fica sem atendimento. O balconista consegue lançar pedidos manualmente no painel de administração e receber o pagamento em dinheiro.</p>
    </div>
    <div class="manual-card">
      <h3>PEDIDO MANUAL NO BALCÃO</h3>
      <p>O painel de administração permite ao balconista atender qualquer cliente, independente de ter ou não smartphone:</p>
      <div class="scenario-list">
        <div class="scenario-item">
          <div class="s-icon">📵</div>
          <p><strong style="color:white;">Sem smartphone:</strong> Balconista lança o pedido manualmente no painel e recebe em dinheiro.</p>
        </div>
        <div class="scenario-item">
          <div class="s-icon">💵</div>
          <p><strong style="color:white;">Prefere dinheiro:</strong> Cliente paga em espécie, sem necessidade de pagamento digital.</p>
        </div>
        <div class="scenario-item">
          <div class="s-icon">🤝</div>
          <p><strong style="color:white;">Atendimento híbrido:</strong> Online e presencial funcionam juntos no mesmo painel de cozinha.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section id="cadastro" style="background:var(--gray);">
  <div class="center">
    <div class="section-tag">💰 Planos e Preços</div>
    <h2 class="section-title">Comece grátis,<br>cresça sem limites</h2>
    <p class="section-desc">30 dias de teste completo sem custo. Depois, escolha o plano que melhor se encaixa no seu negócio.</p>
  </div>
  <div class="pricing-grid">
    <div class="price-card free">
      <div class="plan-name">🎁 Teste Grátis</div>
      <div class="price-amount">R$0</div>
      <div class="price-period">por 30 dias completos</div>
      <ul class="price-features">
        <li>Todas as funcionalidades liberadas</li>
        <li>Cardápio digital ilimitado</li>
        <li>Integração Mercado Pago</li>
        <li>Alerta sonoro para clientes</li>
        <li>Sem cartão de crédito necessário</li>
      </ul>
      <a href="#" class="price-btn gold-btn">Começar Grátis Agora</a>
    </div>
    <div class="price-card monthly">
      <div class="price-badge">⭐ Mais Popular</div>
      <div class="plan-name">📅 Mensal</div>
      <div class="price-amount">R$200</div>
      <div class="price-period">por mês • sem fidelidade</div>
      <ul class="price-features">
        <li>Tudo do plano gratuito</li>
        <li>Suporte prioritário</li>
        <li>QR Code personalizado</li>
        <li>Link direto do seu foodtruck</li>
        <li>Painel de cozinha completo</li>
      </ul>
      <a href="#" class="price-btn white-btn">Assinar Mensal</a>
    </div>
    <div class="price-card annual">
      <div class="price-badge green-badge">🤑 20% de desconto</div>
      <div class="plan-name">📆 Anual</div>
      <div class="price-amount">R$160</div>
      <div class="price-period">por mês • pago anualmente</div>
      <ul class="price-features">
        <li>Tudo do plano mensal</li>
        <li>Economia de R$480/ano</li>
        <li>Acesso antecipado a novidades</li>
        <li>Suporte VIP</li>
        <li>Melhor custo-benefício</li>
      </ul>
      <a href="#" class="price-btn green-btn">Assinar Anual</a>
    </div>
  </div>
</section>

<!-- RESELLER -->
<section class="reseller-section">
  <div class="center">
    <div class="section-tag">💼 Seja Revendedor</div>
    <h2 class="section-title" style="color:white;">Ganhe dinheiro<br>revendendo FoodPronto</h2>
    <p class="section-desc">Renda recorrente todo mês. Quanto mais clientes você trouxer, mais você ganha — para sempre!</p>
  </div>
  <div class="reseller-grid">
    <div>
      <div class="commission-big">
        <div class="pct">50%</div>
        <div class="label">de comissão recorrente</div>
        <div style="border-top:1px solid rgba(255,255,255,0.1);margin:16px 0;"></div>
        <div style="font-size:0.85rem;color:rgba(255,255,255,0.6);">Exemplo: 10 clientes ativos =</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:2.4rem;color:#4ade80;margin:4px 0;">R$1.000/mês</div>
        <div class="sub">Todo mês, automaticamente, sem fazer nada extra</div>
      </div>
    </div>
    <div class="reseller-perks">
      <div class="reseller-perk">
        <div class="perk-icon">💰</div>
        <div>
          <h4>50% de comissão recorrente</h4>
          <p>Você ganha metade do valor de cada assinatura todo mês, enquanto o cliente continuar ativo.</p>
        </div>
      </div>
      <div class="reseller-perk">
        <div class="perk-icon">🎟️</div>
        <div>
          <h4>10% de voucher para seus clientes</h4>
          <p>Ofereça 10% de desconto para seus clientes com seu voucher exclusivo. Seja mais competitivo que a versão online direta!</p>
        </div>
      </div>
      <div class="reseller-perk">
        <div class="perk-icon">🔄</div>
        <div>
          <h4>Renda passiva e recorrente</h4>
          <p>Uma vez que seu cliente assina, você recebe todo mês sem precisar fazer mais nada. Renda que cresce com o tempo.</p>
        </div>
      </div>
      <div class="reseller-perk">
        <div class="perk-icon">📈</div>
        <div>
          <h4>Sem limite de ganhos</h4>
          <p>Não há teto para suas comissões. Traga 100 foodtrucks e receba 50% das 100 assinaturas todo mês.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ECOSYSTEM -->
<section class="eco-section">
  <div class="center">
    <div class="section-tag">🌐 Ecossistema FoodPronto</div>
    <h2 class="section-title">Uma família de soluções<br>para o setor alimentício</h2>
    <p class="section-desc">FoodPronto não é só para foodtrucks. Veja todo o ecossistema disponível para diferentes tipos de negócio.</p>
  </div>
  <div class="eco-grid">
    <div class="eco-card">
      <div class="eco-icon">🚚</div>
      <span class="eco-tag truck">Foodtruck</span>
      <h3>FoodPronto — Foodtruck</h3>
      <p>A solução completa para foodtrucks: pedidos online, painel de cozinha, alertas sonoros e pagamento sem maquininha.</p>
      <a href="https://www.youtube.com/@foodpronto" target="_blank" class="eco-link">Conhecer ↗</a>
    </div>
    <div class="eco-card">
      <div class="eco-icon">🛵</div>
      <span class="eco-tag delivery">Delivery</span>
      <h3>FoodPronto Delivery</h3>
      <p>Gestão de delivery a domicílio com motoboys integrados pelo WhatsApp. Simples e eficiente para restaurantes com entrega.</p>
      <a href="https://delivery.foodpronto.com.br" target="_blank" class="eco-link">delivery.foodpronto.com.br ↗</a>
    </div>
    <div class="eco-card">
      <div class="eco-icon">🏖️</div>
      <span class="eco-tag beach">Quiosque Praia</span>
      <h3>Quiosque Praia</h3>
      <p>O cliente pede do seu guarda-sol pelo celular e um garçom de praia leva tudo até ele. Perfeito para quiosques litorâneos.</p>
      <a href="https://pay.quiosquepraia.com" target="_blank" class="eco-link">pay.quiosquepraia.com ↗</a>
    </div>
    <div class="eco-card">
      <div class="eco-icon">📋</div>
      <span class="eco-tag menu">Menu Digital</span>
      <h3>Cardápio Digital</h3>
      <p>Crie e compartilhe um cardápio digital para qualquer restaurante. Inclui placa display com QR Code e NFC para acesso presencial.</p>
      <a href="https://cardapio.foodpronto.com.br" target="_blank" class="eco-link">cardapio.foodpronto.com.br ↗</a>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="final-cta">
  <div class="section-tag" style="background:rgba(245,197,24,0.2);color:var(--gold);">🚀 Comece Hoje</div>
  <h2 class="section-title">Pronto para digitalizar<br>seu foodtruck?</h2>
  <p class="section-desc">30 dias grátis. Instalação em 30 minutos. Sem maquininha, sem complicação.</p>
  <div class="cta-btns">
    <a href="#cadastro" class="btn-primary" style="font-size:1.05rem;padding:18px 44px;">🎉 Cadastrar Grátis Agora</a>
    <a href="https://www.youtube.com/@foodpronto" target="_blank" class="yt-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.4s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.6 2 12 2 12 2s-4.6 0-7.3.3c-.6.1-1.9.1-3 1.3C.8 4.4.5 6.4.5 6.4S.2 8.7.2 11v2.1c0 2.3.3 4.6.3 4.6s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 22 12 22 12 22s4.6 0 7.3-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.3.3-4.6V11c0-2.3-.3-4.6-.3-4.6zM9.7 15.5v-8l8.1 4-8.1 4z"/></svg>
      Assistir no YouTube
    </a>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <p>© 2024 FoodPronto Brasil — Todos os direitos reservados</p>
  <p style="margin-top:8px;">
    <a href="https://delivery.foodpronto.com.br">Delivery</a> •
    <a href="https://pay.quiosquepraia.com">Quiosque Praia</a> •
    <a href="https://cardapio.foodpronto.com.br">Cardápio Digital</a> •
    <a href="https://www.youtube.com/@foodpronto">YouTube</a>
  </p>
</footer>

<script>
function triggerAlert() {
  const phone = document.getElementById('phoneMock');
  const card = document.getElementById('notifCard');
  phone.classList.remove('vibrate');
  card.style.animation = 'none';
  setTimeout(() => {
    phone.classList.add('vibrate');
    card.style.animation = '';
    card.style.animation = 'bounceIn 0.5s ease';
  }, 10);
  setTimeout(() => phone.classList.remove('vibrate'), 1000);
}
</script>
</body>
</html>'''

# Replace placeholder with actual base64
html = html.replace('LOGO_BASE64_PLACEHOLDER', logo_b64)

with open('/mnt/user-data/outputs/foodpronto_landing.html', 'w') as f:
    f.write(html)

print("Done! File size:", len(html), "bytes")
