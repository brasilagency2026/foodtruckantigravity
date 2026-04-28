"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function AdminPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const trucks = useQuery(api.admin.getAllFoodTrucks);
  const updateStatus = useMutation(api.admin.updateFoodTruckStatus);
  const deleteTruck = useMutation(api.admin.deleteFoodTruck);

  const vouchers = useQuery(api.admin.getAllVouchers);
  const createVoucher = useMutation(api.admin.createVoucher);
  const updateVoucher = useMutation(api.admin.updateVoucher);
  const deleteVoucher = useMutation(api.admin.deleteVoucher);
  const payCommissions = useMutation(api.admin.payCommissions);

  const [activeTab, setActiveTab] = useState<"trucks" | "vouchers">("trucks");
  const [newVoucher, setNewVoucher] = useState({ code: "", partnerName: "", partnerPhone: "", partnerPixKey: "", discountPercentage: 10, commissionPercentage: 50 });

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "trial" | "payment">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  if (!isLoaded) return <div className="p-10 text-white">Carregando...</div>;
  if (!isSignedIn) return <div className="p-10 text-white">Acesso negado. Faça login.</div>;

  // Simple superadmin check (could be refined with roles in Clerk/Convex)
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "glwebagency2@gmail.com";

  if (!isAdmin) {
    return <div className="p-10 text-white">Você não tem permissão para acessar esta página.</div>;
  }

  if (trucks === undefined) return <div className="p-10 text-white">Carregando dados...</div>;

  let filteredTrucks = trucks.filter(t => {
    if (filter === "pending") return t.approvalStatus === "pending";
    if (filter === "approved") return t.approvalStatus === "approved";
    if (filter === "rejected") return t.approvalStatus === "rejected";
    return true;
  });

  filteredTrucks.sort((a, b) => {
    let valA: any = a.name;
    let valB: any = b.name;

    if (sortBy === "trial") {
      valA = a.trialEndsAt || 0;
      valB = b.trialEndsAt || 0;
    } else if (sortBy === "payment") {
      valA = a.nextPaymentAt || 0;
      valB = b.nextPaymentAt || 0;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: "name" | "trial" | "payment") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: "name" | "trial" | "payment") => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("pt-BR");
  };

  return (
    <div className="admin-container">
      <style>{CSS}</style>
      <header className="admin-header">
        <h1>👑 Painel Super Admin</h1>
        <div className="admin-tabs">
          <button className={activeTab === "trucks" ? "active" : ""} onClick={() => setActiveTab("trucks")}>🚛 Food Trucks</button>
          <button className={activeTab === "vouchers" ? "active" : ""} onClick={() => setActiveTab("vouchers")}>🎟️ Vouchers / Commerciaux</button>
        </div>
      </header>

      {activeTab === "trucks" && (
        <>
          <div className="admin-filters mb-4">
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todos</button>
            <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pendentes</button>
            <button className={filter === "approved" ? "active" : ""} onClick={() => setFilter("approved")}>Aprovados</button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => toggleSort("name")}>Food Truck {getSortIcon("name")}</th>
                  <th>Contato</th>
                  <th>Status Aprovação</th>
                  <th>Status Operação</th>
                  <th className="sortable" onClick={() => toggleSort("trial")}>Vencimento Teste {getSortIcon("trial")}</th>
                  <th className="sortable" onClick={() => toggleSort("payment")}>Próximo Pgto {getSortIcon("payment")}</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrucks.length === 0 ? (
                  <tr><td colSpan={7} className="text-center">Nenhum food truck encontrado.</td></tr>
                ) : (
                  filteredTrucks.map(truck => (
                    <tr key={truck._id}>
                      <td>
                        <strong>{truck.name}</strong><br/>
                        <small>{truck.cityDisplay} - {truck.stateDisplay}</small>
                      </td>
                      <td>
                        {truck.phone}<br/>
                        <a 
                          href={`https://wa.me/55${truck.phone.replace(/\D/g, '')}?text=Olá! Aqui é do Food Pronto.`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-whatsapp"
                        >
                          📱 WhatsApp
                        </a>
                      </td>
                      <td>
                        <select 
                          value={truck.approvalStatus || "pending"}
                          onChange={(e) => updateStatus({ id: truck._id, approvalStatus: e.target.value as any })}
                          className={`status-select ${truck.approvalStatus || "pending"}`}
                        >
                          <option value="pending">Pendente</option>
                          <option value="approved">Aprovado</option>
                          <option value="rejected">Recusado</option>
                        </select>
                      </td>
                      <td>
                        <button 
                          className={`btn-toggle ${truck.isActive !== false ? "active" : "paused"}`}
                          onClick={() => updateStatus({ id: truck._id, isActive: truck.isActive === false ? true : false })}
                        >
                          {truck.isActive !== false ? "🟢 Ativo" : "⏸️ Pausado"}
                        </button>
                      </td>
                      <td>
                        <input 
                          type="date" 
                          value={truck.trialEndsAt ? new Date(truck.trialEndsAt).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            updateStatus({ id: truck._id, trialEndsAt: date.getTime() });
                          }}
                          className="date-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="date" 
                          value={truck.nextPaymentAt ? new Date(truck.nextPaymentAt).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            updateStatus({ id: truck._id, nextPaymentAt: date.getTime() });
                          }}
                          className="date-input"
                        />
                      </td>
                      <td>
                        <button 
                          className="btn-delete"
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja DELETAR o truck ${truck.name}?`)) {
                              deleteTruck({ id: truck._id });
                            }
                          }}
                        >
                          🗑️ Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "vouchers" && (
        <div className="vouchers-section">
          <div className="admin-table-wrapper mb-8" style={{ padding: 20 }}>
            <h2 className="text-xl font-bold mb-4 text-[#FF6B35]">Criar Novo Voucher</h2>
            <div className="flex gap-4 items-end">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Código</label>
                <input 
                  type="text" 
                  value={newVoucher.code} 
                  onChange={e => setNewVoucher({...newVoucher, code: e.target.value})} 
                  placeholder="Ex: CARLOS10"
                  className="bg-[#16162a] border border-white/20 p-2 rounded text-white uppercase"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Nome do Comercial</label>
                <input 
                  type="text" 
                  value={newVoucher.partnerName} 
                  onChange={e => setNewVoucher({...newVoucher, partnerName: e.target.value})} 
                  placeholder="Nome do Parceiro"
                  className="bg-[#16162a] border border-white/20 p-2 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">WhatsApp</label>
                <input 
                  type="text" 
                  value={newVoucher.partnerPhone} 
                  onChange={e => setNewVoucher({...newVoucher, partnerPhone: e.target.value})} 
                  placeholder="Ex: 11999999999"
                  className="bg-[#16162a] border border-white/20 p-2 rounded text-white w-32"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Chave PIX</label>
                <input 
                  type="text" 
                  value={newVoucher.partnerPixKey} 
                  onChange={e => setNewVoucher({...newVoucher, partnerPixKey: e.target.value})} 
                  placeholder="CPF, Email ou Telefone"
                  className="bg-[#16162a] border border-white/20 p-2 rounded text-white"
                />
              </div>
              <div className="w-20">
                <label className="block text-sm mb-1 text-gray-400">Desc %</label>
                <input 
                  type="number" 
                  value={newVoucher.discountPercentage} 
                  onChange={e => setNewVoucher({...newVoucher, discountPercentage: Number(e.target.value)})} 
                  className="bg-[#16162a] border border-white/20 p-2 rounded text-white w-full"
                />
              </div>
              <div className="w-20">
                <label className="block text-sm mb-1 text-gray-400">Com %</label>
                <input 
                  type="number" 
                  value={newVoucher.commissionPercentage} 
                  onChange={e => setNewVoucher({...newVoucher, commissionPercentage: Number(e.target.value)})} 
                  className="bg-[#16162a] border border-white/20 p-2 rounded text-white w-full"
                />
              </div>
              <button 
                onClick={async () => {
                  if (!newVoucher.code || !newVoucher.partnerName) return alert("Preencha código e nome.");
                  try {
                    await createVoucher({
                      code: newVoucher.code,
                      partnerName: newVoucher.partnerName,
                      partnerPhone: newVoucher.partnerPhone,
                      partnerPixKey: newVoucher.partnerPixKey,
                      isActive: true,
                      discountPercentage: newVoucher.discountPercentage,
                      commissionPercentage: newVoucher.commissionPercentage
                    });
                    setNewVoucher({ code: "", partnerName: "", partnerPhone: "", partnerPixKey: "", discountPercentage: 10, commissionPercentage: 50 });
                  } catch (e: any) {
                    alert(e.message);
                  }
                }}
                className="bg-[#FF6B35] text-white px-4 py-2 rounded font-bold hover:bg-[#e05a2b]"
              >
                + Adicionar
              </button>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Parceiro</th>
                  <th>Comissão a Pagar</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {!vouchers || vouchers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center">Nenhum voucher encontrado.</td></tr>
                ) : (
                  vouchers.map(v => (
                    <tr key={v._id}>
                      <td><strong>{v.code}</strong></td>
                      <td>
                        {v.partnerName}
                        {v.partnerPhone && (
                          <div style={{ marginTop: 4 }}>
                            <a 
                              href={`https://wa.me/55${v.partnerPhone.replace(/\D/g, '')}?text=Olá ${v.partnerName}!`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn-whatsapp"
                            >
                              📱 WhatsApp
                            </a>
                          </div>
                        )}
                        {v.partnerPixKey && (
                          <div className="text-xs text-gray-400 mt-2">
                            PIX: <span className="text-white font-mono">{v.partnerPixKey}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="font-bold text-green-400">
                          R$ {v.pendingCommission?.toFixed(2).replace('.', ',') || "0,00"}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          Taxa: {v.commissionPercentage}%
                        </div>
                        {(v.pendingCommission || 0) > 0 && (
                          <button 
                            className="btn-pay mt-2"
                            onClick={() => {
                              if (window.confirm(`Confirmar que você pagou R$ ${v.pendingCommission?.toFixed(2).replace('.', ',')} para ${v.partnerName}?`)) {
                                payCommissions({ partnerId: v._id });
                              }
                            }}
                          >
                            💸 Marcar como Pago
                          </button>
                        )}
                        {v.lastPaidAt && (
                          <div className="text-xs text-gray-500 mt-2">
                            Último pgto: {new Date(v.lastPaidAt).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td>
                        <button 
                          className={`btn-toggle ${v.isActive ? "active" : "paused"}`}
                          onClick={() => updateVoucher({ id: v._id, isActive: !v.isActive })}
                        >
                          {v.isActive ? "🟢 Ativo" : "🔴 Inativo"}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn-delete"
                          onClick={() => {
                            if (window.confirm(`Deletar voucher ${v.code}?`)) {
                              deleteVoucher({ id: v._id });
                            }
                          }}
                        >
                          🗑️ Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
  .admin-container {
    padding: 40px;
    background: #080810;
    min-height: 100vh;
    color: #f0f0f8;
    font-family: 'Nunito', sans-serif;
  }
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  .admin-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    color: #FF6B35;
  }
  .admin-tabs {
    display: flex;
    gap: 10px;
  }
  .admin-tabs button {
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.5);
    padding: 8px 16px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  .admin-tabs button.active {
    color: #FF6B35;
    border-bottom: 2px solid #FF6B35;
  }
  .admin-filters {
    display: flex;
    gap: 10px;
  }
  .admin-filters.mb-4 {
    margin-bottom: 20px;
  }
  .admin-filters button {
    background: #16162a;
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }
  .admin-filters button.active {
    background: #FF6B35;
    border-color: #FF6B35;
  }
  .admin-table-wrapper {
    background: #0f0f1a;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    overflow-x: auto;
  }
  .admin-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .admin-table th, .admin-table td {
    padding: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .admin-table th {
    background: rgba(0,0,0,0.2);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255,255,255,0.5);
  }
  .admin-table tr:hover {
    background: rgba(255,255,255,0.02);
  }
  .admin-table th.sortable {
    cursor: pointer;
    user-select: none;
    transition: color 0.2s;
  }
  .admin-table th.sortable:hover {
    color: #fff;
  }
  .btn-whatsapp {
    display: inline-block;
    margin-top: 6px;
    background: #25D366;
    color: #fff;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
  }
  .status-select {
    background: #16162a;
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
  }
  .status-select.pending { border-color: #F59E0B; color: #F59E0B; }
  .status-select.approved { border-color: #10B981; color: #10B981; }
  .status-select.rejected { border-color: #EF4444; color: #EF4444; }
  
  .btn-toggle {
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    font-weight: 700;
    cursor: pointer;
  }
  .btn-toggle.active { background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); }
  .btn-toggle.paused { background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3); }
  
  .date-input {
    background: #16162a;
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 13px;
    color-scheme: dark;
  }
  
  .btn-delete {
    background: rgba(239, 68, 68, 0.1);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }
  .btn-delete:hover {
    background: #EF4444;
    color: #fff;
  }
  .btn-pay {
    background: rgba(16, 185, 129, 0.2);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.4);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-pay:hover {
    background: #10B981;
    color: #fff;
  }
`;
