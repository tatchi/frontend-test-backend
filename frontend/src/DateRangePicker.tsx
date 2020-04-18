import * as React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';

export const DateRangePicker: React.FC<{
  from: Date;
  to: Date;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
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
            selectedDays: [from, { from: from, to: to }],
            disabledDays: {
              // Server generate data up to 15 days before
              before: new Date(new Date(now).setDate(now.getDate() - 15)),
              after: to,
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
            selectedDays: [from, { from: from, to: to }],
            disabledDays: {
              before: from,
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
