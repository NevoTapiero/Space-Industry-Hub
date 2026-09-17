import { Routes, Route, Navigate } from 'react-router-dom'
import { Nav, Footer, ScrollToTop } from './components/ui.jsx'
import Home from './pages/Home.jsx'
import Launches from './pages/Launches.jsx'
import Companies from './pages/Companies.jsx'
import Company from './pages/Company.jsx'
import Vehicles from './pages/Vehicles.jsx'
import Vehicle from './pages/Vehicle.jsx'
import Hangar from './pages/Hangar.jsx'
import Sources from './pages/Sources.jsx'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/launches" element={<Launches />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:slug" element={<Company />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:slug" element={<Vehicle />} />
          <Route path="/hangar" element={<Hangar />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
