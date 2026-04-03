import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";

function FormulasPage({ formulas, onAddSheet, onDeleteSheet, onAddSection, onDeleteSection, onAddItem, onDeleteItem, onUpdateItem }) {
  const [newSheetTitle, setNewSheetTitle] = useState("");
  const [activeSheetId, setActiveSheetId] = useState(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [collapsedSections, setCollapsedSections] = useState({});
  const [newItemText, setNewItemText] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState("");

  const activeSheet = formulas.find((s) => s.id === activeSheetId) ?? formulas[0] ?? null;

  function handleAddSheet(e) {
    e.preventDefault();
    if (!newSheetTitle.trim()) return;
    onAddSheet(newSheetTitle.trim());
    setNewSheetTitle("");
  }

  function handleAddSection(e) {
    e.preventDefault();
    if (!newSectionTitle.trim() || !activeSheet) return;
    onAddSection(activeSheet.id, newSectionTitle.trim());
    setNewSectionTitle("");
  }

  function handleAddItem(e, sectionId) {
    e.preventDefault();
    const text = newItemText[sectionId] ?? "";
    if (!text.trim() || !activeSheet) return;
    onAddItem(activeSheet.id, sectionId, text.trim());
    setNewItemText((prev) => ({ ...prev, [sectionId]: "" }));
  }

  function toggleSection(sectionId) {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>📝 Formula &amp; Cheat Sheets</h2>
      </div>

      <div className="formulas-layout">
        {/* Sheet list */}
        <aside className="formulas-sidebar">
          <form className="stack-form" onSubmit={handleAddSheet}>
            <input
              value={newSheetTitle}
              onChange={(e) => setNewSheetTitle(e.target.value)}
              placeholder="New sheet (e.g. Physics)"
            />
            <button type="submit" className="ghost-button"><Plus size={13} /> New Sheet</button>
          </form>
          <div className="list-block">
            {formulas.map((sheet) => (
              <div key={sheet.id} className="fc-set-row">
                <button
                  type="button"
                  className={`list-item ${sheet.id === activeSheet?.id ? "is-active" : ""}`}
                  onClick={() => setActiveSheetId(sheet.id)}
                >
                  <strong>{sheet.title}</strong>
                  <span>{sheet.sections.length} sections</span>
                </button>
                <button type="button" className="icon-danger-btn" onClick={() => onDeleteSheet(sheet.id)} title="Delete sheet">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {!formulas.length && <p className="muted">No sheets yet.</p>}
          </div>
        </aside>

        {/* Sheet content */}
        <main className="formulas-main">
          {activeSheet ? (
            <>
              <div className="formulas-sheet-header">
                <h3>{activeSheet.title}</h3>
                <form className="inline-form" onSubmit={handleAddSection}>
                  <input
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="New section (e.g. Kinematics)"
                  />
                  <button type="submit" className="ghost-button"><Plus size={13} /> Add Section</button>
                </form>
              </div>

              {activeSheet.sections.length === 0 && (
                <p className="muted">Add sections to organize your formulas and key terms.</p>
              )}

              {activeSheet.sections.map((section) => (
                <div key={section.id} className="formula-section">
                  <div className="formula-section__header" onClick={() => toggleSection(section.id)}>
                    {collapsedSections[section.id] ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                    <strong>{section.title}</strong>
                    <span className="muted">{section.items.length} entries</span>
                    <button
                      type="button"
                      className="icon-danger-btn"
                      onClick={(e) => { e.stopPropagation(); onDeleteSection(activeSheet.id, section.id); }}
                      title="Delete section"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {!collapsedSections[section.id] && (
                    <div className="formula-section__body">
                      {section.items.map((item) => (
                        <div key={item.id} className="formula-item">
                          {editingItem === item.id ? (
                            <div className="formula-item__edit">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={2}
                              />
                              <div className="fc-edit-actions">
                                <button type="button" className="accent-button" onClick={() => { onUpdateItem(activeSheet.id, section.id, item.id, editText); setEditingItem(null); }}>Save</button>
                                <button type="button" className="ghost-button" onClick={() => setEditingItem(null)}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="formula-item__view">
                              <pre className="formula-item__text">{item.text}</pre>
                              <div className="formula-item__actions">
                                <button type="button" className="icon-btn" onClick={() => { setEditingItem(item.id); setEditText(item.text); }} title="Edit">✏️</button>
                                <button type="button" className="icon-danger-btn" onClick={() => onDeleteItem(activeSheet.id, section.id, item.id)} title="Delete"><Trash2 size={12} /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <form className="inline-form" onSubmit={(e) => handleAddItem(e, section.id)}>
                        <input
                          value={newItemText[section.id] ?? ""}
                          onChange={(e) => setNewItemText((prev) => ({ ...prev, [section.id]: e.target.value }))}
                          placeholder="Add formula, term, or note…"
                        />
                        <button type="submit" className="ghost-button"><Plus size={13} /> Add</button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="fc-empty-study">
              <p className="muted">Create a sheet to get started.</p>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

export default FormulasPage;
