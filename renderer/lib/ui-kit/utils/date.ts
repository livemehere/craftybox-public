import dayjs from 'dayjs';

/**
 * @param year 2021
 * @param month 0~11
 */
export function getDatesOfMonth(year: number, month: number) {
  const firstDay = dayjs().year(year).month(month).startOf('month');
  const totalDayCnt = firstDay.daysInMonth();
  const days = Array.from({ length: totalDayCnt }, (_, i) => firstDay.add(i, 'day'));

  const paddingDayCnt = firstDay.day();
  days.unshift(...Array.from({ length: paddingDayCnt }, (_, i) => firstDay.subtract(i + 1, 'day')).reverse());
  return days;
}

export function splitDatesByWeek(dates: dayjs.Dayjs[]) {
  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }
  return weeks;
}
