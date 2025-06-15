// src/components/ConfirmationDialog.tsx
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmationDialog({ open, title, message, onConfirm, onClose }: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Confirm Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
