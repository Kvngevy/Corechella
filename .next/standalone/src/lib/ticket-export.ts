import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

const TICKET_WIDTH = 920;

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function embedImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(
    images.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;

      try {
        const absolute = new URL(src, window.location.origin).href;
        const response = await fetch(absolute, { credentials: "include" });
        if (!response.ok) throw new Error("image fetch failed");
        const blob = await response.blob();
        img.src = await blobToDataUrl(blob);
        img.removeAttribute("crossorigin");
      } catch {
        img.style.visibility = "hidden";
      }
    })
  );
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
}

export async function captureTicketElement(element: HTMLElement) {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-ticket-export", "true");
  wrapper.style.cssText =
    "position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;background:#000000;";

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${TICKET_WIDTH}px`;
  clone.style.maxWidth = `${TICKET_WIDTH}px`;
  clone.style.transform = "none";
  clone.style.boxShadow = "none";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    await embedImages(clone);
    await waitForImages(clone);

    const height = clone.offsetHeight || 480;

    return await html2canvas(clone, {
      scale: 2,
      backgroundColor: "#000000",
      logging: false,
      width: TICKET_WIDTH,
      height,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      imageTimeout: 15000,
    });
  } finally {
    document.body.removeChild(wrapper);
  }
}

export async function downloadTicketAsPng(element: HTMLElement, filename: string) {
  const canvas = await captureTicketElement(element);
  const dataUrl = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadTicketAsPdf(element: HTMLElement, filename: string) {
  const canvas = await captureTicketElement(element);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 40;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const y = Math.max(20, (pageHeight - imgHeight) / 2);

  pdf.addImage(imgData, "PNG", 20, y, imgWidth, imgHeight);
  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
