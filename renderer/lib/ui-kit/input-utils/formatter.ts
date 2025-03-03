export const formatToTimeString = (input: string, formatType: 'hour' | 'minute') => {
  let digits = input.replace(/\D/g, '');

  const maxDigits = formatType === 'hour' ? 6 : 4;
  digits = digits.slice(0, maxDigits);

  if (formatType === 'hour') {
    return digits.replace(/^(\d{0,2})(\d{0,2})(\d{0,2})$/, (match, hours, minutes, seconds) => {
      if (seconds) return `${hours}:${minutes}:${seconds}`;
      if (minutes) return `${hours}:${minutes}`;
      return hours;
    });
  } else {
    return digits.replace(/^(\d{0,2})(\d{0,2})$/, (match, minutes, seconds) => {
      if (seconds) return `${minutes}:${seconds}`;
      return minutes;
    });
  }
};
