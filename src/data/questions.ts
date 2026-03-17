// Profile-based FQ Test configuration

export interface ProfileConfig {
  ageGroup: string;
  ageCode: string;
  roles: { code: string; label: string }[];
}

export const AGE_GROUPS: ProfileConfig[] = [
  {
    ageGroup: '18-25',
    ageCode: 'A1',
    roles: [
      { code: 'SAL', label: 'Salaried' },
      { code: 'STU', label: 'Student' },
      { code: 'HOM', label: 'Housewife' },
      { code: 'BUS', label: 'Business' },
      { code: 'SELF', label: 'Self Employed' },
    ],
  },
  {
    ageGroup: '26-39',
    ageCode: 'A2',
    roles: [
      { code: 'SAL', label: 'Salaried' },
      { code: 'STU', label: 'Student' },
      { code: 'HOM', label: 'Housewife' },
      { code: 'BUS', label: 'Business' },
      { code: 'SELF', label: 'Self Employed' },
    ],
  },
  {
    ageGroup: '40-59',
    ageCode: 'A3',
    roles: [
      { code: 'SAL', label: 'Salaried' },
      { code: 'HOM', label: 'Housewife' },
      { code: 'BUS', label: 'Business' },
      { code: 'SELF', label: 'Self Employed' },
    ],
  },
  {
    ageGroup: '60+',
    ageCode: 'A4',
    roles: [
      { code: 'SAL', label: 'Salaried' },
      { code: 'HOM', label: 'Housewife' },
      { code: 'BUS', label: 'Business' },
      { code: 'SELF', label: 'Self Employed' },
      { code: 'RET', label: 'Retired' },
    ],
  },
];

export const ROLE_EMOJIS: Record<string, string> = {
  SAL: '💼',
  STU: '🎓',
  HOM: '🏠',
  BUS: '🚀',
  SELF: '🧑‍💻',
  RET: '🏖️',
};

export function buildProfileCode(ageCode: string, roleCode: string): string {
  return `${ageCode}_${roleCode}`;
}

export function getProfileLabel(profileCode: string): string {
  const [ageCode, roleCode] = profileCode.split('_');
  const ageGroup = AGE_GROUPS.find(a => a.ageCode === ageCode);
  const role = ageGroup?.roles.find(r => r.code === roleCode);
  return `${role?.label || roleCode} (${ageGroup?.ageGroup || ageCode})`;
}

// All 19 profile codes (ordered 1-19)
export function getAllProfileCodes(): string[] {
  const codes: string[] = [];
  for (const ag of AGE_GROUPS) {
    for (const role of ag.roles) {
      codes.push(buildProfileCode(ag.ageCode, role.code));
    }
  }
  return codes;
}

// Returns 1-based profile number (1-19)
export function getProfileNumber(profileCode: string): number {
  return getAllProfileCodes().indexOf(profileCode) + 1;
}

// Returns profile info with number
export function getProfileWithNumber(profileCode: string): { number: number; code: string; label: string } {
  return {
    number: getProfileNumber(profileCode),
    code: profileCode,
    label: getProfileLabel(profileCode),
  };
}

// 6 Financial Dimensions
export const dimensions = [
  'Earning Mindset',
  'Spending Behaviour',
  'Saving Behaviour',
  'Debt Awareness',
  'Investment Awareness',
  'Financial Safety',
];

export const dimensionIcons = ['💼', '💳', '💰', '🧾', '📈', '🛡️'];

// FQ Score bands (0-810, max 18×45)
export const fqBands = [
  { min: 0, max: 163, level: 'Beginner', meaning: 'Limited awareness — your journey starts here!', emoji: '🌱' },
  { min: 163, max: 325, level: 'Explorer', meaning: 'Basic awareness — keep exploring!', emoji: '🧭' },
  { min: 325, max: 487, level: 'Developing', meaning: 'Improving habits — you\'re on the right track!', emoji: '📚' },
  { min: 487, max: 649, level: 'Smart', meaning: 'Good control — strong financial instincts!', emoji: '🧠' },
  { min: 649, max: 811, level: 'Master', meaning: 'Highly optimized behaviour — you\'re a legend!', emoji: '👑' },
];

export const TOTAL_QUESTIONS = 18;
export const MAX_SCORE_PER_QUESTION = 50;
export const MAX_SCORE = TOTAL_QUESTIONS * MAX_SCORE_PER_QUESTION; // 18 × 50 = 900

export const reflectionOptions = [
  '💼 Earn more actively',
  '💳 Spend smarter',
  '💰 Save consistently',
  '🧾 Avoid unnecessary debt',
  '📈 Start investing',
  '🛡️ Protect money from scams',
];
