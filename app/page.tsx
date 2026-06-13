import { ApplyPanelProvider } from "./_components/ApplyPanelContext";
import ApplyPanel from "./_components/ApplyPanel";
import Header from "./_components/Header";
import HeroPage from "./_components/HeroPage";
import Manifesto from "./_components/Manifesto";
import Offer from "./_components/Offer";
import WhoWeBack from "./_components/WhoWeBack";
import Roster from "./_components/Roster";
import Closing from "./_components/Closing";

export default function Home() {
  return (
    <ApplyPanelProvider>
      <Header />
      <main className="site" aria-label="Braveheart Fellowship">
        <HeroPage />
        <Manifesto />
        <Offer />
        <WhoWeBack />
        <Roster />
        <Closing />
      </main>
      <ApplyPanel />
    </ApplyPanelProvider>
  );
}
