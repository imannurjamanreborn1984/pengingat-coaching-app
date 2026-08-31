import { INITIAL_ROOTS_DATA } from '../data/rootsData';
import { supabase } from '../supabaseClient';

const STORAGE_KEYS = {
  CUSTOM_ROOTS: 'buku_saku_custom_roots_v1',
  BOOKMARKS: 'buku_saku_bookmarks_v1',
  JOURNALS: 'buku_saku_journals_v1',
};

export const DEFAULT_JOURNALS = [
  {
    id: 'journal-1',
    date: new Date().toISOString().split('T')[0],
    practiceType: 'dynamic_meditation',
    targetRootId: 'root-1',
    targetRootName: 'Akar Hayah (Vitalitas Murni)',
    durationMinutes: 15,
    energyLevelBefore: 2,
    energyLevelAfter: 5,
    somaticSensations: ['Dada terasa hangat', 'Nafas terasa lebih lapang', 'Kaki berakar kuat ke tanah'],
    notes: 'Melakukan latihan dynamic breathwork 3 siklus. Energi mengalir deras ke seluruh sel tubuh.',
    breakthroughInsights: 'Kelelahan selama ini bukan karena kekurangan tidur, melainkan karena pola nafas yang pendek dan menahan beban yang belum terjadi.',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'journal-2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    practiceType: 'khalwat',
    targetRootId: 'root-9',
    targetRootName: 'Akar Salam (Kedamaian Titik Hening)',
    durationMinutes: 25,
    energyLevelBefore: 3,
    energyLevelAfter: 4,
    somaticSensations: ['Detak jantung melambat', 'Bahu turun rileks', 'Pikiran hening'],
    notes: 'Duduk hening di sudut kamar tanpa gawai. Mengamati kekhawatiran yang bermunculan lalu menyerahkannya satu per satu ke titik nol.',
    breakthroughInsights: 'Kedamaian bukan berarti tidak ada masalah di luar, tapi ketiadaan perlawanan terhadap realitas saat ini.',
    createdAt: Date.now() - 86400000,
  }
];

export const DataService = {
  // --- ROOTS MANAGEMENT ---
  getRoots() {
    if (typeof window === 'undefined') return INITIAL_ROOTS_DATA;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROOTS);
      if (!stored) {
        return INITIAL_ROOTS_DATA;
      }
      const customOverrides = JSON.parse(stored);
      
      return INITIAL_ROOTS_DATA.map((root) => {
        if (customOverrides[root.id]) {
          return {
            ...root,
            ...customOverrides[root.id],
            sainsEpigenetika: [
              ...root.sainsEpigenetika,
              ...(customOverrides[root.id].sainsEpigenetika || []).filter(
                (c) => !root.sainsEpigenetika.some((o) => o.id === c.id)
              ),
            ],
            kitabKearifan: [
              ...root.kitabKearifan,
              ...(customOverrides[root.id].kitabKearifan || []).filter(
                (c) => !root.kitabKearifan.some((o) => o.id === c.id)
              ),
            ],
            popCultureFolklore: [
              ...root.popCultureFolklore,
              ...(customOverrides[root.id].popCultureFolklore || []).filter(
                (c) => !root.popCultureFolklore.some((o) => o.id === c.id)
              ),
            ],
          };
        }
        return root;
      });
    } catch (e) {
      console.error('Error fetching roots from storage:', e);
      return INITIAL_ROOTS_DATA;
    }
  },

  getRootById(id) {
    const all = this.getRoots();
    return all.find((r) => r.id === id || r.slug === id);
  },

  addPerspectiveToRoot(rootId, category, entry) {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROOTS);
      const customOverrides = stored ? JSON.parse(stored) : {};
      
      if (!customOverrides[rootId]) {
        customOverrides[rootId] = {
          sainsEpigenetika: [],
          kitabKearifan: [],
          popCultureFolklore: [],
        };
      }

      if (category === 'sains') {
        customOverrides[rootId].sainsEpigenetika = [
          ...(customOverrides[rootId].sainsEpigenetika || []),
          entry,
        ];
      } else if (category === 'kitab') {
        customOverrides[rootId].kitabKearifan = [
          ...(customOverrides[rootId].kitabKearifan || []),
          entry,
        ];
      } else if (category === 'popculture') {
        customOverrides[rootId].popCultureFolklore = [
          ...(customOverrides[rootId].popCultureFolklore || []),
          entry,
        ];
      }

      localStorage.setItem(STORAGE_KEYS.CUSTOM_ROOTS, JSON.stringify(customOverrides));
      return true;
    } catch (e) {
      console.error('Error adding perspective to root:', e);
      return false;
    }
  },

  resetRootsToDefault() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_ROOTS);
    }
  },

  // --- BOOKMARKS ---
  getBookmarks() {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(rootId) {
    const bookmarks = this.getBookmarks();
    let updated;
    let isBookmarkedNow = false;

    if (bookmarks.includes(rootId)) {
      updated = bookmarks.filter((id) => id !== rootId);
      isBookmarkedNow = false;
    } else {
      updated = [...bookmarks, rootId];
      isBookmarkedNow = true;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    }
    return isBookmarkedNow;
  },

  isBookmarked(rootId) {
    return this.getBookmarks().includes(rootId);
  },

  // --- JOURNALS ---
  getJournals() {
    if (typeof window === 'undefined') return DEFAULT_JOURNALS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOURNALS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(DEFAULT_JOURNALS));
        return DEFAULT_JOURNALS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading journals:', e);
      return DEFAULT_JOURNALS;
    }
  },

  saveJournal(entry) {
    const journals = this.getJournals();
    const newId = entry.id || `journal-${Date.now()}`;
    const newEntry = {
      ...entry,
      id: newId,
      createdAt: Date.now(),
    };

    const existingIndex = journals.findIndex((j) => j.id === newId);
    let updated;

    if (existingIndex >= 0) {
      updated = journals.map((j) => (j.id === newId ? newEntry : j));
    } else {
      updated = [newEntry, ...journals];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(updated));
    }
    return newEntry;
  },

  deleteJournal(id) {
    const journals = this.getJournals();
    const updated = journals.filter((j) => j.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(updated));
    }
  },

  exportAllDataJSON() {
    if (typeof window === 'undefined') return '{}';
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      customRoots: localStorage.getItem(STORAGE_KEYS.CUSTOM_ROOTS)
        ? JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_ROOTS))
        : {},
      journals: this.getJournals(),
      bookmarks: this.getBookmarks(),
    };
    return JSON.stringify(data, null, 2);
  },

  importDataJSON(jsonString) {
    if (typeof window === 'undefined') return false;
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.customRoots) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_ROOTS, JSON.stringify(parsed.customRoots));
      }
      if (parsed.journals && Array.isArray(parsed.journals)) {
        localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(parsed.journals));
      }
      if (parsed.bookmarks && Array.isArray(parsed.bookmarks)) {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(parsed.bookmarks));
      }
      return true;
    } catch (e) {
      console.error('Failed to import data JSON:', e);
      return false;
    }
  },
};
