"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";

type Member = { name: string; role: string; note: string };

export default function Roster() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/roster")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const fellows: Member[] = Array.isArray(data?.fellows) ? data.fellows : [];
        const grantees: Member[] = Array.isArray(data?.grantees) ? data.grantees : [];
        setMembers([...fellows, ...grantees].filter((m) => m && m.name));
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="band" id="fellows">
      <div className="wrap">
        <Reveal className="section-head">
          <div>
            <p className="eyebrow">The cohort</p>
            <h2 className="section-title">
              The brave, <em>named.</em>
            </h2>
          </div>
          <p className="lede">
            Every fellow and grantee Braveheart has backed. The list is short on purpose, and growing.
          </p>
        </Reveal>

        {members.length > 0 ? (
          <ul className="roster-list">
            {members.map((m, i) => (
              <Reveal as="li" key={`${m.name}-${i}`} className="roster-row" delay={i * 40}>
                <span className="roster-name">{m.name}</span>
                <span className="roster-note">{m.note}</span>
                <span className="roster-role">{m.role}</span>
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal>
            <p className="roster-empty">
              {loaded ? "The first cohort is forming. Yours could be the first name here." : "Loading the cohort…"}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
