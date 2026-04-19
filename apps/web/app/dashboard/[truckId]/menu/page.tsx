"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { formatPrice } from "shared/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItem {
  _id: Id<"menuItems">;
  name: string;
  description: string;
  price: number;
  photoUrl: string;
  category: string;
  available: boolean;
  preparationTime: number;
  allergens: string[];
  sku?: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  preparationTime: string;
  allergens: string;
  photoUrl: string;
  sku: string;
}

const EMPTY_FORM: FormData = {
  name: "", description: "", price: "",
  category: "", preparationTime: "15",
  allergens: "", photoUrl: "", sku: "",
};

const ALLERGEN_OPTIONS = [
  "Glúten", "Lactose", "Ovos", "Amendoim", "Frutos do Mar",
  "Soja", "Nozes", "Gergelim",
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GerenciarCardapioPage({
  params,
}: {
  params: { truckId: string };
}) {
  const router = useRouter();
  const truckId = params.truckId as Id<"foodTrucks">;
  const truck = useQuery(api.foodTrucks.getTruckById, { truckId });
  const items = useQuery(api.menu.getAllMenuItemsByTruck, { truckId }) as MenuItem[] | undefined;

  const createItem = useMutation(api.menu.createMenuItem);
  const updateItem = useMutation(api.menu.updateMenuItem);
  const deleteItem = useMutation(api.menu.deleteMenuItem);
  const toggleAvailable = useMutation(api.menu.toggleAvailable);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<Id<"menuItems"> | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState("Todos");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"menuItems"> | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Derived data ─────────────────────────────────────────────────────────────

  const categories = items
    ? ["Todos", ...Array.from(new Set(items.map((i) => i.category))).filter(Boolean)]
    : ["Todos"];

  const filtered =
    filterCat === "Todos" ? items ?? [] : (items ?? []).filter((i) => i.category === filterCat);

  const stats = {
    total: items?.length ?? 0,
    available: items?.filter((i) => i.available).length ?? 0,
    categories: new Set(items?.map((i) => i.category)).size,
  };

  // ── Form helpers ─────────────────────────────────────────────────────────────

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowForm(true);
  }

  function openEdit(item: MenuItem) {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description,
      price: (item.price / 100).toFixed(2).replace(".", ","),
      category: item.category,
      preparationTime: String(item.preparationTime),
      allergens: item.allergens.join(", "),
      photoUrl: item.photoUrl,
      sku: item.sku ?? "",
    });
    setErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function parsePrice(raw: string): number {
    return Math.round(parseFloat(raw.replace(",", ".")) * 100);
  }

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.description.trim()) e.description = "Descrição é obrigatória";
    if (!form.price || isNaN(parseFloat(form.price.replace(",", ".")))) e.price = "Preço inválido";
    if (!form.category.trim()) e.category = "Categoria é obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const key = `menu/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, contentType: file.type }),
      });
      const { uploadUrl, publicUrl } = await res.json();
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      set("photoUrl", publicUrl);
    } catch {
      alert("Erro no upload. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const price = parsePrice(form.price);
      const allergens = form.allergens
        ? form.allergens.split(",").map((a) => a.trim()).filter(Boolean)
        : [];
      const preparationTime = parseInt(form.preparationTime) || 15;
      const sku = form.sku.trim() || undefined;

      if (editingId) {
        await updateItem({
          itemId: editingId,
          name: form.name,
          description: form.description,
          price,
          photoUrl: form.photoUrl,
          category: form.category,
          preparationTime,
          allergens,
          sku,
        });
      } else {
        await createItem({
          truckId,
          name: form.name,
          description: form.description,
          price,
          photoUrl: form.photoUrl || "",
          category: form.category,
          preparationTime,
          allergens,
          sku,
        });
      }
      closeForm();
    } catch {
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: Id<"menuItems">) {
    await deleteItem({ itemId: id });
    setDeleteConfirm(null);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{CSS}</style>
      <div className="cm-page">

        {/* Header */}
        <div className="cm-header">
          <div className="cm-header-left">
            <button className="cm-back" onClick={() => router.push(`/dashboard/${params.truckId}`)}>
              ← Voltar
            </button>
            <div>
              <h1 className="cm-title">Gerenciar cardápio</h1>
              {truck && <p className="cm-truck">{truck.name}</p>}
            </div>
          </div>
          <button className="cm-add-btn" onClick={openCreate}>
            + Adicionar item
          </button>
        </div>

        {/* Stats */}
        <div className="cm-stats">
          <div className="cm-stat">
            <span className="cm-stat-n">{stats.total}</span>
            <span className="cm-stat-l">itens no total</span>
          </div>
          <div className="cm-stat">
            <span className="cm-stat-n" style={{ color: "#22C55E" }}>{stats.available}</span>
            <span className="cm-stat-l">disponíveis</span>
          </div>
          <div className="cm-stat">
            <span className="cm-stat-n" style={{ color: "#FF6B35" }}>{stats.categories}</span>
            <span className="cm-stat-l">categorias</span>
          </div>
          <div className="cm-stat">
            <span className="cm-stat-n" style={{ color: "#F59E0B" }}>
              {items ? items.length - stats.available : 0}
            </span>
            <span className="cm-stat-l">indisponíveis</span>
          </div>
        </div>

        {/* Category filters */}
        <div className="cm-filters">
          {categories.map((c) => (
            <button
              key={c}
              className={`cm-filter ${filterCat === c ? "active" : ""}`}
              onClick={() => setFilterCat(c)}
            >
              {c}
              {c !== "Todos" && (
                <span className="cm-filter-count">
                  {items?.filter((i) => i.category === c).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {!items ? (
          <div className="cm-loading">
            <div className="cm-spinner" />
            <span>Carregando cardápio...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="cm-empty">
            <span className="cm-empty-icon">🍽️</span>
            <p>
              {filterCat === "Todos"
                ? "Nenhum item no cardápio ainda."
                : `Nenhum item na categoria "${filterCat}".`}
            </p>
            <button className="cm-add-btn" onClick={openCreate}>
              + Adicionar primeiro item
            </button>
          </div>
        ) : (
          <div className="cm-grid">
            {filtered.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => setDeleteConfirm(item._id)}
                onToggle={(val) => toggleAvailable({ itemId: item._id, available: val })}
              />
            ))}
          </div>
        )}

        {/* Delete confirm modal */}
        {deleteConfirm && (
          <div className="cm-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
            <div className="cm-modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="cm-modal-icon">🗑️</div>
              <h3 className="cm-modal-title">Excluir item?</h3>
              <p className="cm-modal-body">
                {items?.find((i) => i._id === deleteConfirm)?.name}<br />
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                  Essa ação não pode ser desfeita.
                </span>
              </p>
              <div className="cm-modal-actions">
                <button className="cm-btn-ghost" onClick={() => setDeleteConfirm(null)}>
                  Cancelar
                </button>
                <button className="cm-btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit form drawer */}
        {showForm && (
          <div className="cm-drawer-backdrop" onClick={closeForm}>
            <div className="cm-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="cm-drawer-handle" />
              <div className="cm-drawer-header">
                <h2 className="cm-drawer-title">
                  {editingId ? "Editar item" : "Novo item"}
                </h2>
                <button className="cm-close-btn" onClick={closeForm}>✕</button>
              </div>

              <div className="cm-form">

                {/* Photo upload */}
                <div className="cm-photo-section">
                  <div
                    className="cm-photo-drop"
                    onClick={() => !uploading && fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (f) handleUpload(f);
                    }}
                  >
                    {form.photoUrl ? (
                      <>
                        <img src={form.photoUrl} alt="preview" className="cm-photo-preview" />
                        <div className="cm-photo-overlay">🔄 Trocar foto</div>
                      </>
                    ) : (
                      <div className="cm-photo-placeholder">
                        <span className="cm-photo-icon">📷</span>
                        <span className="cm-photo-hint">
                          {uploading ? "Enviando..." : "Clique ou arraste uma foto"}
                        </span>
                      </div>
                    )}
                    {uploading && <div className="cm-upload-bar" />}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                  />
                </div>

                {/* Name */}
                <Field label="Nome do item *" error={errors.name}>
                  <input
                    className={`cm-input ${errors.name ? "error" : ""}`}
                    placeholder="Ex: Smash Burger Duplo"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </Field>

                {/* Description */}
                <Field label="Descrição *" error={errors.description}>
                  <textarea
                    className={`cm-input cm-textarea ${errors.description ? "error" : ""}`}
                    placeholder="Ingredientes, preparo, diferenciais..."
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={3}
                  />
                </Field>

                {/* Price + Category row */}
                <div className="cm-row-2">
                  <Field label="Preço (R$) *" error={errors.price}>
                    <input
                      className={`cm-input ${errors.price ? "error" : ""}`}
                      placeholder="19,90"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                    />
                  </Field>
                  <Field label="Categoria *" error={errors.category}>
                    <input
                      className={`cm-input ${errors.category ? "error" : ""}`}
                      placeholder="Ex: Hambúrgueres"
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      list="categories-list"
                    />
                    <datalist id="categories-list">
                      {categories.filter((c) => c !== "Todos").map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </Field>
                </div>

                {/* Prep time + SKU row */}
                <div className="cm-row-2">
                  <Field label="Tempo de preparo (min)">
                    <input
                      className="cm-input"
                      type="number"
                      min="1"
                      max="120"
                      value={form.preparationTime}
                      onChange={(e) => set("preparationTime", e.target.value)}
                    />
                  </Field>
                  <Field label="Referência / SKU">
                    <input
                      className="cm-input"
                      placeholder="Ex: BRG-001"
                      value={form.sku}
                      onChange={(e) => set("sku", e.target.value)}
                    />
                  </Field>
                </div>

                {/* Allergens */}
                <div className="cm-allergens-section">
                  <label className="cm-label">Alérgenos</label>
                  <div className="cm-allergen-pills">
                    {ALLERGEN_OPTIONS.map((a) => {
                      const active = form.allergens.includes(a);
                      return (
                        <button
                          key={a}
                          type="button"
                          className={`cm-allergen-pill ${active ? "active" : ""}`}
                          onClick={() => {
                            const list = form.allergens
                              ? form.allergens.split(", ").filter(Boolean)
                              : [];
                            const next = active
                              ? list.filter((x) => x !== a)
                              : [...list, a];
                            set("allergens", next.join(", "));
                          }}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Save button */}
                <button
                  className="cm-save-btn"
                  onClick={handleSave}
                  disabled={saving || uploading}
                >
                  {saving ? "Salvando..." : editingId ? "💾 Salvar alterações" : "✅ Adicionar ao cardápio"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Menu Item Card ───────────────────────────────────────────────────────────

function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className={`cm-item-card ${!item.available ? "unavailable" : ""}`}>
      {item.photoUrl ? (
        <img src={item.photoUrl} alt={item.name} className="cm-item-photo" />
      ) : (
        <div className="cm-item-photo-placeholder">🍽️</div>
      )}

      <div className="cm-item-body">
        <div className="cm-item-top">
          <div>
            <h3 className="cm-item-name">{item.name}</h3>
            <span className="cm-item-cat">{item.category}</span>
          </div>
          <div className="cm-item-toggle-wrap">
            <button
              className={`cm-toggle ${item.available ? "on" : "off"}`}
              onClick={() => onToggle(!item.available)}
              title={item.available ? "Desativar" : "Ativar"}
            >
              <div className="cm-toggle-knob" />
            </button>
            <span className={`cm-toggle-label ${item.available ? "on" : "off"}`}>
              {item.available ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        <p className="cm-item-desc">{item.description}</p>

        <div className="cm-item-meta">
          <span className="cm-item-price">{formatPrice(item.price)}</span>
          <span className="cm-item-prep">⏱ {item.preparationTime} min</span>
          {item.sku && <span className="cm-item-sku">🏷️ {item.sku}</span>}
          {item.allergens.length > 0 && (
            <span className="cm-item-allergens">⚠️ {item.allergens.join(", ")}</span>
          )}
        </div>

        <div className="cm-item-actions">
          <button className="cm-item-edit" onClick={onEdit}>✏️ Editar</button>
          <button className="cm-item-delete" onClick={onDelete}>🗑️</button>
        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="cm-field">
      <label className="cm-label">{label}</label>
      {children}
      {error && <span className="cm-field-error">{error}</span>}
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Nunito:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080810; --surface: #0f0f1a; --surface2: #16162a;
    --border: rgba(255,255,255,0.07); --orange: #FF6B35;
    --text: #f0f0f8; --muted: rgba(240,240,248,0.45);
    --green: #22C55E; --red: #EF4444; --amber: #F59E0B;
    --display: 'Syne', sans-serif; --body: 'Nunito', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--body); }

  .cm-page { min-height: 100vh; padding: 32px 24px 80px; max-width: 1000px; margin: 0 auto; }

  /* HEADER */
  .cm-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
  .cm-header-left { display: flex; align-items: flex-start; gap: 16px; }
  .cm-back { background: none; border: 1px solid var(--border); border-radius: 10px; color: var(--muted); padding: 8px 14px; font-size: 13px; cursor: pointer; font-family: var(--body); transition: color 0.2s; white-space: nowrap; margin-top: 4px; }
  .cm-back:hover { color: var(--text); }
  .cm-title { font-family: var(--display); font-size: 26px; font-weight: 800; margin-bottom: 4px; }
  .cm-truck { color: var(--orange); font-size: 13px; font-weight: 600; }
  .cm-add-btn { background: var(--orange); color: #fff; border: none; border-radius: 12px; padding: 12px 22px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: var(--body); white-space: nowrap; transition: opacity 0.2s; box-shadow: 0 4px 16px rgba(255,107,53,0.3); }
  .cm-add-btn:hover { opacity: 0.88; }

  /* STATS */
  .cm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .cm-stat { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px; text-align: center; }
  .cm-stat-n { display: block; font-family: var(--display); font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .cm-stat-l { font-size: 12px; color: var(--muted); }

  /* FILTERS */
  .cm-filters { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 24px; scrollbar-width: none; }
  .cm-filters::-webkit-scrollbar { display: none; }
  .cm-filter { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 100px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s; font-family: var(--body); }
  .cm-filter:hover { border-color: rgba(255,255,255,0.18); color: var(--text); }
  .cm-filter.active { background: rgba(255,107,53,0.12); border-color: rgba(255,107,53,0.3); color: var(--orange); }
  .cm-filter-count { background: rgba(255,255,255,0.1); border-radius: 100px; padding: 1px 7px; font-size: 11px; }
  .cm-filter.active .cm-filter-count { background: rgba(255,107,53,0.2); }

  /* GRID */
  .cm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .cm-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 14px; color: var(--muted); font-size: 14px; }
  .cm-spinner { width: 32px; height: 32px; border: 2px solid rgba(255,107,53,0.2); border-top-color: var(--orange); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .cm-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; gap: 14px; text-align: center; }
  .cm-empty-icon { font-size: 48px; }
  .cm-empty p { color: var(--muted); font-size: 15px; }

  /* ITEM CARD */
  .cm-item-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; transition: border-color 0.2s; }
  .cm-item-card:hover { border-color: rgba(255,107,53,0.2); }
  .cm-item-card.unavailable { opacity: 0.55; }
  .cm-item-photo { width: 100%; height: 140px; object-fit: cover; }
  .cm-item-photo-placeholder { width: 100%; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 36px; background: var(--surface2); }
  .cm-item-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
  .cm-item-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
  .cm-item-name { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
  .cm-item-cat { font-size: 11px; color: var(--orange); font-weight: 600; background: rgba(255,107,53,0.1); border-radius: 100px; padding: 2px 8px; }
  .cm-item-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }
  .cm-item-meta { display: flex; gap: 10px; flex-wrap: wrap; }
  .cm-item-price { color: var(--orange); font-weight: 800; font-size: 16px; }
  .cm-item-prep { font-size: 12px; color: var(--muted); }
  .cm-item-sku { font-size: 11px; color: var(--muted); font-family: monospace; background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 4px; }
  .cm-item-allergens { font-size: 11px; color: var(--amber); }
  .cm-item-actions { display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--border); }
  .cm-item-edit { background: rgba(255,255,255,0.06); border: 1px solid var(--border); border-radius: 8px; color: var(--text); padding: 7px 14px; font-size: 12px; cursor: pointer; font-family: var(--body); transition: background 0.2s; font-weight: 600; }
  .cm-item-edit:hover { background: rgba(255,255,255,0.1); }
  .cm-item-delete { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15); border-radius: 8px; color: var(--red); padding: 7px 12px; font-size: 12px; cursor: pointer; font-family: var(--body); transition: background 0.2s; }
  .cm-item-delete:hover { background: rgba(239,68,68,0.15); }

  /* TOGGLE */
  .cm-item-toggle-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
  .cm-toggle { width: 40px; height: 22px; border-radius: 100px; border: none; cursor: pointer; padding: 3px; display: flex; align-items: center; transition: background 0.25s; }
  .cm-toggle.on { background: var(--green); justify-content: flex-end; }
  .cm-toggle.off { background: rgba(255,255,255,0.1); justify-content: flex-start; }
  .cm-toggle-knob { width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
  .cm-toggle-label { font-size: 10px; font-weight: 700; }
  .cm-toggle-label.on { color: var(--green); }
  .cm-toggle-label.off { color: var(--muted); }

  /* DRAWER */
  .cm-drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
  .cm-drawer { background: #0f0f1a; border-radius: 24px 24px 0 0; width: 100%; max-width: 640px; max-height: 92vh; overflow-y: auto; padding: 16px 24px 48px; border: 1px solid var(--border); border-bottom: none; animation: slideUp 0.3s ease; }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .cm-drawer-handle { width: 40px; height: 4px; background: rgba(255,255,255,0.12); border-radius: 100px; margin: 0 auto 20px; }
  .cm-drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .cm-drawer-title { font-family: var(--display); font-size: 22px; font-weight: 800; }
  .cm-close-btn { background: rgba(255,255,255,0.06); border: 1px solid var(--border); border-radius: 50%; width: 32px; height: 32px; color: var(--muted); cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }

  /* FORM */
  .cm-form { display: flex; flex-direction: column; gap: 20px; }
  .cm-photo-section {}
  .cm-photo-drop { position: relative; border: 2px dashed var(--border); border-radius: 16px; min-height: 140px; cursor: pointer; overflow: hidden; background: var(--surface); display: flex; align-items: center; justify-content: center; transition: border-color 0.2s; }
  .cm-photo-drop:hover { border-color: rgba(255,107,53,0.3); }
  .cm-photo-preview { width: 100%; height: 160px; object-fit: cover; display: block; }
  .cm-photo-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center; color: transparent; font-size: 14px; font-weight: 700; transition: all 0.2s; }
  .cm-photo-drop:hover .cm-photo-overlay { background: rgba(0,0,0,0.45); color: #fff; }
  .cm-photo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px; }
  .cm-photo-icon { font-size: 32px; }
  .cm-photo-hint { font-size: 13px; color: var(--muted); }
  .cm-upload-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--orange); animation: uploadPulse 1s ease-in-out infinite; }
  @keyframes uploadPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
  .cm-field { display: flex; flex-direction: column; gap: 7px; }
  .cm-label { font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: 0.03em; }
  .cm-input { padding: 13px 15px; background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; color: var(--text); font-size: 14px; font-family: var(--body); outline: none; transition: border-color 0.2s; width: 100%; }
  .cm-input:focus { border-color: rgba(255,107,53,0.4); }
  .cm-input.error { border-color: rgba(239,68,68,0.5); }
  .cm-textarea { resize: vertical; line-height: 1.5; min-height: 80px; }
  .cm-field-error { color: var(--red); font-size: 12px; }
  .cm-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .cm-allergens-section { display: flex; flex-direction: column; gap: 10px; }
  .cm-allergen-pills { display: flex; flex-wrap: wrap; gap: 7px; }
  .cm-allergen-pill { padding: 6px 14px; border-radius: 100px; border: 1px solid var(--border); background: var(--surface2); color: var(--muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: var(--body); }
  .cm-allergen-pill:hover { border-color: rgba(255,255,255,0.18); color: var(--text); }
  .cm-allergen-pill.active { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); color: var(--amber); }
  .cm-save-btn { background: var(--orange); color: #fff; border: none; border-radius: 14px; padding: 16px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: var(--body); transition: opacity 0.2s; box-shadow: 0 6px 20px rgba(255,107,53,0.3); }
  .cm-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .cm-save-btn:not(:disabled):hover { opacity: 0.88; }

  /* DELETE MODAL */
  .cm-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .cm-modal-sm { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 32px 28px; max-width: 340px; width: 100%; text-align: center; }
  .cm-modal-icon { font-size: 40px; margin-bottom: 16px; }
  .cm-modal-title { font-family: var(--display); font-size: 20px; font-weight: 800; margin-bottom: 10px; }
  .cm-modal-body { font-size: 14px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
  .cm-modal-actions { display: flex; gap: 10px; }
  .cm-btn-ghost { flex: 1; padding: 12px; background: transparent; border: 1px solid var(--border); border-radius: 10px; color: var(--muted); cursor: pointer; font-family: var(--body); font-size: 14px; transition: color 0.2s; }
  .cm-btn-ghost:hover { color: var(--text); }
  .cm-btn-danger { flex: 1; padding: 12px; background: var(--red); border: none; border-radius: 10px; color: #fff; cursor: pointer; font-family: var(--body); font-size: 14px; font-weight: 700; transition: opacity 0.2s; }
  .cm-btn-danger:hover { opacity: 0.88; }

  @media (max-width: 600px) {
    .cm-page { padding: 20px 16px 80px; }
    .cm-stats { grid-template-columns: repeat(2, 1fr); }
    .cm-row-2 { grid-template-columns: 1fr; }
    .cm-header { flex-direction: column; }
    .cm-add-btn { width: 100%; text-align: center; }
  }
`;
