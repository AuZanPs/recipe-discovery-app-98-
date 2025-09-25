import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import './HelpTooltip.css';

interface HelpTooltipProps {
  children: React.ReactNode;
}

export const HelpTooltip = ({ children }: HelpTooltipProps) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [overlayMode, setOverlayMode] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const idBase = useRef<string>(`help-${Math.random().toString(36).slice(2)}`);
  // compute stable id values
  const titleId = useMemo(() => `${idBase.current}-title`, []);
  const contentId = useMemo(() => `${idBase.current}-content`, []);

  // Helpers for environment detection
  const isMobileViewport = () => (typeof window !== 'undefined' ? window.innerWidth <= 767 : false);
  // Treat mobile strictly by viewport for consistent UX across hybrid devices
  const isMobile = () => isMobileViewport();

  const computePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 768;
  const margin = 8;

    // Mobile-first: use overlay on very small screens
    if (viewportW <= 767) {
      setOverlayMode(true);
      return;
    }

    setOverlayMode(false);

    // Preferred: right side placement
    let x = rect.right + 10;
    let y = rect.top;

    // If we can measure tooltip, adjust to prevent overflow
    const w = tooltipRef.current?.offsetWidth ?? 280; // default width
    const h = tooltipRef.current?.offsetHeight ?? 200; // estimate

    // Prevent right overflow -> place to left
    if (x + w + margin > viewportW) {
      x = rect.left - w - 10;
      // If still overflows left, center as fallback
      if (x < margin) {
        x = Math.max(margin, Math.round((viewportW - w) / 2));
      }
    }

    // Prevent bottom overflow -> shift up
    if (y + h + margin > viewportH) {
      y = Math.max(margin, viewportH - h - margin);
    }

    // Prevent top overflow
    if (y < margin) y = margin;

    setPosition({ x, y });
  };

  const open = () => {
    clearTimeout(timeoutRef.current);
    setShow(true);
  };

  const handleMouseEnter = () => {
    // Avoid hover-based open on mobile/touch to prevent flash/close
    if (isMobile()) return;
    open();
  };

  const handleMouseLeave = () => {
    // Avoid hover-based close on mobile/touch to prevent flash/close
    if (isMobile()) return;
    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, 100); // Small delay for better UX
  };

  const handleTooltipMouseEnter = () => {
    clearTimeout(timeoutRef.current);
  };

  const handleTooltipMouseLeave = () => {
    if (isMobile()) return; // Don't auto-close on mobile overlay via mouseleave
    setShow(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Toggle on click for touch devices and mouse users
    e.stopPropagation();
    // On touch/mobile, click may fire after touchstart; ignore to avoid double toggle
    if (isMobile()) return;
    if (show) setShow(false); else open();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Touch-first toggle to prevent hover conflicts
    e.preventDefault();
    e.stopPropagation();
    setShow(prev => !prev);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShow(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onResizeOrScroll = () => {
      if (show) computePosition();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResizeOrScroll);
      window.addEventListener('scroll', onResizeOrScroll, true);
      if (show) window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onResizeOrScroll);
        window.removeEventListener('scroll', onResizeOrScroll, true);
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [show]);

  useLayoutEffect(() => {
    if (show) computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Lock body scroll while overlay is open on mobile
  useEffect(() => {
    if (show && (overlayMode || isMobileViewport())) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [show, overlayMode]);

  // Focus close button when opening modal on mobile for accessibility
  useEffect(() => {
    if (show && overlayMode && tooltipRef.current) {
      const closeBtn = tooltipRef.current.querySelector('.title-bar-controls button') as HTMLButtonElement | null;
      closeBtn?.focus?.();
    }
  }, [show, overlayMode]);

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onFocus={open}
  onBlur={() => { if (!isMobile()) handleMouseLeave(); }}
        ref={triggerRef}
        style={{ position: 'relative' }}
      >
        {children}
      </span>
      
      {show && (
        overlayMode ? (
          <div className="help-tooltip-overlay" onClick={() => setShow(false)}>
            <div
              className="help-tooltip-overlay-inner"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={contentId}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="window help-tooltip-window" ref={tooltipRef}>
                <div className="title-bar">
                  <div id={titleId} className="title-bar-text">Recipe Discovery</div>
                  <div className="title-bar-controls">
                    <button aria-label="Close" onClick={() => setShow(false)}></button>
                  </div>
                </div>
                <div className="window-body">
                  <div id={contentId} className="help-content">
                    <p><strong>Recipe Discovery App</strong></p>
                    <p>Windows 98-style recipe finder</p>
                    <hr />
                    <p><strong>Features:</strong></p>
                    <ul>
                      <li>Search recipes by name</li>
                      <li>Browse by categories</li>
                      <li>Discover random recipes</li>
                      <li>View detailed instructions</li>
                    </ul>
                    <hr />
                    <p><strong>Usage:</strong></p>
                    <p>Click any recipe card for full details and cooking instructions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="help-tooltip-popup"
            role="tooltip"
            aria-labelledby={titleId}
            aria-describedby={contentId}
            style={{ position: 'fixed', left: position.x, top: position.y, zIndex: 10000 }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div className="window help-tooltip-window" ref={tooltipRef}>
              <div className="title-bar">
                <div id={titleId} className="title-bar-text">Help & Information</div>
                <div className="title-bar-controls">
                  <button aria-label="Close" onClick={() => setShow(false)}></button>
                </div>
              </div>
              <div className="window-body">
                <div id={contentId} className="help-content">
                  <p><strong>Recipe Discovery App</strong></p>
                  <p>Windows 98-style recipe finder</p>
                  <hr />
                  <p><strong>Features:</strong></p>
                  <ul>
                    <li>Search recipes by name</li>
                    <li>Browse by categories</li>
                    <li>Discover random recipes</li>
                    <li>View detailed instructions</li>
                  </ul>
                  <hr />
                  <p><strong>Usage:</strong></p>
                  <p>Click any recipe card for full details and cooking instructions.</p>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};