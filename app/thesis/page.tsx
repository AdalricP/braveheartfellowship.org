import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thesis",
  description: "Why Braveheart backs young people doing important research the world needs.",
};

export default function ThesisPage() {
  return (
    <main className="prose">
      <a className="back" href="/">← Braveheart Fellowship</a>

      <h1>Genius is distributed evenly. Opportunity is not.</h1>
      <p className="dek">The Braveheart thesis.</p>

      <p>
        The next person to change a field is alive right now — working alone, building in the margins,
        unable to afford the journal that holds the paper they need. The world asks them for
        credentials. We ask what they have built.
      </p>
      <p>
        Braveheart finds young people at the very start of their work and becomes their first
        believer. Not a committee. Not a permission slip. The earliest yes they will ever get, plus
        the tools and the network to make the work real.
      </p>

      <h2>Important research that can pay for itself</h2>
      <p>
        We are not limited to any one field. We back people doing research that matters to the world —
        and that can stand on its own two feet financially. The discovery should be real, and the path
        from discovery to something durable should be plausible. Truth first, but truth that can fund
        more truth.
      </p>
      <p>
        That means a theoretical physicist and a founder building a hard-science company can both
        belong here. What they share is conviction, output, and the willingness to be wrong in public
        for the chance of being right.
      </p>

      <h2>Who we back</h2>
      <p>
        Young, early, and unproven in the eyes of the institutions that usually decide who gets a
        chance — often from backgrounds without the network that opens doors. People who have already
        made something: a proof, a prototype, a paper, a program. Conviction shows up in the work.
      </p>

      <h2>What we give</h2>
      <p>
        Access to journals and the literature. A research network of professors, founders, investors
        and researchers. AI, cloud compute, and deep-research tools. And access to equipment, hardware,
        and the lab — the physical means to actually run the experiment.
      </p>
      <p>
        The point is simple: remove the reasons a brave person can&apos;t begin, and back them before
        anyone else will.
      </p>

      <h2>Apply</h2>
      <p>
        There is no season and no committee. Tell us what you are working on and what you are proudest
        of having built. If it is real, we will move fast. Fortune favours the bold.
      </p>
    </main>
  );
}
