export const SUPER_ADMIN_EMAILS = [
  'imannurjamanreborn@gmail.com',
  'imannurjaman84@gmail.com',
  'imannnurjanan84@gmail.com',
  'imannurjaman@gmail.com',
  'lautanmahabbah@gmail.com',
  'anggrek1720@gmail.com',
  'admin@nptcentre.id',
  'admin@neuroprogrammingtraining.id',
  'admin@npt.com'
];

export const NPT_LEVEL_CONFIG = {
  1: {
    level: 1,
    name: 'Nafas & Relaksasi Dasar',
    subtitle: 'Fondasi Kesadaran Pikiran & Jiwa',
    focus: 'Fondasi Kesadaran Pikiran & Jiwa',
    desc: 'Membangun kesadaran awal, reprogram pola pikir bawah sadar, dan pembersihan hambatan mental.',
    icon: '🌬️'
  },
  2: {
    level: 2,
    name: 'Olah Energi & Somatik',
    subtitle: 'Penyembuhan Emosi & Self-Discovery',
    focus: 'Penyembuhan Emosi & Self-Discovery',
    desc: 'Melepaskan trauma masa lalu, rekonsiliasi batin, dan membangkitkan potensi energi internal.',
    icon: '⚡'
  },
  3: {
    level: 3,
    name: 'Power & Transcendental',
    subtitle: 'Energy & Mental Mastery',
    focus: 'Energy & Mental Mastery',
    desc: 'Penguasaan fokus, sinkronisasi gelombang otak alfa-teta, dan pemrograman niat.',
    icon: '🔥'
  },
  4: {
    level: 4,
    name: 'Self Mastery & Mindset',
    subtitle: 'Spiritual Alignment & Higher Consciousness',
    focus: 'Spiritual Alignment & Higher Consciousness',
    desc: 'Menyelaraskan orientasi hidup dengan nilai ketuhanan dan ketenangan spiritual mendalam.',
    icon: '🧠'
  },
  5: {
    level: 5,
    name: 'Higher State Awareness & 14 Akar Spiritual',
    subtitle: 'Cosmic Awareness, Sufistic Mindset & Fondasi 14 Akar Spiritual',
    focus: 'Cosmic Awareness, Sufistic Mindset & Pembahasan 14 Akar Spiritual (Menuju Level 6)',
    desc: 'Kematangan pandangan kosmik, kepasrahan total, kesadaran hakikat keberadaan, serta pembahasan 14 Akar Spiritualitas menuju Level 6.',
    icon: '👁️'
  },
  6: {
    level: 6,
    name: 'Mastery & Integrasi 14 Akar Spiritualitas',
    subtitle: 'Pendalaman Lanjutan 14 Akar Spiritualitas & Penugasan',
    focus: 'Mastery 14 Akar Spiritualitas, Praktik Lanjutan & Penugasan',
    desc: 'Pendalaman komprehensif 14 Akar Spiritualitas, monitoring latihan harian, dan pembinaan coaching intensif Level 6.',
    icon: '🌿'
  }
};

/**
 * Simpan identitas perangkat secara permanen (LocalStorage + Cookie 10 Tahun)
 * Cukup 1x login/registrasi per perangkat (HP/Laptop).
 */
export function savePermanentDeviceUser(userData) {
  if (typeof window === 'undefined' || !userData) return;
  try {
    const normalized = {
      ...userData,
      name: userData.name || userData.full_name || (userData.email ? userData.email.split('@')[0] : 'Member NPT'),
      status: userData.status || 'approved'
    };
    const jsonStr = JSON.stringify(normalized);
    localStorage.setItem('npt_user_auth', jsonStr);
    if (normalized.name) {
      localStorage.setItem('participant_name', normalized.name);
    }
    // Cookie 10 tahun (315.360.000 detik)
    document.cookie = `npt_device_auth=${encodeURIComponent(jsonStr)}; path=/; max-age=315360000; SameSite=Lax`;
  } catch (e) {}
}

/**
 * Ambil identitas perangkat yang tersimpan dari LocalStorage atau Cookie 10 Tahun.
 */
export function getSavedDeviceUser() {
  if (typeof window === 'undefined') return null;
  try {
    const savedAuth = localStorage.getItem('npt_user_auth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      // Pastikan cookie juga selalu sinkron
      document.cookie = `npt_device_auth=${encodeURIComponent(savedAuth)}; path=/; max-age=315360000; SameSite=Lax`;
      return parsed;
    }

    const match = document.cookie.match(/(?:^|; )npt_device_auth=([^;]*)/);
    if (match && match[1]) {
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      localStorage.setItem('npt_user_auth', JSON.stringify(parsed));
      if (parsed.name) {
        localStorage.setItem('participant_name', parsed.name);
      }
      return parsed;
    }
  } catch (e) {}
  return null;
}

/**
 * Hapus identitas perangkat hanya jika user sengaja menekan tombol Keluar / Ganti Akun.
 */
export function clearPermanentDeviceUser() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('npt_user_auth');
    localStorage.removeItem('participant_name');
    document.cookie = 'npt_device_auth=; path=/; max-age=0; SameSite=Lax';
  } catch (e) {}
}

/**
 * Sinkronisasi otomatis status approval dari Supabase berdasarkan email/WA yang tersimpan di perangkat.
 * Jika akun sebelumnya 'pending' lalu di-approve Admin, perangkat otomatis berubah jadi 'approved' tanpa login ulang!
 */
export async function syncDeviceUserApproval(supabaseClient, existingUser = null) {
  const localUser = existingUser || getSavedDeviceUser();
  if (!localUser || !supabaseClient) return localUser;

  const cleanEmail = (localUser.email || '').trim().toLowerCase();
  const cleanPhone = (localUser.phone_number || '').replace(/[^0-9]/g, '');

  if (cleanEmail && SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
    const adminUser = {
      ...localUser,
      role: 'super_admin',
      status: 'approved'
    };
    savePermanentDeviceUser(adminUser);
    return adminUser;
  }

  if (!cleanEmail && !cleanPhone) return localUser;

  try {
    let query = supabaseClient.from('profiles').select('*');
    if (cleanEmail && cleanPhone) {
      query = query.or(`email.eq.${cleanEmail},phone_number.eq.${cleanPhone}`);
    } else if (cleanEmail) {
      query = query.eq('email', cleanEmail);
    } else {
      query = query.eq('phone_number', cleanPhone);
    }

    const { data: profiles } = await query;
    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

    if (profile) {
      const updatedUser = {
        ...localUser,
        id: profile.id || localUser.id,
        email: profile.email || cleanEmail || localUser.email,
        phone_number: profile.phone_number || cleanPhone || localUser.phone_number,
        name: profile.full_name || localUser.name,
        role: profile.role || localUser.role || 'member',
        status: profile.status || localUser.status || 'approved'
      };
      savePermanentDeviceUser(updatedUser);
      return updatedUser;
    }
  } catch (e) {}

  return localUser;
}

/**
 * Parse role string into explicit array of granted NPT levels (1-6) and EMT access.
 * Supports:
 * - 'super_admin' -> levels [1,2,3,4,5,6], hasEmt: true
 * - 'npt_all' -> levels [1,2,3,4,5,6], hasEmt: true
 * - 'npt_1,npt_5' -> levels [1,5], hasEmt: false
 * - 'npt_5' -> levels [5], hasEmt: false
 * - 'emt' -> levels [], hasEmt: true
 * - 'emt,npt_1,npt_5' -> levels [1,5], hasEmt: true
 */
export function parseGrantedLevels(role) {
  if (!role) return { levels: [1], hasEmt: false, isAll: false, isSuperAdmin: false };
  const r = String(role).trim().toLowerCase();
  if (r === 'super_admin' || r === 'admin') {
    return { levels: [1, 2, 3, 4, 5, 6], hasEmt: true, isAll: true, isSuperAdmin: true };
  }
  if (r === 'npt_all') {
    return { levels: [1, 2, 3, 4, 5, 6], hasEmt: true, isAll: true, isSuperAdmin: false };
  }

  const tokens = r.split(',').map((t) => t.trim()).filter(Boolean);
  const levelsSet = new Set();
  let hasEmt = false;

  for (const t of tokens) {
    if (t === 'npt_all') {
      [1, 2, 3, 4, 5, 6].forEach((lvl) => levelsSet.add(lvl));
      hasEmt = true;
    } else if (t === 'emt') {
      hasEmt = true;
    } else if (t.startsWith('npt_')) {
      const num = parseInt(t.replace('npt_', ''), 10);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        levelsSet.add(num);
      }
    } else if (t === 'member') {
      levelsSet.add(1);
    }
  }

  const sortedLevels = Array.from(levelsSet).sort((a, b) => a - b);
  const isAll = sortedLevels.length === 6;

  return {
    levels: sortedLevels,
    hasEmt,
    isAll,
    isSuperAdmin: false
  };
}

/**
 * Serialize an array of level/role keys back into a compact role string for database storage
 * @param {string[]} selectedKeys e.g. ['npt_1', 'npt_5'] or ['npt_5', 'emt']
 * @returns {string} e.g. 'npt_1,npt_5' or 'npt_all'
 */
export function serializeLevelsToRole(selectedKeys) {
  if (!selectedKeys || !Array.isArray(selectedKeys) || selectedKeys.length === 0) {
    return 'npt_1';
  }
  const keys = Array.from(new Set(selectedKeys.filter(Boolean)));
  if (keys.includes('super_admin')) return 'super_admin';

  const nptLevels = keys
    .filter((k) => k.startsWith('npt_'))
    .map((k) => parseInt(k.replace('npt_', ''), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 6)
    .sort((a, b) => a - b);

  const hasEmt = keys.includes('emt');
  const isAll = nptLevels.length === 6;

  if (isAll && hasEmt) return 'npt_all,emt';
  if (isAll) return 'npt_all';

  const parts = nptLevels.map((n) => `npt_${n}`);
  if (hasEmt) parts.push('emt');

  return parts.length > 0 ? parts.join(',') : 'npt_1';
}

export function parseUserAccess(user) {
  if (!user) {
    return {
      isLoggedIn: false,
      isApproved: false,
      isSuperAdmin: false,
      program: 'guest',
      maxLevel: 0,
      allowedLevels: [],
      hasEmtAccess: false,
      canAccessNptLevel: () => false,
      badgeText: 'Tamu / Pengunjung'
    };
  }

  const role = (user.role || '').toLowerCase().trim();
  const email = (user.email || '').toLowerCase().trim();
  const isSuperAdmin = role === 'super_admin' || SUPER_ADMIN_EMAILS.includes(email);

  if (isSuperAdmin) {
    return {
      isLoggedIn: true,
      isApproved: true,
      isSuperAdmin: true,
      program: 'all',
      maxLevel: 6,
      allowedLevels: [1, 2, 3, 4, 5, 6],
      hasEmtAccess: true,
      canAccessNptLevel: () => true,
      badgeText: '👑 Super Admin VIP'
    };
  }

  // Catatan Khusus: Jika member sudah berstatus 'approved'
  const isApproved = user.status === 'approved' || (!user.status && Boolean(user.email || user.phone_number || user.name));

  const granted = parseGrantedLevels(role);
  const allowedLevels = granted.levels;
  const hasEmtAccess = granted.hasEmt || granted.isAll;
  const maxLevel = allowedLevels.length > 0 ? Math.max(...allowedLevels) : (hasEmtAccess ? 0 : 1);

  // Badge Text
  let badgeText = '⏳ Menunggu Persetujuan Admin';
  if (isApproved) {
    if (granted.isAll) {
      badgeText = '⭐ NPT Semua Level (1 - 6)';
    } else if (allowedLevels.length === 0 && hasEmtAccess) {
      badgeText = '🎓 Member EMT Terverifikasi';
    } else if (allowedLevels.length === 1) {
      badgeText = `⭐ Member NPT Level ${allowedLevels[0]}`;
    } else if (allowedLevels.length > 1) {
      badgeText = `⭐ NPT Level ${allowedLevels.join(', ')}${hasEmtAccess ? ' + EMT' : ''}`;
    } else {
      badgeText = '⭐ Member NPT Terverifikasi';
    }
  }

  return {
    isLoggedIn: true,
    isApproved,
    isSuperAdmin: false,
    program: hasEmtAccess && allowedLevels.length === 0 ? 'emt' : 'npt',
    maxLevel,
    allowedLevels,
    hasEmtAccess,
    canAccessNptLevel: (targetLevel) => {
      if (!isApproved) return false;
      if (isSuperAdmin || granted.isAll) return true;
      const target = Number(targetLevel);
      return allowedLevels.includes(target);
    },
    badgeText
  };
}

export function formatRoleLabel(role) {
  if (!role) return 'Member';
  const r = role.toLowerCase().trim();
  if (r === 'super_admin') return '👑 Super Admin';
  if (r === 'npt_all') return '⭐ Semua Level (1 - 6)';
  if (r === 'emt') return '🎓 EMT Guru';

  const granted = parseGrantedLevels(role);
  if (granted.isAll) return '⭐ Semua Level (1 - 6)';
  if (granted.levels.length === 0 && granted.hasEmt) return '🎓 EMT Guru';
  
  const parts = [];
  if (granted.levels.length > 0) {
    if (granted.levels.length === 1) {
      const lvl = granted.levels[0];
      const cfg = NPT_LEVEL_CONFIG[lvl];
      parts.push(`🏛️ Level ${lvl}${cfg ? `: ${cfg.name}` : ''}`);
    } else {
      parts.push(`🏛️ Level ${granted.levels.join(', ')}`);
    }
  }
  if (granted.hasEmt) {
    parts.push('🎓 EMT');
  }

  return parts.length > 0 ? parts.join(' + ') : 'Member';
}
