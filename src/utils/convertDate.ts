/// convert date to string YYYY-MM-DD HH:mm:ss
export function convertDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export const convertDateWithOptions = (
  date: string,
  locale = 'en-US',
  options?: Intl.DateTimeFormatOptions
) => {
  const DateFormat = new Date(date).toLocaleString(locale, options);
  return `${DateFormat}`;
};
