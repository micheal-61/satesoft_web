import React from "react";
import { useRoutes, Outlet, Navigate, useLocation } from "react-router-dom";

// ==========================================
// SYSTEM ROUTING ARCHITECTURE
// ==========================================
// This file acts as the central router for the entire application.
// The app is split into two main sections:
// 1. Public Pages (Frontend): Handled by PublicLayout, uses standard pages from src/pages.
// 2. Admin CMS (Backend/Admin Portal): Handled under the /admin path.

// --- Public Pages ---
import Home from "./pages/website/Home";
import AppAbout from "./pages/website/About";
import Products from "./pages/website/Products";
import Services from "./pages/website/Services";
import ServiceDetails from "./pages/website/ServiceDetails";
import Pricing from "./pages/website/Pricing";
import FAQ from "./pages/website/FAQ";
import Testimonials from "./pages/website/Testimonials";
import Contact from "./pages/website/Contact";
import Blog from "./pages/website/Blog";
import Board from "./pages/website/Board";
import ProductDetails from "./pages/website/ProductDetails";
import ProductDetailsDuqcat from "./pages/website/Productdetailsduqcat";
import ProductDetailsKaribyshoo from "./pages/website/ProductdetailsKaribyshoo";
import ProductDetailsFoundDocument from "./pages/website/ProductdetailsFoundDocument";
import Opportunities from "./pages/website/Opportunities";
import OpportunityDetails from "./pages/website/OpportunityDetails";
import OpportunityApplication from "./pages/website/OpportunityApplication";
import Partners from "./pages/website/Partners";
import BlogDetails from "./pages/website/BlogDetails";
import Sustainability from "./pages/Sustainability";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ServiceAgreement from "./pages/ServiceAgreement";
import Support from "./pages/website/Support";

// --- Admin CMS ---
import RaincloudDashboard from "./pages/admin/RaincloudDashboard";
import AdminLogin from "./pages/admin/AdminLogin";

// --- Layouts ---
import Appheader from "./components/Navbar";
import Footer from "./components/Footer";

// Public layout wrapper: Injects Navbar and Footer around public pages
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

  return (
    <>
      <Appheader />
      <main className="pt-24">
        <Outlet />
      </main>
      <Footer />
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
      { index: true, element: <AppAbout /> },
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
      { path: "opportunities", element: <Opportunities /> },
      { path: "opportunities/:id", element: <OpportunityDetails /> },
      { path: "opportunities/:id/apply", element: <OpportunityApplication /> },
      { path: "partners", element: <Partners /> },
      { path: "products/duqact", element: <ProductDetailsDuqcat /> },
      { path: "products/karibyshoo", element: <ProductDetailsKaribyshoo /> },
      { path: "products/founddocument", element: <ProductDetailsFoundDocument /> },
      { path: "products/:id", element: <ProductDetails /> },
      { path: "blog/:id", element: <BlogDetails /> },
      { path: "sustainability", element: <Sustainability /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "service-agreement", element: <ServiceAgreement /> },
      { path: "support", element: <Support /> },
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
