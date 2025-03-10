export const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const [day] = date.toLocaleDateString().split('/');
  const [, month] = date.toDateString().split(' ');
  return `${day}. ${month}`;
};

export const toGbps = (bits: number) => bits * 1e-9;

export const formatGbps = (gbps: number) => `${gbps.toFixed(2)} Gbps`;

export const addDays = (date: Date, days: number) =>
  new Date(new Date(date).setDate(date.getDate() + days));
export const removeDays = (date: Date, days: number) =>
  new Date(new Date(date).setDate(date.getDate() - days));
