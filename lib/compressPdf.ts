// lib/compressPdf.ts
export async function compressPdf(
    file: File,
    opts = { scale: 1.5, quality: 0.7 }
  ): Promise<File> {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    const { PDFDocument } = await import("pdf-lib");
  
    const src = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const out = await PDFDocument.create();
  
    for (let i = 1; i <= src.numPages; i++) {
      const page = await src.getPage(i);
      const viewport = page.getViewport({ scale: opts.scale });
  
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, viewport }).promise;  
      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg", opts.quality)
      );
      const img = await out.embedJpg(await blob.arrayBuffer());
      const p = out.addPage([viewport.width, viewport.height]);
      p.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  
      canvas.width = canvas.height = 0; // libera memoria
    }
  
    const bytes = await out.save();
    const compressed = new File([bytes as BlobPart], file.name, { type: "application/pdf" });
  
    // Si el PDF era de texto/vectores, rasterizar puede pesar más: se queda el original
    return compressed.size < file.size ? compressed : file;
  }