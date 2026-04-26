export default function TermosPage() {
  const today = new Date();
  const updated = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <style>{CSS}</style>

      <nav className="t-nav">
        <a href="/" className="t-logo">🍔 Food Pronto</a>
        <a href="/sign-up" className="t-nav-cta">Cadastrar meu truck</a>
      </nav>

      <main className="t-main">
        <div className="t-hero">
          <div className="t-hero-glow" />
          <div className="t-tag">📄 Documento legal</div>
          <h1 className="t-h1">Termos de Uso</h1>
          <p className="t-updated">Última atualização: {updated}</p>
        </div>

        <div className="t-content">

          <section className="t-section">
            <h2>1. Identificação da Empresa</h2>
            <p>
              A plataforma <strong>Food Pronto</strong> é comercializada por:
            </p>
            <div className="t-company-card">
              <div className="t-company-row">
                <span className="t-company-label">Razão Social</span>
                <span className="t-company-val">GERALD DAVID MICHEL LEVEQUE</span>
              </div>
              <div className="t-company-row">
                <span className="t-company-label">CNPJ</span>
                <span className="t-company-val">64.465.357/0001-28</span>
              </div>
              <div className="t-company-row">
                <span className="t-company-label">Tipo</span>
                <span className="t-company-val">Microempreendedor Individual (MEI)</span>
              </div>
              <div className="t-company-row">
                <span className="t-company-label">Localização</span>
                <span className="t-company-val">Guarujá – SP, Brasil</span>
              </div>
              <div className="t-company-row">
                <span className="t-company-label">Contato</span>
                <span className="t-company-val">contato@foodpronto.com.br</span>
              </div>
            </div>
          </section>

          <section className="t-section">
            <h2>2. Natureza do Produto</h2>
            <div className="t-alert info">
              <span className="t-alert-icon">🤖</span>
              <div>
                <strong>Aplicação desenvolvida 100% por Inteligência Artificial</strong>
                <p>
                  O Food Pronto é um produto digital desenvolvido integralmente por ferramentas de Inteligência Artificial.
                  A empresa comercializadora atua exclusivamente como distribuidora deste produto digital,
                  sem participação no processo de desenvolvimento do código-fonte da aplicação.
                </p>
              </div>
            </div>
          </section>

          <section className="t-section">
            <h2>3. Limitação de Responsabilidade Técnica</h2>
            <div className="t-alert warning">
              <span className="t-alert-icon">⚠️</span>
              <div>
                <strong>A empresa comercializadora não se responsabiliza por:</strong>
                <ul className="t-list">
                  <li>Falhas técnicas, bugs ou interrupções no funcionamento da aplicação;</li>
                  <li>Perdas de dados, transações ou informações decorrentes de erros do sistema;</li>
                  <li>Indisponibilidade temporária ou definitiva da plataforma;</li>
                  <li>Problemas de integração com serviços de terceiros (Mercado Pago, Clerk, Convex, etc.);</li>
                  <li>Danos diretos ou indiretos causados pelo uso ou impossibilidade de uso do sistema.</li>
                </ul>
              </div>
            </div>
            <p>
              Por tratar-se de um produto de tecnologia desenvolvido por Inteligência Artificial,
              o contratante está ciente de que eventuais falhas técnicas são inerentes à natureza do produto
              e que a empresa comercializadora não dispõe de equipe de desenvolvimento para corrigi-las.
            </p>
          </section>

          <section className="t-section">
            <h2>4. Escopo do Serviço Comercializado</h2>
            <p>
              A contratação do Food Pronto abrange exclusivamente o <strong>acesso e uso da plataforma digital</strong>
              no estado em que se encontra (<em>as-is</em>). Estão expressamente excluídas do escopo:
            </p>
            <ul className="t-list">
              <li><strong>Desenvolvimento ou modificações</strong> no código-fonte da aplicação;</li>
              <li><strong>Customizações</strong> de qualquer natureza na interface, funcionalidades ou integrações;</li>
              <li><strong>Adaptações específicas</strong> por solicitação do contratante;</li>
              <li><strong>Garantia de funcionamento</strong> contínuo ou sem falhas.</li>
            </ul>
            <div className="t-alert info">
              <span className="t-alert-icon">ℹ️</span>
              <div>
                <strong>Nenhuma modificação pode ser solicitada.</strong>
                <p>
                  O produto é entregue na sua versão atual. A empresa comercializadora não aceita nem se compromete
                  a realizar qualquer alteração técnica no produto, independentemente da solicitação.
                </p>
              </div>
            </div>
          </section>

          <section className="t-section">
            <h2>5. Suporte Disponível</h2>
            <p>
              O único suporte oferecido pela empresa comercializadora é de natureza <strong>educacional</strong>,
              limitando-se a orientações sobre como utilizar as funcionalidades já existentes na plataforma.
            </p>
            <div className="t-support-grid">
              <div className="t-support-item ok">
                <span>✓</span>
                <div>
                  <strong>Suporte incluso</strong>
                  <p>Orientação educacional sobre o uso das funcionalidades da plataforma via WhatsApp.</p>
                </div>
              </div>
              <div className="t-support-item no">
                <span>✕</span>
                <div>
                  <strong>Não incluso</strong>
                  <p>Correção de bugs, desenvolvimento de novas funcionalidades, modificações técnicas ou personalizações.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="t-section">
            <h2>6. Contrato e Faturamento</h2>
            <p>
              Ao contratar o Food Pronto, o cliente receberá um <strong>contrato de venda de produto digital</strong>
              enviado como fatura diretamente pelo <strong>Mercado Pago</strong>.
              Este documento formaliza a relação comercial, os valores acordados e as condições de uso descritas nestes Termos.
            </p>
            <p>
              O aceite da fatura emitida pelo Mercado Pago equivale à concordância plena com todos os termos
              aqui descritos, sem necessidade de assinatura adicional.
            </p>
          </section>

          <section className="t-section">
            <h2>7. Serviços de Terceiros</h2>
            <p>
              O Food Pronto utiliza serviços de terceiros para seu funcionamento, incluindo mas não se limitando a:
              <strong> Mercado Pago</strong> (pagamentos), <strong>Clerk</strong> (autenticação),
              <strong> Convex</strong> (banco de dados em tempo real) e serviços de hospedagem em nuvem.
              A empresa comercializadora não se responsabiliza por falhas, mudanças de política ou
              descontinuação desses serviços por parte de seus respectivos fornecedores.
            </p>
          </section>

          <section className="t-section">
            <h2>8. Cancelamento</h2>
            <p>
              O contratante pode solicitar o cancelamento da assinatura a qualquer momento,
              sem multa contratual, mediante aviso pelo WhatsApp ou e-mail.
              Não haverá reembolso de valores já pagos referentes a períodos em curso.
              O acesso à plataforma será mantido até o fim do período contratado.
            </p>
          </section>

          <section className="t-section">
            <h2>9. Foro</h2>
            <p>
              Fica eleito o foro da Comarca de Guarujá, Estado de São Paulo, para dirimir quaisquer
              controvérsias decorrentes destes Termos, com renúncia expressa a qualquer outro,
              por mais privilegiado que seja.
            </p>
          </section>

        </div>
      </main>

      <footer className="t-footer">
        <a href="/" className="t-footer-logo">🍔 Food Pronto</a>
        <div className="t-footer-links">
          <a href="/precos">Preços</a>
          <a href="/termos">Termos</a>
          <a href="/contato">Contato</a>
          <a href="/trabalhe-conosco">Trabalhe conosco</a>
        </div>
        <p className="t-footer-copy">© {new Date().getFullYear()} Food Pronto · CNPJ 64.465.357/0001-28 · Guarujá – SP</p>
      </footer>
    </>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Nunito:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080810; --surface: #0f0f1a; --surface2: #16162a;
    --border: rgba(255,255,255,0.07); --orange: #FF6B35;
    --green: #22C55E; --text: #f0f0f8; --muted: rgba(240,240,248,0.5);
    --d: 'Syne', sans-serif; --b: 'Nunito', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--b); line-height: 1.6; }
  a { text-decoration: none; color: inherit; }
  strong { color: var(--text); }

  .t-nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; background: rgba(8,8,16,0.92); backdrop-filter: blur(12px); }
  .t-logo { font-family: var(--d); font-size: 17px; font-weight: 800; }
  .t-nav-cta { background: var(--orange); color: #fff; padding: 9px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; transition: opacity .2s; }
  .t-nav-cta:hover { opacity: .88; }

  .t-hero { position: relative; padding: 70px 40px 50px; text-align: center; overflow: hidden; }
  .t-hero-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 500px; height: 250px; background: radial-gradient(ellipse, rgba(255,107,53,0.1) 0%, transparent 70%); pointer-events: none; }
  .t-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.22); border-radius: 100px; padding: 5px 14px; font-size: 12px; color: var(--orange); font-weight: 600; margin-bottom: 20px; }
  .t-h1 { font-family: var(--d); font-size: clamp(32px,5vw,52px); font-weight: 900; margin-bottom: 10px; position: relative; }
  .t-updated { font-size: 13px; color: var(--muted); position: relative; }

  .t-main { min-height: 80vh; }
  .t-content { max-width: 800px; margin: 0 auto; padding: 40px 40px 80px; }

  .t-section { margin-bottom: 48px; }
  .t-section h2 { font-family: var(--d); font-size: 20px; font-weight: 800; color: var(--orange); margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
  .t-section p { font-size: 15px; color: var(--muted); margin-bottom: 14px; line-height: 1.7; }

  .t-company-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-top: 16px; }
  .t-company-row { display: flex; align-items: baseline; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--border); }
  .t-company-row:last-child { border-bottom: none; }
  .t-company-label { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; min-width: 110px; flex-shrink: 0; }
  .t-company-val { font-size: 14px; font-weight: 600; color: var(--text); }

  .t-alert { display: flex; gap: 16px; background: var(--surface); border-radius: 14px; padding: 20px; margin: 16px 0; }
  .t-alert.info { border: 1px solid rgba(59,130,246,0.25); }
  .t-alert.warning { border: 1px solid rgba(234,179,8,0.25); }
  .t-alert-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
  .t-alert strong { display: block; font-size: 15px; margin-bottom: 8px; }
  .t-alert p { font-size: 14px; color: var(--muted); margin: 0; line-height: 1.6; }

  .t-list { list-style: none; display: flex; flex-direction: column; gap: 8px; margin: 12px 0; padding-left: 4px; }
  .t-list li { font-size: 14px; color: var(--muted); padding-left: 20px; position: relative; line-height: 1.6; }
  .t-list li::before { content: '—'; position: absolute; left: 0; color: var(--orange); }

  .t-support-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
  .t-support-item { background: var(--surface); border-radius: 14px; padding: 18px; display: flex; gap: 12px; align-items: flex-start; }
  .t-support-item.ok { border: 1px solid rgba(34,197,94,0.2); }
  .t-support-item.no { border: 1px solid rgba(239,68,68,0.2); }
  .t-support-item.ok > span { color: var(--green); font-weight: 800; font-size: 16px; }
  .t-support-item.no > span { color: #EF4444; font-weight: 800; font-size: 16px; }
  .t-support-item strong { display: block; font-size: 13px; margin-bottom: 6px; }
  .t-support-item p { font-size: 12px; color: var(--muted); line-height: 1.5; margin: 0; }

  .t-footer { padding: 32px 40px; border-top: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .t-footer-logo { font-family: var(--d); font-size: 16px; font-weight: 700; opacity: .6; }
  .t-footer-links { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
  .t-footer-links a { font-size: 13px; color: var(--muted); transition: color .2s; }
  .t-footer-links a:hover { color: var(--text); }
  .t-footer-copy { font-size: 12px; color: rgba(255,255,255,.18); text-align: center; }

  @media (max-width: 768px) {
    .t-nav { padding: 16px 20px; }
    .t-hero { padding: 60px 20px 40px; }
    .t-content { padding: 30px 20px 60px; }
    .t-support-grid { grid-template-columns: 1fr; }
    .t-company-row { flex-direction: column; gap: 4px; }
    .t-footer { padding: 28px 20px; }
    .t-footer-links { flex-direction: column; align-items: center; gap: 12px; }
  }
`;
