import { Suspense, lazy } from 'react';
import { Box } from '@mui/material';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

const TeamsContainer = lazy(() => import('../containers/TeamsContainer'));

const TeamsPage = () => {
  return (
    <Box>
      <Suspense fallback={<LoadingSpinner />}>
        <TeamsContainer />
      </Suspense>
    </Box>
  );
};

export default TeamsPage;
