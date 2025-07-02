import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import Header from "./components/Layout/Header"
import Footer from "./components/Layout/Footer"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import About from "./pages/About"
import Support from "./pages/Support"
import Login from "./pages/Login"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AddIntern from "./pages/admin/AddIntern"
import ViewAllInterns from "./pages/admin/ViewAllInterns"
import GenerateQR from "./pages/admin/GenerateQR"
import Certificates from "./pages/admin/Certificates"
import InternVerification from "./pages/InternVerification"
import EditIntern from "./pages/admin/EditIntern"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <>
                    <Header />
                    <Home />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/about"
                element={
                  <>
                    <Header />
                    <About />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/support"
                element={
                  <>
                    <Header />
                    <Support />
                    <Footer />
                  </>
                }
              />
              <Route
                path="/verify/:uniqueId"
                element={
                  <>
                    <InternVerification />
                    <Footer />
                  </>
                }
              />

              {/* Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Header isAdmin />
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-intern"
                element={
                  <ProtectedRoute>
                    <Header isAdmin />
                    <AddIntern />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/view-all"
                element={
                  <ProtectedRoute>
                    <Header isAdmin />
                    <ViewAllInterns />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/generate-qr"
                element={
                  <ProtectedRoute>
                    <Header isAdmin />
                    <GenerateQR />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/certificates"
                element={
                  <ProtectedRoute>
                    <Header isAdmin />
                    <Certificates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit-intern/:internId"
                element={
                  <ProtectedRoute>
                    <Header isAdmin />
                    <EditIntern />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
