import { useState } from "react";
import { Plus, Search, Pin, Trash2, FileText } from "lucide-react";

function NotesPage({ notesData, activeSubjectKey, onAddNote, onDeleteNote, onUpdateNote, onTogglePin, onToggleTag }) {
  const notes = notesData?.items ?? [];
  const [searchText, setSearchText] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [filterTag, setFilterTag] = useState(null);
  const [newTag, setNewTag] = useState("");

  const allTags = [...new Set(notes.flatMap((n) => n.tags ?? []))];

  const filteredNotes = notes
    .filter((n) => {
      const matchSearch =
        !searchText ||
        n.title.toLowerCase().includes(searchText.toLowerCase()) ||
        n.body.toLowerCase().includes(searchText.toLowerCase());
      const matchTag = !filterTag || (n.tags ?? []).includes(filterTag);
      return matchSearch && matchTag;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const selectedNote = notes.find((n) => n.id === selectedId);

  function selectNote(note) {
    setSelectedId(note.id);
    setEditTitle(note.title);
    setEditBody(note.body);
  }

  function saveNote() {
    if (!selectedId) return;
    onUpdateNote(selectedId, { title: editTitle, body: editBody });
  }

  function createNew() {
    const newNote = {
      id: `note-${Date.now()}`,
      title: "New Note",
      body: "",
      subjectKey: activeSubjectKey ?? "alchemy",
      tags: [],
      pinned: false,
      createdAt: new Date().toISOString().split("T")[0],
    };
    onAddNote(newNote);
    setSelectedId(newNote.id);
    setEditTitle("New Note");
    setEditBody("");
  }

  function handleAddTag(event) {
    event.preventDefault();
    if (!newTag.trim() || !selectedId) return;
    onToggleTag(selectedId, newTag.trim());
    setNewTag("");
  }

  const SUBJECT_COLOR = { alchemy: "#7c3aed", chronicles: "#0d9488", mechanics: "#dc2626" };

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>Guild Notes</h2>
        <button type="button" className="accent-button" onClick={createNew}>
          <Plus size={14} /> New Note
        </button>
      </div>

      <div className="notes-layout">
        <div className="notes-list-panel panel">
          <div className="notes-search-wrap">
            <Search size={14} className="notes-search-icon" />
            <input
              className="notes-search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search notes…"
            />
          </div>

          {allTags.length > 0 && (
            <div className="notes-tag-filters">
              <button
                type="button"
                className={`tag-filter-btn ${!filterTag ? "is-active" : ""}`}
                onClick={() => setFilterTag(null)}
              >
                All
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`tag-filter-btn ${filterTag === t ? "is-active" : ""}`}
                  onClick={() => setFilterTag(filterTag === t ? null : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="notes-list">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                className={`notes-list-item ${selectedId === note.id ? "is-active" : ""}`}
                onClick={() => selectNote(note)}
              >
                <div className="notes-item-top">
                  <span
                    className="notes-subject-dot"
                    style={{ background: SUBJECT_COLOR[note.subjectKey] ?? "#7c3aed" }}
                  />
                  <strong className="notes-item-title">{note.title || "Untitled"}</strong>
                  {note.pinned && <Pin size={11} className="notes-pin-icon" />}
                </div>
                <span className="notes-item-preview">
                  {note.body.slice(0, 70) || "Empty note…"}
                </span>
                {(note.tags ?? []).length > 0 && (
                  <div className="notes-item-tags">
                    {note.tags.slice(0, 3).map((t) => (
                      <span key={t} className="note-tag-mini">{t}</span>
                    ))}
                  </div>
                )}
              </button>
            ))}
            {filteredNotes.length === 0 && (
              <p className="muted" style={{ padding: "12px" }}>
                {searchText ? "No notes match your search." : "No notes yet. Create one!"}
              </p>
            )}
          </div>
        </div>

        <div className="notes-editor-panel panel">
          {selectedNote ? (
            <>
              <div className="notes-editor-header">
                <input
                  className="notes-title-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={saveNote}
                  placeholder="Note title"
                />
                <div className="notes-editor-actions">
                  <button
                    type="button"
                    className={`ghost-button icon-btn ${selectedNote.pinned ? "is-active" : ""}`}
                    onClick={() => onTogglePin(selectedNote.id)}
                    title={selectedNote.pinned ? "Unpin note" : "Pin note"}
                  >
                    <Pin size={15} />
                  </button>
                  <button
                    type="button"
                    className="ghost-button icon-btn"
                    onClick={() => {
                      onDeleteNote(selectedNote.id);
                      setSelectedId(null);
                    }}
                    title="Delete note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <textarea
                className="notes-body-textarea"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                onBlur={saveNote}
                placeholder="Start writing your notes here…"
              />

              <div className="notes-tags-row">
                {(selectedNote.tags ?? []).map((t) => (
                  <span key={t} className="note-tag">
                    {t}
                    <button type="button" className="note-tag-remove" onClick={() => onToggleTag(selectedNote.id, t)}>
                      ×
                    </button>
                  </span>
                ))}
                <form className="note-add-tag-form" onSubmit={handleAddTag}>
                  <input
                    className="note-tag-input"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="+ tag"
                  />
                </form>
              </div>

              <div className="notes-meta">
                <span className="muted">Created {selectedNote.createdAt}</span>
                <span className="muted">{selectedNote.subjectKey}</span>
              </div>
            </>
          ) : (
            <div className="notes-empty-state">
              <FileText size={52} opacity={0.15} />
              <p>Select a note to start editing, or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default NotesPage;
