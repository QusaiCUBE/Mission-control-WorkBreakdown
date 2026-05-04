export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  return due < today;
}

export function formatDate(date: string | null): string {
  if (!date) return '—';
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateFull(date: string | null): string {
  if (!date) return '—';
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function generatePhaseDates(
  startDate: string,
  durations: number[]
): { start: string; end: string }[] {
  const phases: { start: string; end: string }[] = [];
  let current = startDate;

  for (const weeks of durations) {
    const end = addDays(current, weeks * 7 - 1);
    phases.push({ start: current, end });
    current = addDays(end, 1);
  }

  return phases;
}
