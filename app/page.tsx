import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import FinancialChart from "@/components/FinancialChart";
import CandleChart from "@/components/CandleChart";
import GlobalMarkets from "@/components/GlobalMarkets";
import GeoMap from "@/components/GeoMap";
import NetworkGraph from "@/components/NetworkGraph";
import BubbleChart from "@/components/BubbleChart";
import HeatmapSection from "@/components/HeatmapSection";
import StreamGraph from "@/components/StreamGraph";
import ScatterMatrix from "@/components/ScatterMatrix";
import McKinseyCharts from "@/components/McKinseyCharts";
import About from "@/components/About";
import Footer from "@/components/Footer";
import LayoutToggle from "@/components/LayoutToggle";

export default function Home() {
  return (
    <LayoutToggle>
      <main>
        <Navbar />
        <Hero />
        <div className="section-divider" />
        <Dashboard />
        <div className="section-divider" />
        <FinancialChart />
        <div className="section-divider" />
        <CandleChart />
        <div className="section-divider" />
        <GlobalMarkets />
        <div className="section-divider" />
        <GeoMap />
        <div className="section-divider" />
        <NetworkGraph />
        <div className="section-divider" />
        <BubbleChart />
        <div className="section-divider" />
        <HeatmapSection />
        <div className="section-divider" />
        <StreamGraph />
        <div className="section-divider" />
        <ScatterMatrix />
        <div className="section-divider" />
        <McKinseyCharts />
        <div className="section-divider" />
        <About />
        <Footer />
      </main>
    </LayoutToggle>
  );
}
