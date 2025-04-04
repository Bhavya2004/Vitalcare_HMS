// Centralized configuration for route access which maps routes to roles allowed to access them

type RouteAccessProps = {
    [key: string]: string[];
  };
  
  export const routeAccess: RouteAccessProps = {
    "/admin": ["admin"],
    "/doctor": ["doctor"],
    "/patient": ["patient", "admin", "doctor", "nurse"],
    "/admin/dashboard": ["admin"],
  };