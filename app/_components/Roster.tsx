"use client";

import { useEffect, useState } from "react";

type Member = { name: string; role: string; note: string };

export default function Roster() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/roster")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const fellows: Member[] = Array.isArray(data?.fellows) ? data.fellows : [];
        const grantees: Member[] = Array.isArray(data?.grantees) ? data.grantees : [];
        setMembers([...fellows, ...grantees].filter((m) => m && m.name));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (members.length === 0) return null;

  return (
    <section>
      <p className="block-title">Fellows</p>
      <div className="roster">
        {members.map((m, i) => (
          <div className="roster-row" key={`${m.name}-${i}`}>
            <span className="roster-name">{m.name}</span>
            {m.note ? <span className="roster-note">{m.note}</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
