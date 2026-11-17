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
      // Not base64, might be a URL to fetch
      return null;
    }
  }
  return null;
}

/**
 * CleanPdfViewer
 *
 * Renders PDF pages directly to HTML5 <canvas> elements without using <iframe>.
 * Eliminates browser PDFium dark frames, black borders, nested scrollbars, and plugin UI.
 *
 * Props:
 *   pdfData           - Uint8Array | ArrayBuffer | string (data URL or blob URL)
 *   zoomPercent       - number (e.g. 100 for 100%)
 *   onLoadSuccess     - ({ numPages, width, height }) => void
 *   onError           - (Error) => void
 *   id                - string
 */
export function CleanPdfViewer({
  pdfData,
  zoomPercent = 100,
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
        let docSource;
        const bytes = normalizePdfBytes(pdfData);
        if (bytes) {
          docSource = { data: bytes };
        } else if (typeof pdfData === 'string') {
          docSource = { url: pdfData };
        } else {
          throw new Error('Unsupported PDF data format.');
        }

        loadingTask = pdfjsLib.getDocument(docSource);
        const pdfDoc = await loadingTask.promise;

        if (isCancelled) return;

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        const outputScale = typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 1) : 1;
        const scale = (zoomPercent / 100) * 1.35; // 1.35 provides crisp, readable scale matching long bond size

        let firstPageDims = { width: 612, height: 936 };

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          if (isCancelled) break;

          const page = await pdfDoc.getPage(pageNum);
          const displayViewport = page.getViewport({ scale });
          const renderViewport = page.getViewport({ scale: scale * outputScale });

          if (pageNum === 1) {
            firstPageDims = { width: displayViewport.width, height: displayViewport.height };
          }

          // Page wrapper for printing and document styling
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

          // Canvas element
          const canvas = document.createElement('canvas');
          canvas.className = 'clean-pdf-canvas';
          canvas.width = Math.floor(renderViewport.width);
          canvas.height = Math.floor(renderViewport.height);
          canvas.style.width = '100%';
          canvas.style.maxWidth = `${displayViewport.width}px`;
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
  }, [pdfData, zoomPercent, onLoadSuccess, onError]);

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
