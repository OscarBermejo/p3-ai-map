import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import type { FinancialNarrativeView } from "../../data/types/financialNarrative";

type Props = {
  narrative: FinancialNarrativeView;
  displayName: string;
};

function bodyParagraphs(body: string): string[] {
  return body
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Renders YAML narrative prose (bold, inline code, etc.) — not plain text. */
const narrativeMdComponents: Components = {
  p: ({ children }) => (
    <p className="value-chain__narrative-p">{children}</p>
  ),
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ children }) => (
    <code className="value-chain__code">{children}</code>
  ),
};

function NarrativeMarkdownBody({ text }: { text: string }) {
  return (
    <>
      {bodyParagraphs(text).map((para, i) => (
        <ReactMarkdown key={i} components={narrativeMdComponents}>
          {para}
        </ReactMarkdown>
      ))}
    </>
  );
}

export function CompanyFinancialNarrative({ narrative, displayName }: Props) {
  const {
    basedOnFinancials,
    asOf,
    centralQuestions,
    sections,
    disclosureGaps,
    sources,
  } = narrative;

  return (
    <section
      className="value-chain__narrative"
      aria-labelledby="financial-narrative-heading"
    >
      <h4
        id="financial-narrative-heading"
        className="value-chain__narrative-title"
      >
        Financial narrative
      </h4>
      <p className="value-chain__narrative-meta">
        <span className="value-chain__narrative-badge">Interpretation</span>
        {displayName} — based on{" "}
        <code className="value-chain__code">{basedOnFinancials.file}</code>
        {basedOnFinancials.periodLabel ? (
          <>
            {" "}
            ({basedOnFinancials.periodLabel}, period end{" "}
            {basedOnFinancials.periodEnd})
          </>
        ) : (
          <> (period end {basedOnFinancials.periodEnd})</>
        )}
        . Narrative as of {asOf}. Not audited metrics.
      </p>

      {centralQuestions.length > 0 ? (
        <div className="value-chain__narrative-questions">
          <h5 className="value-chain__narrative-questions-title">
            Questions this narrative tries to answer
          </h5>
          <ol className="value-chain__narrative-questions-list">
            {centralQuestions.map((q, i) => (
              <li key={i} className="value-chain__narrative-questions-item">
                <ReactMarkdown
                  components={{
                    ...narrativeMdComponents,
                    p: ({ children }) => (
                      <span className="value-chain__narrative-questions-md">
                        {children}
                      </span>
                    ),
                  }}
                >
                  {q}
                </ReactMarkdown>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="value-chain__narrative-sections">
        {sections.map((sec) => (
          <article
            key={sec.id}
            className={
              sec.id === "conclusion"
                ? "value-chain__narrative-article value-chain__narrative-article--conclusion"
                : "value-chain__narrative-article"
            }
          >
            <h5 className="value-chain__narrative-section-title">{sec.title}</h5>
            <div className="value-chain__narrative-body">
              <NarrativeMarkdownBody text={sec.body} />
            </div>
          </article>
        ))}
      </div>

      {disclosureGaps ? (
        <div className="value-chain__narrative-gaps">
          <h5 className="value-chain__narrative-gaps-title">Disclosure gaps</h5>
          <div className="value-chain__narrative-body">
            <NarrativeMarkdownBody text={disclosureGaps} />
          </div>
        </div>
      ) : null}

      {sources.length > 0 ? (
        <div className="value-chain__narrative-sources">
          <h5 className="value-chain__narrative-sources-title">
            Primary sources (narrative)
          </h5>
          <ul className="value-chain__narrative-source-list">
            {sources.map((s, i) => (
              <li key={`${s.url}-${i}`}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="value-chain__narrative-source-link"
                >
                  {s.description.length > 120
                    ? `${s.description.slice(0, 117)}…`
                    : s.description}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
