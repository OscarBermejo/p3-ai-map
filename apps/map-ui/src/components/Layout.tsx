import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";

const ABOUT_LEAVE_MS = 220;

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const leaveTimerRef = useRef<number | null>(null);
  const brandButtonRef = useRef<HTMLButtonElement>(null);
  const aboutDialogRef = useRef<HTMLDivElement>(null);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current != null) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const closeAbout = useCallback(() => {
    clearLeaveTimer();
    setAboutOpen(false);
  }, [clearLeaveTimer]);

  const enterAboutZone = useCallback(() => {
    clearLeaveTimer();
    setAboutOpen(true);
  }, [clearLeaveTimer]);

  const leaveAboutZone = useCallback(() => {
    clearLeaveTimer();
    leaveTimerRef.current = window.setTimeout(() => {
      leaveTimerRef.current = null;
      setAboutOpen(false);
    }, ABOUT_LEAVE_MS);
  }, [clearLeaveTimer]);

  const handleBrandBlur = useCallback(
    (e: FocusEvent<HTMLButtonElement>) => {
      const next = e.relatedTarget as Node | null;
      if (next && aboutDialogRef.current?.contains(next)) {
        clearLeaveTimer();
        return;
      }
      leaveAboutZone();
    },
    [clearLeaveTimer, leaveAboutZone],
  );

  const handleDialogBlur = useCallback(
    (e: FocusEvent<HTMLDivElement>) => {
      const next = e.relatedTarget as Node | null;
      if (next && brandButtonRef.current?.contains(next)) {
        clearLeaveTimer();
        return;
      }
      leaveAboutZone();
    },
    [clearLeaveTimer, leaveAboutZone],
  );

  useEffect(() => () => clearLeaveTimer(), [clearLeaveTimer]);

  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAbout();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen, closeAbout]);

  return (
    <div className="layout">
      <main className="layout__main">{children}</main>
      {aboutOpen ? (
        <div className="layout__about-backdrop" aria-hidden />
      ) : null}
      <div className="layout__about-anchor">
        <button
          ref={brandButtonRef}
          type="button"
          className="layout__brand"
          aria-label="theaimap — about this page"
          aria-expanded={aboutOpen}
          aria-haspopup="dialog"
          aria-controls="layout-about-dialog"
          onMouseEnter={enterAboutZone}
          onMouseLeave={leaveAboutZone}
          onFocus={enterAboutZone}
          onBlur={handleBrandBlur}
        >
          theaimap
        </button>
      </div>
      {aboutOpen ? (
        <div
          ref={aboutDialogRef}
          className="layout__about-dialog"
          id="layout-about-dialog"
          role="dialog"
          aria-labelledby="layout-about-title"
          tabIndex={0}
          onMouseEnter={enterAboutZone}
          onMouseLeave={leaveAboutZone}
          onFocus={enterAboutZone}
          onBlur={handleDialogBlur}
        >
          <h2 id="layout-about-title" className="layout__about-title">
            TheAiMap
          </h2>
          <div className="layout__about-body">
            <p>
              TheAiMap is meant to help you see how companies fit into the AI
              value chain and how their story shows up in the numbers, the
              business, and the public record—so you can orient yourself and
              compare players side by side. It is not investment advice and not
              a substitute for reading filings and primary sources yourself.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
