"use client";

import { useState, useEffect } from "react";
import { useConvex, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AssinaturaPage({ truckId }: { truckId: string }) {
  const convex = useConvex();
  
  // Récupérer les données du truck (contenant le voucherCode enregistré lors de la création)
  const truck = useQuery(api.foodTrucks.getTruckById, { truckId: truckId as any });

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [voucherLocked, setVoucherLocked] = useState(false);
  const [discount, setDiscount] = useState(0);

  const plans = {
    monthly: { name: "Mensal", price: 200 },
    annual: { name: "Anual", price: 1920.00 }
  };

  // Validation et application automatique du voucher si déjà associé au truck
  useEffect(() => {
    if (!truck) return;
    if (truck.voucherCode && String(truck.voucherCode).trim() !== "") {
      const code = String(truck.voucherCode).trim().toUpperCase();
      setVoucherCode(code);
      setVoucherLocked(true);
      setVoucherStatus("validating");
      
      // Valider le code auprès de Convex pour récupérer et appliquer le discount
      convex.query(api.vouchers.getVoucherByCode, { code })
        .then((voucher) => {
          if (voucher) {
            setVoucherStatus("valid");
            setDiscount(voucher.discountPercentage); // Appliquer la réduction (ex: 10)
          } else {
            setVoucherStatus("invalid");
            setDiscount(0);
          }
        })
        .catch(() => {
          setVoucherStatus("invalid");
          setDiscount(0);
        });
    }
  }, [truck, convex]);

  const calculateTotal = () => {
    const basePrice = plans[selectedPlan].price;
    return basePrice - (basePrice * (discount / 100));
  };

  return (
    <div>
      <h2>Meu Plano de Assinatura</h2>
      <p>Subtotal: R$ {plans[selectedPlan].price}</p>
      
      {discount > 0 && (
        <p style={{ color: "green" }}>Desconto ({discount}%): - R$ {plans[selectedPlan].price * (discount / 100)}</p>
      )}

      <h3>Total: R$ {calculateTotal()}</h3>
    </div>
  );
}
