import { Suspense, lazy } from 'react';
import { Box } from '@mui/material';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

const ActivityContainer = lazy(() => import('../containers/ActivityContainer'));

const ActivityPage = () => {
  return (
    <Box>
      <Suspense fallback={<LoadingSpinner />}>
        <ActivityContainer />
      </Suspense>
    </Box>
  );
};

export default ActivityPage;
