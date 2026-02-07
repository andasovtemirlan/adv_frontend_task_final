import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import AppLayout from '@/shared/components/Layout/AppLayout';
import LoginPage from '@/features/auth/pages/LoginPage';

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const ProjectsPage = lazy(() => import('@/features/projects/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/features/projects/pages/ProjectDetailPage'));
const KanbanPage = lazy(() => import('@/features/tasks/pages/KanbanPage'));
const TeamsPage = lazy(() => import('@/features/teams/pages/TeamsPage'));
const ActivityPage = lazy(() => import('@/features/activity/pages/ActivityPage'));
const MembersPage = lazy(() => import('@/features/members/pages/MembersPage'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'projects',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectsPage />
          </Suspense>
        ),
      },
      {
        path: 'projects/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'projects/new',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'tasks',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <KanbanPage />
          </Suspense>
        ),
      },
      {
        path: 'teams',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TeamsPage />
          </Suspense>
        ),
      },
      {
        path: 'activity',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ActivityPage />
          </Suspense>
        ),
      },
      {
        path: 'members',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <MembersPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
