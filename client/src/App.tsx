import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import CafeDetailPage from "./pages/CafeDetailPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCafeListPage from "./pages/admin/AdminCafeListPage";
import AdminCafeFormPage from "./pages/admin/AdminCafeFormPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/cafes/:id" element={<CafeDetailPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="cafes" element={<AdminCafeListPage />} />
          <Route path="cafes/create" element={<AdminCafeFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;