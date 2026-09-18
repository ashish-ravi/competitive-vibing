/**
 * Facts the legal pages render. Keep these true: the privacy policy is a
 * description of what the app does, not a template.
 */
export const LEGAL = {
  appName: 'Competitive Vibing',
  /** Where privacy requests go. Set before submitting Google OAuth verification. */
  contactEmail: 'privacy@example.com',
  /** Shown as "Last updated" on both pages. Bump when the text changes. */
  updated: '18 September 2026',
  operatorLocation: 'Australia',
} as const;
