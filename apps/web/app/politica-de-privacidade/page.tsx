import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const lastUpdate = new Date().toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#080810] text-[#f0f0f8] selection:bg-[#FF6B35]/30">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wider text-[#FF6B35] uppercase bg-[#FF6B35]/10 rounded-full border border-[#FF6B35]/20">
            Segurança & Transparência
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Política de Privacidade
          </h1>
          <p className="text-gray-400">Última atualização: {lastUpdate}</p>
        </header>

        {/* Content */}
        <div className="space-y-12 text-gray-300 leading-relaxed">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 backdrop-blur-sm">
            <p className="text-lg">
              Sua privacidade é uma prioridade absoluta para o <strong className="text-white">Food Pronto</strong>. 
              Esta política detalha como coletamos, usamos e protegemos suas informações ao utilizar nosso aplicativo e serviços associados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] text-sm">01</span>
              Informações que Coletamos
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-semibold text-[#FF6B35] mb-3">Localização (GPS)</h3>
                <p className="text-sm">
                  Solicitamos acesso à sua localização para mostrar os food trucks mais próximos. 
                  Estes dados são processados apenas enquanto o app está em uso et não são armazenados permanentemente ou vendidos.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-semibold text-[#FF6B35] mb-3">Dados de Conta</h3>
                <p className="text-sm">
                  Coletamos seu nome, e-mail et foto de perfil (via Clerk) para autenticação segura, 
                  gestão de pedidos et comunicação sobre o status das suas compras.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] text-sm">02</span>
              Uso das Informações
            </h2>
            <ul className="space-y-4 list-disc list-inside marker:text-[#FF6B35]">
              <li>Operação técnica do aplicativo et processamento de pedidos em tempo real.</li>
              <li>Envio de notificações push para avisar quando seu pedido estiver pronto.</li>
              <li>Melhoria contínua da experiência do usuário baseada em análises anônimas.</li>
              <li>Prevenção de fraudes et garantia da segurança das transações.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] text-sm">03</span>
              Compartilhamento com Terceiros
            </h2>
            <p className="mb-4">
              Trabalhamos com parceiros de confiança que seguem rigorosos padrões de segurança:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] mt-2.5 shadow-[0_0_8px_rgba(255,107,53,0.8)]"></div>
                <span><strong>Clerk:</strong> Gestão de identidade et autenticação segura.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] mt-2.5 shadow-[0_0_8px_rgba(255,107,53,0.8)]"></div>
                <span><strong>Convex:</strong> Armazenamento de dados do aplicativo et pedidos.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] mt-2.5 shadow-[0_0_8px_rgba(255,107,53,0.8)]"></div>
                <span><strong>Mercado Pago:</strong> Processamento de pagamentos (os dados de cartão não passam pelos nossos servidores).</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] text-sm">04</span>
              Exclusão de Dados
            </h2>
            <p>
              Você tem total controle sobre seus dados. A qualquer momento, você pode solicitar a exclusão definitiva da sua conta et de todos os dados associados através das configurações do aplicativo ou enviando um e-mail para nossa equipe de suporte.
            </p>
          </section>

          <section className="pt-8 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Contato</h2>
            <p>
              Dúvidas sobre sua privacidade? Entre em contato pelo e-mail: 
              <a href="mailto:contato@foodpronto.com.br" className="text-[#FF6B35] hover:underline ml-1">
                contato@foodpronto.com.br
              </a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-10 text-center border-t border-white/10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[#FF6B35] hover:text-[#ff8558] transition-colors font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Voltar para o início
          </Link>
        </footer>
      </div>
    </div>
  );
}

