import React from "react";
import { useNavigate } from "react-router-dom";
import { FileQuestion, MoveLeft, Home } from "lucide-react";

import Button from "../components/common/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const NotFoundPage = () => {
  const navigate = useNavigate();;
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 text-center">
        {/* Icon / 404 Visual */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20 duration-1000" />
            <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center border-2 border-slate-100">
              <FileQuestion
                className="w-10 h-10 text-emerald-500"
                strokeWidth={1.5}
              />
            </div>
            {/* 404 Badge */}
            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg border-2 border-white">
              404
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Sorry, we couldn't find the page you're looking for. It might have
          been removed, renamed, or doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Back Button */}
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto justify-center"
          >
            <MoveLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          {/* Dynamic Home Button */}
          <Button
            onClick={handleGoHome}
            className="w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
