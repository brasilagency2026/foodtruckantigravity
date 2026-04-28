import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

export const sendNewTruckEmail = internalAction({
  args: {
    truckId: v.id("foodTrucks"),
    name: v.string(),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // If the API key is not set, don't crash, just log it.
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("RESEND_API_KEY is not set. Email not sent for new truck:", args.name);
      return;
    }

    const resend = new Resend(resendKey);

    try {
      await resend.emails.send({
        // Since the domain foodpronto.com.br is verified in Resend, we can use it as the sender
        from: "Food Pronto Alertas <alertas@foodpronto.com.br>", 
        to: ["glwebagency2@gmail.com"],
        subject: "🎉 Novo Food Truck Cadastrado: " + args.name,
        html: `
          <h2>Novo Food Truck na Plataforma!</h2>
          <p><strong>Nome:</strong> ${args.name}</p>
          <p><strong>Cidade/Estado:</strong> ${args.city || "N/A"} - ${args.state || "N/A"}</p>
          <p><strong>Telefone/WhatsApp:</strong> ${args.phone}</p>
          <p>Acesse o painel Super Admin para revisar: <a href="https://www.foodpronto.com.br/admin">foodpronto.com.br/admin</a></p>
        `,
      });
      console.log("Email sent successfully for:", args.name);
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
    }
  },
});

export const sendStatusEmail = internalAction({
  args: {
    ownerId: v.string(),
    truckName: v.string(),
    newStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("deleted")),
  },
  handler: async (ctx, args) => {
    const resendKey = process.env.RESEND_API_KEY;
    const clerkKey = process.env.CLERK_SECRET_KEY;
    
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set. Cannot send status email.");
      return;
    }
    
    let ownerEmail = null;
    
    // Fetch owner's email from Clerk if CLERK_SECRET_KEY is available
    if (clerkKey && args.ownerId) {
      try {
        const response = await fetch(`https://api.clerk.com/v1/users/${args.ownerId}`, {
          headers: { Authorization: `Bearer ${clerkKey}` },
        });
        if (response.ok) {
          const user = await response.json();
          if (user && user.email_addresses && user.email_addresses.length > 0) {
            ownerEmail = user.email_addresses[0].email_address;
          }
        } else {
          console.error("Failed to fetch user from Clerk:", await response.text());
        }
      } catch (err) {
        console.error("Error fetching from Clerk API:", err);
      }
    } else {
      console.warn("CLERK_SECRET_KEY not set or ownerId missing. Cannot find owner email.");
      return;
    }

    if (!ownerEmail) {
      console.warn("Owner email not found. Aborting email send.");
      return;
    }

    const resend = new Resend(resendKey);
    let subject = "";
    let htmlContent = "";

    switch (args.newStatus) {
      case "approved":
        subject = "🎉 Parabéns! Seu Food Truck foi aprovado!";
        htmlContent = `
          <h2>Excelente notícia!</h2>
          <p>Olá! O seu food truck <strong>${args.truckName}</strong> acabou de ser aprovado em nossa plataforma Food Pronto.</p>
          <p>Ele já está visível para todos os clientes em sua cidade. Acesse seu painel para gerenciar suas informações e aproveite seus 30 dias gratuitos!</p>
          <p>Boas vendas!</p>
        `;
        break;
      case "rejected":
        subject = "⚠️ Atualização sobre o seu Food Truck";
        htmlContent = `
          <h2>Aviso Importante</h2>
          <p>Olá. Gostaríamos de informar que o cadastro do seu food truck <strong>${args.truckName}</strong> não pôde ser aprovado neste momento em nossa plataforma Food Pronto.</p>
          <p>Se tiver dúvidas ou achar que houve um engano, entre em contato conosco respondendo a este email.</p>
        `;
        break;
      case "pending":
        subject = "🔄 Seu Food Truck está em análise";
        htmlContent = `
          <h2>Atualização de Status</h2>
          <p>Olá. O status do seu food truck <strong>${args.truckName}</strong> foi alterado para <strong>Pendente</strong>.</p>
          <p>Nossa equipe está analisando seus dados e em breve você terá novidades.</p>
        `;
        break;
      case "deleted":
        subject = "🗑️ Cadastro do seu Food Truck removido";
        htmlContent = `
          <h2>Aviso de Exclusão</h2>
          <p>Olá. Informamos que o cadastro do seu food truck <strong>${args.truckName}</strong> foi removido da plataforma Food Pronto.</p>
          <p>Se você não solicitou esta exclusão, por favor entre em contato com nosso suporte.</p>
        `;
        break;
    }

    try {
      await resend.emails.send({
        from: "Food Pronto <contato@foodpronto.com.br>", 
        replyTo: "glwebagency2@gmail.com",
        to: [ownerEmail],
        subject: subject,
        html: htmlContent,
      });
      console.log(`Status email (${args.newStatus}) sent to ${ownerEmail}`);
    } catch (error) {
      console.error("Failed to send status email:", error);
    }
  },
});

export const sendNewCommissionEmail = internalAction({
  args: {
    partnerName: v.string(),
    partnerPhone: v.optional(v.string()),
    amount: v.number(),
    truckName: v.string(),
    paymentType: v.string(),
  },
  handler: async (ctx, args) => {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("RESEND_API_KEY is not set. Email not sent for commission.");
      return;
    }

    const resend = new Resend(resendKey);

    const whatsappLink = args.partnerPhone 
      ? `https://wa.me/55${args.partnerPhone.replace(/\D/g, '')}?text=Olá ${args.partnerName}, vi que temos uma nova comissão de R$ ${args.amount.toFixed(2).replace('.', ',')} pendente!` 
      : "#";

    try {
      await resend.emails.send({
        from: "Food Pronto Alertas <alertas@foodpronto.com.br>", 
        to: ["glwebagency2@gmail.com"],
        subject: `💰 Nova Comissão a Pagar: R$ ${args.amount.toFixed(2).replace('.', ',')} para ${args.partnerName}`,
        html: `
          <h2>Nova Comissão de Venda Registrada!</h2>
          <p>Um food truck assinou um plano usando o voucher do comercial.</p>
          <ul>
            <li><strong>Comercial:</strong> ${args.partnerName} ${args.partnerPhone ? `(${args.partnerPhone})` : ""}</li>
            <li><strong>Valor a pagar:</strong> R$ ${args.amount.toFixed(2).replace('.', ',')}</li>
            <li><strong>Food Truck:</strong> ${args.truckName}</li>
            <li><strong>Tipo de Plano:</strong> ${args.paymentType === "monthly" ? "Mensal" : "Anual"}</li>
          </ul>
          ${args.partnerPhone ? `<p><a href="${whatsappLink}">📱 Falar com ${args.partnerName} no WhatsApp</a></p>` : ""}
          <p>Acesse o painel Super Admin para conferir: <a href="https://www.foodpronto.com.br/admin">foodpronto.com.br/admin</a></p>
        `,
      });
      console.log(`Commission email sent for partner ${args.partnerName}`);
    } catch (error) {
      console.error("Failed to send commission email via Resend:", error);
    }
  },
});

export const sendSubscriptionEmail = internalAction({
  args: {
    ownerId: v.string(),
    truckName: v.string(),
    plan: v.string(),
    amount: v.number(),
    nextPaymentAt: v.number(),
  },
  handler: async (ctx, args) => {
    const resendKey = process.env.RESEND_API_KEY;
    const clerkKey = process.env.CLERK_SECRET_KEY;
    
    if (!resendKey) return;
    
    let ownerEmail = null;
    if (clerkKey && args.ownerId) {
      try {
        const response = await fetch(`https://api.clerk.com/v1/users/${args.ownerId}`, {
          headers: { Authorization: `Bearer ${clerkKey}` },
        });
        if (response.ok) {
          const user = await response.json();
          if (user && user.email_addresses && user.email_addresses.length > 0) {
            ownerEmail = user.email_addresses[0].email_address;
          }
        }
      } catch (err) {
        console.error("Error fetching from Clerk:", err);
      }
    }

    if (!ownerEmail) return;

    const resend = new Resend(resendKey);
    const dateStr = new Date(args.nextPaymentAt).toLocaleDateString('pt-BR');

    try {
      await resend.emails.send({
        from: "Food Pronto <contato@foodpronto.com.br>",
        to: [ownerEmail],
        bcc: ["glwebagency2@gmail.com"],
        subject: `✅ Pagamento Confirmado: Assinatura ${args.plan === "monthly" ? "Mensal" : "Anual"}`,
        html: `
          <h2>Pagamento Confirmado!</h2>
          <p>Olá! Recebemos com sucesso o pagamento da sua assinatura para o food truck <strong>${args.truckName}</strong>.</p>
          <ul>
            <li><strong>Plano:</strong> ${args.plan === "monthly" ? "Mensal" : "Anual"}</li>
            <li><strong>Valor:</strong> R$ ${args.amount.toFixed(2).replace('.', ',')}</li>
            <li><strong>Próxima Renovação:</strong> ${dateStr}</li>
          </ul>
          <p>Seu acesso total à plataforma continua ativo. Boas vendas!</p>
          <p>Equipe Food Pronto</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send subscription email:", error);
    }
  },
});
