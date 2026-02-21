export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date));
};

export const formatTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    timeStyle: 'short',
  }).format(new Date(date));
};
