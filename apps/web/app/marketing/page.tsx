"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
import MercadoPagoLogo from "./mercado-pago.png";
import PixLogo from "./logo-pix.png";
import DinheiroLogo from "./dinheiro.png";

const CSS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap');

  .marketing-landing {
    --mkt-navy: #0d1e3a;
    --mkt-navy2: #162848;
    --mp-blue: #00ADEF;
    --mkt-gold: #f5c518;
    --mkt-gold2: #e8a900;
    --mkt-green: #1a7a2e;
    --mkt-green2: #22a33d;
    --mkt-white: #ffffff;
    --mkt-gray: #f4f6fa;
    --mkt-text: #1a1a2e;
    --mkt-muted: #5a6070;
    --mkt-radius: 16px;
    --mkt-radius-sm: 10px;

    font-family: "Nunito", sans-serif;
    color: var(--mkt-text);
    background: #fff;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .marketing-landing * {
    box-sizing: border-box;
  }

  /* NAV */
  .marketing-landing .mkt-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(13,30,58,0.97);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 5%;
    height: 70px;
    border-bottom: 2px solid var(--mkt-gold);
  }
  .marketing-landing .logo-nav { display: flex; align-items: center; gap: 12px; }
  .marketing-landing .logo-icon { font-size: 32px; }
  .marketing-landing .logo-nav span { font-family: "Bebas Neue", sans-serif; font-size: 1.6rem; color: var(--mkt-white); letter-spacing: 1px; }
  .marketing-landing .logo-nav span em { color: var(--mkt-gold); font-style: normal; }
  .marketing-landing .nav-cta {
    background: var(--mkt-gold); color: var(--mkt-navy); font-weight: 800; font-size: 0.9rem;
    border: none; border-radius: 50px; padding: 10px 24px; cursor: pointer;
    text-decoration: none; transition: background 0.2s;
  }
  .marketing-landing .nav-cta:hover { background: var(--mkt-gold2); }

  /* HERO */
  .marketing-landing .mkt-hero {
    min-height: 100vh;
    background: var(--mkt-navy);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column;
    text-align: center;
    padding: 100px 5% 60px;
    position: relative;
    overflow: hidden;
  }
  .marketing-landing .mkt-hero::before {
    content: "";
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 30%, #1e3a6e 0%, transparent 70%);
    pointer-events: none;
  }
  .marketing-landing .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(245,197,24,0.15); border: 1.5px solid var(--mkt-gold);
    color: var(--mkt-gold); font-size: 0.85rem; font-weight: 700;
    border-radius: 50px; padding: 6px 18px; margin-bottom: 28px;
    letter-spacing: 0.5px;
    position: relative; z-index: 1;
  }
  .marketing-landing .hero-badge .badge-dot { width: 8px; height: 8px; background: var(--mkt-gold); border-radius: 50%; animation: mkt-pulse 1.5s infinite; }
  @keyframes mkt-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
  
  .marketing-landing .mkt-hero h1 {
    font-family: "Bebas Neue", sans-serif;
    font-size: clamp(3rem, 8vw, 6.5rem);
    color: var(--mkt-white); line-height: 1;
    margin-bottom: 10px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.4);
    position: relative; z-index: 1;
  }
  .marketing-landing .mkt-hero h1 .accent { color: var(--mkt-gold); }
  .marketing-landing .mkt-hero h1 .accent2 { color: #4ade80; }
  .marketing-landing .mkt-hero .subtitle {
    font-size: clamp(1.1rem, 2.5vw, 1.4rem);
    color: rgba(255,255,255,0.8); max-width: 700px;
    line-height: 1.6; margin-bottom: 40px;
    position: relative; z-index: 1;
  }
  
  .marketing-landing .hero-btns { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 56px; position: relative; z-index: 1; }
  .marketing-landing .btn-primary {
    background: var(--mkt-gold); color: var(--mkt-navy); font-weight: 800; font-size: 1rem;
    border-radius: 50px; padding: 16px 36px; text-decoration: none;
    transition: transform 0.15s, background 0.2s;
    box-shadow: 0 4px 20px rgba(245,197,24,0.4);
  }
  .marketing-landing .btn-primary:hover { transform: translateY(-2px); background: var(--mkt-gold2); }
  .marketing-landing .btn-secondary {
    background: transparent; color: var(--mkt-white); font-weight: 700; font-size: 1rem;
    border: 2px solid rgba(255,255,255,0.4); border-radius: 50px; padding: 16px 36px;
    text-decoration: none; transition: border-color 0.2s, background 0.2s;
  }
  .marketing-landing .btn-secondary:hover { border-color: var(--mkt-white); background: rgba(255,255,255,0.08); }
  
  .marketing-landing .hero-stats {
    display: flex; gap: 40px; flex-wrap: wrap; justify-content: center;
    border-top: 1px solid rgba(255,255,255,0.1); padding-top: 40px;
    position: relative; z-index: 1;
  }
  .marketing-landing .hero-stat { text-align: center; }
  .marketing-landing .hero-stat .num { font-family: "Bebas Neue", sans-serif; font-size: 2.6rem; color: var(--mkt-gold); line-height: 1; }
  .marketing-landing .hero-stat .lbl { font-size: 0.8rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

  /* SECTION BASE */
  .marketing-landing .mkt-section { padding: 80px 5%; }
  .marketing-landing .section-tag {
    display: inline-block; background: rgba(245,197,24,0.12); color: var(--mkt-gold2);
    font-weight: 800; font-size: 0.75rem; letter-spacing: 1.5px; text-transform: uppercase;
    border-radius: 50px; padding: 5px 16px; margin-bottom: 14px;
  }
  .marketing-landing .section-title {
    font-family: "Bebas Neue", sans-serif; font-size: clamp(2rem, 5vw, 3.2rem);
    line-height: 1.1; margin-bottom: 16px; color: var(--mkt-navy);
  }
  .marketing-landing .section-desc { font-size: 1.05rem; color: var(--mkt-muted); max-width: 600px; line-height: 1.7; }
  .marketing-landing .center { text-align: center; }
  .marketing-landing .center .section-desc { margin: 0 auto; }
  
  .marketing-landing .text-white { color: var(--mkt-white); }
  .marketing-landing .text-light { color: rgba(255,255,255,0.7); }

  /* HOW IT WORKS */
  .marketing-landing .steps-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 28px; margin-top: 50px;
  }
  .marketing-landing .step-card {
    background: var(--mkt-gray); border-radius: var(--mkt-radius); padding: 32px 24px;
    position: relative; border: 2px solid transparent;
    transition: border-color 0.2s, transform 0.2s;
  }
  .marketing-landing .step-card:hover { border-color: var(--mkt-gold); transform: translateY(-4px); }
  .marketing-landing .step-num {
    font-family: "Bebas Neue", sans-serif; font-size: 4rem; color: var(--mkt-gold);
    opacity: 0.2; line-height: 1; margin-bottom: 8px;
  }
  .marketing-landing .step-icon { font-size: 2.2rem; margin-bottom: 14px; }
  .marketing-landing .step-card h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 10px; color: var(--mkt-navy); }
  .marketing-landing .step-card p { font-size: 0.92rem; color: var(--mkt-muted); line-height: 1.6; }
  .marketing-landing .step-time {
    display: inline-block; background: var(--mkt-gold); color: var(--mkt-navy);
    font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 50px;
    margin-top: 12px;
  }

  /* FEATURES */
  .marketing-landing .features-bg { background: var(--mkt-navy); color: var(--mkt-white); }
  .marketing-landing .feat-tag { background: rgba(245,197,24,0.2); color: var(--mkt-gold); }
  .marketing-landing .feat-desc { color: rgba(255,255,255,0.65); }
  .marketing-landing .features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px; margin-top: 50px;
  }
  .marketing-landing .feat-card {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--mkt-radius); padding: 28px 24px;
    transition: background 0.2s, border-color 0.2s;
  }
  .marketing-landing .feat-card:hover { background: rgba(255,255,255,0.09); border-color: rgba(245,197,24,0.5); }
  .marketing-landing .feat-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(245,197,24,0.15); display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem; margin-bottom: 18px;
  }
  .marketing-landing .feat-card h3 { font-size: 1.05rem; font-weight: 800; margin-bottom: 10px; color: var(--mkt-white); }
  .marketing-landing .feat-card p { font-size: 0.9rem; color: rgba(255,255,255,0.6); line-height: 1.65; }
  .marketing-landing .feat-badge {
    display: inline-block; margin-top: 12px; font-size: 0.72rem; font-weight: 700;
    padding: 4px 12px; border-radius: 50px;
  }
  .marketing-landing .feat-badge.gold { background: rgba(245,197,24,0.2); color: var(--mkt-gold); }
  .marketing-landing .feat-badge.green { background: rgba(34,163,61,0.2); color: #4ade80; }

  /* PAYMENT */
  .marketing-landing .payment-wrap {
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
    align-items: center; margin-top: 20px;
  }
  @media(max-width:768px) { .marketing-landing .payment-wrap { grid-template-columns:1fr; } }
  .marketing-landing .payment-methods {
    display: flex; flex-direction: column; gap: 14px; margin-top: 28px;
  }
  .marketing-landing .pay-item {
    display: flex; align-items: center; gap: 16px;
    background: var(--mkt-gray); border-radius: var(--mkt-radius-sm); padding: 16px 20px;
    border-left: 4px solid var(--mkt-gold);
  }
  .marketing-landing .pay-item.credit,
  .marketing-landing .pay-item.debit {
    border-left: 4px solid var(--mp-blue);
  }
  .marketing-landing .pay-item.pix,
  .marketing-landing .pay-item.cash {
    border-left: 4px solid var(--mkt-green);
  }
  .marketing-landing .pay-item.credit .ico svg,
  .marketing-landing .pay-item.debit .ico svg { width: 28px; height: 18px; color: var(--mp-blue); display: block; }
  .marketing-landing .pay-item.pix .ico svg,
  .marketing-landing .pay-item.cash .ico svg { width: 28px; height: 18px; color: var(--mkt-green); display: block; }
  .marketing-landing .debit-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--mp-blue); color: #fff; font-size: 12px; margin-left: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.18);
  }
  .marketing-landing .pay-item .ico { font-size: 1.8rem; }
  .marketing-landing .pay-item h4 { font-weight: 800; font-size: 0.95rem; margin-bottom: 2px; color: var(--mkt-navy); }
  .marketing-landing .pay-item p { font-size: 0.82rem; color: var(--mkt-muted); margin: 0; }
  .marketing-landing .no-machine {
    background: linear-gradient(135deg, var(--mkt-navy), #1e3a6e);
    border-radius: var(--mkt-radius); padding: 36px; color: var(--mkt-white); text-align: center;
  }
  .marketing-landing .no-machine .big { font-family: "Bebas Neue", sans-serif; font-size: 2.5rem; color: var(--mkt-gold); margin-bottom: 10px; }
  .marketing-landing .no-machine p { font-size: 0.95rem; color: rgba(255,255,255,0.75); line-height: 1.6; }
  .marketing-landing .checkmark { font-size: 1.2rem; margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
  .marketing-landing .checkmark span { display: flex; align-items: center; gap: 10px; justify-content: center; font-size: 0.9rem; color: rgba(255,255,255,0.85); }
  .marketing-landing .checkmark span::before { content: "✅"; }

  /* ALERT SECTION */
  .marketing-landing .alert-section { background: var(--mkt-gray); }
  .marketing-landing .alert-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  @media(max-width:768px) { .marketing-landing .alert-wrap { grid-template-columns:1fr; } }
  .marketing-landing .alert-check-list { margin-top:28px; display:flex; flex-direction:column; gap:12px; }
  .marketing-landing .alert-check-item { display:flex; align-items:center; gap:12px; font-size:0.92rem; }
  .marketing-landing .alert-check-item.muted { color: var(--mkt-muted); }
  .marketing-landing .alert-check-item.highlight { color: var(--mkt-navy); font-weight: 700; }
  .marketing-landing .alert-check-item .icon { font-size: 1.4rem; }
  
  .marketing-landing .alert-demo {
    background: var(--mkt-navy); border-radius: var(--mkt-radius); padding: 40px;
    color: var(--mkt-white); text-align: center; max-width: 500px; margin: 0 auto;
    border: 2px solid var(--mkt-gold);
  }
  .marketing-landing .demo-title { font-size:0.85rem; color:rgba(255,255,255,0.6); margin-bottom:8px; }
  .marketing-landing .phone-mock {
    background: #1a1a1a; border-radius: 28px; padding: 20px;
    margin: 24px auto; max-width: 260px;
    border: 6px solid #333; position: relative;
  }
  .marketing-landing .phone-notch {
    width: 100px; height: 24px; background: #1a1a1a; border-radius: 0 0 16px 16px;
    margin: -20px auto 16px; position: relative; z-index: 1;
  }
  .marketing-landing .notif-card {
    background: rgba(255,255,255,0.95); border-radius: 14px; padding: 14px 16px;
    color: #1a1a1a; text-align: left;
    opacity: 0; transform: scale(0.8);
  }
  .marketing-landing .bounceIn {
    animation: mkt-bounceIn 0.5s forwards ease;
  }
  @keyframes mkt-bounceIn { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
  
  .marketing-landing .notif-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .marketing-landing .notif-app { font-size: 0.7rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
  .marketing-landing .notif-time { font-size: 0.65rem; color: #999; margin-left: auto; }
  .marketing-landing .notif-title { font-weight: 800; font-size: 0.85rem; color: #1a1a1a; }
  .marketing-landing .notif-body { font-size: 0.78rem; color: #555; margin-top: 2px; }
  
  .marketing-landing .vibrate { animation: mkt-vibrate 0.3s linear 3; }
  @keyframes mkt-vibrate { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-4px,0)} 75%{transform:translate(4px,0)} }
  
  .marketing-landing .sim-btn {
    background: var(--mkt-gold); color: var(--mkt-navy); border: none; border-radius: 50px;
    padding: 12px 28px; font-weight: 800; font-size: 0.9rem; cursor: pointer; margin-top: 8px;
    transition: transform 0.15s;
  }
  .marketing-landing .sim-btn:hover { transform: translateY(-2px); }

  /* MANUAL ORDER */
  .marketing-landing .manual-section { background: var(--mkt-white); }
  .marketing-landing .manual-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  @media(max-width:768px) { .marketing-landing .manual-wrap { grid-template-columns: 1fr; } }
  .marketing-landing .manual-card {
    background: var(--mkt-navy); border-radius: var(--mkt-radius); padding: 36px;
    color: var(--mkt-white); border: 2px solid var(--mkt-gold);
  }
  .marketing-landing .manual-card h3 { font-family: "Bebas Neue", sans-serif; font-size: 2rem; color: var(--mkt-gold); margin-bottom: 16px; }
  .marketing-landing .manual-card p { font-size: 0.92rem; color: rgba(255,255,255,0.75); line-height: 1.65; }
  .marketing-landing .scenario-list { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
  .marketing-landing .scenario-item {
    display: flex; align-items: flex-start; gap: 14px;
    background: rgba(255,255,255,0.07); border-radius: var(--mkt-radius-sm); padding: 14px 16px;
  }
  .marketing-landing .scenario-item .s-icon { font-size: 1.4rem; flex-shrink: 0; }
  .marketing-landing .scenario-item p { font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.5; margin: 0; }
  .marketing-landing .scenario-item strong { color: var(--mkt-white); }

  /* PRICING */
  .marketing-landing .pricing-bg { background: var(--mkt-gray); }
  .marketing-landing .pricing-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 28px; margin-top: 50px; max-width: 900px; margin-left: auto; margin-right: auto;
  }
  .marketing-landing .price-card {
    border-radius: var(--mkt-radius); padding: 36px 28px; text-align: center;
    border: 2px solid transparent; position: relative; transition: transform 0.2s;
  }
  .marketing-landing .price-card:hover { transform: translateY(-4px); }
  .marketing-landing .price-card.free { background: var(--mkt-gray); border-color: #ddd; }
  .marketing-landing .price-card.monthly { background: var(--mkt-navy); color: var(--mkt-white); border-color: var(--mkt-gold); }
  .marketing-landing .price-card.annual { background: var(--mkt-navy); color: var(--mkt-white); border-color: var(--mkt-green2); }
  .marketing-landing .price-badge {
    position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
    background: var(--mkt-gold); color: var(--mkt-navy); font-size: 0.7rem; font-weight: 800;
    padding: 4px 18px; border-radius: 50px; white-space: nowrap;
  }
  .marketing-landing .price-badge.green-badge { background: var(--mkt-green2); color: var(--mkt-white); }
  .marketing-landing .plan-name { font-family: "Bebas Neue", sans-serif; font-size: 1.6rem; margin-bottom: 8px; }
  .marketing-landing .price-card.free .plan-name { color: var(--mkt-navy); }
  .marketing-landing .price-amount { font-family: "Bebas Neue", sans-serif; font-size: 3.8rem; line-height: 1; color: var(--mkt-gold); margin: 12px 0 4px; }
  .marketing-landing .price-card.free .price-amount { color: var(--mkt-green); }
  .marketing-landing .price-period { font-size: 0.82rem; margin-bottom: 24px; }
  .marketing-landing .price-card.free .price-period { color: var(--mkt-muted); }
  .marketing-landing .price-card.monthly .price-period, .marketing-landing .price-card.annual .price-period { color: rgba(255,255,255,0.6); }
  .marketing-landing .price-features { list-style: none; text-align: left; margin-bottom: 28px; display: flex; flex-direction: column; gap: 10px; padding: 0; }
  .marketing-landing .price-features li { display: flex; align-items: flex-start; gap: 10px; font-size: 0.88rem; }
  .marketing-landing .price-features li::before { content: "✓"; font-weight: 800; color: var(--mkt-gold); flex-shrink: 0; margin-top: 1px; }
  .marketing-landing .price-card.free .price-features li { color: var(--mkt-muted); }
  .marketing-landing .price-card.free .price-features li::before { color: var(--mkt-green); }
  .marketing-landing .price-card.monthly .price-features li, .marketing-landing .price-card.annual .price-features li { color: rgba(255,255,255,0.8); }
  .marketing-landing .price-btn {
    display: block; width: 100%; padding: 14px; border-radius: 50px;
    font-weight: 800; font-size: 0.95rem; text-decoration: none; text-align: center;
    transition: opacity 0.2s;
  }
  .marketing-landing .price-btn:hover { opacity: 0.88; }
  .marketing-landing .gold-btn { background: var(--mkt-gold); color: var(--mkt-navy); }
  .marketing-landing .white-btn { background: var(--mkt-white); color: var(--mkt-navy); }
  .marketing-landing .green-btn { background: var(--mkt-green2); color: var(--mkt-white); }

  /* RESELLER */
  .marketing-landing .reseller-section { background: linear-gradient(135deg, #0a1628, #1a3a6e); color: var(--mkt-white); }
  .marketing-landing .reseller-tag { background: rgba(74,222,128,0.15); color: #4ade80; }
  .marketing-landing .reseller-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; margin-top: 40px; }
  @media(max-width:768px) { .marketing-landing .reseller-grid { grid-template-columns: 1fr; } }
  .marketing-landing .commission-big {
    background: rgba(245,197,24,0.1); border: 2px solid var(--mkt-gold);
    border-radius: var(--mkt-radius); padding: 36px; text-align: center;
  }
  .marketing-landing .commission-big .pct { font-family: "Bebas Neue", sans-serif; font-size: 6rem; color: var(--mkt-gold); line-height: 1; }
  .marketing-landing .commission-big .label { font-size: 0.9rem; color: rgba(255,255,255,0.7); }
  .marketing-landing .commission-big .comm-divider { border-top:1px solid rgba(255,255,255,0.1); margin:16px 0; }
  .marketing-landing .commission-big .comm-ex-label { font-size:0.85rem; color:rgba(255,255,255,0.6); }
  .marketing-landing .commission-big .comm-ex-val { font-family:'Bebas Neue',sans-serif; font-size:2.4rem; color:#4ade80; margin:4px 0; }
  .marketing-landing .commission-big .sub { font-size: 0.82rem; color: rgba(255,255,255,0.5); margin-top: 8px; }
  .marketing-landing .reseller-perks { display: flex; flex-direction: column; gap: 16px; }
  .marketing-landing .reseller-perk {
    display: flex; align-items: flex-start; gap: 16px;
    background: rgba(255,255,255,0.06); border-radius: var(--mkt-radius-sm); padding: 18px;
  }
  .marketing-landing .reseller-perk .perk-icon { font-size: 1.8rem; flex-shrink: 0; }
  .marketing-landing .reseller-perk h4 { font-weight: 800; font-size: 0.95rem; margin-bottom: 4px; color: var(--mkt-white); }
  .marketing-landing .reseller-perk p { font-size: 0.83rem; color: rgba(255,255,255,0.6); line-height: 1.5; margin: 0; }

  /* ECOSYSTEM */
  .marketing-landing .eco-section { background: var(--mkt-gray); }
  .marketing-landing .eco-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-top: 50px; }
  .marketing-landing .eco-card {
    background: var(--mkt-white); border-radius: var(--mkt-radius); padding: 28px 24px;
    border: 2px solid #e8eaf0; transition: border-color 0.2s, transform 0.2s;
  }
  .marketing-landing .eco-card:hover { border-color: var(--mkt-navy); transform: translateY(-4px); }
  .marketing-landing .eco-icon { font-size: 2.4rem; margin-bottom: 14px; }
  .marketing-landing .eco-tag { display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 50px; margin-bottom: 10px; }
  .marketing-landing .eco-tag.truck { background: rgba(245,197,24,0.15); color: var(--mkt-gold2); }
  .marketing-landing .eco-tag.delivery { background: rgba(26,122,46,0.12); color: var(--mkt-green); }
  .marketing-landing .eco-tag.beach { background: rgba(56,189,248,0.15); color: #0369a1; }
  .marketing-landing .eco-tag.menu { background: rgba(167,139,250,0.15); color: #7c3aed; }
  .marketing-landing .eco-card h3 { font-size: 1.05rem; font-weight: 800; margin-bottom: 8px; color: var(--mkt-navy); }
  .marketing-landing .eco-card p { font-size: 0.85rem; color: var(--mkt-muted); line-height: 1.6; margin-bottom: 14px; }
  .marketing-landing .eco-link { font-size: 0.82rem; font-weight: 700; color: var(--mkt-navy); text-decoration: none; border-bottom: 2px solid var(--mkt-gold); padding-bottom: 2px; }
  .marketing-landing .eco-link:hover { color: var(--mkt-gold2); }

  /* CTA FINAL */
  .marketing-landing .final-cta {
    background: var(--mkt-navy); color: var(--mkt-white); text-align: center;
    padding: 100px 5%;
  }
  .marketing-landing .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .marketing-landing .yt-btn {
    display: inline-flex; align-items: center; gap: 10px;
    background: #ff0000; color: #fff; font-weight: 800; font-size: 0.95rem;
    border-radius: 50px; padding: 16px 32px; text-decoration: none;
    transition: opacity 0.2s;
  }
  .marketing-landing .yt-btn:hover { opacity: 0.88; }

  /* FOOTER */
  .marketing-landing .mkt-footer {
    background: #060e1d; color: rgba(255,255,255,0.4);
    text-align: center; padding: 28px 5%;
    font-size: 0.82rem; border-top: 1px solid rgba(245,197,24,0.2);
  }
  .marketing-landing .mkt-footer a { color: var(--mkt-gold); text-decoration: none; }
`;

export default function MarketingLandingPage() {
  const [isVibrating, setIsVibrating] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  // Pour l'animation initiale du composant de notification
  useEffect(() => {
    setIsBouncing(true);
  }, []);

  const triggerAlert = () => {
    setIsVibrating(false);
    setIsBouncing(false);
    
    // Petit délai pour réinitialiser l'animation
    setTimeout(() => {
      setIsVibrating(true);
      setIsBouncing(true);
      
      // Arrêter la vibration après 1s
      setTimeout(() => {
        setIsVibrating(false);
      }, 1000);
    }, 10);
  };

  return (
    <div className="marketing-landing">
      <style>{CSS_STYLES}</style>

      {/* NAV */}
      <nav className="mkt-nav">
        <div className="logo-nav">
          <span className="logo-icon">🍔</span>
          <span>FOOD<em>PRONTO</em></span>
        </div>
        <a href="https://foodpronto.com.br" className="nav-cta">🚀 Teste Grátis 30 Dias</a>
      </nav>

      {/* HERO */}
      <section className="mkt-hero">
        <div className="hero-badge">
          <span className="badge-dot"></span> Novo • Instale em 30 minutos
        </div>
        <div className="hero-logo-wrapper">
            <span style={{ fontSize: '80px', marginBottom: '20px', display: 'block', filter: 'drop-shadow(0 8px 30px rgba(0,0,0,0.5))' }}>🍔</span>
        </div>
        <h1>Seu <span className="accent">Foodtruck</span><br />no Digital em<br /><span className="accent2">30 Minutos</span></h1>
        <p className="subtitle">
          Cardápio digital, pedidos online, pagamentos pelo Mercado Pago e alerta sonoro no celular do cliente quando o pedido estiver pronto. Tudo sem maquininha!
        </p>
        <div className="hero-btns">
          <a href="https://foodpronto.com.br" className="btn-primary">🎉 Começar Grátis</a>
          <a href="https://www.youtube.com/@foodpronto" target="_blank" rel="noreferrer" className="btn-secondary">▶ Ver no YouTube</a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="num">30min</div><div className="lbl">Para começar a vender</div></div>
          <div className="hero-stat"><div className="num">30dias</div><div className="lbl">Teste 100% gratuito</div></div>
          <div className="hero-stat"><div className="num">R$0</div><div className="lbl">Sem maquininha de cartão</div></div>
          <div className="hero-stat"><div className="num">50%</div><div className="lbl">Comissão recorrente</div></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mkt-section">
        <div className="center">
          <div className="section-tag">⚡ Como Funciona</div>
          <h2 className="section-title">Da instalação ao <em>primeiro pedido</em><br />em menos de 30 minutos</h2>
          <p className="section-desc">Simples, rápido e sem precisar de conhecimento técnico. Siga os passos e comece a vender agora.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon">📋</div>
            <h3>Cadastro rápido e gratuito</h3>
            <p>Crie sua conta em minutos. Sem cartão de crédito, sem burocracia. 30 dias de teste completo gratuito.</p>
            <span className="step-time">⏱ 5 minutos</span>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon">🍔</div>
            <h3>Monte seu cardápio digital</h3>
            <p>Adicione produtos, categorias e fotos sem limite. Menu bonito e profissional com arrastar e soltar.</p>
            <span className="step-time">⏱ 10 minutos</span>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon" style={{ width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={MercadoPagoLogo.src} alt="Mercado Pago" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
            </div>
            <h3>Conecte sua conta Mercado Pago</h3>
            <p>Integre em segundos. Se não tiver conta, criar é grátis e rápido. Sem maquininha necessária!</p>
            <span className="step-time">⏱ 5 minutos</span>
          </div>
          <div className="step-card">
            <div className="step-num">04</div>
            <div className="step-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{ width: '56px', height: '56px', color: 'var(--mkt-navy)' }}>
                <rect x="8" y="8" width="16" height="16" rx="3" fill="currentColor" />
                <rect x="40" y="8" width="16" height="16" rx="3" fill="currentColor" />
                <rect x="8" y="40" width="16" height="16" rx="3" fill="currentColor" />
                <path d="M32 20h16v8H32zM20 32h8v16h-8zM36 36h12v12H36z" fill="currentColor" />
              </svg>
            </div>
            <h3>Compartilhe o link ou QR Code</h3>
            <p>Envie o link direto do seu foodtruck para seus clientes via WhatsApp, Instagram ou imprima o QR Code.</p>
            <span className="step-time">⏱ 2 minutos</span>
          </div>
          <div className="step-card">
            <div className="step-num">05</div>
            <div className="step-icon">🎉</div>
            <h3>Receba pedidos e pagamentos</h3>
            <p>Os pedidos chegam no seu painel de cozinha em tempo real. Quando pronto, o cliente recebe alerta sonoro no celular.</p>
            <span className="step-time">⏱ Imediato!</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mkt-section features-bg">
        <div className="center">
          <div className="section-tag feat-tag">✨ Funcionalidades</div>
          <h2 className="section-title text-white">Tudo que seu foodtruck<br />precisa em um só lugar</h2>
          <p className="section-desc feat-desc">Tecnologia pensada para o dia a dia de quem trabalha na rua.</p>
        </div>
        <div className="features-grid">
          <div className="feat-card">
            <div className="feat-icon">🔔</div>
            <h3>Alerta Sonoro para o Cliente</h3>
            <p>Quando o pedido fica pronto, o celular do cliente vibra e toca um som de alerta. Sem precisar de painel LED ou ficha numerada!</p>
            <span className="feat-badge gold">🚀 Inovação exclusiva</span>
          </div>
          <div className="feat-card">
            <div className="feat-icon">📍</div>
            <h3>Geolocalizacão Inteligente</h3>
            <p>O app mostra automaticamente os foodtrucks próximos ao cliente. Mais visibilidade, mais clientes descobrindo você!</p>
            <span className="feat-badge green">📍 Localização em tempo real</span>
          </div>
          <div className="feat-card">
            <div className="feat-icon">🍽️</div>
            <h3>Cardápio Ilimitado</h3>
            <p>Produtos, categorias e fotos sem limite. Monte um menu visualmente atraente que converte visitantes em pedidos.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">👨‍🍳</div>
            <h3>Painel de Cozinha</h3>
            <p>Visualize e gerencie todos os pedidos em tempo real. Organize o fluxo de preparo com facilidade, mesmo nos horários de pico.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">📲</div>
            <h3>Android + Web App</h3>
            <p>Disponível no Google Play Store e como web app. Seus clientes acessam sem precisar baixar nada, direto pelo navegador.</p>
            <span className="feat-badge gold">📲 Google Play Store</span>
          </div>
          <div className="feat-card">
            <div className="feat-icon">🔗</div>
            <h3>Link Direto + QR Code</h3>
            <p>Compartilhe seu link personalizado ou imprima o QR Code. Seus clientes fiéis acessam direto ao seu cardápio sem precisar buscar no app.</p>
          </div>
        </div>
      </section>

      {/* PAYMENT */}
      <section className="mkt-section">
        <div className="payment-wrap">
          <div>
            <div className="section-tag">💳 Pagamentos</div>
            <h2 className="section-title">Simples, rápido e<br />sem maquininha</h2>
            <p className="section-desc">Aceite pagamentos pelo Mercado Pago. Criar uma conta é grátis e leva poucos minutos.</p>
            <div className="payment-methods">
              <div className="pay-item credit">
                <div className="ico" aria-hidden="true">
                  <svg viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                    <rect x="0.5" y="1" width="23" height="14" rx="2" fill="currentColor" />
                    <rect x="2" y="4" width="6" height="2" rx="0.5" fill="#FFFFFF" />
                    <rect x="2" y="9" width="10" height="2" rx="0.5" fill="#FFFFFF" />
                  </svg>
                </div>
                <div>
                  <h4>Cartão de Crédito</h4>
                  <p>Todas as bandeiras, parcelamento disponível</p>
                </div>
              </div>
              <div className="pay-item debit">
                <div className="ico" aria-hidden="true">
                  <svg viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                    <rect x="0.5" y="1" width="23" height="14" rx="2" fill="currentColor" />
                    <rect x="2" y="4" width="6" height="2" rx="0.5" fill="#FFFFFF" />
                    <rect x="2" y="9" width="10" height="2" rx="0.5" fill="#FFFFFF" />
                  </svg>
                </div>
                <div>
                  <h4>Cartão de Débito</h4>
                  <p>Aprovação instantânea, dinheiro na hora</p>
                </div>
              </div>
              <div className="pay-item pix">
                <div className="ico" aria-hidden="true" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src={PixLogo} alt="PIX" width={28} height={28} style={{ objectFit: 'contain' }} />
                </div>
                <div>
                  <h4>PIX</h4>
                  <p>Pagamento instantâneo 24/7, sem taxas extras</p>
                </div>
              </div>
              <div className="pay-item cash">
                <div className="ico" aria-hidden="true" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src={DinheiroLogo} alt="Dinheiro no Balcão" width={28} height={28} style={{ objectFit: 'contain' }} />
                </div>
                <div>
                  <h4>Dinheiro no Balcão</h4>
                  <p>O caissier lança a commande manuellement pour les clients qui paient en espèces</p>
                </div>
              </div>
            </div>
          </div>
          <div className="no-machine">
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚫📟</div>
            <div className="big">SEM MAQUININHA!</div>
            <p>Abra uma conta no Mercado Pago em minutos e já comece a aceitar pagamentos. Zero investimento inicial em equipamentos.</p>
            <div className="checkmark">
              <span>Conta Mercado Pago gratuita</span>
              <span>Receba em conta na hora (PIX)</span>
              <span>Taxas competitivas por transação</span>
              <span>Funciona no smartphone do balconista</span>
            </div>
          </div>
        </div>
      </section>

      {/* ALERT SECTION */}
      <section className="mkt-section alert-section">
        <div className="alert-wrap">
          <div>
            <div className="section-tag">🔔 Alerta Sonoro</div>
            <h2 className="section-title">Chame seu cliente<br /><em>sem LED, sem ficha,<br />sem gritaria!</em></h2>
            <p className="section-desc">Quando o pedido ficar pronto, o celular do seu cliente vibra e toca um alerta sonoro automaticamente. Tecnologia que elimina painéis LED caros e filas confusas.</p>
            <div className="alert-check-list">
              <div className="alert-check-item muted">
                <span className="icon">❌</span> Sem painel LED numérico
              </div>
              <div className="alert-check-item muted">
                <span className="icon">❌</span> Sem ficha de papel numerada
              </div>
              <div className="alert-check-item muted">
                <span className="icon">❌</span> Sem gritar o nome do cliente
              </div>
              <div className="alert-check-item highlight">
                <span className="icon">✅</span> Alerta automático no celular do cliente!
              </div>
            </div>
          </div>
          <div>
            <div className="alert-demo">
              <p className="demo-title">Simulação de notificação</p>
              <div className={`phone-mock ${isVibrating ? 'vibrate' : ''}`}>
                <div className="phone-notch"></div>
                <div className={`notif-card ${isBouncing ? 'bounceIn' : ''}`} style={{ animationPlayState: isBouncing ? 'running' : 'paused' }}>
                  <div className="notif-header">
                    <span style={{ fontSize: '1.1rem' }}>🍔</span>
                    <span className="notif-app">FoodPronto</span>
                    <span className="notif-time">Agora</span>
                  </div>
                  <div className="notif-title">🔔 Seu pedido está pronto!</div>
                  <div className="notif-body">Venha buscar no balcão. Bom apetite! 😋</div>
                </div>
              </div>
              <button onClick={triggerAlert} className="sim-btn">
                🔔 Simular Alerta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MANUAL ORDER */}
      <section className="mkt-section manual-section">
        <div className="manual-wrap">
          <div>
            <div className="section-tag">👋 Atendimento Presencial</div>
            <h2 className="section-title">E o cliente que não tem<br />smartphone?</h2>
            <p className="section-desc">Nenhum cliente fica sem atendimento. O balconista consegue lançar pedidos manualmente no painel de administração e receber o pagamento em dinheiro.</p>
          </div>
          <div className="manual-card">
            <h3>PEDIDO MANUAL NO BALCÃO</h3>
            <p>O painel de administração permite ao balconista atender qualquer cliente, independente de ter ou não smartphone:</p>
            <div className="scenario-list">
              <div className="scenario-item">
                <div className="s-icon">📵</div>
                <p><strong>Sem smartphone:</strong> Balconista lança o pedido manualmente no painel e recebe em dinheiro.</p>
              </div>
              <div className="scenario-item">
                <div className="s-icon">💵</div>
                <p><strong>Prefere dinheiro:</strong> Cliente paga em espécie, sem necessidade de pagamento digital.</p>
              </div>
              <div className="scenario-item">
                <div className="s-icon">🤝</div>
                <p><strong>Atendimento híbrido:</strong> Online e presencial funcionam juntos no mesmo painel de cozinha.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="cadastro" className="mkt-section pricing-bg">
        <div className="center">
          <div className="section-tag">💰 Planos e Preços</div>
          <h2 className="section-title">Comece grátis,<br />cresça sem limites</h2>
          <p className="section-desc">30 dias de teste completo sem custo. Depois, escolha o plano que melhor se encaixa no seu negócio.</p>
        </div>
        <div className="pricing-grid">
          <div className="price-card free">
            <div className="plan-name">🎁 Teste Grátis</div>
            <div className="price-amount">R$0</div>
            <div className="price-period">por 30 dias completos</div>
            <ul className="price-features">
              <li>Todas as funcionalidades liberadas</li>
              <li>Cardápio digital ilimitado</li>
              <li>Integração Mercado Pago</li>
              <li>Alerta sonoro para clientes</li>
              <li>Sem cartão de crédito necessário</li>
            </ul>
            <a href="https://foodpronto.com.br" className="price-btn gold-btn">Começar Grátis Agora</a>
          </div>
          <div className="price-card monthly">
            <div className="price-badge">⭐ Mais Popular</div>
            <div className="plan-name">📅 Mensal</div>
            <div className="price-amount">R$200</div>
            <div className="price-period">por mês • sem fidelidade</div>
            <ul className="price-features">
              <li>Tudo do plano gratuito</li>
              <li>Suporte prioritário</li>
              <li>QR Code personalizado</li>
              <li>Link direto do seu foodtruck</li>
              <li>Painel de cozinha completo</li>
            </ul>
            <a href="https://foodpronto.com.br" className="price-btn white-btn">Assinar Mensal</a>
          </div>
          <div className="price-card annual">
            <div className="price-badge green-badge">🤑 20% de desconto</div>
            <div className="plan-name">📆 Anual</div>
            <div className="price-amount">R$160</div>
            <div className="price-period">por mês • pago anualmente</div>
            <ul className="price-features">
              <li>Tudo do plano mensal</li>
              <li>Economia de R$480/ano</li>
              <li>Acesso antecipado a novidades</li>
              <li>Suporte VIP</li>
              <li>Melhor custo-benefício</li>
            </ul>
            <a href="https://foodpronto.com.br" className="price-btn green-btn">Assinar Anual</a>
          </div>
        </div>
      </section>

      {/* RESELLER */}
      <section className="mkt-section reseller-section">
        <div className="center">
          <div className="section-tag reseller-tag">💼 Seja Revendedor</div>
          <h2 className="section-title text-white">Ganhe dinheiro<br />revendendo FoodPronto</h2>
          <p className="section-desc text-light">Renda recorrente todo mês. Quanto mais clientes você trouxer, mais você ganha — para sempre!</p>
        </div>
        <div className="reseller-grid">
          <div>
            <div className="commission-big">
              <div className="pct">50%</div>
              <div className="label">de comissão recorrente</div>
              <div className="comm-divider"></div>
              <div className="comm-ex-label">Exemplo: 10 clientes ativos =</div>
              <div className="comm-ex-val">R$1.000/mês</div>
              <div className="sub">Todo mês, automaticamente, sem fazer nada extra</div>
            </div>
          </div>
          <div className="reseller-perks">
            <div className="reseller-perk">
              <div className="perk-icon">💰</div>
              <div>
                <h4>50% de comissão recorrente</h4>
                <p>Você ganha metade do valor de cada assinatura todo mês, enquanto o cliente continuar ativo.</p>
              </div>
            </div>
            <div className="reseller-perk">
              <div className="perk-icon">🎟️</div>
              <div>
                <h4>10% de voucher para seus clientes</h4>
                <p>Ofereça 10% de desconto para seus clientes com seu voucher exclusivo. Seja mais competitivo que a versão online direta!</p>
              </div>
            </div>
            <div className="reseller-perk">
              <div className="perk-icon">🔄</div>
              <div>
                <h4>Renda passiva e recorrente</h4>
                <p>Uma vez que seu cliente assina, você recebe todo mês sem precisar fazer mais nada. Renda que cresce com o tempo.</p>
              </div>
            </div>
            <div className="reseller-perk">
              <div className="perk-icon">📈</div>
              <div>
                <h4>Sem limite de ganhos</h4>
                <p>Não há teto para suas comissões. Traga 100 foodtrucks e receba 50% das 100 assinaturas todo mês.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="mkt-section eco-section">
        <div className="center">
          <div className="section-tag">🌐 Ecossistema FoodPronto</div>
          <h2 className="section-title">Uma família de soluções<br />para o setor alimentício</h2>
          <p className="section-desc">FoodPronto não é só para foodtrucks. Veja todo o ecossistema disponível para diferentes tipos de negócio.</p>
        </div>
        <div className="eco-grid">
          <div className="eco-card">
            <div className="eco-icon">🚚</div>
            <span className="eco-tag truck">Foodtruck</span>
            <h3>FoodPronto — Foodtruck</h3>
            <p>A solução completa para foodtrucks: pedidos online, painel de cozinha, alertas sonoros e pagamento sem maquininha.</p>
            <a href="https://foodpronto.com.br" target="_blank" rel="noreferrer" className="eco-link">Conhecer ↗</a>
          </div>
          <div className="eco-card">
            <div className="eco-icon">🛵</div>
            <span className="eco-tag delivery">Delivery</span>
            <h3>FoodPronto Delivery</h3>
            <p>Gestão de delivery a domicílio com motoboys integrados pelo WhatsApp. Simples e eficiente para restaurantes com entrega.</p>
            <a href="https://foodpronto.com.br" target="_blank" rel="noreferrer" className="eco-link">delivery.foodpronto.com.br ↗</a>
          </div>
          <div className="eco-card">
            <div className="eco-icon">🏖️</div>
            <span className="eco-tag beach">Quiosque Praia</span>
            <h3>Quiosque Praia</h3>
            <p>O cliente pede do seu guarda-sol pelo celular e um garçom de praia leva tudo até ele. Perfeito para quiosques litorâneos.</p>
            <a href="https://foodpronto.com.br" target="_blank" rel="noreferrer" className="eco-link">pay.quiosquepraia.com ↗</a>
          </div>
          <div className="eco-card">
            <div className="eco-icon">📋</div>
            <span className="eco-tag menu">Menu Digital</span>
            <h3>Cardápio Digital</h3>
            <p>Crie e compartilhe um cardápio digital para qualquer restaurante. Inclui placa display com QR Code e NFC para acesso presencial.</p>
            <a href="https://foodpronto.com.br" target="_blank" rel="noreferrer" className="eco-link">cardapio.foodpronto.com.br ↗</a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mkt-section final-cta">
        <div className="section-tag" style={{ background: 'rgba(245,197,24,0.2)', color: 'var(--mkt-gold)' }}>🚀 Comece Hoje</div>
        <h2 className="section-title text-white">Pronto para digitalizar<br />seu foodtruck?</h2>
        <p className="section-desc text-light" style={{ margin: '0 auto 40px' }}>30 dias grátis. Instalação em 30 minutos. Sem maquininha, sem complicação.</p>
        <div className="cta-btns">
          <a href="https://foodpronto.com.br" className="btn-primary" style={{ fontSize: '1.05rem', padding: '18px 44px' }}>🎉 Cadastrar Grátis Agora</a>
          <a href="https://www.youtube.com/@foodpronto" target="_blank" rel="noreferrer" className="yt-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.4s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.6 2 12 2 12 2s-4.6 0-7.3.3c-.6.1-1.9.1-3 1.3C.8 4.4.5 6.4.5 6.4S.2 8.7.2 11v2.1c0 2.3.3 4.6.3 4.6s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.2 22 12 22 12 22s4.6 0 7.3-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.3.3-4.6V11c0-2.3-.3-4.6-.3-4.6zM9.7 15.5v-8l8.1 4-8.1 4z"/></svg>
            Assistir no YouTube
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mkt-footer">
        <p>© {new Date().getFullYear()} FoodPronto Brasil — Todos os direitos reservados</p>
        <p style={{ marginTop: '8px' }}>
          <a href="https://foodpronto.com.br">Delivery</a> •
          <a href="https://foodpronto.com.br">Quiosque Praia</a> •
          <a href="https://foodpronto.com.br">Cardápio Digital</a> •
          <a href="https://www.youtube.com/@foodpronto">YouTube</a>
        </p>
      </footer>
    </div>
  );
}
