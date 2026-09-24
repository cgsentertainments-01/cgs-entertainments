"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, RefreshCw, Eye, EyeOff, Image as ImageIcon } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active?: boolean;
  display_order?: number;
  eventsCount?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catOrder, setCatOrder] = useState<number>(0);
  const [catIsActive, setCatIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories?all=true", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching admin categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDescription("");
    setCatImage("");
    setCatOrder(categories.length);
    setCatIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || "");
    setCatImage(cat.image || "");
    setCatOrder(cat.display_order || 0);
    setCatIsActive(cat.is_active !== undefined ? cat.is_active : true);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      setSubmitting(true);

      const payload = {
        id: editingCategory?.id,
        name: catName.trim(),
        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: catDescription.trim() || null,
        image: catImage.trim() || null,
        display_order: Number(catOrder) || 0,
        is_active: catIsActive,
      };

      const method = editingCategory ? "PUT" : "POST";
      const res = await fetch("/api/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        await fetchCategories();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || "Failed to save category"}`);
      }
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category. Check network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.softDeleted) {
          alert(`Notice: "${name}" has linked events, so it was set to Inactive and removed from the public website.`);
        }
        await fetchCategories();
      } else {
        const errData = await res.json();
        alert(`Error deleting category: ${errData.error}`);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category.");
    }
  };

  const toggleCategoryVisibility = async (cat: CategoryItem) => {
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cat.id,
          is_active: !cat.is_active,
        }),
      });

      if (res.ok) {
        await fetchCategories();
      }
    } catch (err) {
      console.error("Error toggling category status:", err);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
            Event Categories Management
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Manage category titles, images, display order, and active visibility for CGS Entertainments.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={fetchCategories}
            style={{
              padding: "11px 16px",
              borderRadius: 14,
              background: "#F1F5F9",
              color: "#334155",
              fontSize: 14,
              fontWeight: 700,
              border: "1px solid #CBD5E1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            type="button"
            onClick={openAddModal}
            style={{
              padding: "11px 22px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(124, 58, 237, 0.35)",
            }}
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "16px 20px" }}>
        <div style={{ position: "relative" }}>
          <Search size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search categories in database..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: 12,
              border: "1.5px solid #E2E8F0",
              fontSize: 13.5,
              outline: "none",
              background: "#F8FAFC",
            }}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
          Loading categories from Supabase...
        </div>
      ) : categories.length === 0 ? (
        <div style={{ padding: "48px 24px", background: "#ffffff", borderRadius: 20, border: "1.5px dashed #CBD5E1", textAlign: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", margin: "0 0 6px" }}>No Categories Found in Database</h3>
          <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 16px" }}>Click &quot;Add Category&quot; above to create your first category in Supabase.</p>
          <button
            onClick={openAddModal}
            style={{ padding: "9px 20px", borderRadius: 12, background: "#7C3AED", color: "#FFF", border: "none", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}
          >
            Add First Category
          </button>
        </div>
      ) : (
        /* Categories Grid */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {filteredCategories.map((c) => (
            <div
              key={c.id}
              style={{
                background: "#ffffff",
                borderRadius: 20,
                border: `1.5px solid ${c.is_active !== false ? "#E2E8F0" : "#F1F5F9"}`,
                padding: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                opacity: c.is_active !== false ? 1 : 0.6,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", background: "#F1F5F9" }}
                    />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ImageIcon size={22} color="#7C3AED" />
                    </div>
                  )}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                        {c.name}
                      </h3>
                      {c.is_active === false && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#DC2626", background: "#FEF2F2", padding: "2px 6px", borderRadius: 4 }}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, marginTop: 2 }}>
                      Slug: {c.slug} • Order: {c.display_order ?? 0}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => toggleCategoryVisibility(c)}
                    title={c.is_active !== false ? "Hide Category" : "Show Category"}
                    style={{
                      padding: "7px",
                      borderRadius: 8,
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      color: c.is_active !== false ? "#059669" : "#94A3B8",
                      cursor: "pointer",
                    }}
                  >
                    {c.is_active !== false ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(c)}
                    title="Edit Category"
                    style={{
                      padding: "7px",
                      borderRadius: 8,
                      background: "#F3E8FF",
                      border: "1px solid #DDD6FE",
                      color: "#6D28D9",
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.name)}
                    title="Delete Category"
                    style={{
                      padding: "7px",
                      borderRadius: 8,
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#DC2626",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {c.description && (
                <p style={{ fontSize: 12.5, color: "#64748B", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {c.description}
                </p>
              )}

              <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B", fontWeight: 700 }}>
                <span>{c.eventsCount ?? 0} Events linked</span>
                <span style={{ color: "#7C3AED" }}>Synced to Supabase</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(9, 3, 20, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 480, padding: "32px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Classical Dance"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Brief description of this category..."
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 13.5, resize: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 13.5 }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                    Visibility Status
                  </label>
                  <select
                    value={catIsActive ? "true" : "false"}
                    onChange={(e) => setCatIsActive(e.target.value === "true")}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 13.5 }}
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "10px 20px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#ffffff", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "#fff", border: "none", fontSize: 13.5, fontWeight: 800, cursor: "pointer", opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? "Saving..." : editingCategory ? "Update Category" : "Save to Supabase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

