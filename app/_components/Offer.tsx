import Reveal from "./Reveal";

const ITEMS = [
  {
    n: "01",
    title: "First checks",
    body: "Direct funding to begin — sent fast, no strings, no equity. The earliest yes you will ever get.",
  },
  {
    n: "02",
    title: "Journal access",
    body: "The paywalled literature, opened. Read every paper you need without choosing between rent and research.",
  },
  {
    n: "03",
    title: "A place to think",
    body: "Accommodation while you build, so the question is what to work on — never where to sleep.",
  },
  {
    n: "04",
    title: "Mentorship",
    body: "Professors, founders, investors and researchers across five countries, on call when you are stuck.",
  },
  {
    n: "05",
    title: "Belief",
    body: "Someone who treats your work as inevitable before anyone else does. That changes what is possible.",
  },
];

export default function Offer() {
  return (
    <section className="band" id="offer">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <p className="eyebrow">What we give</p>
            <h2 className="section-title">
              Everything needed to pull a <em>Boltzmann</em> out of someone.
            </h2>
          </div>
          <p className="lede">
            Five commitments, made the moment you are accepted — not deliverables you must earn back.
          </p>
        </Reveal>

        <ul className="offer-list">
          {ITEMS.map((item, i) => (
            <Reveal as="li" key={item.n} className="offer-item" delay={i * 60}>
              <span className="index-num">{item.n}</span>
              <h3>{item.title}</h3>
              <p className="offer-body">{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
