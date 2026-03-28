import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import NotFound from "pages/NotFound";
import PersonalizedDashboard from './pages/personalized-dashboard';
import LoginPersonalInfo from './pages/login-personal-info';
import FindMatchesConversations from './pages/find-matches-conversations';
import AdaptiveQuiz from './pages/adaptive-quiz';
import Settings from './pages/settings';
import SudokuPuzzle from "./pages/sudoku-puzzle";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        <Route path="/" element={<LoginPersonalInfo />} />
        <Route path="/login-personal-info" element={<LoginPersonalInfo />} />
        <Route
          path="/find-matches-conversations"
          element={
            <ProtectedRoute requireAssessment requireSudoku>
              <FindMatchesConversations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adaptive-quiz"
          element={
            <ProtectedRoute>
              <AdaptiveQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/personalized-dashboard"
          element={
            <ProtectedRoute requireAssessment>
              <PersonalizedDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sudoku-puzzle"
          element={
            <ProtectedRoute requireAssessment>
              <SudokuPuzzle />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
