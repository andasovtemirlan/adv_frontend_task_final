import { Suspense, lazy } from 'react';
import { Box } from '@mui/material';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

const ProjectsContainer = lazy(() => import('../containers/ProjectsContainer'));

const ProjectsPage = () => {
  return (
    <Box>
      <Suspense fallback={<LoadingSpinner />}>
        <ProjectsContainer />
      </Suspense>
    </Box>
  );
};

export default ProjectsPage;
