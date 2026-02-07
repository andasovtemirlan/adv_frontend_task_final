import { Suspense, lazy } from 'react';
import { Box } from '@mui/material';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

const DashboardContainer = lazy(() => import('../containers/DashboardContainer'));

const DashboardPage = () => {
  return (
    <Box>
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardContainer />
      </Suspense>
    </Box>
  );
};

export default DashboardPage;
