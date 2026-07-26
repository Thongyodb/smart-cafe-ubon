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
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AuthPage from "./pages/AuthPage";
import ProtectedUserRoute from "./routes/ProtectedUserRoute";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import AdminPhotoSpotsPage from "./pages/admin/AdminPhotoSpotsPage";
import AdminMetaPage from "./pages/admin/AdminMetaPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminCafeImagesPage from "./pages/admin/AdminCafeImagesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />

          <Route element={<ProtectedUserRoute />}>
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedUserRoute />}>
          <Route path="/cafes/:id" element={<CafeDetailPage />} />
        </Route>

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="cafes" element={<AdminCafeListPage />} />
            <Route path="cafes/create" element={<AdminCafeFormPage />} />
            <Route path="cafes/:id/edit" element={<AdminCafeFormPage />} />
            <Route path="cafes/:id/images" element={<AdminCafeImagesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="spots" element={<AdminPhotoSpotsPage />} />
            <Route path="tags" element={<AdminMetaPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;