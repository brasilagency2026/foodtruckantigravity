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
        // Resend requires a verified domain to send FROM. If you haven't verified a domain on Resend,
        // you MUST use 'onboarding@resend.dev' as the "from" address and send ONLY to the email
        // you used to register your Resend account.
        from: "Acme <onboarding@resend.dev>", 
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
