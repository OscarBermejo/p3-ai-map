import { Link } from "react-router-dom";
import { loadLayers } from "../data/loaders/layers";
import { formatCompanySlug } from "../utils/formatCompanySlug";

type ConsoleBreadcrumbProps = {
  layerId?: string;
  companySlug?: string;
};

export function ConsoleBreadcrumb({
  layerId,
  companySlug,
}: ConsoleBreadcrumbProps) {
  const { layers } = loadLayers();
  const layer = layerId ? layers.find((l) => l.id === layerId) : undefined;

  return (
    <nav className="console__crumb" aria-label="Breadcrumb">
      <ol className="console__crumb-list">
        <li className="console__crumb-item">
          <Link className="console__crumb-link" to="/">
            Map
          </Link>
        </li>
        {layer ? (
          <li className="console__crumb-item">
            <span className="console__crumb-sep" aria-hidden>
              /
            </span>
            <Link className="console__crumb-link" to={`/layer/${layer.id}`}>
              {layer.title}
            </Link>
          </li>
        ) : null}
        {layer && companySlug ? (
          <li className="console__crumb-item">
            <span className="console__crumb-sep" aria-hidden>
              /
            </span>
            <span className="console__crumb-current">
              {formatCompanySlug(companySlug)}
            </span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
