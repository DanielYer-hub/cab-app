import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import WelcomePage from './pages/WelcomePage'
import ProtectedRoute from './app/ProtectedRoute'
import DashbordPage from './pages/DashbordPage'
import SectionPage from "./pages/SectionPage";

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/welcome-page" replace />} />
          <Route path='/welcome-page' element={<WelcomePage />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashbordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sections/:id"
            element={
              <ProtectedRoute>
                <SectionPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App