import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";

// Routes
import DashboardLayout from "@/pages/layouts/DashboardLayout";
import LoginPage from "@/pages/auth/Login";

import DashboardHome from "@/pages/dashboard/DashboardHome";
import DashboardTeam from "./pages/dashboard/DashboardTeam";


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="analytics" element={<div>Analytics Page</div>} />
            <Route path="live" element={<div>Live Stream Page</div>} >
              <Route path="add" element={<div>Add Live Stream Page</div>} />
              <Route path="chat" element={<div>Live Chat Page</div>} />
              <Route path="viewers" element={<div>Live Viewers Page</div>} />
            </Route>
            <Route path="videos" element={<div>Videos Page</div>} >
              <Route path="add" element={<div>Add Video Page</div>} />
              <Route path="edit" element={<div>Edit Video Page</div>} />
              <Route path="view" element={<div>View Video Page</div>} />
            </Route>
            <Route path="music" element={<div>Music Page</div>} >
            
            </Route>
            <Route path="team" element={<DashboardTeam />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
