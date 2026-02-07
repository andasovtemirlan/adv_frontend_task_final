import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { memo } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Reusable confirmation dialog component - Optimized with React.memo
 */
const ConfirmDialog = memo(
  ({
    open,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    severity = 'warning',
  }: ConfirmDialogProps) => {
    const getColor = () => {
      switch (severity) {
        case 'error':
          return 'error';
        case 'warning':
          return 'warning';
        case 'info':
          return 'info';
        default:
          return 'primary';
      }
    };

    return (
      <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="inherit">
            {cancelText}
          </Button>
          <Button onClick={onConfirm} variant="contained" color={getColor()} autoFocus>
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;
