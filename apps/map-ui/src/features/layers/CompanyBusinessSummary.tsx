import type { BusinessProfileView } from "../../data/types/businessProfile";

type Row = { label: string; value: string; note: string | null };

function rowsFromProfile(p: BusinessProfileView): Row[] {
  const out: Row[] = [];
  const push = (
    label: string,
    value: number | string | boolean | null | undefined,
    note: string | null,
  ) => {
    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    out.push({
      label,
      value: typeof value === "boolean" ? (value ? "Yes" : "No") : String(value),
      note,
    });
  };

  if (p.asOf) out.push({ label: "As of", value: p.asOf, note: null });
  push("Capacity online (MW)", p.capacityOnline, p.capacityOnlineNotes);
  push("Capacity contracted (MW)", p.capacityContracted, p.capacityContractedNotes);
  push("Capacity secured / pipeline (MW)", p.capacitySecured, p.capacitySecuredNotes);
  push("GPUs online", p.gpusOnline, p.gpusOnlineNotes);
  push("GPUs contracted / on order", p.gpusContracted, p.gpusContractedNotes);
  push("GPUs secured / pipeline", p.gpusSecured, p.gpusSecuredNotes);
  push("Contract backlog (USD)", p.contractsUsdOnline, p.contractsUsdOnlineNotes);
  push("Datacenters / sites", p.dcCount, p.dcCountNotes);
  push("Integration model", p.integrationModel, p.integrationModelNotes);
  if (p.offersManagedPlatform !== null) {
    push(
      "Managed platform",
      p.offersManagedPlatform,
      p.offersManagedPlatformNotes,
    );
  }
  return out;
}

type Props = {
  profile: BusinessProfileView | null;
};

export function CompanyBusinessSummary({ profile }: Props) {
  if (!profile) {
    return (
      <p className="simple-map__panel-empty">
        No business profile is available for this company yet.
      </p>
    );
  }

  const rows = rowsFromProfile(profile);
  if (rows.length === 0) {
    return (
      <p className="simple-map__panel-empty">
        A profile is on file but no fields have been filled in yet.
      </p>
    );
  }

  return (
    <dl className="simple-map__dl">
      {rows.map((r) => (
        <div key={r.label} className="simple-map__dl-row">
          <dt className="simple-map__dl-dt">{r.label}</dt>
          <dd className="simple-map__dl-dd">
            {r.value}
            {r.note ? (
              <span className="simple-map__dl-note"> — {r.note}</span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
