// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import FeaturesPage from "./pages/FeaturesPage/FeaturesPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store";
import { PrivateRoute } from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard/DashBoard";
;

const MainLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </>
);

// Конфигурация маршрутов
const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/features",
        element: <FeaturesPage />,
      },
      {
        path: "/auth",
        element: <AuthPage />,
      },
    ],
  },
  {
    element: <MainLayout/>,
    children: [
      {
        path:'/dashboard',
        element:<PrivateRoute><Dashboard></Dashboard></PrivateRoute>
      }
    ]
  }
]);

// App.tsx
const App = () => null;
export default App;
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
// Рендер приложения
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
