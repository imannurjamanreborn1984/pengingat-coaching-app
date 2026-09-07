export const SUPER_ADMIN_EMAILS = [
  'imannurjamanreborn@gmail.com',
  'imannurjaman84@gmail.com',
  'imannnurjanan84@gmail.com',
  'imannurjaman@gmail.com',
  'lautanmahabbah@gmail.com',
  'admin@nptcentre.id',
  'admin@neuroprogrammingtraining.id',
  'admin@npt.com'
];

export const NPT_LEVEL_CONFIG = {
  1: { level: 1, name: 'Nafas & Relaksasi Dasar', icon: '🌬️' },
  2: { level: 2, name: 'Olah Energi & Somatik', icon: '⚡' },
  3: { level: 3, name: 'Power & Transcendental', icon: '🔥' },
  4: { level: 4, name: 'Self Mastery & Mindset', icon: '🧠' },
  5: { level: 5, name: 'Higher State Awareness', icon: '👁️' },
  6: { level: 6, name: '14 Akar Spiritualitas & Integrasi', icon: '🌿' }
};

export function parseUserAccess(user) {
  if (!user) {
    return {
      isLoggedIn: false,
      isApproved: false,
      isSuperAdmin: false,
      program: 'guest',
      maxLevel: 0,
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
      hasEmtAccess: true,
      canAccessNptLevel: (targetLevel) => true,
      badgeText: '👑 Super Admin VIP'
    };
  }

  const isApproved = user.status === 'approved';

  let program = 'npt';
  let maxLevel = 1;
  let hasEmtAccess = false;

  if (role === 'emt') {
    program = 'emt';
    maxLevel = 0;
    hasEmtAccess = true;
  } else if (role.startsWith('npt_')) {
    program = 'npt';
    const lvlNum = parseInt(role.replace('npt_', ''), 10);
    maxLevel = isNaN(lvlNum) ? 1 : lvlNum;
    if (role === 'npt_all') maxLevel = 6;
  } else if (role === 'member') {
    // Default legacy member: full access
    program = 'npt';
    maxLevel = 6;
    hasEmtAccess = true;
  }

  return {
    isLoggedIn: true,
    isApproved,
    isSuperAdmin: false,
    program,
    maxLevel,
    hasEmtAccess: hasEmtAccess || maxLevel >= 6,
    canAccessNptLevel: (targetLevel) => {
      if (!isApproved) return false;
      return maxLevel >= targetLevel;
    },
    badgeText: program === 'emt' ? '🎓 Member EMT' : `⭐ Member NPT Level ${maxLevel}`
  };
}

export function formatRoleLabel(role) {
  if (!role) return 'Member';
  const r = role.toLowerCase().trim();
  if (r === 'super_admin') return '👑 Super Admin';
  if (r === 'emt') return '🎓 EMT (Pelatihan Emosi Guru)';
  if (r === 'npt_all' || r === 'member') return '⭐ NPT Semua Level (1 - 6)';
  if (r.startsWith('npt_')) {
    const lvl = r.replace('npt_', '');
    const config = NPT_LEVEL_CONFIG[lvl];
    return `🏛️ NPT Level ${lvl}${config ? `: ${config.name}` : ''}`;
  }
  return role;
}
