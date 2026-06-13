import { ApplyPanelProvider } from "./_components/ApplyPanelContext";
import ApplyPanel from "./_components/ApplyPanel";
import Landing from "./_components/Landing";

export default function Home() {
  return (
    <ApplyPanelProvider>
      <Landing />
      <ApplyPanel />
    </ApplyPanelProvider>
  );
}
