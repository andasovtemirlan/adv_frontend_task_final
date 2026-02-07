import { Box, CircularProgress } from '@mui/material';
import { memo } from 'react';

/**
 * Loading spinner component - Optimized with React.memo
 */
const LoadingSpinner = memo(({ size = 40 }: { size?: number }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
      width="100%"
    >
      <CircularProgress size={size} />
    </Box>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
