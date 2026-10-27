import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import { AuthProvider } from '@/lib/auth-context'
import { LandingPage } from '@/pages/landing'
import { LogbookPage } from '@/pages/logbook'
import { NotFoundPage } from '@/pages/not-found'
import { SignInPage } from '@/pages/sign-in'
import { SignUpPage } from '@/pages/sign-up'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <LogbookPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
