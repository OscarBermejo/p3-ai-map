import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { getBusinessProfileForSlug } from "../../data/loaders/businessProfile";
import { getFinancialNarrativeForSlug } from "../../data/loaders/financialNarrative";
import { getCompaniesByLayer } from "../../data/loaders/companyIndex";
import {
  getLatestQuarterForSlug,
  getQuarterHistoryForSlug,
} from "../../data/loaders/latestQuarter";
import { loadLayers } from "../../data/loaders/layers";
import type { BusinessProfileView } from "../../data/types/businessProfile";
import type { LatestQuarterView } from "../../data/types/quarter";
import { CompanyFinancialEvolution } from "./CompanyFinancialEvolution";
import { CompanyFinancialNarrative } from "./CompanyFinancialNarrative";
import { LayerSummaryTables } from "./LayerSummaryTables";

function formatCompanySlug(slug: string): string {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function LayersMapView() {
  const { layers } = loadLayers();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCompanySlug, setSelectedCompanySlug] = useState<string | null>(
    null,
  );
  const detailPanelId = useId();

  const selectedLayer = selectedId
    ? layers.find((l) => l.id === selectedId)
    : undefined;
  const companies = selectedId ? getCompaniesByLayer(selectedId) : [];

  useEffect(() => {
    setSelectedCompanySlug(null);
  }, [selectedId]);

  const toggleLayer = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const clearLayer = useCallback(() => {
    setSelectedId(null);
    setSelectedCompanySlug(null);
  }, []);

  const selectCompany = useCallback((slug: string) => {
    setSelectedCompanySlug((prev) => (prev === slug ? null : slug));
  }, []);

  const selectedQuarterHistory =
    selectedCompanySlug != null
      ? getQuarterHistoryForSlug(selectedCompanySlug)
      : [];

  const companyColumns = useMemo(
    () =>
      companies.map(({ slug }) => ({
        slug,
        displayName: formatCompanySlug(slug),
      })),
    [companies],
  );

  const quarterBySlug = useMemo(() => {
    const m = new Map<string, LatestQuarterView | null>();
    for (const { slug } of companies) {
      m.set(slug, getLatestQuarterForSlug(slug));
    }
    return m;
  }, [companies]);

  const businessBySlug = useMemo(() => {
    const m = new Map<string, BusinessProfileView | null>();
    for (const { slug } of companies) {
      m.set(slug, getBusinessProfileForSlug(slug));
    }
    return m;
  }, [companies]);

  const selectedNarrative =
    selectedCompanySlug != null
      ? getFinancialNarrativeForSlug(selectedCompanySlug)
      : null;

  const mapSection = (
    <div className="value-chain__map">
      <section className="layers__section" aria-labelledby="layers-heading">
        <h2 id="layers-heading" className="layers__section-label">
          AI value chain
        </h2>
        <ol className="layers__list mono">
          {layers.map(({ id, title }) => {
            const isSelected = selectedId === id;
            return (
              <li key={id} className="layers__item">
                <button
                  type="button"
                  className={
                    isSelected
                      ? "layers__item-btn layers__item-btn--selected"
                      : "layers__item-btn"
                  }
                  onClick={() => toggleLayer(id)}
                  aria-pressed={isSelected}
                  aria-expanded={isSelected}
                  aria-controls={detailPanelId}
                >
                  <span className="layers__title">{title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );

  const showLayerSummariesBelow =
    Boolean(selectedLayer) &&
    companies.length > 0 &&
    selectedCompanySlug == null;

  return (
    <div
      className={
        selectedId ? "value-chain value-chain--split" : "value-chain"
      }
    >
      {selectedId ? (
        <>
          <div className="value-chain__split-top">
            {mapSection}
            <aside
              id={detailPanelId}
              className="value-chain__detail mono"
              hidden={!selectedLayer}
              aria-labelledby="layer-detail-heading"
            >
              {selectedLayer ? (
                <>
                  <div className="value-chain__detail-head">
                    <h3
                      id="layer-detail-heading"
                      className="value-chain__detail-title"
                    >
                      {selectedLayer.title}
                    </h3>
                    <button
                      type="button"
                      className="value-chain__back"
                      onClick={clearLayer}
                    >
                      All layers
                    </button>
                  </div>
                  {companies.length === 0 ? (
                    <p className="value-chain__empty">
                      No companies in the index for this layer yet.
                    </p>
                  ) : (
                    <div className="value-chain__detail-inner">
                      <div className="value-chain__company-column">
                        <p className="value-chain__company-list-label">
                          Companies in this layer
                        </p>
                        <ul
                          className="value-chain__companies"
                          aria-label={`Companies in ${selectedLayer.title}`}
                        >
                          {companies.map(({ slug }) => {
                            const isCoSelected = selectedCompanySlug === slug;
                            return (
                              <li key={slug} className="value-chain__company">
                                <button
                                  type="button"
                                  className={
                                    isCoSelected
                                      ? "value-chain__company-btn value-chain__company-btn--selected"
                                      : "value-chain__company-btn"
                                  }
                                  onClick={() => selectCompany(slug)}
                                  aria-pressed={isCoSelected}
                                >
                                  <span
                                    className="value-chain__tick"
                                    aria-hidden
                                  >
                                    {isCoSelected ? "✓" : "○"}
                                  </span>
                                  <span className="value-chain__company-name">
                                    {formatCompanySlug(slug)}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </aside>
          </div>
          {showLayerSummariesBelow && selectedLayer ? (
            <div className="value-chain__split-below mono">
              <LayerSummaryTables
                layerId={selectedLayer.id}
                companies={companyColumns}
                quarters={quarterBySlug}
                business={businessBySlug}
              />
            </div>
          ) : null}
          {selectedCompanySlug && selectedLayer ? (
            <div
              className="value-chain__split-below value-chain__split-below--company mono"
              aria-live="polite"
            >
              {selectedQuarterHistory.length > 0 ? (
                <CompanyFinancialEvolution
                  history={selectedQuarterHistory}
                  displayName={formatCompanySlug(selectedCompanySlug)}
                />
              ) : (
                <p className="value-chain__empty value-chain__empty--metrics">
                  No financial quarter files in content for this company yet.
                </p>
              )}
              {selectedNarrative ? (
                <CompanyFinancialNarrative
                  narrative={selectedNarrative}
                  displayName={formatCompanySlug(selectedCompanySlug)}
                />
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        mapSection
      )}
    </div>
  );
}
