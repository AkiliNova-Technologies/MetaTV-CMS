import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";

// Routes
import DashboardLayout from "@/pages/layouts/DashboardLayout";
import LoginPage from "@/pages/auth/Login";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DashboardTeam from "./pages/dashboard/DashboardTeam";
import DashboardVideos from "./pages/dashboard/DashboardVideos";
import DashboardAddVideo from "./pages/dashboard/DashboardAddVideo";
import VideoLayout from "./pages/layouts/VideoLayout";
import DashboardPrograms from "./pages/dashboard/DashboardPrograms";
import DashboardEditVideo from "./pages/dashboard/DashboardEditVideo";
import DashboardWatchVideo from "./pages/dashboard/DashboardWatchVideo";
import DashboardMusic from "./pages/dashboard/DashboardMusic";
import DashboardAnalytics from "./pages/dashboard/DashboardAnalytics";
import DashboardLiveStream from "./pages/dashboard/DashboardLiveSream";
import { Toaster } from "./components/ui/sonner";
import DashboardQuickCreate from "./pages/dashboard/DashboardQuickCreate";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="quick-create" element={<DashboardQuickCreate />} />
            <Route path="analytics" element={<DashboardAnalytics />} />
            <Route path="livestream" element={<DashboardLiveStream />}>
              <Route path="viewers" element={<div>Live Viewers Page</div>} />
            </Route>
            <Route path="videos" element={<VideoLayout />}>
              <Route index element={<DashboardVideos />} />
              <Route path="create-video" element={<DashboardAddVideo />} />
              <Route path="edit-video/:id" element={<DashboardEditVideo />} />
              <Route path="watch-video/:id" element={<DashboardWatchVideo />} />
            </Route>
            <Route path="music" element={<DashboardMusic />} />
            <Route path="team" element={<DashboardTeam />} />
            <Route path="programs" element={<DashboardPrograms />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
