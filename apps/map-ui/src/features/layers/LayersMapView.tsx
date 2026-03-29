import { useCallback, useEffect, useId, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBusinessProfileForSlug } from "../../data/loaders/businessProfile";
import { getAllChipsProducts } from "../../data/loaders/chipsProducts";
import { getAllModelsProducts } from "../../data/loaders/modelsProducts";
import { getFinancialNarrativeForSlug } from "../../data/loaders/financialNarrative";
import { getCompaniesByLayer } from "../../data/loaders/companyIndex";
import {
  getLatestQuarterForSlug,
  getQuarterHistoryForSlug,
} from "../../data/loaders/latestQuarter";
import { loadLayers } from "../../data/loaders/layers";
import type { BusinessProfileView } from "../../data/types/businessProfile";
import type { LatestQuarterView } from "../../data/types/quarter";
import { formatCompanySlug } from "../../utils/formatCompanySlug";
import { CompanyFinancialEvolution } from "./CompanyFinancialEvolution";
import { CompanyFinancialNarrative } from "./CompanyFinancialNarrative";
import { LayerSummaryTables } from "./LayerSummaryTables";

export function LayersMapView() {
  const { layerId, slug: selectedCompanySlug } = useParams<{
    layerId?: string;
    slug?: string;
  }>();
  const navigate = useNavigate();
  const overlayTitleId = useId();

  const { layers } = loadLayers();
  const expandedLayerId = layerId ?? null;

  const validLayerIds = useMemo(
    () => new Set(layers.map((l) => l.id)),
    [layers],
  );

  useEffect(() => {
    if (layerId && !validLayerIds.has(layerId)) {
      navigate("/", { replace: true });
    }
  }, [layerId, validLayerIds, navigate]);

  useEffect(() => {
    if (!layerId || !selectedCompanySlug) return;
    const slugs = getCompaniesByLayer(layerId).map((c) => c.slug);
    if (!slugs.includes(selectedCompanySlug)) {
      navigate(`/layer/${layerId}`, { replace: true });
    }
  }, [layerId, selectedCompanySlug, navigate]);

  const companiesByLayer = useMemo(() => {
    const m = new Map<string, { slug: string }[]>();
    for (const { id } of layers) {
      m.set(id, getCompaniesByLayer(id));
    }
    return m;
  }, [layers]);

  const selectedLayer = expandedLayerId
    ? layers.find((l) => l.id === expandedLayerId)
    : undefined;
  const companies = selectedLayer
    ? (companiesByLayer.get(selectedLayer.id) ?? [])
    : [];

  const expandLayer = useCallback(
    (id: string) => {
      if (expandedLayerId === id) {
        navigate("/");
      } else {
        navigate(`/layer/${id}`);
      }
    },
    [expandedLayerId, navigate],
  );

  const clearExpanded = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const closeCompanyOverlay = useCallback(() => {
    if (expandedLayerId) navigate(`/layer/${expandedLayerId}`);
  }, [expandedLayerId, navigate]);

  const openCompanyInLayer = useCallback(
    (lid: string, slug: string) => {
      navigate(`/layer/${lid}/company/${slug}`);
    },
    [navigate],
  );

  useEffect(() => {
    if (!selectedCompanySlug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.querySelector(".palette")) return;
      closeCompanyOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedCompanySlug, closeCompanyOverlay]);

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

  const chipsProducts = useMemo(
    () => (expandedLayerId === "chips" ? getAllChipsProducts() : []),
    [expandedLayerId],
  );

  const modelsProducts = useMemo(
    () => (expandedLayerId === "models" ? getAllModelsProducts() : []),
    [expandedLayerId],
  );

  const selectedNarrative =
    selectedCompanySlug != null
      ? getFinancialNarrativeForSlug(selectedCompanySlug)
      : null;

  const showLayerSummariesBelow =
    Boolean(selectedLayer) &&
    companies.length > 0 &&
    selectedCompanySlug == null &&
    expandedLayerId != null;

  const selectedCompanyDisplay =
    selectedCompanySlug != null
      ? formatCompanySlug(selectedCompanySlug)
      : "";

  return (
    <div className="pipeline">
      <div className="pipeline__ambient" aria-hidden>
        <div className="pipeline__grid" />
        <div className="pipeline__scan" />
      </div>

      <header className="pipeline__header">
        <h1 className="pipeline__title">AI value chain</h1>
        <p className="pipeline__lede">
          Expand a layer to compare companies; open a node for filings-backed
          detail. Use the rail, <span className="pipeline__lede-kbd">⌘K</span>,
          or keys <span className="pipeline__lede-kbd">1</span>–
          <span className="pipeline__lede-kbd">{layers.length}</span> for
          layers.
        </p>
      </header>

      <div
        className="pipeline__stack"
        role="region"
        aria-label="Value chain layers"
      >
        {layers.map(({ id, title }, index) => {
          const layerCompanies = companiesByLayer.get(id) ?? [];
          const isExpanded = expandedLayerId === id;
          const isDimmed =
            expandedLayerId != null && expandedLayerId !== id;

          return (
            <section
              key={id}
              className={
                isExpanded
                  ? "pipeline__band pipeline__band--expanded"
                  : isDimmed
                    ? "pipeline__band pipeline__band--dimmed"
                    : "pipeline__band"
              }
              aria-labelledby={`pipeline-layer-${id}`}
            >
              {index > 0 ? (
                <div className="pipeline__connector" aria-hidden>
                  <span className="pipeline__connector-line" />
                </div>
              ) : null}

              <div className="pipeline__band-inner">
                <button
                  type="button"
                  className="pipeline__band-head"
                  onClick={() => expandLayer(id)}
                  aria-expanded={isExpanded}
                  aria-controls={`pipeline-body-${id}`}
                  id={`pipeline-layer-${id}`}
                >
                  <span className="pipeline__band-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="pipeline__band-title">{title}</span>
                  <span className="pipeline__band-meta">
                    {layerCompanies.length}{" "}
                    {layerCompanies.length === 1 ? "player" : "players"}
                  </span>
                  <span className="pipeline__band-chevron" aria-hidden>
                    {isExpanded ? "−" : "+"}
                  </span>
                </button>

                <div
                  className="pipeline__band-body"
                  id={`pipeline-body-${id}`}
                  hidden={expandedLayerId !== id}
                >
                  {layerCompanies.length === 0 ? (
                    <p className="pipeline__empty">
                      No companies indexed for this layer yet.
                    </p>
                  ) : (
                    <ul
                      className="pipeline__nodes"
                      aria-label={`${title}: companies`}
                    >
                      {layerCompanies.map(({ slug }) => {
                        const q = getLatestQuarterForSlug(slug);
                        const hasData = q != null;
                        const isSelected =
                          selectedCompanySlug === slug &&
                          expandedLayerId === id;

                        return (
                          <li key={slug} className="pipeline__node-item">
                            <button
                              type="button"
                              className={
                                isSelected
                                  ? "pipeline__node pipeline__node--selected"
                                  : "pipeline__node"
                              }
                              onClick={() => {
                                navigate(`/layer/${id}/company/${slug}`);
                              }}
                              aria-pressed={isSelected}
                            >
                              <span className="pipeline__node-glow" aria-hidden />
                              <span className="pipeline__node-label">
                                {formatCompanySlug(slug)}
                              </span>
                              {hasData ? (
                                <span
                                  className="pipeline__node-pulse"
                                  title="Has quarter data"
                                  aria-label="Has quarter data"
                                />
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {expandedLayerId == null ? (
                  <div className="pipeline__band-preview mono">
                    {layerCompanies.slice(0, 5).map(({ slug }) => (
                      <button
                        key={slug}
                        type="button"
                        className="pipeline__preview-chip"
                        onClick={() => openCompanyInLayer(id, slug)}
                      >
                        {formatCompanySlug(slug)}
                      </button>
                    ))}
                    {layerCompanies.length > 5 ? (
                      <span className="pipeline__preview-more">
                        +{layerCompanies.length - 5}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {expandedLayerId ? (
        <div className="pipeline__toolbar mono">
          <button
            type="button"
            className="pipeline__toolbar-btn"
            onClick={clearExpanded}
          >
            Overview
          </button>
        </div>
      ) : null}

      {showLayerSummariesBelow && selectedLayer ? (
        <div className="pipeline__summaries mono">
          <LayerSummaryTables
            layerId={selectedLayer.id}
            companies={companyColumns}
            quarters={quarterBySlug}
            business={businessBySlug}
            chipsProducts={chipsProducts}
            modelsProducts={modelsProducts}
          />
        </div>
      ) : null}

      {selectedCompanySlug && selectedLayer ? (
        <div
          className="pipeline__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={overlayTitleId}
        >
          <button
            type="button"
            className="pipeline__overlay-scrim"
            onClick={closeCompanyOverlay}
            aria-label="Close detail"
          />
          <div className="pipeline__overlay-panel mono">
            <div className="pipeline__overlay-head">
              <div>
                <p className="pipeline__overlay-layer">{selectedLayer.title}</p>
                <h2 className="pipeline__overlay-title" id={overlayTitleId}>
                  {selectedCompanyDisplay}
                </h2>
              </div>
              <button
                type="button"
                className="pipeline__overlay-close"
                onClick={closeCompanyOverlay}
              >
                Close
              </button>
            </div>
            <div className="pipeline__overlay-body" aria-live="polite">
              {selectedQuarterHistory.length > 0 ? (
                <CompanyFinancialEvolution history={selectedQuarterHistory} />
              ) : (
                <p className="pipeline__empty pipeline__empty--inset">
                  No financial quarter files in content for this company yet.
                </p>
              )}
              {selectedNarrative ? (
                <CompanyFinancialNarrative narrative={selectedNarrative} />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
