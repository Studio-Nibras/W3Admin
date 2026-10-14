import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProductsPage from "../features/products/pages/ProductsPage";
import CustomersPage from "../features/customers/pages/CustomersPage";
import CategoriesPage from "../features/categories/pages/CategoriesPage";

const router = createBrowserRouter([
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
    ],
  },
]);

export default router;
