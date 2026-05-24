"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type RosterItem = {
  name: string;
  role?: string;
  note?: string;
  notes?: string;
  application_type?: string;
  image?: string;
  image_url?: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function RosterCard({ item, type }: { item: RosterItem; type: "fellows" | "grantees" | "all" }) {
  const initials = getInitials(item.name || "");
  const imageSource = item.image || item.image_url;
  const role = item.role || (type === "grantees" ? "micro grant" : "fellowship");
  const note = item.note || item.notes || item.application_type || "";

  return (
    <article className="roster-card">
      <div className="roster-avatar">
        {imageSource ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSource} alt={item.name} />
        ) : (
          <div className="roster-avatar-fallback" aria-hidden="true">
            {initials}
          </div>
        )}
      </div>
      <div className="roster-body">
        <div className="roster-name">{item.name}</div>
        <div className="roster-role">{role}</div>
        <div className="roster-note">{note}</div>
      </div>
    </article>
  );
}

export default function RosterPage() {
  const [items, setItems] = useState<RosterItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/roster");
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message || "Could not load roster.");
        if (cancelled) return;
        const fellows: RosterItem[] = Array.isArray(result.fellows)
          ? result.fellows.map((item: RosterItem) => ({ ...item, role: item.role || "fellowship" }))
          : [];
        const grantees: RosterItem[] = Array.isArray(result.grantees)
          ? result.grantees.map((item: RosterItem) => ({ ...item, role: item.role || "micro grant" }))
          : [];
        setItems([...fellows, ...grantees]);
      } catch {
        if (!cancelled) setItems([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="page roster-page" id="fellows-grantees" data-page>
      <div className="page-inner roster-layout">
        <div className="roster-header">
          <h2>Fellows / Grantees</h2>
        </div>
        <div className="roster-list">
          {items === null || items.length === 0 ? (
            <article className="roster-empty">
              <p>
                New fellows and grantees land here. Add entries to the spreadsheet and they will
                appear here automatically.
              </p>
            </article>
          ) : (
            items.map((item, i) => <RosterCard key={`${item.name}-${i}`} item={item} type="all" />)
          )}
        </div>
        <Partners />
      </div>
    </section>
  );
}

const partners: { name: string; href?: string; logo?: string; logoClassName?: string; cardClassName?: string }[] = [
  {
    name: "Forge Residency",
    href: "https://forgeresidency.com",
    logo: "/assets/forge_logo.png",
    cardClassName: "partner-card-forge",
    logoClassName: "partner-logo-forge",
  },
  {
    name: "Lotus Fund",
    logo: "/assets/lotusfund.png",
    cardClassName: "partner-card-lotus",
    logoClassName: "partner-logo-lotus",
  },
  {
    name: "Lagrange Point",
    logo: "/assets/lagrange_point_logo.jpg",
    cardClassName: "partner-card-lagrange",
    logoClassName: "partner-logo-lagrange",
  },
];

function Partners() {
  return (
    <footer className="partners-section" aria-label="Braveheart partners">
      <div className="partners-eyebrow">
        <span className="partners-line" />
        <p className="partners-title">Partners</p>
        <span className="partners-line" />
      </div>
      <div className="partners-grid">
        {partners.map((p, i) => {
          const inner = (
            <>
              {p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={`partner-card-logo${p.logoClassName ? ` ${p.logoClassName}` : ""}`}
                  src={p.logo}
                  alt={p.name}
                />
              ) : (
                <span className="partner-card-name">{p.name}</span>
              )}
              <span className="partner-card-label">{p.name}</span>
            </>
          );

          const motionProps = {
            className: `partner-card${p.href ? " partner-card-link" : ""}${p.cardClassName ? ` ${p.cardClassName}` : ""}`,
            initial: { opacity: 0, y: 18 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-10% 0px" },
            transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
            whileHover: { y: -4, scale: 1.01 },
          };

          return p.href ? (
            <motion.a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" {...motionProps}>
              {inner}
            </motion.a>
          ) : (
            <motion.div key={p.name} {...motionProps}>
              {inner}
            </motion.div>
          );
        })}
      </div>
    </footer>
  );
}
