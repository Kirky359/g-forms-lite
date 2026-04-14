import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { FormBuilderPage } from "./pages/FormBuilderPage";
import { EditFormPage } from "./pages/EditFormPage";
import { FormFillerPage } from "./pages/FormFillerPage";
import { FormResponsesPage } from "./pages/FormResponsesPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms/new"
          element={
            <ProtectedRoute>
              <FormBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms/:id/edit"
          element={
            <ProtectedRoute>
              <EditFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="/forms/:id/fill" element={<FormFillerPage />} />
        <Route
          path="/forms/:id/responses"
          element={
            <ProtectedRoute>
              <FormResponsesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;