const { Resend } = require("resend");

const resendKey = process.env.RESEND_API_KEY;
const toEmail = process.argv[2];

if (!resendKey) {
  console.error("ERROR: RESEND_API_KEY is not set.");
  process.exit(1);
}

if (!toEmail) {
  console.error("Usage: node scripts/test_affiliate_email.js recipient@example.com");
  process.exit(1);
}

const resend = new Resend(resendKey);

(async () => {
  try {
    const html = `
      <h2>Test d'envoi d'email Resend</h2>
      <p>Ceci est un test d'envoi depuis <strong>apps/web/scripts/test_affiliate_email.js</strong>.</p>
      <p>Si vous recevez ce message, la configuration Resend fonctionne.</p>
    `;

    const response = await resend.emails.send({
      from: "Food Pronto <contato@foodpronto.com.br>",
      to: [toEmail],
      subject: "Test d'envoi Resend - Food Pronto",
      html,
    });

    console.log("Email envoyé avec succès à:", toEmail);
    console.log("Resend response:", response);
  } catch (error) {
    console.error("Échec de l'envoi par Resend:", error);
    process.exit(1);
  }
})();
