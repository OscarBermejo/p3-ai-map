type Source = { url?: string; description: string };

type Props = {
  title: string;
  sources: Source[];
};

function label(s: Source): string {
  const t = s.description;
  return t.length > 120 ? `${t.slice(0, 117)}…` : t;
}

export function PrimarySourcesList({ title, sources }: Props) {
  if (sources.length === 0) return null;
  return (
    <div className="value-chain__narrative-sources">
      <h5 className="value-chain__narrative-sources-title">{title}</h5>
      <ul className="value-chain__narrative-source-list">
        {sources.map((s, i) => (
          <li key={`${s.url ?? "cite"}-${s.description.slice(0, 40)}-${i}`}>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="value-chain__narrative-source-link"
              >
                {label(s)}
              </a>
            ) : (
              <span className="value-chain__narrative-source-text">{label(s)}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
