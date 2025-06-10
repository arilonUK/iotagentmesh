
import Auth from "@/pages/Auth";
import Documentation from "@/pages/Documentation";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import AcceptInvitation from "@/pages/AcceptInvitation";
import Index from "@/pages/Index";

export const publicRoutes = [
  {
    path: "/welcome",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/signup",
    element: <Auth />,
  },
  {
    path: "/docs",
    element: <Documentation />,
  },
  {
    path: "/blog",
    element: <Blog />,
  },
  {
    path: "/blog/:slug",
    element: <BlogPost />,
  },
  {
    path: "/accept-invitation/:token",
    element: <AcceptInvitation />,
  },
];
