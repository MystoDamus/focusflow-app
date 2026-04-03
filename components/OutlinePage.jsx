import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function OutlineNode({ node, depth, onUpdate, onDelete, onAdd, onIndent, onDedent }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);

  function commitEdit() {
    if (editText.trim()) onUpdate(node.id, editText.trim());
    setEditing(false);
  }

  const indentLeft = depth * 24;

  return (
    <div className="outline-node" style={{ marginLeft: indentLeft }}>
      <div className="outline-node__row">
        <button type="button" className="icon-btn" title="Dedent" onClick={() => onDedent(node.id)} disabled={depth === 0}>
          <ArrowLeft size={14} />
        </button>
        <button type="button" className="icon-btn" title="Indent" onClick={() => onIndent(node.id)}>
          <ArrowRight size={14} />
        </button>
        {editing ? (
          <input
            className="outline-node__input"
            value={editText}
            autoFocus
            onChange={(e) => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); }}
          />
        ) : (
          <span className={`outline-node__text outline-node__text--d${Math.min(depth, 3)}`} onClick={() => { setEditing(true); setEditText(node.text); }}>
            {node.text || <em className="muted">click to edit</em>}
          </span>
        )}
        <div className="outline-node__actions">
          <button type="button" className="icon-btn" title="Add node below" onClick={() => onAdd(node.id)}>
            <Plus size={14} />
          </button>
          <button type="button" className="icon-danger-btn" title="Delete" onClick={() => onDelete(node.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function OutlinePage({ outlines, onAddOutline, onDeleteOutline, onAddNode, onDeleteNode, onUpdateNode, onIndentNode, onDedentNode }) {
  const [selectedId, setSelectedId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const selected = outlines.find((o) => o.id === selectedId) ?? null;

  function handleAddOutline(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const id = genId();
    onAddOutline(id, newTitle.trim());
    setSelectedId(id);
    setNewTitle("");
  }

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>🗺 Outline Builder</h2>
      </div>
      <div className="formulas-layout">
        {/* Sidebar */}
        <aside className="formulas-sidebar">
          <div className="panel">
            <h3>Outlines</h3>
            <form className="inline-form" onSubmit={handleAddOutline} style={{ marginBottom: 10 }}>
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New outline title" />
              <button type="submit" className="accent-button">+</button>
            </form>
            {outlines.length === 0 && <p className="muted">No outlines yet.</p>}
            {outlines.map((o) => (
              <div key={o.id} className={`fc-set-row ${o.id === selectedId ? "is-active-row" : ""}`}>
                <button type="button" className="set-select-btn" onClick={() => setSelectedId(o.id)}>{o.title}</button>
                <button type="button" className="icon-danger-btn" onClick={() => { onDeleteOutline(o.id); if (selectedId === o.id) setSelectedId(null); }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="formulas-main">
          {!selected && (
            <div className="panel">
              <p className="muted">Select or create an outline to get started.</p>
            </div>
          )}
          {selected && (
            <article className="panel">
              <div className="formulas-sheet-header">
                <h3>{selected.title}</h3>
                <button type="button" className="accent-button" onClick={() => onAddNode(selected.id, null)}>
                  + Add Node
                </button>
              </div>
              {selected.nodes.length === 0 && <p className="muted">Add your first node above.</p>}
              {selected.nodes.map((node) => (
                <OutlineNode
                  key={node.id}
                  node={node}
                  depth={node.depth ?? 0}
                  onUpdate={(id, text) => onUpdateNode(selected.id, id, text)}
                  onDelete={(id) => onDeleteNode(selected.id, id)}
                  onAdd={(afterId) => onAddNode(selected.id, afterId)}
                  onIndent={(id) => onIndentNode(selected.id, id)}
                  onDedent={(id) => onDedentNode(selected.id, id)}
                />
              ))}
            </article>
          )}
        </main>
      </div>
    </section>
  );
}

export default OutlinePage;
