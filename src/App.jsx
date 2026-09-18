import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Nav, Footer, ScrollToTop, ScrollProgress } from './components/ui.jsx'
import Home from './pages/Home.jsx'
import Launches from './pages/Launches.jsx'
import Companies from './pages/Companies.jsx'
import Company from './pages/Company.jsx'
import Vehicles from './pages/Vehicles.jsx'
import Vehicle from './pages/Vehicle.jsx'
import Sources from './pages/Sources.jsx'

const Hangar = lazy(() => import('./pages/Hangar.jsx'))
const Engines = lazy(() => import('./pages/Engines.jsx'))

export default function App() {
  const { pathname } = useLocation()
  return (
    <>
      <ScrollToTop />
      <ScrollProgress />
      <Nav />
      <main className="route-fade" key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/launches" element={<Launches />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:slug" element={<Company />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:slug" element={<Vehicle />} />
          <Route
            path="/engines"
            element={
              <Suspense fallback={<div className="page container"><div className="loading">LOADING 3D…</div></div>}>
                <Engines />
              </Suspense>
            }
          />
          <Route
            path="/hangar"
            element={
              <Suspense fallback={<div className="page container"><div className="loading">LOADING 3D…</div></div>}>
                <Hangar />
              </Suspense>
            }
          />
          <Route path="/sources" element={<Sources />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
