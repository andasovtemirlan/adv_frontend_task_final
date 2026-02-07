import { Suspense, lazy } from 'react';
import { Box } from '@mui/material';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

const ProjectDetailContainer = lazy(() => import('../containers/ProjectDetailContainer'));

const ProjectDetailPage = () => {
  return (
    <Box>
      <Suspense fallback={<LoadingSpinner />}>
        <ProjectDetailContainer />
      </Suspense>
    </Box>
  );
};

export default ProjectDetailPage;
