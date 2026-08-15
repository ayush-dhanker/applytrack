export const APPLICATION_STATUSES = [
  'saved',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'ghosted',
] as const;

export const ROLE_TYPES = [
  'ai-ml',
  'mlops',
  'full-stack',
  'frontend',
  'data',
] as const;

export const WORK_MODES = ['onsite', 'hybrid', 'remote'] as const;

export const SOURCES = [
  'linkedin',
  'indeed',
  'company-site',
  'referral',
  'other',
] as const;

export const CV_VARIANTS = ['ai', 'ds', 'mern'] as const;