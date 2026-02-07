import { Suspense, lazy } from 'react';
import { Box } from '@mui/material';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

const KanbanContainer = lazy(() => import('../containers/KanbanContainer'));

const KanbanPage = () => {
  return (
    <Box>
      <Suspense fallback={<LoadingSpinner />}>
        <KanbanContainer />
      </Suspense>
    </Box>
  );
};

export default KanbanPage;
