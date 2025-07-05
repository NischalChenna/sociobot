import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { Navbar } from "./components/layout/Navbar";
import { Dashboard } from "./components/Dashboard";
import { ContentGenerator } from "./components/ContentGenerator";
import { PostScheduler } from "./components/PostScheduler";
import { BusinessProfileForm } from "./components/BusinessProfileForm";
import { schedulerAPI, userAPI } from "./utils/api";
import { GeneratedContent, ScheduledPost, BusinessProfile } from "./types";
import toast from "react-hot-toast";

const AuthWrapper: React.FC = () => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  return (
    <>
      {authMode === "login" ? (
        <LoginForm onSwitchToRegister={() => setAuthMode("register")} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setAuthMode("login")} />
      )}
    </>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedContent, setSelectedContent] =
    useState<GeneratedContent | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Load scheduled posts on mount
  useEffect(() => {
    if (user) {
      loadScheduledPosts();
    }
  }, [user]);

  const loadScheduledPosts = async () => {
    try {
      const response = await schedulerAPI.getPosts();
      setScheduledPosts(response.posts);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  const handleNewPost = () => {
    navigate("/generate");
  };

  const handleContentGenerated = (content: GeneratedContent) => {
    setSelectedContent(content);
    navigate(`/schedule/${content.festival.id}`);
  };

  const handleScheduled = async (post: ScheduledPost) => {
    try {
      // Check if it's a mock festival ID (not a valid MongoDB ObjectId)
      const isMockFestival =
        post.content.festival.id &&
        !post.content.festival.id.match(/^[0-9a-fA-F]{24}$/);

      const response = await schedulerAPI.schedulePost({
        festivalId: isMockFestival ? undefined : post.content.festival.id, // Don't send mock IDs
        content: post.content,
        platforms: post.platforms,
        scheduledDate: post.scheduledDate,
        timezone: post.timezone,
      });

      // Add the new post to the list
      setScheduledPosts((prev) => [response, ...prev]);

      toast.success("Post scheduled successfully!");
      navigate("/");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to schedule post";
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleProfileSubmit = async (profile: BusinessProfile) => {
    try {
      await userAPI.updateProfile(profile);
      setShowProfileForm(false);
      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading SocioBot
          </h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthWrapper />;
  }

  // Show profile form if user doesn't have a complete profile
  if (
    showProfileForm ||
    !user.businessProfile?.name ||
    !user.businessProfile?.description
  ) {
    return <BusinessProfileForm onSubmit={handleProfileSubmit} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              scheduledPosts={scheduledPosts}
              onNewPost={handleNewPost}
            />
          }
        />
        <Route
          path="/generate"
          element={
            <ContentGenerator
              profile={user.businessProfile}
              onContentGenerated={handleContentGenerated}
              onBack={handleBack}
            />
          }
        />
        <Route
          path="/schedule/:contentId"
          element={
            selectedContent ? (
              <PostScheduler
                content={selectedContent}
                onScheduled={handleScheduled}
                onBack={handleBack}
              />
            ) : (
              <Navigate to="/generate" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  // Register service worker for PWA functionality
  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration);
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError);
          });
      });
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
