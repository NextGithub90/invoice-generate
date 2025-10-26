// Utility currency formatter
const currencyEl = document.getElementById("currency");
function formatter() {
  const cur = currencyEl.value || "IDR";
  const locale = cur === "IDR" ? "id-ID" : cur === "USD" ? "en-US" : "de-DE";
  return new Intl.NumberFormat(locale, { style: "currency", currency: cur, maximumFractionDigits: 0 });
}
function fmt(n) {
  return formatter().format(n || 0);
}

// State
let items = [
  { desc: "Consultation", qty: 1, price: 300 },
  { desc: "Project Draft", qty: 1, price: 2400 },
  { desc: "Implementation", qty: 1, price: 2500 },
  { desc: "Additional Supplies", qty: 1, price: 750 },
  { desc: "Monthly meeting", qty: 1, price: 2000 },
];

// Elements
const tbody = document.querySelector("#itemsTable tbody");
const previewBody = document.querySelector("#previewItems tbody");

const p = {
  docType: document.getElementById("pDocType"),
  invNo: document.getElementById("pInvNo"),
  invDate: document.getElementById("pInvDate"),
  compName: document.getElementById("pCompName"),
  compAddr: document.getElementById("pCompAddr"),
  clientName: document.getElementById("pClientName"),
  clientAddr: document.getElementById("pClientAddr"),
  sub: document.getElementById("pSub"),
  tax: document.getElementById("pTax"),
  disc: document.getElementById("pDisc"),
  grand: document.getElementById("pGrand"),
  notes: document.getElementById("pNotes"),
  compPhone: document.getElementById("pCompPhone"),
  taxRateLabel: document.getElementById("pTaxRate"),
  compWebsite: document.getElementById("pCompWebsite"),
  compEmail: document.getElementById("pCompEmail"),
  // Contact bar preview elements
  contactPhone: document.getElementById("pContactPhone"),
  contactEmail: document.getElementById("pContactEmail"),
  contactAddr: document.getElementById("pContactAddr"),
};

// Inputs
const inputs = {
  docType: document.getElementById("docType"),
  currency: currencyEl,
  compName: document.getElementById("compName"),
  compAddr: document.getElementById("compAddr"),
  compEmail: document.getElementById("compEmail"),
  compPhone: document.getElementById("compPhone"),
  compWebsite: document.getElementById("compWebsite"),
  clientName: document.getElementById("clientName"),
  clientAddr: document.getElementById("clientAddr"),
  clientEmail: document.getElementById("clientEmail"),
  clientPhone: document.getElementById("clientPhone"),
  invNo: document.getElementById("invNo"),
  invDate: document.getElementById("invDate"),
  dueDate: document.getElementById("dueDate"),
  taxRate: document.getElementById("taxRate"),
  discount: document.getElementById("discount"),
  notes: document.getElementById("notes"),
  addItem: document.getElementById("addItem"),
  clearItems: document.getElementById("clearItems"),
  csvInput: document.getElementById("csvInput"),
  generatePdf: document.getElementById("generatePdf"),
};

// Initial date
inputs.invDate.valueAsDate = new Date();

function calcTotals() {
  const sub = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const tax = sub * (Number(inputs.taxRate.value || 0) / 100);
  const disc = Number(inputs.discount.value || 0);
  const grand = Math.max(sub + tax - disc, 0);
  return { sub, tax, disc, grand };
}

function renderItemsTable() {
  tbody.innerHTML = "";
  items.forEach((it, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input class="form-control" value="${it.desc}" data-field="desc" data-idx="${idx}"></td>
      <td style="width:100px"><input class="form-control" type="number" min="0" value="${it.qty}" data-field="qty" data-idx="${idx}"></td>
      <td style="width:160px"><input class="form-control" type="number" min="0" value="${it.price}" data-field="price" data-idx="${idx}"></td>
      <td class="text-nowrap">${fmt(it.qty * it.price)}</td>
      <td style="width:52px"><button class="btn btn-sm btn-outline-danger" data-remove="${idx}">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Events for inputs
  tbody.querySelectorAll("input[data-field]").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const idx = Number(inp.dataset.idx);
      const field = inp.dataset.field;
      let val = inp.value;
      if (field !== "desc") val = Number(val || 0);
      items[idx][field] = val;
      render();
    });
  });
  tbody.querySelectorAll("button[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      items.splice(Number(btn.dataset.remove), 1);
      render();
    });
  });
}

function renderPreviewTable() {
  previewBody.innerHTML = "";
  items.forEach((it, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i + 1}</td><td>${it.desc}</td><td>${it.qty}</td><td>${fmt(it.price)}</td><td>${fmt(it.qty * it.price)}</td>`;
    previewBody.appendChild(tr);
  });
}

function renderHeader() {
  p.docType.textContent = inputs.docType.value;
  p.invNo.textContent = inputs.invNo.value || "-";
  const d = inputs.invDate.value ? new Date(inputs.invDate.value) : new Date();
  p.invDate.textContent = d.toLocaleDateString("id-ID");
  p.compName.textContent = inputs.compName.value || "";
  p.compAddr.textContent = inputs.compAddr.value || "";
  p.compWebsite.textContent = inputs.compWebsite.value || "";
  p.compEmail.textContent = inputs.compEmail.value || "";
  p.clientName.textContent = inputs.clientName.value || "";
  p.clientAddr.textContent = inputs.clientAddr.value || "";
  p.notes.textContent = inputs.notes.value || "";
  p.compPhone.textContent = inputs.compPhone.value || "";
  // Contact bar (company info)
  p.contactPhone.textContent = inputs.compPhone.value || "";
  p.contactEmail.textContent = inputs.compEmail.value || "";
  p.contactAddr.textContent = inputs.compAddr.value || "";
}

function renderTotals() {
  const t = calcTotals();
  p.sub.textContent = fmt(t.sub);
  p.tax.textContent = fmt(t.tax);
  p.disc.textContent = fmt(t.disc);
  p.grand.textContent = fmt(t.grand);
  p.taxRateLabel.textContent = inputs.taxRate.value || 0;
}

function render() {
  renderItemsTable();
  renderPreviewTable();
  renderHeader();
  renderTotals();
}

// CSV import: columns -> desc,qty,price
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const out = [];
  lines.forEach((line) => {
    // support ; or ,
    const sep = line.includes(";") ? ";" : ",";
    const parts = line.split(sep).map((s) => s.trim());
    if (parts.length >= 3) {
      const [desc, qty, price] = parts;
      const q = Number(qty.replace(/[^0-9.-]/g, "")) || 0;
      const p = Number(price.replace(/[^0-9.-]/g, "")) || 0;
      if (desc) out.push({ desc, qty: q, price: p });
    }
  });
  return out;
}

// Events
inputs.addItem.addEventListener("click", () => {
  items.push({ desc: "Item", qty: 1, price: 0 });
  render();
});
inputs.clearItems.addEventListener("click", () => {
  items = [];
  render();
});
inputs.csvInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result.toString().replace(/^\uFEFF/, "");
    const imported = parseCSV(text);
    if (imported.length) items = imported;
    render();
  };
  reader.readAsText(file);
});

["change", "input"].forEach((ev) => {
  [
    inputs.docType,
    inputs.currency,
    inputs.invNo,
    inputs.invDate,
    inputs.taxRate,
    inputs.discount,
    inputs.compName,
    inputs.compAddr,
    inputs.compWebsite,
    inputs.compEmail,
    inputs.compPhone,
    inputs.clientName,
    inputs.clientAddr,
    inputs.notes,
  ].forEach((el) => {
    el.addEventListener(ev, render);
  });
});

// PDF generation using jsPDF + autoTable
let logoInfo = null;
async function loadLogo() {
  try {
    const res = await fetch("images/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    const reader = new FileReader();
    return await new Promise((resolve) => {
      reader.onload = () => {
        const dataUrl = reader.result;
        const img = new Image();
        img.onload = () => {
          resolve({ dataUrl, naturalWidth: img.naturalWidth || 0, naturalHeight: img.naturalHeight || 0 });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
}
loadLogo().then((info) => {
  logoInfo = info;
});

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "pt", "a4"); // 595x842 pt
  let startY = 190; // default

  // Header dengan layout menyerupai contoh
  const header = () => {
    // Logo kiri atas + brand
    let logoW = 0,
      logoH = 0;
    if (logoInfo && logoInfo.dataUrl) {
      logoW = 64;
      const ratio = (logoInfo.naturalHeight || 1) / (logoInfo.naturalWidth || 1);
      logoH = Math.max(logoW * ratio, 28);
      try {
        doc.addImage(logoInfo.dataUrl, "PNG", 40, 28, logoW, logoH);
      } catch (_) {}
    }

    // Nama perusahaan di kanan logo
    const brandX = 40 + (logoW ? logoW + 16 : 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(inputs.compName.value || "", brandX, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("REAL ESTATE DEVELOPER", brandX, 64);
    if (inputs.compWebsite.value) {
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(inputs.compWebsite.value, brandX, 74);
      doc.setTextColor(0);
    }
    if (inputs.compEmail.value) {
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(inputs.compEmail.value, brandX, 86);
      doc.setTextColor(0);
    }

    // Judul besar INVOICE + aksen
    // doc.setFillColor(13, 110, 253);
    // doc.rect(40, 92, 56, 12, "F");
    // doc.setFont("helvetica", "bold");
    // doc.setFontSize(22);
    // doc.text(inputs.docType.value, 110, 102);

    // Kolom kiri: To + alamat klien
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("To", 40, 130);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(inputs.clientName.value || "", 40, 146);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const addrLines = doc.splitTextToSize(inputs.clientAddr.value || "", 260);
    doc.text(addrLines, 40, 162);

    // Kolom kanan: Invoice no dan Date
    const dateText = inputs.invDate.value ? new Date(inputs.invDate.value).toLocaleDateString("id-ID") : new Date().toLocaleDateString("id-ID");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Invoice no :", 360, 130);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(inputs.invNo.value || "-", 555, 130, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Date :", 360, 146);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(dateText, 555, 146, { align: "right" });

    // Garis pemisah dan posisi start tabel
    const contentBottom = 162 + addrLines.length * 12;
    const lineY = Math.max(contentBottom + 16, 176);
    doc.setDrawColor(220);
    doc.line(40, lineY, 555, lineY);
    startY = lineY + 18;
  };

  header();

  const bodyRows = items.map((it, i) => [i + 1, it.desc, it.qty, formatter().format(it.price), formatter().format((it.qty || 0) * (it.price || 0))]);

  doc.autoTable({
    startY: startY,
    head: [["#", "Deskripsi", "Qty", "Harga", "Total"]],
    body: bodyRows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [243, 246, 251], textColor: 20 },
    margin: { left: 40, right: 40 },
    didDrawPage: () => {
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height || pageSize.getHeight();
      const pageWidth = pageSize.width || pageSize.getWidth();
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - 40, pageHeight - 20, { align: "right" });
    },
  });

  // Ringkasan kanan + Payment & Terms kiri dengan tampilan bar GRAND TOTAL
  const t = calcTotals();
  let y = doc.lastAutoTable.finalY + 20;
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + 160 > pageHeight) {
    doc.addPage();
    y = 60;
  }

  // Kiri: Payment Method
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Payment Method", 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Bank Name : ${inputs.compName.value || ""}`, 40, y + 18);
  doc.text(`Account Number : ${inputs.compPhone.value || ""}`, 40, y + 34);

  // Kiri: Terms
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Term and Conditions :", 40, y + 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const termsLines = doc.splitTextToSize(inputs.notes.value || "", 320);
  doc.text(termsLines, 40, y + 78);

  // Kanan: Summary
  const xLeft = 400,
    xRight = 555;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Sub Total", xLeft, y);
  doc.text(formatter().format(t.sub), xRight, y, { align: "right" });
  doc.text(`Tax ${inputs.taxRate.value || 0}%`, xLeft, y + 18);
  doc.text(formatter().format(t.tax), xRight, y + 18, { align: "right" });
  doc.text("Discount", xLeft, y + 36);
  doc.text(formatter().format(t.disc), xRight, y + 36, { align: "right" });

  // Bar Grand Total (centered two-lines)
  const gtSpacingTop = 72;
  const barY = y + gtSpacingTop;
  const barH = 48;
  doc.setFillColor(13, 110, 253);
  doc.roundedRect(xLeft, barY, xRight - xLeft, barH, 10, 10, "F");
  const centerX = xLeft + (xRight - xLeft) / 2;
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("GRAND TOTAL", centerX, barY + 20, { align: "center" });
  doc.setFontSize(16);
  doc.text(formatter().format(t.grand), centerX, barY + 36, { align: "center" });
  doc.setTextColor(0);

  // Contact bar (Administrator)
  let contactY = barY + barH + 36; // beri jarak bawah lebih lega
  const pageH = doc.internal.pageSize.getHeight();
  if (contactY + 60 > pageH) {
    doc.addPage();
    contactY = 60;
  }
  doc.setDrawColor(200);
  doc.line(40, contactY, 555, contactY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 110, 253);
  doc.text("Administrator", 298, contactY + 16, { align: "center" });

  // Three columns: Phone, Mail, Address
  const colW = (555 - 40) / 3;
  const c1 = 40;
  const c2 = 40 + colW;
  const c3 = 40 + colW * 2;

  doc.setFontSize(10);
  // Phone
  doc.text("Phone", c1, contactY + 36);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text(inputs.compPhone.value || "", c1, contactY + 52);
  // Mail
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 110, 253);
  doc.text("Mail", c2, contactY + 36);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text(inputs.compEmail.value || "", c2, contactY + 52);
  // Address
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 110, 253);
  doc.text("Address", c3, contactY + 36);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  const addrShort = doc.splitTextToSize(inputs.compAddr.value || "", colW - 10);
  doc.text(addrShort, c3, contactY + 52);

  const filename = `${inputs.docType.value.toLowerCase()}-${inputs.invNo.value || "doc"}.pdf`;
  doc.save(filename);
}

inputs.generatePdf.addEventListener("click", generatePDF);

// Initial render
render();
