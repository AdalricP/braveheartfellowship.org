import Reveal from "./Reveal";

const CRITERIA = [
  {
    n: "i.",
    title: "Early, not proven",
    body: "You are at the very start of the journey. We are not looking for a track record — we are looking for the spark before the world notices it.",
  },
  {
    n: "ii.",
    title: "Outside the door",
    body: "Often from underprivileged backgrounds, often without the network that usually decides who gets a chance. The door has been closed. We open it.",
  },
  {
    n: "iii.",
    title: "Truth over consensus",
    body: "Drawn to theoretical physics and mathematics, and willing to go against the world for an idea you believe is right.",
  },
  {
    n: "iv.",
    title: "Builders, not talkers",
    body: "You have already made something — a proof, a prototype, a paper, a program. Conviction shows up in the work.",
  },
];

export default function WhoWeBack() {
  return (
    <section className="band who" id="who">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">Who we back</p>
          <h2 className="section-title who-title">
            Brave enough to bet on themselves <em>before anyone else will.</em>
          </h2>
        </Reveal>
        <Reveal delay={80} className="criteria">
          {CRITERIA.map((c) => (
            <div key={c.n}>
              <span className="num">{c.n}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
