import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/Home/Home_Page";
// UTILITY PAGES
import NonePage from "./pages/None/None_Page";

function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        {/* RUTA UNDEFINED */}
        <Route path="*" element={<NonePage />} />
      </Routes>
    </Router>
  );
}

export default App;
