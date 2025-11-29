import React, { useEffect, useState, useRef } from "react";

/**
 * Todo Studio — full App.js
 * - Drop-in replacement for src/app/src/App.js
 * - High-contrast modal, Escape to close, accessible focus, improved visibility
 * - Backend expectations:
 *    GET  /todos
 *    POST /todos
 *    PATCH /todos/:id
 *    DELETE /todos/:id
 */

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

/* ---------- Icons ---------- */
const Icon = {
  Plus: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Trash: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 6V4h4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Edit: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 21v-3l11-11 3 3L6 21H3zM14 7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Search: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

/* ---------- Helpers ---------- */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

/* ---------- Theme + Styles (visibility-focused) ---------- */
const theme = {
  darkBg: "#071028",
  panelBg: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
  accentA: "#7c3aed",
  accentB: "#06b6d4",
  card: "#ffffff",
  textPrimary: "#071122",
  textOnDark: "#e6eef9",
  mutedOnDark: "rgba(230,238,249,0.7)",
  radius: 14
};

const styles = {
  page: {
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto",
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 10% 10%, rgba(124,58,237,0.12), transparent), radial-gradient(900px 500px at 90% 90%, rgba(6,182,212,0.06), transparent), ${theme.darkBg}`,
    padding: 28,
    boxSizing: "border-box",
    color: theme.textOnDark,
  },
  wrap: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 26,
    borderRadius: 18,
    background: theme.panelBg,
    boxShadow: "0 18px 60px rgba(2,6,23,0.6)",
    border: "1px solid rgba(255,255,255,0.02)"
  },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  titleWrap: { flex: "0 0 360px" },
  title: { fontSize: 28, margin: 0, color: theme.textOnDark, letterSpacing: -0.4 },
  subtitle: { marginTop: 8, color: theme.mutedOnDark, fontSize: 13 },

  controls: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", flex: 1 },

  // Inputs & buttons
  input: { padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: theme.textOnDark, outline: "none", fontSize: 14, minWidth: 260 },
  searchInput: { padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)", color: theme.mutedOnDark, outline: "none", fontSize: 14 },

  addBtn: {
    display: "inline-flex", gap: 8, alignItems: "center",
    background: `linear-gradient(90deg, ${theme.accentA}, ${theme.accentB})`,
    color: "white", border: "none", padding: "12px 16px", borderRadius: 12, cursor: "pointer",
    boxShadow: "0 10px 30px rgba(6,182,212,0.14)", fontWeight: 700, fontSize: 14, transition: "transform .14s ease, box-shadow .14s ease"
  },

  // list
  list: { marginTop: 20, display: "grid", gap: 14 },
  card: {
    display: "flex", alignItems: "center", gap: 14, padding: 16,
    background: theme.card, color: theme.textPrimary, borderRadius: theme.radius,
    boxShadow: "0 8px 24px rgba(2,6,23,0.08)", transition: "transform .12s ease, box-shadow .12s ease",
  },
  cardHover: { transform: "translateY(-6px)", boxShadow: "0 18px 40px rgba(2,6,23,0.12)" },

  checkbox: {
    width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", cursor: "pointer",
    border: "1px solid rgba(11,18,32,0.06)"
  },

  todoText: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  todoTitle: { margin: 0, fontSize: 17, fontWeight: 700, color: theme.textPrimary },
  todoMeta: { fontSize: 13, color: "rgba(11,18,32,0.6)" },

  actions: { display: "flex", gap: 8, alignItems: "center" },
  actionBtn: { background: "transparent", border: "none", padding: 8, borderRadius: 8, cursor: "pointer", color: "rgba(11,18,32,0.7)", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  actionBtnVisible: { background: "rgba(15,23,42,0.03)", color: "rgba(11,18,32,0.88)" },

  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
  pagerBtn: { padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.03)", color: theme.textOnDark },
  pagerInfo: { color: theme.mutedOnDark },

  // toasts & modal
  toastArea: { position: "fixed", right: 20, bottom: 20, display: "flex", flexDirection: "column", gap: 10, zIndex: 9999 },
  toast: (type = "info") => ({ minWidth: 220, padding: "10px 14px", borderRadius: 10, color: "white", background: type === "error" ? "#ef4444" : "#10b981" }),

  // improved modal styles for high contrast
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,0.48)",   // slightly lighter overlay to keep modal readable
    display: "grid",
    placeItems: "center",
    zIndex: 9998,
    padding: 20,
  },
  modal: {
    width: 460,
    maxWidth: "94%",
    background: "#ffffff",              // bright white background
    color: "#071122",                   // dark readable text
    padding: 22,
    borderRadius: 12,
    boxShadow: "0 30px 80px rgba(2,6,23,0.6)",
    lineHeight: 1.4
  },

  // skeleton
  skeleton: { height: 64, borderRadius: 12, background: "linear-gradient(90deg, rgba(200,200,200,0.08), rgba(200,200,200,0.04))", animation: "pulse 1.2s infinite" },

  // focus outline for accessibility
  focusOutline: { boxShadow: "0 0 0 4px rgba(124,58,237,0.18)" }
};

const keyframes = `
@keyframes pulse {
  0% { opacity: 0.6 }
  50% { opacity: 1 }
  100% { opacity: 0.6 }
}
`;

/* ---------- Small toast hook ---------- */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  function push(msg, opts = {}) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    setToasts(t => [...t, { id, msg, type: opts.type || "info" }]);
    if (!opts.sticky) setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opts.duration || 3800);
  }
  function remove(id) { setToasts(t => t.filter(x => x.id !== id)); }
  return { toasts, push, remove };
}

/* ---------- Component ---------- */
export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [confirm, setConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingVal, setEditingVal] = useState("");
  const editRef = useRef(null);
  const toasts = useToasts();

  useEffect(() => {
    const s = document.createElement("style");
    s.innerHTML = keyframes;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // close modal with Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && confirm) setConfirm(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm]);

  useEffect(() => { fetchTodos(); }, []);

  async function fetchTodos() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/todos`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setTodos(Array.isArray(data) ? data.map(t => ({ completed: !!t.completed, ...t })) : []);
    } catch (err) {
      console.error(err);
      toasts.push("Failed to load todos", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  // derived
  const filtered = todos.filter(t => t.description.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b) => {
      const da = new Date(a.created_at).getTime()||0;
      const db = new Date(b.created_at).getTime()||0;
      return sort === "newest" ? db - da : da - db;
    });

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page-1)*perPage, page*perPage);

  /* ---------- Actions ---------- */
  async function onCreate(e) {
    e.preventDefault();
    const input = (e.target.elements.desc.value || "").trim();
    if (!input) return;
    setCreating(true);
    const tempId = `tmp-${Date.now()}`;
    const optimistic = { _id: tempId, description: input, created_at: new Date().toISOString(), completed: false };
    setTodos(t => [optimistic, ...t]);
    e.target.reset();

    try {
      const res = await fetch(`${API_BASE}/todos`, {
        method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ description: input })
      });
      if (!res.ok) throw new Error("create failed");
      const created = await res.json();
      setTodos(t => t.map(x => x._id===tempId ? created : x));
      toasts.push("Added", { type: "info" });
    } catch (err) {
      console.error(err);
      setTodos(t => t.filter(x => x._id !== tempId));
      toasts.push("Create failed", { type: "error" });
    } finally {
      setCreating(false);
    }
  }

  async function onToggle(id) {
    const prev = todos.slice();
    setTodos(t => t.map(x => x._id===id ? {...x, completed: !x.completed} : x));
    try {
      const item = todos.find(x=>x._id===id) || {};
      const res = await fetch(`${API_BASE}/todos/${id}`, {
        method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ completed: !item.completed })
      });
      if (!res.ok) throw new Error("patch failed");
      toasts.push("Updated", { type: "info" });
    } catch (err) {
      console.error(err);
      setTodos(prev);
      toasts.push("Update failed", { type: "error" });
    }
  }

  function startEdit(todo) {
    setEditingId(todo._id);
    setEditingVal(todo.description);
    setTimeout(()=> editRef.current && editRef.current.focus(), 30);
  }

  async function commitEdit(id) {
    const val = (editingVal||"").trim();
    if (!val) { toasts.push("Description required", { type: "error" }); return; }
    const prev = todos.slice();
    setTodos(t => t.map(x => x._id===id ? {...x, description: val} : x));
    setEditingId(null);
    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, {
        method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ description: val })
      });
      if (!res.ok) throw new Error("edit failed");
      toasts.push("Saved", { type: "info" });
    } catch (err) {
      console.error(err);
      setTodos(prev);
      toasts.push("Save failed", { type: "error" });
    }
  }

  function askDelete(id, text) { setConfirm({ id, text }); }

  async function doDelete() {
    if (!confirm) return;
    const { id } = confirm;
    setConfirm(null);
    const prev = todos.slice();
    setTodos(t => t.filter(x => x._id !== id));
    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      toasts.push("Deleted", { type: "info" });
    } catch (err) {
      console.error(err);
      setTodos(prev);
      toasts.push("Delete failed", { type: "error" });
    }
  }

  /* ---------- Render ---------- */
  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.headerRow}>
          <div style={styles.titleWrap}>
            <h1 style={styles.title}>✨ Todo Studio</h1>
            <div style={styles.subtitle}>Colorful, accessible, and readable — add, edit, delete with confidence</div>
          </div>

          <div style={styles.controls}>
            <form onSubmit={onCreate} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input name="desc" aria-label="Add todo" placeholder="Add a task..." style={styles.input} />
              <button
                type="submit"
                style={styles.addBtn}
                disabled={creating}
                onMouseDown={(e)=> e.currentTarget.style.transform="translateY(1px)"}
                onMouseUp={(e)=> e.currentTarget.style.transform="translateY(0px)"}
              >
                <Icon.Plus/> <span style={{ fontWeight: 700 }}>Add</span>
              </button>
            </form>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)" }}>
                <Icon.Search/>
                <input placeholder="Search tasks..." value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} style={{ ...styles.searchInput, background: "transparent", color: theme.mutedOnDark }} aria-label="Search todos" />
              </div>

              <select value={sort} onChange={(e)=>setSort(e.target.value)} style={{ padding: "10px 12px", borderRadius: 10, border: "none", fontSize: 14 }}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, color: theme.mutedOnDark }}>
          Showing <strong style={{ color: "white" }}>{filtered.length}</strong> tasks • Page {page} / {pages}
        </div>

        <div style={styles.list}>
          {loading ? (
            Array.from({length: 4}).map((_,i) => (
              <div key={i} style={{ ...styles.card, opacity: 0.95 }}>
                <div style={{ ...styles.skeleton, width: 42, height: 42, borderRadius: 10 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ ...styles.skeleton, height: 16, width: "55%", marginBottom: 8 }} />
                  <div style={{ ...styles.skeleton, height: 12, width: "35%" }} />
                </div>
                <div style={{ width: 100 }} />
              </div>
            ))
          ) : pageItems.length === 0 ? (
            <div style={{ padding: 12, background: "transparent" }}>
              <div style={{ textAlign: "center", padding: 40, color: theme.mutedOnDark }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "white" }}>No tasks yet</div>
                <div style={{ marginTop: 8 }}>Add your first task to get started — everything is saved to the backend.</div>
              </div>
            </div>
          ) : pageItems.map(todo => (
            <div
              key={todo._id}
              style={styles.card}
              onMouseEnter={e => Object.assign(e.currentTarget.style, styles.cardHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: "translateY(0px)", boxShadow: "0 8px 24px rgba(2,6,23,0.08)" })}
            >
              <div
                onClick={() => onToggle(todo._id)}
                aria-label={todo.completed ? "Mark as uncompleted" : "Mark as completed"}
                role="button"
                tabIndex={0}
                onKeyDown={(e)=> { if (e.key === "Enter") onToggle(todo._1d); }}
                style={{
                  ...styles.checkbox,
                  background: todo.completed ? `linear-gradient(90deg, ${theme.accentA}, ${theme.accentB})` : "#fafbfd",
                  color: todo.completed ? "white" : "rgba(11,18,32,0.6)",
                  transition: "all .12s ease"
                }}
              >
                {todo.completed ? <Icon.Check/> : <div style={{ width: 8, height: 8, borderRadius: 6, background: "rgba(11,18,32,0.12)" }} />}
              </div>

              <div style={styles.todoText}>
                {editingId === todo._id ? (
                  <input ref={editRef} value={editingVal} onChange={(e)=>setEditingVal(e.target.value)} onKeyDown={(e)=>{ if (e.key==="Enter") commitEdit(todo._id); if (e.key==="Escape") setEditingId(null); }} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)" }} />
                ) : (
                  <>
                    <h3 style={{ ...styles.todoTitle, color: todo.completed ? "rgba(11,18,32,0.45)" : styles.todoTitle.color }}>{todo.description}</h3>
                    <div style={styles.todoMeta}>Created {formatDate(todo.created_at)}</div>
                  </>
                )}
              </div>

              <div style={styles.actions}>
                {editingId === todo._id ? (
                  <>
                    <button onClick={()=>commitEdit(todo._id)} style={{ ...styles.actionBtn, ...styles.actionBtnVisible, padding: "8px 12px", fontWeight: 700, color: "rgba(11,18,32,0.85)" }}>Save</button>
                    <button onClick={()=>setEditingId(null)} style={{ ...styles.actionBtn, padding: "8px 12px", background: "transparent" }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button title="Edit" onClick={()=>startEdit(todo)} style={{ ...styles.actionBtn, ...styles.actionBtnVisible, width: 44, height: 44 }}>
                      <Icon.Edit/> 
                    </button>
                    <button title="Delete" onClick={()=>askDelete(todo._id, todo.description)} style={{ ...styles.actionBtn, ...styles.actionBtnVisible, width: 44, height: 44 }}>
                      <Icon.Trash/>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={()=>setPage(p => clamp(p-1,1,pages))}
              disabled={page<=1}
              style={{ ...styles.pagerBtn, opacity: page<=1 ? 0.4 : 1, cursor: page<=1 ? "not-allowed" : "pointer" }}
            >
              Prev
            </button>
            <div style={styles.pagerInfo}>Page {page} of {pages}</div>
            <button
              onClick={()=>setPage(p => clamp(p+1,1,pages))}
              disabled={page>=pages}
              style={{ ...styles.pagerBtn, opacity: page>=pages ? 0.4 : 1, cursor: page>=pages ? "not-allowed" : "pointer" }}
            >
              Next
            </button>
          </div>

          <div>
            <button onClick={fetchTodos} style={{ ...styles.pagerBtn, marginLeft: 8 }}>Refresh</button>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div style={{ position: "fixed", right: 20, bottom: 20, display: "flex", flexDirection: "column", gap: 10, zIndex: 9999 }}>
        {toasts.toasts?.map(t => (
          <div key={t.id} style={{ minWidth: 220, padding: "10px 14px", borderRadius: 10, color: "white", background: t.type === "error" ? "#ef4444" : "#10b981" }} onClick={()=>toasts.remove(t.id)}>{t.msg}</div>
        ))}
      </div>

      {/* confirm modal */}
      {confirm && (
        <div
          style={styles.modalOverlay}
          // overlay captures clicks/keyboard. Escape handled globally in useEffect.
          onClick={(e) => { if (e.target === e.currentTarget) setConfirm(null); }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" style={styles.modal}>
            <div id="confirm-title" style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: "#071122" }}>
              Delete
            </div>

            <div style={{ marginBottom: 16, fontSize: 14, color: "#1f2937" }}>
              Delete <strong style={{ color: "#0b1220" }}>{`“${confirm.text}”`}</strong>?
              <div style={{ marginTop: 8, color: "#475569", fontSize: 13 }}>
                This action is permanent and will remove the task from storage.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setConfirm(null)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(11,18,32,0.12)",
                  background: "#ffffff",
                  color: "#0b1220",
                  cursor: "pointer",
                  minWidth: 90,
                }}
              >
                Cancel
              </button>

              <button
                onClick={doDelete}
                autoFocus
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  cursor: "pointer",
                  minWidth: 90,
                  boxShadow: "0 8px 20px rgba(239,68,68,0.18)"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
