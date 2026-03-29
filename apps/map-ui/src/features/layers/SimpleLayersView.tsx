import { useCallback, useMemo, useState } from "react";
import {
  getBusinessProfileForSlug,
  getBusinessSourcesForSlug,
} from "../../data/loaders/businessProfile";
import { getFinancialNarrativeForSlug } from "../../data/loaders/financialNarrative";
import {
  getCompaniesByLayer,
  getLayerForSlug,
} from "../../data/loaders/companyIndex";
import { getChipsProductsForSlug } from "../../data/loaders/chipsProducts";
import { getModelsProductsForSlug } from "../../data/loaders/modelsProducts";
import {
  getQuarterHistoryForSlug,
} from "../../data/loaders/latestQuarter";
import { loadLayers } from "../../data/loaders/layers";
import { formatCompanySlug } from "../../utils/formatCompanySlug";
import { CompanyBusinessSummary } from "./CompanyBusinessSummary";
import { CompanyFinancialEvolution } from "./CompanyFinancialEvolution";
import { CompanyFinancialNarrative } from "./CompanyFinancialNarrative";
import {
  ChipsProductsCompareTable,
  ModelsProductsCompareTable,
} from "./productCatalogTables";
import { PrimarySourcesList } from "./PrimarySourcesList";

type DetailTab = "financial" | "business" | "narrative";

const TAB_INTRO: Record<DetailTab, string> = {
  financial:
    "Use this view to see how key figures—such as revenue and margins—move from one period to the next. " +
    "The amounts are taken from the company’s tracked quarters and are meant to line up with public disclosures (for example regulatory filings or official investor materials), with sources noted where they were recorded.",
  business:
    "Here you’ll find a concise operating picture: capacity, compute, major contracts, and how the company fits the layer—drawn from a structured profile that editors keep up to date. " +
    "Individual lines may include short notes or caveats where the underlying facts need context.",
  narrative:
    "This is written analysis: themes, open questions, disclosure gaps, and conclusions—not a table of numbers. " +
    "It reflects how someone has read the same public information summarized under Financial; it is not investment advice and does not replace official filings or the company’s own statements.",
};

export function SimpleLayersView() {
  const { layers } = loadLayers();
  const [openLayerId, setOpenLayerId] = useState<string | null>(null);
  const [selectedCompanySlug, setSelectedCompanySlug] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<DetailTab>("financial");

  const toggleLayer = useCallback((id: string) => {
    setSelectedCompanySlug(null);
    setOpenLayerId((prev) => (prev === id ? null : id));
  }, []);

  const openRows = useMemo(
    () => (openLayerId != null ? getCompaniesByLayer(openLayerId) : []),
    [openLayerId],
  );

  const selectCompany = useCallback((slug: string) => {
    setSelectedCompanySlug((prev) => (prev === slug ? null : slug));
  }, []);

  const quarterHistory = useMemo(
    () =>
      selectedCompanySlug != null
        ? getQuarterHistoryForSlug(selectedCompanySlug)
        : [],
    [selectedCompanySlug],
  );

  const businessProfile = useMemo(
    () =>
      selectedCompanySlug != null
        ? getBusinessProfileForSlug(selectedCompanySlug)
        : null,
    [selectedCompanySlug],
  );

  const companyLayer = useMemo(
    () =>
      selectedCompanySlug != null
        ? getLayerForSlug(selectedCompanySlug)
        : null,
    [selectedCompanySlug],
  );

  const chipsProductsForCompany = useMemo(
    () =>
      selectedCompanySlug != null
        ? getChipsProductsForSlug(selectedCompanySlug)
        : [],
    [selectedCompanySlug],
  );

  const modelsProductsForCompany = useMemo(
    () =>
      selectedCompanySlug != null
        ? getModelsProductsForSlug(selectedCompanySlug)
        : [],
    [selectedCompanySlug],
  );

  const businessPanelIntro =
    companyLayer === "chips"
      ? "Product-level accelerator specs (memory, compute, workload fit) from the structured business profile. Hover dotted values for notes."
      : companyLayer === "models"
        ? "Model lineup: benchmarks, pricing snapshots, and latency where tracked. Hover dotted values for notes."
        : TAB_INTRO.business;

  const narrative = useMemo(
    () =>
      selectedCompanySlug != null
        ? getFinancialNarrativeForSlug(selectedCompanySlug)
        : null,
    [selectedCompanySlug],
  );

  const businessSources = useMemo(
    () =>
      selectedCompanySlug != null
        ? getBusinessSourcesForSlug(selectedCompanySlug)
        : [],
    [selectedCompanySlug],
  );

  return (
    <div className="simple-map-page">
      <div className="simple-map__layers-row">
        {layers.map(({ id, title }) => {
          const open = openLayerId === id;
          const dimmed = openLayerId != null && !open;

          return (
            <div key={id} className="simple-map__section">
              <button
                type="button"
                className={[
                  "simple-map__layer",
                  open && "simple-map__layer--active",
                  dimmed && "simple-map__layer--dimmed",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleLayer(id)}
                aria-expanded={open}
              >
                {title}
              </button>
            </div>
          );
        })}
      </div>

      {openLayerId != null ? (
        <div
          className="simple-map__companies-row"
          role="region"
          aria-label="Companies in selected layer"
        >
          {openRows.length === 0 ? (
            <p className="simple-map__empty">No companies indexed.</p>
          ) : (
            <ul className="simple-map__list">
              {openRows.map(({ slug }) => {
                const selected = selectedCompanySlug === slug;
                const companyDimmed =
                  selectedCompanySlug != null && !selected;
                return (
                  <li key={slug} className="simple-map__item">
                    <button
                      type="button"
                      className={[
                        "simple-map__company",
                        selected && "simple-map__company--selected",
                        companyDimmed && "simple-map__company--dimmed",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => selectCompany(slug)}
                      aria-pressed={selected}
                    >
                      {formatCompanySlug(slug)}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {selectedCompanySlug != null ? (
        <div className="simple-map__detail">
          <div className="simple-map__tabs" role="tablist" aria-label="Company detail">
            {(
              [
                ["financial", "Financial"],
                ["business", "Business"],
                ["narrative", "Narrative"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                className={
                  activeTab === id
                    ? "simple-map__tab simple-map__tab--active"
                    : "simple-map__tab"
                }
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            className="simple-map__panel"
            role="tabpanel"
            aria-live="polite"
          >
            {activeTab === "financial" ? (
              <>
                <p className="simple-map__tab-intro">{TAB_INTRO.financial}</p>
                {quarterHistory.length > 0 ? (
                  <CompanyFinancialEvolution history={quarterHistory} />
                ) : (
                  <p className="simple-map__panel-empty">
                    No quarterly financial data is available for this company yet.
                  </p>
                )}
              </>
            ) : null}

            {activeTab === "business" ? (
              <>
                <p className="simple-map__tab-intro">{businessPanelIntro}</p>
                {companyLayer === "chips" &&
                chipsProductsForCompany.length > 0 ? (
                  <ChipsProductsCompareTable
                    products={chipsProductsForCompany}
                    mode="simple"
                  />
                ) : companyLayer === "models" &&
                  modelsProductsForCompany.length > 0 ? (
                  <ModelsProductsCompareTable
                    products={modelsProductsForCompany}
                    mode="simple"
                  />
                ) : (
                  <CompanyBusinessSummary profile={businessProfile} />
                )}
                <PrimarySourcesList
                  title="Primary sources (business)"
                  sources={businessSources}
                />
              </>
            ) : null}

            {activeTab === "narrative" ? (
              <>
                <p className="simple-map__tab-intro">{TAB_INTRO.narrative}</p>
                {narrative ? (
                  <CompanyFinancialNarrative narrative={narrative} />
                ) : (
                  <p className="simple-map__panel-empty">
                    No narrative analysis is available for this company yet.
                  </p>
                )}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
