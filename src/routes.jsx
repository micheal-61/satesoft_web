import React, { Suspense, lazy } from "react";
import { useRoutes, Outlet, Navigate, useLocation } from "react-router-dom";

const Home = lazy(() => import("./pages/website/Home"));
const About = lazy(() => import("./pages/website/About"));
const Products = lazy(() => import("./pages/website/Products"));
const Services = lazy(() => import("./pages/website/Services"));
const ServiceDetails = lazy(() => import("./pages/website/ServiceDetails"));
const Pricing = lazy(() => import("./pages/website/Pricing"));
const FAQ = lazy(() => import("./pages/website/FAQ"));
const Testimonials = lazy(() => import("./pages/website/Testimonials"));
const Contact = lazy(() => import("./pages/website/Contact"));
const Blog = lazy(() => import("./pages/website/Blog"));
const Board = lazy(() => import("./pages/website/Board"));
const ProductDetails = lazy(() => import("./pages/website/ProductDetails"));
const ProductDetailsDuqcat = lazy(() => import("./pages/website/Productdetailsduqcat"));
const ProductDetailsKaribyshoo = lazy(() => import("./pages/website/ProductdetailsKaribyshoo"));
const ProductDetailsFoundDocument = lazy(() => import("./pages/website/ProductdetailsFoundDocument"));
const Opportunities = lazy(() => import("./pages/website/Opportunities"));
const OpportunityDetails = lazy(() => import("./pages/website/OpportunityDetails"));
const OpportunityApplication = lazy(() => import("./pages/website/OpportunityApplication"));
const Partners = lazy(() => import("./pages/website/Partners"));
const BlogDetails = lazy(() => import("./pages/website/BlogDetails"));
const Environmental = lazy(() => import("./pages/website/Environmental"));
const PrivacyPolicy = lazy(() => import("./pages/website/PrivacyPolicy"));
const ServiceAgreement = lazy(() => import("./pages/website/ServiceAgreement"));
const Support = lazy(() => import("./pages/website/Support"));
const MilestoneDetail = lazy(() => import("./pages/website/MilestoneDetail"));
const MilestoneMonth = lazy(() => import("./pages/website/MilestoneMonth"));
const ActivityDetail = lazy(() => import("./pages/website/ActivityDetail"));
const ActivityDateDetail = lazy(() => import("./pages/website/ActivityDateDetail"));
const AdvisorDetail = lazy(() => import("./pages/website/AdvisorDetail"));

const RaincloudDashboard = lazy(() => import("./pages/admin/RaincloudDashboard"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));

const Appheader = lazy(() => import("./components/Navbar"));
const FooterComponent = lazy(() => import("./components/Footer"));

const Loading = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="inline-flex items-center gap-2 text-primary-500">
      <i className="bi bi-arrow-clockwise animate-spin text-2xl"></i>
      <span className="text-lg font-medium">Loading...</span>
    </div>
  </div>
);

const PublicLayout = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.documentElement.scrollLeft = 0;
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
  }, [pathname]);

  React.useEffect(() => {
    const titles = {
      '/': 'Satesoft - Driving Digital Innovation Across Africa',
      '/about': 'About Us - Satesoft',
      '/products': 'Products - Satesoft',
      '/services': 'Services - Satesoft',
      '/pricing': 'Pricing - Satesoft',
      '/faq': 'FAQ - Satesoft',
      '/testimonials': 'Testimonials - Satesoft',
      '/contact': 'Contact Us - Satesoft',
      '/blog': 'Blog - Satesoft',
      '/board': 'Our Team - Satesoft',
      '/opportunities': 'Careers - Satesoft',
      '/partners': 'Partners - Satesoft',
      '/environmental': 'Environmental Sustainability - Satesoft',
      '/privacy-policy': 'Privacy Policy - Satesoft',
      '/service-agreement': 'Service Agreement - Satesoft',
      '/support': 'Support Center - Satesoft',
    };
    const title = titles[pathname] || 'Satesoft';
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Empowering businesses across Africa with innovative cloud solutions, intelligent software, and actionable data analytics.');
    }
  }, [pathname]);

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-white focus:text-[#72bf24] focus:border focus:border-[#72bf24] focus:rounded-lg focus:shadow-lg">
        Skip to main content
      </a>
      <Suspense fallback={<div className="fixed top-0 left-0 right-0 z-[200] bg-white/90 backdrop-blur-md border-b border-gray-100 h-16"></div>}>
        <Appheader />
      </Suspense>
      <main id="main-content" className="pt-24">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-32 bg-gray-50"></div>}>
        <FooterComponent />
      </Suspense>
    </>
  );
};

import { useAuth } from './context/AuthContext';

// Authentication Wrapper for the CMS
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user || !user.authenticated) {
    // Redirect to the login page if not logged in
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export const routesConfig = [
  // ----------------------------------------------------
  // PUBLIC FRONTEND ROUTES
  // ----------------------------------------------------
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      // The About Us page is now the site's landing page; the previous
      // homepage remains available from Company > About Us.
      { index: true, element: <About /> },
      { path: "about", element: <Home /> },
      { path: "products", element: <Products /> },
      { path: "services", element: <Services /> },
      { path: "services/:id", element: <ServiceDetails /> },
      { path: "pricing", element: <Pricing /> },
      { path: "faq", element: <FAQ /> },
      { path: "testimonials", element: <Testimonials /> },
      { path: "contact", element: <Contact /> },
      { path: "blog", element: <Blog /> },
      { path: "board", element: <Board /> },
      { path: "board/:id", element: <AdvisorDetail /> },
      { path: "opportunities", element: <Opportunities /> },
      { path: "opportunities/:id", element: <OpportunityDetails /> },
      { path: "opportunities/:id/apply", element: <OpportunityApplication /> },
      { path: "partners", element: <Partners /> },
      { path: "products/duqact", element: <ProductDetailsDuqcat /> },
      { path: "products/karibyshoo", element: <ProductDetailsKaribyshoo /> },
      { path: "products/founddocument", element: <ProductDetailsFoundDocument /> },
      { path: "products/:id", element: <ProductDetails /> },
      { path: "blog/:id", element: <BlogDetails /> },
      { path: "environmental", element: <Environmental /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "service-agreement", element: <ServiceAgreement /> },
      { path: "support", element: <Support /> },
      { path: "milestone/:id/month/:month", element: <MilestoneMonth /> },
      { path: "milestone/:id/date/:date", element: <ActivityDateDetail /> },
      { path: "milestone/:milestoneId/activity/:activityId", element: <ActivityDetail /> },
      { path: "milestone/:id", element: <MilestoneDetail /> },
    ],
  },

  // ----------------------------------------------------
  // CMS ADMIN ROUTES (BACKEND PORTAL)
  // ----------------------------------------------------
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/*",
    element: (
      <RequireAuth>
        <RaincloudDashboard />
      </RequireAuth>
    ),
  },
];

export default function AppRoutes() {
  const element = useRoutes(routesConfig);
  return element;
}
