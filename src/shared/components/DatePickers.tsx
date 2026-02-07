import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { Box, Typography } from '@mui/material';
import { parseISO, formatISO } from 'date-fns';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
}

export const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = 'Date Range',
  error = false,
  helperText = '',
}: DateRangePickerProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ mb: 2 }}>
        {label && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DatePicker
            label="Start Date"
            value={startDate ? parseISO(startDate) : null}
            onChange={(date) => {
              if (date) {
                onStartDateChange(formatISO(date, { representation: 'date' }));
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error,
              },
            }}
          />
          <DatePicker
            label="End Date"
            value={endDate ? parseISO(endDate) : null}
            onChange={(date) => {
              if (date) {
                onEndDateChange(formatISO(date, { representation: 'date' }));
              }
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error,
              },
            }}
          />
        </Box>
        {helperText && (
          <Typography variant="caption" color={error ? 'error' : 'textSecondary'}>
            {helperText}
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
};

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  error?: boolean;
  helperText?: string;
}

export const DatePickerField = ({
  label,
  value,
  onChange,
  error = false,
  helperText = '',
}: DatePickerFieldProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={value ? parseISO(value) : null}
        onChange={(date) => {
          if (date) {
            onChange(formatISO(date, { representation: 'date' }));
          }
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
            error,
            helperText,
          },
        }}
      />
    </LocalizationProvider>
  );
};
