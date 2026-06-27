import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import FinancialChart from "@/components/FinancialChart";
import GeoMap from "@/components/GeoMap";
import NetworkGraph from "@/components/NetworkGraph";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <div className="section-divider" />
      <Dashboard />
      <div className="section-divider" />
      <FinancialChart />
      <div className="section-divider" />
      <GeoMap />
      <div className="section-divider" />
      <NetworkGraph />
      <div className="section-divider" />
      <About />
      <Footer />
    </main>
  );
}
