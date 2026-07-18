// App.tsx
import { useEffect, useState } from 'react';
import { getLessons, deleteLesson, saveLesson, updateLesson } from '../utils/storage';
import type { Lesson } from '../types';

export default function App() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Modal states
  const [infoModalLesson, setInfoModalLesson] = useState<Lesson | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [globalInterval, setGlobalInterval] = useState('daily');
  // Edit state
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Form States (Used for both Add and Edit)
  const [formText, setFormText] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formCategory, setFormCategory] = useState("");

  // Load the saved setting when the extension opens
  // Load the saved setting when the extension opens
  useEffect(() => {
    chrome.storage.local.get("settings").then((res) => {
      // Tell TypeScript exactly what shape this object is to remove the red line
      const data = res as { settings?: { globalInterval: string } };
      if (data.settings && data.settings.globalInterval) {
        setGlobalInterval(data.settings.globalInterval);
      }
    });
  }, []);

  // Function to handle changing the setting
  const handleIntervalChange = (newInterval: string) => {
    setGlobalInterval(newInterval);
    chrome.storage.local.set({ settings: { globalInterval: newInterval } });
  };

  // Load lessons on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getLessons();
    const sortedData = data.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setLessons(sortedData);
  };

  const handleDelete = async (id: string) => {
    await deleteLesson(id);
    setInfoModalLesson(null);
    await loadData();
  };

  const openAddModal = () => {
    setFormText("");
    setFormNote("");
    setFormCategory("");
    setIsAddingLesson(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setFormText(lesson.lessonText);
    setFormNote(lesson.personalNote || "");
    setFormCategory(lesson.category);
    setEditingLesson(lesson);
    setInfoModalLesson(null); // Close the info modal to show the edit modal
  };

  const handleSave = async () => {
    if (!formText.trim()) return;

    if (editingLesson) {
      // UPDATE EXISTING
      const updated: Lesson = {
        ...editingLesson,
        lessonText: formText.trim(),
        personalNote: formNote.trim(),
        category: formCategory.trim() || "Other"
      };
      await updateLesson(updated);
      setEditingLesson(null);
    } else {
      // CREATE NEW
      const newLesson: Lesson = {
        id: crypto.randomUUID(),
        lessonText: formText.trim(),
        personalNote: formNote.trim(),
        category: formCategory.trim() || "Other",
        tags: [],
        source: { title: "Manual Entry", url: "", domain: "local" },
        createdAt: new Date().toISOString(),
        reminder: { enabled: true, nextReminderAt: new Date().toISOString(), reminderInterval: "daily", isCurrentlyShowing: false },
        reflection: { hasReflected: false, hasActed: false, lastReflection: null, lastAction: null },
        archived: false
      };
      await saveLesson(newLesson);
      setIsAddingLesson(false);
    }

    await loadData();
  };

  // Filter lessons based on search and category
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.lessonText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.personalNote && lesson.personalNote.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === "All" || lesson.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(lessons.map(l => l.category)))];

  return (
    <div style={{
      width: '400px', height: '550px', backgroundColor: '#0D0D12', color: '#E2E8F0',
      fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative'
    }}>
      {/* HEADER */}
      <header style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00C2FF' }}></div>
            <h1 style={{ margin: 0, fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', color: '#94A3B8' }}>REMIND</h1>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#E2E8F0'}
            onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>

        <input
          type="text" placeholder="Search your lessons..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', backgroundColor: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#E2E8F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 12px', backgroundColor: activeCategory === cat ? '#00C2FF' : 'transparent',
                color: activeCategory === cat ? '#0D0D12' : '#94A3B8', border: `1px solid ${activeCategory === cat ? '#00C2FF' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '16px', fontSize: '12px', fontWeight: activeCategory === cat ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* LESSON LIST */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
        {filteredLessons.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', marginTop: '40px', fontSize: '14px' }}>No lessons found.</div>
        ) : (
          filteredLessons.map(lesson => (
            <div key={lesson.id} style={{ backgroundColor: '#1A1A24', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px', position: 'relative' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.6', color: '#FFFFFF' }}>"{lesson.lessonText}"</p>
              {lesson.personalNote && (
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', lineHeight: '1.5', color: '#94A3B8', fontStyle: 'italic' }}>{lesson.personalNote}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lesson.category}</span>
                <button onClick={() => setInfoModalLesson(lesson)} title="Source Information" style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>ⓘ</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD LESSON BUTTON */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'linear-gradient(to top, #0D0D12 80%, transparent)', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={openAddModal}
          style={{
            backgroundColor: '#00C2FF', color: '#0D0D12', border: 'none', borderRadius: '24px', padding: '10px 24px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 194, 255, 0.2)',
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Add Lesson
        </button>
      </div>

      {/* ADD / EDIT LESSON MODAL */}
      {(isAddingLesson || editingLesson) && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(13, 13, 18, 0.85)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 20
        }}>
          <div style={{
            backgroundColor: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px',
            width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '14px', color: '#FFFFFF' }}>{editingLesson ? 'Edit Lesson' : 'New Lesson'}</h2>
              <button onClick={() => { setIsAddingLesson(false); setEditingLesson(null); }} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
            </div>

            <textarea
              placeholder="What do you want to remember?" value={formText} onChange={(e) => setFormText(e.target.value)}
              style={{ width: '100%', height: '80px', padding: '12px', backgroundColor: '#0D0D12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#E2E8F0', fontSize: '14px', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
              autoFocus
            />

            <input
              type="text" placeholder="Personal note (optional)" value={formNote} onChange={(e) => setFormNote(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0D0D12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />

            <input
              type="text" placeholder="Category (e.g. Discipline)" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0D0D12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />

            <button
              onClick={handleSave} disabled={!formText.trim()}
              style={{
                width: '100%', padding: '12px', backgroundColor: formText.trim() ? '#00C2FF' : '#2A2A35',
                color: formText.trim() ? '#0D0D12' : '#94A3B8', border: 'none', borderRadius: '8px',
                cursor: formText.trim() ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', marginTop: '4px'
              }}
            >
              {editingLesson ? 'Save Changes' : 'Save Lesson'}
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(13, 13, 18, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 20 }}>
          <div style={{ backgroundColor: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '14px', color: '#FFFFFF' }}>Settings</h2>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
            </div>
            {/* Replace everything below the Settings header with this: */}
            <div style={{ padding: '4px 0' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0', margin: '0 0 8px 0' }}>Global Reminder Settings</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                Set how often your lessons should resurface after you reflect on them. This applies to all lessons automatically.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>Reminder Interval</label>
                <select
                  value={globalInterval}
                  onChange={(e) => handleIntervalChange(e.target.value)}
                  style={{
                    backgroundColor: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0',
                    fontSize: '13px', borderRadius: '8px', width: '100%', padding: '10px', outline: 'none',
                    boxSizing: 'border-box', cursor: 'pointer', appearance: 'auto'
                  }}
                >
                  <option value="daily">Every Day</option>
                  <option value="2days">Every 2 Days</option>
                  <option value="weekly">Once a Week</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INFO MODAL */}
      {infoModalLesson && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(13, 13, 18, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 10 }}>
          <div style={{ backgroundColor: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '14px', color: '#FFFFFF' }}>Source Details</h2>
              <button onClick={() => setInfoModalLesson(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div><div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>ORIGINAL PAGE</div><div style={{ fontSize: '13px', color: '#E2E8F0', wordBreak: 'break-word' }}>{infoModalLesson.source.title}</div></div>
              <div><div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>DOMAIN</div><div style={{ fontSize: '13px', color: '#00C2FF' }}>{infoModalLesson.source.domain}</div></div>
              <div><div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>SAVED ON</div><div style={{ fontSize: '13px', color: '#E2E8F0' }}>{new Date(infoModalLesson.createdAt).toLocaleDateString()}</div></div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                onClick={() => openEditModal(infoModalLesson)}
                style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#E2E8F0', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(infoModalLesson.id)}
                style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}
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