import React from "react";
import { Navigate } from "react-router-dom";
import { useIntroVibeAuth } from "../introVibeAuth";

const ProtectedRoute = ({
  children,
  requireAssessment = false,
  requireSudoku = false,
}) => {
  const { currentUser, authReady } = useIntroVibeAuth();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="rounded-2xl border border-border bg-card px-6 py-5 shadow-gentle text-center">
          <p className="text-foreground font-medium">Restoring your IntroVibe session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login-personal-info" replace />;
  }

  if (requireAssessment && (!currentUser?.assessmentCompleted || !currentUser?.personalityType)) {
    return <Navigate to="/adaptive-quiz" replace />;
  }

  if (
    requireSudoku &&
    currentUser?.personalityType === "Introvert" &&
    !currentUser?.sudokuCompleted
  ) {
    return <Navigate to="/sudoku-puzzle" replace />;
  }

  return children;
};

export default ProtectedRoute;
