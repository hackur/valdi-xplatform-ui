/**
 * Mock SystemFont for testing
 */

export function systemFont(size: number): any {
  return { size, weight: 'normal' };
}

export function systemBoldFont(size: number): any {
  return { size, weight: 'bold' };
}
