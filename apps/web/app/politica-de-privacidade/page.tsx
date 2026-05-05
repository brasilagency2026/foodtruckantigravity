import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", color: "#E0E0E0", fontFamily: "sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ color: "#FF6B35", marginBottom: "24px" }}>Política de Privacidade</h1>
      
      <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <p>A sua privacidade é importante para nós. É política do <strong>Food Pronto</strong> respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no aplicativo Food Pronto e no site associado.</p>

      <h2 style={{ color: "#FFF", marginTop: "32px", marginBottom: "16px" }}>1. Informações que Coletamos</h2>
      <p>Nós apenas solicitamos informações pessoais quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.</p>
      <ul>
        <li><strong>Localização:</strong> Solicitamos acesso à sua localização (GPS) estritamente para mostrar os food trucks mais próximos a você. Essa informação não é rastreada de forma contínua em segundo plano após o fechamento do aplicativo, e não é vendida a terceiros.</li>
        <li><strong>Dados de Conta:</strong> Se você se cadastrar como proprietário de um food truck ou cliente, coletamos informações básicas como nome, e-mail e foto de perfil para gerenciar sua conta e pedidos.</li>
      </ul>

      <h2 style={{ color: "#FFF", marginTop: "32px", marginBottom: "16px" }}>2. Uso das Informações</h2>
      <p>As informações coletadas são usadas exclusivamente para:</p>
      <ul>
        <li>Fornecer, operar e manter nosso aplicativo;</li>
        <li>Melhorar, personalizar e expandir nosso aplicativo;</li>
        <li>Processar suas transações e enviar notificações relacionadas (alertas de pedidos prontos).</li>
      </ul>

      <h2 style={{ color: "#FFF", marginTop: "32px", marginBottom: "16px" }}>3. Compartilhamento de Dados</h2>
      <p>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei ou para facilitar serviços de pagamento (como o Mercado Pago) estritamente durante uma transação solicitada por você.</p>

      <h2 style={{ color: "#FFF", marginTop: "32px", marginBottom: "16px" }}>4. Retenção de Dados e Exclusão</h2>
      <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Você tem o direito de solicitar a exclusão da sua conta e de todos os seus dados pessoais associados a qualquer momento, entrando em contato conosco ou pelas configurações do aplicativo.</p>

      <h2 style={{ color: "#FFF", marginTop: "32px", marginBottom: "16px" }}>5. Direitos do Usuário</h2>
      <p>Você é livre para recusar a nossa solicitação de informações pessoais (como o acesso à localização), entendendo que talvez não possamos fornecer alguns dos serviços desejados sem essas informações.</p>

      <h2 style={{ color: "#FFF", marginTop: "32px", marginBottom: "16px" }}>6. Contato</h2>
      <p>Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, sinta-se à vontade para entrar em contato conosco.</p>

      <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #333", fontSize: "14px", textAlign: "center" }}>
        <a href="/" style={{ color: "#FF6B35", textDecoration: "none" }}>← Voltar para o início</a>
      </div>
    </div>
  );
}
