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

  const [filter, setFilter] = useState("all");

  if (!isLoaded) return <div className="p-10 text-white">Carregando...</div>;
  if (!isSignedIn) return <div className="p-10 text-white">Acesso negado. Faça login.</div>;

  // Simple superadmin check (could be refined with roles in Clerk/Convex)
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "contato@foodpronto.com.br" || 
                  user?.primaryEmailAddress?.emailAddress === "gleveque@gmail.com" || // add your personal email if needed
                  true; // Temporarily allow anyone logged in to see it during development. Remove '|| true' for prod.

  if (!isAdmin) {
    return <div className="p-10 text-white">Você não tem permissão para acessar esta página.</div>;
  }

  if (trucks === undefined) return <div className="p-10 text-white">Carregando dados...</div>;

  const filteredTrucks = trucks.filter(t => {
    if (filter === "pending") return t.approvalStatus === "pending";
    if (filter === "approved") return t.approvalStatus === "approved";
    if (filter === "rejected") return t.approvalStatus === "rejected";
    return true;
  });

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("pt-BR");
  };

  return (
    <div className="admin-container">
      <style>{CSS}</style>
      
      <header className="admin-header">
        <h1>👑 Painel Super Admin</h1>
        <div className="admin-filters">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todos</button>
          <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Pendentes</button>
          <button className={filter === "approved" ? "active" : ""} onClick={() => setFilter("approved")}>Aprovados</button>
        </div>
      </header>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Food Truck</th>
              <th>Contato</th>
              <th>Status Aprovação</th>
              <th>Status Operação</th>
              <th>Vencimento Teste</th>
              <th>Próximo Pgto</th>
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
                        if (window.confirm(\`Tem certeza que deseja DELETAR o truck \${truck.name}?\`)) {
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
    </div>
  );
}

const CSS = \`
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
  .admin-filters {
    display: flex;
    gap: 10px;
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
\`;
