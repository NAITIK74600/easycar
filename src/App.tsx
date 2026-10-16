import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CustomCursor } from './components/common/CustomCursor';
import { HomePage } from './pages/HomePage';
import { FleetPage } from './pages/FleetPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { LocationsPage } from './pages/LocationsPage';
import { BookingPage } from './pages/BookingPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { AuthProvider } from './context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  // Initialize Lenis luxury momentum scroll connected to GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <CustomCursor />
        <div className="min-h-screen bg-obsidian text-pearl flex flex-col justify-between selection:bg-brand-red selection:text-white grain-overlay">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/fleet" element={<FleetPage />} />
              <Route path="/fleet/:slug" element={<VehicleDetailPage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/booking/confirmation/:ref" element={<BookingConfirmationPage />} />
              <Route path="/owner" element={<OwnerDashboardPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
