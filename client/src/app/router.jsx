import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProductsPage from "../features/products/pages/ProductsPage";
import CustomersPage from "../features/customers/pages/CustomersPage";
import CategoriesPage from "../features/categories/pages/CategoriesPage";
import ActivityLogsPage from "../features/activity-logs/pages/ActivityLogsPage";
import SettingsPage from "../features/settings/pages/SettingsPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/products",
            element: <ProductsPage />,
          },
          {
            path: "/customers",
            element: <CustomersPage />,
          },
          {
            path: "/categories",
            element: <CategoriesPage />,
          },
          {
            path: "activity-logs",
            element: <ActivityLogsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
