import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomePage from "./pages/HomePage/HomePage";


const App: React.FC = () => (
  <>
    <Header />
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route path=\"/dashboard\" element={<DashboardPage />} /> */}
    </Routes>
    <Footer />
  </>
);

export default App;
