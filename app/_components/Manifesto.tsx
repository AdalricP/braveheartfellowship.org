import Reveal from "./Reveal";

export default function Manifesto() {
  return (
    <section className="band manifesto" id="manifesto">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">The thesis</p>
          <p className="manifesto-quote">
            Genius is distributed evenly. <em>Opportunity is not.</em>
          </p>
        </Reveal>
        <Reveal delay={100} className="manifesto-body">
          <p>
            The next Boltzmann or Dirac is alive right now — sketching in a margin, debugging at 3am,
            unable to afford the journal that holds the paper they need. The world asks them for
            credentials. <strong>We ask what they have built.</strong>
          </p>
          <p>
            We focus on theoretical physics and mathematics, and on the kind of person willing to be
            wrong in public for the chance of being right. No committees, no permission slips. Just
            conviction, capital, and a network that opens doors. <strong>Braveheart is the first
            believer.</strong>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
