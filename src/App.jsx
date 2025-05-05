import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./layouts/MainLayout";

// Lazy load components
const MyProperties = lazy(() => import("./components/properties/MyProperties"));
const Listings = lazy(() => import("./components/properties/Listings"));
const Maintenance = lazy(() => import("./components/maintenance/Maintenance"));
const Calendar = lazy(() => import("./components/calendar/Calendar"));
const AITools = lazy(() => import("./components/ai-tools/AITools"));
const Chat = lazy(() => import("./components/chat/Chat"));
const Inventory = lazy(() => import("./components/inventory/Inventory"));
const Budget = lazy(() => import("./components/budget/Budget"));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <MainLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Navigate to="/listings" />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/my-properties" element={<MyProperties />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/ai-tools" element={<AITools />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="*" element={<Navigate to="/listings" />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;