import { ApplyPanelProvider } from "./_components/ApplyPanelContext";
import ApplyPanel from "./_components/ApplyPanel";
import CursorGrid from "./_components/CursorGrid";
import HeroPage from "./_components/HeroPage";
import RosterPage from "./_components/RosterPage";
import SectionJump from "./_components/SectionJump";
import SignalPage from "./_components/SignalPage";

export default function Home() {
  return (
    <ApplyPanelProvider>
      <CursorGrid />
      <SectionJump />
      <main className="site-shell" aria-label="Braveheart Fellowship">
        <HeroPage />
        <RosterPage />
        <SignalPage />
      </main>
      <ApplyPanel />
    </ApplyPanelProvider>
  );
}
