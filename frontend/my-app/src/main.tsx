// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";
import FeaturesPage from "./pages/FeaturesPage/FeaturesPage";
import "./index.css"
// Основной лейаут
const MainLayout = () => (
  <>
    <Header />
    <main>
      <Outlet /> {/* Контент страниц будет здесь */}
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
    ],
  },
]);

// App.tsx
const App = () => null;
export default App;

// Рендер приложения
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);