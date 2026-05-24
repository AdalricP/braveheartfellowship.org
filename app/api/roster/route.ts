import { NextResponse } from "next/server";
import Airtable from "airtable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RosterRow = {
  name: string;
  role: string;
  note: string;
  image?: string;
};

type AirtableBase = ReturnType<Airtable["base"]>;

function fieldStr(record: { get: (key: string) => unknown }, key: string): string {
  const value = record.get(key);
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

async function fetchApproved(
  base: AirtableBase,
  tableName: string,
  defaultRole: string,
): Promise<RosterRow[]> {
  try {
    const records = await base(tableName)
      .select({
        filterByFormula: '{Status} = "Approved"',
        fields: ["Name", "Work Description", "Status"],
      })
      .all();

    return records.map((record) => ({
      name: fieldStr(record, "Name"),
      role: defaultRole,
      note: fieldStr(record, "Work Description"),
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const pat = process.env.AIRTABLE_PAT;

  if (!baseId || !pat) {
    return NextResponse.json({ ok: true, fellows: [], grantees: [] });
  }

  const base = new Airtable({ apiKey: pat }).base(baseId);
  const fellowshipTable = process.env.AIRTABLE_TABLE_FELLOWSHIP || "Fellowship";
  const grantTable = process.env.AIRTABLE_TABLE_GRANT || "Grant";

  const [fellows, grantees] = await Promise.all([
    fetchApproved(base, fellowshipTable, "fellowship"),
    fetchApproved(base, grantTable, "micro grant"),
  ]);

  return NextResponse.json({ ok: true, fellows, grantees });
}
