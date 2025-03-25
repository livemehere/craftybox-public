import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

import { useMemo } from 'react';
import { useControlledState } from '@fewings/react/hooks';

import { getDatesOfMonth, splitDatesByWeek } from '../utils/date';

const today = dayjs();
const headers = ['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT'];
const months = Array.from({ length: 12 }, (_, i) => i);

type UseCalendarOptions = {
  year?: number;
  month?: number;
  onChangeYear?: (year: number) => void;
  onChangeMonth?: (month: number) => void;
  defaultYear?: number;
  defaultMonth?: number;
};

export const useCalendar = (opt: UseCalendarOptions) => {
  const [year = today.year(), setYear] = useControlledState({
    value: opt.year,
    onChange: opt.onChangeYear,
    defaultValue: opt.defaultYear
  });
  console.log(opt.year, opt.month);

  const [month = today.month(), setMonth] = useControlledState({
    value: opt.month,
    onChange: opt.onChangeMonth,
    defaultValue: opt.defaultMonth
  });

  const weeks = useMemo(() => splitDatesByWeek(getDatesOfMonth(year, month)), [year, month]);

  const moveMonth = (dir: -1 | 1) => {
    if (dir === -1) {
      if (month === 0) {
        setYear(year - 1);
        setMonth(11);
      } else {
        setMonth(month - 1);
      }
    } else {
      if (month === 11) {
        setYear(year + 1);
        setMonth(0);
      } else {
        setMonth(month + 1);
      }
    }
  };

  return {
    headers,
    weeks,
    months,
    moveMonth
  };
};
