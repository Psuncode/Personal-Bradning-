import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { ResumePage } from './pages/ResumePage';
import { MeetPage } from './pages/MeetPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/projects',
    element: <ProjectsPage />,
  },
  {
    path: '/projects/:slug',
    element: <ProjectDetailPageWrapper />,
  },
  {
    path: '/blog',
    element: <BlogPage />,
  },
  {
    path: '/blog/:slug',
    element: <BlogPostPageWrapper />,
  },
  {
    path: '/resume',
    element: <ResumePage />,
  },
  {
    path: '/meet',
    element: <MeetPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

// Wrapper components to extract slug from URL params
function ProjectDetailPageWrapper() {
  const params = new URLSearchParams(window.location.search);
  const slug = window.location.pathname.split('/projects/')[1];
  return <ProjectDetailPage slug={slug} />;
}

function BlogPostPageWrapper() {
  const slug = window.location.pathname.split('/blog/')[1];
  return <BlogPostPage slug={slug} />;
}
