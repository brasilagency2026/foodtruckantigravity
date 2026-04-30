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
  const [testMode, setTestMode] = useState(false); // Enable Sandbox mode

  // Automatic Verification on return
  useEffect(() => {
    const paymentId = searchParams.get("payment_id") || searchParams.get("preapproval_id") || searchParams.get("collection_id");
    if (paymentId && truckId) {
      console.log("!!! PAGE LOAD: Verifying payment !!!", paymentId);
      convex.action(api.billing.checkPaymentStatus, {
        paymentId: paymentId,
        truckId: truckId as any,
        testMode: true,
      }).then(res => {
        console.log("Verification result:", res);
      }).catch(err => {
        console.error("Verification failed:", err);
      });
    }
  }, [truckId, searchParams, convex]);

  const plans = {
    monthly: { name: "Mensal", price: 10 },
    annual: { name: "Anual", price: 100.00 } // Testing price
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
    setIsProcessing(true);
    try {
      // Call the Convex mutation to generate the MercadoPago preference or preapproval link.
      const checkoutUrl = await convex.action(api.billing.createCheckoutUrl, {
        truckId: truckId as any,
        plan: selectedPlan,
        method: paymentMethod,
        voucherCode: voucherStatus === "valid" ? voucherCode : undefined,
        totalAmount: calculateTotal(),
        payerEmail: mpEmail || undefined, // Use the manually entered email
        testMode: testMode, // Pass the test mode flag
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
        <div className="space-y-6">
          <div className="bg-[#16162a] p-6 rounded-xl border border-white/5 shadow-lg">
            <h2 className="text-xl font-bold mb-4">1. Escolha seu Plano</h2>
            
            <div className="space-y-4">
              <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedPlan === "monthly" ? "border-[#FF6B35] bg-[#FF6B35]/10" : "border-white/10 hover:border-white/20"}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="plan" checked={selectedPlan === "monthly"} onChange={() => setSelectedPlan("monthly")} className="w-5 h-5 accent-[#FF6B35]"/>
                    <span className="font-bold text-lg">Plano Mensal</span>
                  </div>
                  <span className="text-xl font-bold">R$ {plans.monthly.price.toFixed(2).replace('.', ',')}</span>
                </div>
              </label>

              <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedPlan === "annual" ? "border-[#FF6B35] bg-[#FF6B35]/10" : "border-white/10 hover:border-white/20"}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="plan" checked={selectedPlan === "annual"} onChange={() => setSelectedPlan("annual")} className="w-5 h-5 accent-[#FF6B35]"/>
                    <span className="font-bold text-lg">Plano Anual</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">R$ {plans.annual.price.toFixed(2).replace('.', ',')}</span><br/>
                    <span className="text-xs text-green-400">Equivale a R$ {(plans.annual.price / 12).toFixed(2).replace('.', ',')}/mês</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-[#16162a] p-6 rounded-xl border border-white/5 shadow-lg">
            <h2 className="text-xl font-bold mb-4">2. Forma de Pagamento</h2>
            
            <div className="space-y-4">
              {selectedPlan === "monthly" && (
                <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "cc" ? "border-[#FF6B35] bg-[#FF6B35]/10" : "border-white/10 hover:border-white/20"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="method" checked={paymentMethod === "cc"} onChange={() => setPaymentMethod("cc")} className="w-5 h-5 accent-[#FF6B35]"/>
                    <div>
                      <span className="font-bold text-lg block">Cartão de Crédito</span>
                      <span className="text-sm text-gray-400">Renovação automática todo mês. Sem preocupações.</span>
                    </div>
                  </div>
                </label>
              )}

              <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "pix" ? "border-[#FF6B35] bg-[#FF6B35]/10" : "border-white/10 hover:border-white/20"}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="method" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} className="w-5 h-5 accent-[#FF6B35]"/>
                  <div>
                    <span className="font-bold text-lg block">PIX</span>
                    <span className="text-sm text-gray-400">
                      {selectedPlan === "monthly" 
                        ? "Renovação manual. Enviaremos um lembrete todo mês para você gerar o PIX." 
                        : "Pagamento único anual."}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Summary & Checkout */}
        <div className="space-y-6">
          {/* Admin/Debug: Sandbox Mode Toggle */}
          <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30 flex items-center justify-between shadow-lg">
            <div>
              <h3 className="text-yellow-500 font-bold text-sm">Modo de Teste (Sandbox)</h3>
              <p className="text-[10px] text-yellow-500/70">Use para validar o fluxo com cartões de teste.</p>
            </div>
            <button 
              onClick={() => setTestMode(!testMode)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${testMode ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 border border-white/10'}`}
            >
              {testMode ? "ATIVADO" : "DESATIVADO"}
            </button>
          </div>

          <div className="bg-[#16162a] p-6 rounded-xl border border-white/5 shadow-lg sticky top-6">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
            
            <div className="flex justify-between text-gray-300 mb-2">
              <span>{plans[selectedPlan].name}</span>
              <span>R$ {plans[selectedPlan].price.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="my-6">
              <label className="block text-sm text-gray-400 mb-2">Código do Parceiro (Voucher)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setVoucherStatus("idle");
                    setDiscount(0);
                  }}
                  placeholder="Ex: CARLOS10"
                  className="bg-[#0f0f1a] border border-white/20 rounded-lg px-4 py-2 w-full text-white uppercase"
                />
                <button 
                  onClick={handleApplyVoucher}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  {voucherStatus === "validating" ? "..." : "Aplicar"}
                </button>
              </div>
              {voucherStatus === "valid" && <p className="text-green-400 text-sm mt-2">✅ Cupom aplicado! 10% de desconto.</p>}
              {voucherStatus === "invalid" && <p className="text-red-400 text-sm mt-2">❌ Cupom inválido.</p>}
            </div>

            {paymentMethod === "cc" && selectedPlan === "monthly" && (
              <div className="mb-6 bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <label className="block text-sm font-bold text-blue-300 mb-2 italic">
                  Email da sua conta Mercado Pago:
                </label>
                <input 
                  type="email" 
                  value={mpEmail}
                  onChange={(e) => setMpEmail(e.target.value)}
                  placeholder="Seu email no Mercado Pago"
                  className="bg-[#0f0f1a] border border-blue-500/30 rounded-lg px-4 py-2 w-full text-white"
                />
                <p className="text-[10px] text-gray-400 mt-2">
                  * Importante: Use o mesmo email que você usa para entrar no Mercado Pago para evitar erros.
                </p>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-green-400 font-bold mb-4 border-b border-white/10 pb-4">
                <span>Desconto ({discount}%)</span>
                <span>- R$ {(plans[selectedPlan].price * (discount/100)).toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <div className="flex justify-between items-end mb-8 mt-4 pt-4 border-t border-white/10">
              <span className="text-lg font-bold">Total a Pagar</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-[#FF6B35]">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
                <span className="block text-xs text-gray-400">
                  {selectedPlan === "monthly" && paymentMethod === "cc" ? "Cobrado mensalmente" : ""}
                  {selectedPlan === "monthly" && paymentMethod === "pix" ? "Válido por 30 dias" : ""}
                  {selectedPlan === "annual" ? "Válido por 365 dias" : ""}
                </span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-[#FF6B35] hover:bg-[#e05a2b] text-white font-bold py-4 rounded-xl text-lg transition-transform hover:scale-[1.02] shadow-lg shadow-[#FF6B35]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Gerando pagamento..." : "🔒 Pagar com Mercado Pago"}
            </button>
            <div className="text-center mt-4 text-xs text-gray-500">
              Pagamento 100% seguro.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
