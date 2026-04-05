declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: any;
    jsPDF?: { unit: string; format: string; orientation: string };
  }

  interface Html2Pdf {
    from(element: HTMLElement | string): Html2Pdf;
    set(options: Html2PdfOptions): Html2Pdf;
    toContainer(): Html2Pdf;
    toCanvas(): Html2Pdf;
    toImg(): Html2Pdf;
    toPdf(): Html2Pdf;
    save(): Promise<void>;
    output(type: string, options?: any): Promise<any>;
  }

  function html2pdf(): Html2Pdf;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Promise<void>;

  export default html2pdf;
}
