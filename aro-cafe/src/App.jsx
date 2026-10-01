import { useSiteAnimations } from './hooks/useSiteAnimations.js';
import Environment from './components/layout/Environment.jsx';
import Nav from './components/layout/Nav.jsx';
import Footer from './components/layout/Footer.jsx';
import Dock from './components/layout/Dock.jsx';
import Hero from './components/hero/Hero.jsx';
import Echo from './components/sections/Echo.jsx';
import NameSection from './components/sections/NameSection.jsx';
import MenuSection from './components/sections/MenuSection.jsx';
import DaySection from './components/sections/DaySection.jsx';
import TeamSection from './components/sections/TeamSection.jsx';
import MomentsSection from './components/sections/MomentsSection.jsx';
import HelloSection from './components/sections/HelloSection.jsx';
import FaqSection from './components/sections/FaqSection.jsx';
import VisitSection from './components/sections/VisitSection.jsx';

export default function App(){
  useSiteAnimations();
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Environment />
      <Nav />
      <Hero />
      <main id="main" tabIndex={-1}>
        <Echo />
        <NameSection />
        <MenuSection />
        <DaySection />
        <TeamSection />
        <MomentsSection />
        <HelloSection />
        <FaqSection />
        <VisitSection />
      </main>
      <Footer />
      <Dock />
    </>
  );
}
