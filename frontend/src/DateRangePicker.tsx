import * as React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { addDays, removeDays } from './utils';

export const DateRangePicker: React.FC<{
  from: Date | undefined;
  to: Date | undefined;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
}> = ({ from, to, onFromDateChange, onToDateChange }) => {
  const dayToPicker = React.useRef<DayPickerInput>(null);

  const now = new Date(Date.now());

  const modifiers = { start: from, end: to };

  return (
    <>
      <span>
        From:&nbsp;
        <DayPickerInput
          value={from}
          placeholder="From"
          formatDate={(date) => date.toLocaleDateString()}
          dayPickerProps={{
            selectedDays: [from, from && to && { from: from, to: to }],
            disabledDays: {
              // Server generate data up to 15 days before
              before: removeDays(now, 15),
              // `from` must be different than `to`. So it can be max `to-1`
              after: to ? removeDays(to, 1) : removeDays(now, 1),
            },
            toMonth: to,
            modifiers,
            numberOfMonths: 1,
            onDayClick: () => {
              if (dayToPicker.current !== null) {
                dayToPicker.current.getInput().focus();
              }
            },
          }}
          onDayChange={onFromDateChange}
        />
      </span>
      <span>
        To: &nbsp;
        <DayPickerInput
          ref={dayToPicker}
          value={to}
          placeholder="To"
          formatDate={(date) => date.toLocaleDateString()}
          dayPickerProps={{
            selectedDays: [from, from && to && { from: from, to: to }],
            disabledDays: {
              before: from
                ? // `to` must be different than `from`. So it can be minimun `from+1`
                  addDays(from, 1)
                : removeDays(now, 14),
              after: now,
            },
            modifiers,
            month: from,
            fromMonth: from,
            numberOfMonths: 1,
          }}
          onDayChange={onToDateChange}
        />
      </span>
    </>
  );
};
