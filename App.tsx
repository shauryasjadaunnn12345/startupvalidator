import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Checklist from "./pages/Checklist";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import BlogList from "./pages/blog/BlogList";
import BlogDetail from "./pages/blog/BlogDetail";
import BlogEditor from "./pages/blog/BlogEditor";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Submit from "./pages/Submit";
import Validate from "./pages/Validate";
import MyStartups from "./pages/MyStartups";
import StartupDetail from "./pages/StartupDetail";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import EmailVerification from "./pages/EmailVerification";
import AuthCallback from "./pages/AuthCallback";
import VerifyAccount from "./pages/VerifyAccount";

// 🔥 FUNDING (NEW)
import FundingList from "./pages/FundingList";
import FundingDetails from "./pages/FundingDetails";
import { RequireAuth } from "@/components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              {/* ================= PUBLIC & SEO ================= */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              {/* ================= BLOG ================= */}
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/admin/blog/new" element={<BlogEditor />} />

              {/* ================= AUTH ================= */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/verify-account" element={<VerifyAccount />} />

              {/* ================= CORE FEATURES ================= */}
              <Route path="/submit" element={<Submit />} />
              <Route path="/validate" element={<Validate />} />
              <Route path="/my-startups" element={<MyStartups />} />
              <Route path="/startup/:id" element={<StartupDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* ================= FUNDING ================= */}
              {/* Public funding list (SEO indexable) */}
              <Route path="/funding" element={<FundingList />} />

              {/* Funding details (LOGIN REQUIRED) */}
              <Route
                path="/funding/:slug"
                element={
                  <RequireAuth>
                    <FundingDetails />
                  </RequireAuth>
                }
              />

              {/* ================= ADMIN / PROFILE ================= */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />

              {/* ================= 404 ================= */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
