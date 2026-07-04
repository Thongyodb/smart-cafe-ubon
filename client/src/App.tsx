import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CafeDetailPage from "./pages/CafeDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cafes/:id" element={<CafeDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;