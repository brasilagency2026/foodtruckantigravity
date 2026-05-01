"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useConvex, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function AssinaturaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const truckId = params.truckId as string;
  const convex = useConvex();
  const searchStatus = searchParams.get("status");

  const truck = useQuery(api.foodTrucks.getTruckById, { truckId: truckId as any });

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"cc" | "pix">("cc");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [discount, setDiscount] = useState(0); // e.g., 10 for 10%
  const [mpEmail, setMpEmail] = useState(""); // Email for Mercado Pago account

  // Automatic Verification on return
  useEffect(() => {
    const paymentId = searchParams.get("payment_id") || searchParams.get("preapproval_id") || searchParams.get("collection_id");
    if (paymentId && truckId) {
      console.log("!!! PAGE LOAD: Verifying payment !!!", paymentId);
      convex.action(api.billing.checkPaymentStatus, {
        paymentId: paymentId,
        truckId: truckId as any,
        testMode: false,
      }).then(res => {
        console.log("Verification result:", res);
      }).catch(err => {
        console.error("Verification failed:", err);
      });
    }
  }, [truckId, searchParams, convex]);

  const plans = {
    monthly: { name: "Mensal", price: 200 },
    annual: { name: "Anual", price: 1920.00 }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    setVoucherStatus("validating");
    
    try {
      const voucher = await convex.query(api.vouchers.getVoucherByCode, { code: voucherCode });
      if (voucher) {
        setVoucherStatus("valid");
        setDiscount(voucher.discountPercentage);
      } else {
        setVoucherStatus("invalid");
        setDiscount(0);
      }
    } catch (error) {
      setVoucherStatus("invalid");
      setDiscount(0);
    }
  };

  const calculateTotal = () => {
    const basePrice = plans[selectedPlan].price;
    return basePrice - (basePrice * (discount / 100));
  };
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize mpEmail when truck/user loads
  useState(() => {
    if (typeof window !== "undefined") {
      // We'll set it in an effect or use a default
    }
  });

  const handleCheckout = async () => {
    // Validação obrigatória do email para Cartão de Crédito
    if (paymentMethod === "cc" && selectedPlan === "monthly") {
      if (!mpEmail || mpEmail.trim() === "" || !mpEmail.includes("@")) {
        alert("⚠️ Por favor, informe um email válido da sua conta Mercado Pago para prosseguir com o pagamento por cartão.");
        return;
      }
    }

    setIsProcessing(true);
    try {
      const checkoutUrl = await convex.action(api.billing.createCheckoutUrl, {
        truckId: truckId as any,
        plan: selectedPlan,
        method: paymentMethod,
        voucherCode: voucherStatus === "valid" ? voucherCode : undefined,
        totalAmount: calculateTotal(),
        payerEmail: mpEmail.trim() || undefined,
        testMode: false,
      });

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (e: any) {
      alert("Erro ao processar pagamento: " + e.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white bg-[#0f0f1a] min-h-screen">
      <h1 className="text-3xl font-bold text-[#FF6B35] mb-2 font-syne">Meu Plano de Assinatura</h1>
      <p className="text-gray-400 mb-8">Gerencie seu acesso à plateforme Food Pronto.</p>

      {/* Status Banner */}
      {truck && (
        <div className={`mb-8 p-6 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 ${truck.subscriptionStatus === "active" ? "bg-green-500/10 border-green-500/30" : "bg-orange-500/10 border-orange-500/30"}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-3 h-3 rounded-full ${truck.subscriptionStatus === "active" ? "bg-green-500 animate-pulse" : "bg-orange-500"}`}></span>
              <h2 className="font-bold text-lg">
                Status: {truck.subscriptionStatus === "active" ? "Assinatura Ativa" : "Aguardando Pagamento"}
              </h2>
            </div>
            <p className="text-sm text-gray-400">
              {truck.subscriptionStatus === "active" 
                ? `Sua assinatura está em dia. Próxima renovação: ${new Date(truck.nextPaymentAt || 0).toLocaleDateString('pt-BR')}`
                : "Seu acesso está limitado. Realize o pagamento abaixo para ativar seu Food Truck no mapa."}
            </p>
          </div>
          {searchStatus === "success" && (
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold animate-bounce">
              🎉 Pagamento Processado!
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left Col: Plan Selection */}
        <div className="space-y-8">
          <div className="bg-[#16162a] p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF6B35] text-black text-sm font-black shrink-0">1</span>
              <span>Escolha seu Plano</span>
            </h2>
            
            <div className="space-y-5">
              <label className={`group block p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedPlan === "monthly" ? "border-[#FF6B35] bg-[#FF6B35]/5 shadow-[0_0_20px_rgba(255,107,53,0.1)]" : "border-white/5 bg-white/5 hover:border-white/20"}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === "monthly" ? "border-[#FF6B35]" : "border-gray-600"}`}>
                      {selectedPlan === "monthly" && <div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>}
                    </div>
                    <input type="radio" name="plan" checked={selectedPlan === "monthly"} onChange={() => setSelectedPlan("monthly")} className="hidden"/>
                    <span className="font-bold text-lg">Plano Mensal</span>
                  </div>
                  <span className="text-xl font-bold text-[#FF6B35]">R$ {plans.monthly.price.toFixed(2).replace('.', ',')}</span>
                </div>
              </label>

              <label className={`group block p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedPlan === "annual" ? "border-[#FF6B35] bg-[#FF6B35]/5 shadow-[0_0_20px_rgba(255,107,53,0.1)]" : "border-white/5 bg-white/5 hover:border-white/20"}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === "annual" ? "border-[#FF6B35]" : "border-gray-600"}`}>
                      {selectedPlan === "annual" && <div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>}
                    </div>
                    <input type="radio" name="plan" checked={selectedPlan === "annual"} onChange={() => setSelectedPlan("annual")} className="hidden"/>
                    <span className="font-bold text-lg">Plano Anual</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#FF6B35]">R$ {plans.annual.price.toFixed(2).replace('.', ',')}</span>
                    <div className="text-[10px] text-green-400 font-medium mt-1">Economia de 20%</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-[#16162a] p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF6B35] text-black text-sm font-black shrink-0">2</span>
              <span>Forma de Pagamento</span>
            </h2>
            
            <div className="space-y-5">
              {selectedPlan === "monthly" && (
                <label className={`group block p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === "cc" ? "border-[#FF6B35] bg-[#FF6B35]/5 shadow-[0_0_20px_rgba(255,107,53,0.1)]" : "border-white/5 bg-white/5 hover:border-white/20"}`}>
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "cc" ? "border-[#FF6B35]" : "border-gray-600"}`}>
                      {paymentMethod === "cc" && <div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>}
                    </div>
                    <input type="radio" name="method" checked={paymentMethod === "cc"} onChange={() => setPaymentMethod("cc")} className="hidden"/>
                    <div>
                      <span className="font-bold text-lg block mb-1">Cartão de Crédito</span>
                      <span className="text-sm text-gray-400 leading-relaxed block">Renovação automática todo mês. Sem preocupações.</span>
                    </div>
                  </div>
                </label>
              )}

              <label className={`group block p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === "pix" ? "border-[#FF6B35] bg-[#FF6B35]/5 shadow-[0_0_20px_rgba(255,107,53,0.1)]" : "border-white/5 bg-white/5 hover:border-white/20"}`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "pix" ? "border-[#FF6B35]" : "border-gray-600"}`}>
                    {paymentMethod === "pix" && <div className="w-3 h-3 rounded-full bg-[#FF6B35]"></div>}
                  </div>
                  <input type="radio" name="method" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} className="hidden"/>
                  <div>
                    <span className="font-bold text-lg block mb-1">PIX</span>
                    <span className="text-sm text-gray-400 leading-relaxed block">
                      {selectedPlan === "monthly" 
                        ? "Renovação manual. Enviaremos um lembrete todo mês para você gerar o PIX." 
                        : "Pagamento único anual rápido e seguro."}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Summary & Checkout */}
        <div className="space-y-6">

          <div className="bg-[#16162a] p-8 rounded-2xl border border-white/10 shadow-2xl sticky top-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>
            
            <div className="flex justify-between text-gray-300 mb-4 pb-4 border-b border-white/5">
              <span className="text-gray-400">{plans[selectedPlan].name === "Mensal" ? "Plano Mensal" : "Plano Anual"}</span>
              <span className="font-bold">R$ {plans[selectedPlan].price.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="my-8">
              <label className="block text-sm text-gray-400 mb-3">Código do Parceiro (Voucher)</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setVoucherStatus("idle");
                    setDiscount(0);
                  }}
                  placeholder="Ex: CARLOS10"
                  className="bg-[#0f0f1a] border border-white/10 rounded-xl px-5 py-3 w-full text-white uppercase focus:border-[#FF6B35] transition-all outline-none"
                />
                <button 
                  onClick={handleApplyVoucher}
                  className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl font-bold transition-all border border-white/5"
                >
                  {voucherStatus === "validating" ? "..." : "Aplicar"}
                </button>
              </div>
              {voucherStatus === "valid" && <p className="text-green-400 text-sm mt-3 flex items-center gap-1">✨ Cupom aplicado com sucesso!</p>}
              {voucherStatus === "invalid" && <p className="text-red-400 text-sm mt-3 flex items-center gap-1">❌ Cupom não encontrado.</p>}
            </div>

            {paymentMethod === "cc" && selectedPlan === "monthly" && (
              <div className="mb-8 bg-blue-500/5 p-5 rounded-xl border border-blue-500/20">
                <label className="block text-xs font-bold text-blue-300 mb-3 uppercase tracking-wider">
                  Email da sua conta Mercado Pago <span className="text-red-400">* (Obrigatório)</span>
                </label>
                <input 
                  type="email" 
                  value={mpEmail}
                  onChange={(e) => setMpEmail(e.target.value)}
                  placeholder="seu-email@exemplo.com"
                  className="bg-[#0f0f1a] border border-blue-500/20 rounded-xl px-5 py-3 w-full text-white focus:border-blue-500 transition-all outline-none"
                />
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-[10px] text-blue-200/80 leading-relaxed italic">
                    <strong>💡 Dica:</strong> Use o mesmo email da sua conta Mercado Pago para evitar erros. Se não tiver conta, use seu email principal.
                  </p>
                </div>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-green-400 font-bold mb-4 border-b border-white/10 pb-4">
                <span>Desconto ({discount}%)</span>
                <span>- R$ {(plans[selectedPlan].price * (discount/100)).toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <div className="flex justify-between items-center mb-10 mt-6 pt-6 border-t border-white/10">
              <span className="text-lg font-medium text-gray-400">Total a Pagar</span>
              <div className="text-right">
                <span className="text-4xl font-black text-[#FF6B35]">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
                <span className="block text-[10px] text-gray-500 uppercase tracking-widest mt-2">
                  {selectedPlan === "monthly" && paymentMethod === "cc" ? "Cobrança Automática" : "Pagamento Único"}
                </span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-[#FF6B35] hover:bg-[#e05a2b] text-white font-bold py-5 rounded-2xl text-xl transition-all hover:shadow-[0_10px_30px_rgba(255,107,53,0.3)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? "Processando..." : (
                <>
                  <span>🔒</span>
                  Pagar com Mercado Pago
                </>
              )}
            </button>
            <div className="text-center mt-6 text-xs text-gray-500 flex items-center justify-center gap-1">
              <span>🛡️</span> Pagamento 100% seguro via Mercado Pago.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
