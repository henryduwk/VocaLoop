export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const isToday = (dateStr: string): boolean => {
  return getToday() === dateStr;
};

export const isDue = (dateStr: string): boolean => {
  return dateStr <= getToday();
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};
