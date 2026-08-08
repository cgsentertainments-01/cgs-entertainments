"use client";

import React, { useState } from "react";
import { Layers, Plus, Search, Edit2, Trash2, X, Sparkles } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  eventsCount: number;
  badge: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: "CAT-1", name: "Dance", slug: "dance", eventsCount: 8, badge: "Popular" },
    { id: "CAT-2", name: "Modeling", slug: "modeling", eventsCount: 5, badge: "Trending" },
    { id: "CAT-3", name: "Singing", slug: "singing", eventsCount: 4, badge: "Featured" },
    { id: "CAT-4", name: "Acting", slug: "acting", eventsCount: 3, badge: "Active" },
    { id: "CAT-5", name: "Music", slug: "music", eventsCount: 4, badge: "Active" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catBadge, setCatBadge] = useState("Popular");

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    const newCat: CategoryItem = {
      id: `CAT-${Date.now().toString().slice(-4)}`,
      name: catName,
      slug: catName.toLowerCase().replace(/\s+/g, "-"),
      eventsCount: 0,
      badge: catBadge,
    };

    setCategories([...categories, newCat]);
    setCatName("");
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this event category?")) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 4px", letterSpacing: -0.4 }}>
            Event Categories
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
            Organize dance, modeling, singing, acting, and stage show categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
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
          <Plus size={18} /> Add New Category
        </button>
      </div>

      {/* Search */}
      <div style={{ background: "#ffffff", borderRadius: 20, border: "1.5px solid #E2E8F0", padding: "16px 20px" }}>
        <div style={{ position: "relative" }}>
          <Search size={17} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search categories..."
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

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {filteredCategories.map((c) => (
          <div
            key={c.id}
            style={{
              background: "#ffffff",
              borderRadius: 20,
              border: "1.5px solid #E2E8F0",
              padding: "22px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6D28D9", background: "#F3E8FF", padding: "3px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                {c.badge}
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "8px 0 2px" }}>
                {c.name}
              </h3>
              <div style={{ fontSize: 12.5, color: "#64748B", fontWeight: 600 }}>
                {c.eventsCount} Active Events
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(c.id)}
              style={{
                padding: "8px",
                borderRadius: 10,
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#DC2626",
                cursor: "pointer",
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
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
            style={{ background: "#ffffff", borderRadius: 24, width: "100%", maxWidth: 440, padding: "32px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0 }}>Add Category</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Comedy & Drama"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                  Badge Tag
                </label>
                <select
                  value={catBadge}
                  onChange={(e) => setCatBadge(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 13.5 }}
                >
                  <option value="Popular">Popular</option>
                  <option value="Trending">Trending</option>
                  <option value="Featured">Featured</option>
                  <option value="Active">Active</option>
                </select>
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
                  style={{ padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #6D28D9)", color: "#fff", border: "none", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
