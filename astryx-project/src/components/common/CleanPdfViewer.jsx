import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure the PDF.js web worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Converts a base64 Data URL, raw base64, Blob URL, or Uint8Array to a Uint8Array.
 */
function normalizePdfBytes(pdfData) {
  if (!pdfData) return null;
  if (pdfData instanceof Uint8Array) return pdfData;
  if (pdfData instanceof ArrayBuffer) return new Uint8Array(pdfData);

  if (typeof pdfData === 'string') {
    if (pdfData.startsWith('data:')) {
      const parts = pdfData.split(',');
      const base64 = parts[1] || '';
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    // If it's a raw base64 string
    try {
      const binary = atob(pdfData.trim());
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * CleanPdfViewer
 *
 * High-definition PDF canvas renderer.
 * Features:
 * - Supersampled canvas rendering to eliminate blurry text and pixelation.
 * - Local standard fonts & cmaps to preserve exact character spacing and glyph widths.
 * - Dedicated targetDpi support (e.g. 300 DPI for print and export).
 * - Zero dark frames, nested scrollbars, or PDFium plugin UI.
 *
 * Props:
 *   pdfData       - Uint8Array | ArrayBuffer | string (data URL or blob URL)
 *   zoomPercent   - number (default 100)
 *   targetDpi     - number | null (e.g. 300 for print, null for high-DPI display)
 *   onLoadSuccess - ({ numPages, width, height }) => void
 *   onError       - (Error) => void
 *   id            - string
 */
export function CleanPdfViewer({
  pdfData,
  zoomPercent = 100,
  targetDpi = null,
  onLoadSuccess,
  onError,
  id = 'clean-pdf-document',
}) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    let loadingTask = null;
    let activeRenderTasks = [];

    async function loadAndRender() {
      if (!pdfData) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const bytes = normalizePdfBytes(pdfData);
        let docSource;
        if (bytes) {
          docSource = {
            data: bytes,
            standardFontDataUrl: '/pdfjs/standard_fonts/',
            cMapUrl: '/pdfjs/cmaps/',
            cMapPacked: true,
          };
        } else if (typeof pdfData === 'string') {
          docSource = {
            url: pdfData,
            standardFontDataUrl: '/pdfjs/standard_fonts/',
            cMapUrl: '/pdfjs/cmaps/',
            cMapPacked: true,
          };
        } else {
          throw new Error('Unsupported PDF data format.');
        }

        loadingTask = pdfjsLib.getDocument(docSource);
        const pdfDoc = await loadingTask.promise;

        if (isCancelled) return;

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        // Display scale matches Long Bond (8.5in x 13in) aspect ratio
        const displayScale = (zoomPercent / 100) * 1.35;
        const dpr = typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 1) : 1;

        // Render scale controls internal canvas pixel resolution
        let renderScale;
        if (targetDpi && targetDpi > 0) {
          // Standard PDF has 72 points per inch
          renderScale = targetDpi / 72;
        } else {
          // High-DPI supersampling: render at least 2.4x for crystal clear on-screen readability
          renderScale = Math.max(displayScale * dpr * 1.5, 2.4);
        }

        let firstPageDims = { width: 612, height: 936 };

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          if (isCancelled) break;

          const page = await pdfDoc.getPage(pageNum);
          const displayViewport = page.getViewport({ scale: displayScale });
          const renderViewport = page.getViewport({ scale: renderScale });

          if (pageNum === 1) {
            firstPageDims = { width: displayViewport.width, height: displayViewport.height };
          }

          // Page wrapper
          const pageWrapper = document.createElement('div');
          pageWrapper.className = 'clean-pdf-page-wrapper';
          pageWrapper.style.backgroundColor = '#ffffff';
          pageWrapper.style.boxShadow = '0 4px 20px rgba(20, 43, 73, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)';
          pageWrapper.style.border = '1px solid #e2e8f0';
          pageWrapper.style.borderRadius = '4px';
          pageWrapper.style.margin = '0 auto 20px auto';
          pageWrapper.style.display = 'flex';
          pageWrapper.style.justifyContent = 'center';
          pageWrapper.style.alignItems = 'center';
          pageWrapper.style.maxWidth = '100%';
          pageWrapper.style.overflow = 'hidden';
          pageWrapper.style.position = 'relative';

          // Canvas element with supersampled internal buffer
          const canvas = document.createElement('canvas');
          canvas.className = 'clean-pdf-canvas';
          canvas.width = Math.floor(renderViewport.width);
          canvas.height = Math.floor(renderViewport.height);
          canvas.style.width = '100%';
          canvas.style.maxWidth = `${Math.floor(displayViewport.width)}px`;
          canvas.style.height = 'auto';
          canvas.style.display = 'block';
          canvas.style.backgroundColor = '#ffffff';

          pageWrapper.appendChild(canvas);
          container.appendChild(pageWrapper);

          const ctx = canvas.getContext('2d');
          const renderContext = {
            canvasContext: ctx,
            viewport: renderViewport,
          };

          const renderTask = page.render(renderContext);
          activeRenderTasks.push(renderTask);
          await renderTask.promise;
        }

        if (!isCancelled) {
          setLoading(false);
          onLoadSuccess?.({
            numPages: pdfDoc.numPages,
            width: firstPageDims.width,
            height: firstPageDims.height,
          });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('[CleanPdfViewer] Render failed:', err);
          setErrorMsg(err.message || 'Unable to render PDF document.');
          setLoading(false);
          onError?.(err);
        }
      }
    }

    loadAndRender();

    return () => {
      isCancelled = true;
      activeRenderTasks.forEach((t) => {
        try {
          t.cancel();
        } catch {}
      });
      if (loadingTask) {
        try {
          loadingTask.destroy();
        } catch {}
      }
    };
  }, [pdfData, zoomPercent, targetDpi, onLoadSuccess, onError]);

  return (
    <div
      id={id}
      className="clean-pdf-viewer-root"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}
    >
      {loading && (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Rendering document preview...
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '13px',
            margin: '16px auto',
            maxWidth: '500px',
            textAlign: 'center',
          }}
        >
          {errorMsg}
        </div>
      )}

      <div
        ref={containerRef}
        className="clean-pdf-pages-container"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      />
    </div>
  );
}

/**
 * PdfThumbnail
 *
 * Renders page 1 of a PDF as a clean, crisp canvas thumbnail.
 * Eliminates browser iframe dark frames, black borders, and scrollbars.
 *
 * Props:
 *   pdfData - Uint8Array | ArrayBuffer | string (data URL or blob URL)
 *   height  - number (default 120)
 *   style   - object
 */
export function PdfThumbnail({
  pdfData,
  height = 120,
  style = {},
}) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let loadingTask = null;

    async function renderThumbnail() {
      if (!pdfData) return;
      try {
        const bytes = normalizePdfBytes(pdfData);
        let docSource;
        if (bytes) {
          docSource = {
            data: bytes,
            standardFontDataUrl: '/pdfjs/standard_fonts/',
            cMapUrl: '/pdfjs/cmaps/',
            cMapPacked: true,
          };
        } else if (typeof pdfData === 'string') {
          docSource = {
            url: pdfData,
            standardFontDataUrl: '/pdfjs/standard_fonts/',
            cMapUrl: '/pdfjs/cmaps/',
            cMapPacked: true,
          };
        } else {
          setError(true);
          return;
        }

        loadingTask = pdfjsLib.getDocument(docSource);
        const pdfDoc = await loadingTask.promise;
        if (isCancelled) return;

        const page = await pdfDoc.getPage(1);
        if (isCancelled) return;

        const dpr = typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 1) : 1;
        // Scale 0.70 * dpr produces ~430-860px width, crisp on retina & standard monitors
        const scale = 0.70 * dpr;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        if (!isCancelled) {
          setLoaded(true);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('[PdfThumbnail] Render failed:', err);
          setError(true);
        }
      }
    }

    renderThumbnail();

    return () => {
      isCancelled = true;
      if (loadingTask) {
        try {
          loadingTask.destroy();
        } catch {}
      }
    };
  }, [pdfData]);

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          ...style,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>PDF Template</span>
      </div>
    );
  }

  return (
    <div
      className="pdf-thumbnail-wrapper"
      style={{
        width: '100%',
        height,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: 'none',
        outline: 'none',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        scrollbarWidth: 'none',   /* Firefox */
        msOverflowStyle: 'none',  /* IE/Edge */
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.18s ease',
          flexShrink: 0,
        }}
      />
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
      )}
    </div>
  );
}
