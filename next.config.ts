import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.56.1", "localhost", "127.0.0.1"],
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      // Legacy marketing & auth URLs
      {
        source: "/previous-landing-page",
        destination: "/",
        permanent: false,
      },
      {
        source: "/previous-landing-page/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/admin/dashboard",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/admin/dashboard/:path*",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/admin/projects",
        destination: "/admin/clinics",
        permanent: false,
      },
      {
        source: "/admin/projects/:path*",
        destination: "/admin/clinics",
        permanent: false,
      },
      {
        source: "/admin/subscription",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/admin/subscription/:path*",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/admin/login",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/c/:company/home",
        destination: "/",
        permanent: false,
      },
      {
        source: "/c/:company/home/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/:companySlug/patient-portal",
        destination: "/patient",
        permanent: false,
      },
      {
        source: "/:companySlug/patient-login",
        destination: "/patient/login",
        permanent: false,
      },
      {
        source: "/:companySlug((?!api|_next|app|admin|patient|setup|specialist|lab).+)/login",
        destination: "/login",
        permanent: false,
      },
      // Legacy company-scoped dashboard root & renamed slugs
      {
        source: "/c/:company/dashboard",
        destination: "/app/today",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/recovery",
        destination: "/app/treatment-recovery",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/campaigns",
        destination: "/app/recall-campaigns",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/staff",
        destination: "/app/staff-commission",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/all-branches",
        destination: "/app/group-dashboard",
        permanent: false,
      },
      // Legacy nested clinic routes -> readable /app/* destinations
      {
        source: "/c/:company/dashboard/appointments/:path*",
        destination: "/app/calendar",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/appointments",
        destination: "/app/calendar",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/patient-management/dental-chart",
        destination: "/app/dental-chart",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/patient-management/explainer",
        destination: "/app/explainers",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/patient-management/:path*",
        destination: "/app/patients",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/patient-management",
        destination: "/app/patients",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/activity-management/treatment-plans",
        destination: "/app/treatment-plans",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/activity-management/exercise-prescription",
        destination: "/app/prescriptions",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/activity-management/:path*",
        destination: "/app/dental-chart",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/activity-management",
        destination: "/app/dental-chart",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/billing/:path*",
        destination: "/app/billing",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/lead-management/:path*",
        destination: "/app/treatment-recovery",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/lead-management",
        destination: "/app/treatment-recovery",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/marketing/:path*",
        destination: "/app/recall-campaigns",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/marketing",
        destination: "/app/recall-campaigns",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/erp/:path*",
        destination: "/app/staff-commission",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/erp",
        destination: "/app/staff-commission",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/settings/:path*",
        destination: "/app/settings",
        permanent: false,
      },
      // Direct 1:1 dashboard slug mapping
      {
        source:
          "/c/:company/dashboard/:slug(today|calendar|patients|gap-filler|ai-receptionist|dental-chart|treatment-plans|explainers|prescriptions|post-op|billing|treatment-recovery|recall-campaigns|inventory|lab-cases|sterilisation|staff-commission|group-dashboard|patient-insights|visiting-specialists|reports|settings)",
        destination: "/app/:slug",
        permanent: false,
      },
      {
        source: "/c/:company/dashboard/:path*",
        destination: "/app/today",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
