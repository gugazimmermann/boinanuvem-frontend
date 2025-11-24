import { getPaymentsByCompanyId } from "~/services/payments.service";
import { mockCompanies } from "~/mocks/companies";
import { formatCurrency } from "~/utils/formatting";
import { format } from "date-fns";
import { getDateLocale } from "~/utils/date";
import { translations } from "~/i18n/translations";
import type { Payment } from "~/types/payment";
import type { Language } from "~/types";

export async function loader({
  params,
  request,
}: {
  params: { invoiceId: string };
  request: Request;
}) {
  const { invoiceId } = params;

  // Get language from query params or default to pt
  const url = new URL(request.url);
  const langParam = url.searchParams.get("lang");
  const language: Language =
    langParam === "en" || langParam === "es" || langParam === "pt" ? langParam : "pt";

  const t = translations[language];
  const dateLocale = getDateLocale(language);

  // Find payment by invoiceId
  const company = mockCompanies[0];
  if (!company) {
    throw new Response("Company not found", { status: 404 });
  }

  const payments = getPaymentsByCompanyId(company.id);
  const payment = payments.find((p: Payment) => p.invoiceId === invoiceId);

  if (!payment) {
    throw new Response("Invoice not found", { status: 404 });
  }
  const invoiceDate = new Date();
  const monthDate = new Date(payment.month + "-01");

  // Get status label
  const statusLabel = t.payments.status[payment.status] || payment.status;

  // Date format based on language
  const dateFormat =
    language === "en"
      ? "MMMM dd, yyyy"
      : language === "es"
        ? "dd 'de' MMMM 'de' yyyy"
        : "dd 'de' MMMM 'de' yyyy";
  const monthFormat =
    language === "en" ? "MMMM yyyy" : language === "es" ? "MMMM 'de' yyyy" : "MMMM 'de' yyyy";
  const htmlLang = language === "en" ? "en" : language === "es" ? "es" : "pt-BR";

  // Generate HTML invoice
  const invoiceHtml = `
<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.payments.invoice.title} - ${payment.invoiceId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header .invoice-number {
      color: #666;
      font-size: 14px;
    }
    .company-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .info-section h3 {
      color: #2563eb;
      font-size: 16px;
      margin-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
    }
    .info-section p {
      margin: 5px 0;
      color: #555;
      font-size: 14px;
    }
    .invoice-details {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .invoice-details table {
      width: 100%;
      border-collapse: collapse;
    }
    .invoice-details th {
      text-align: left;
      padding: 12px;
      background: #2563eb;
      color: white;
      font-weight: 600;
    }
    .invoice-details td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .invoice-details tr:last-child td {
      border-bottom: none;
    }
    .total-section {
      margin-top: 20px;
      text-align: right;
    }
    .total-section .total-label {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-right: 20px;
    }
    .total-section .total-amount {
      font-size: 24px;
      font-weight: 700;
      color: #2563eb;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-paid {
      background: #10b981;
      color: white;
    }
    .status-pending {
      background: #f59e0b;
      color: white;
    }
    .status-failed {
      background: #ef4444;
      color: white;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice-container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>${t.payments.invoice.title.toUpperCase()}</h1>
      <div class="invoice-number">${t.payments.invoice.number}: ${payment.invoiceId}</div>
    </div>

    <div class="company-info">
      <div class="info-section">
        <h3>${t.payments.invoice.issuer.toUpperCase()}</h3>
        <p><strong>Boi na Nuvem</strong></p>
        <p>CNPJ: 00.000.000/0001-00</p>
        <p>Email: contato@boinanuvem.com.br</p>
        <p>${language === "en" ? "Phone" : language === "es" ? "Teléfono" : "Telefone"}: (11) 9999-9999</p>
      </div>
      <div class="info-section">
        <h3>${t.payments.invoice.recipient.toUpperCase()}</h3>
        <p><strong>${company?.companyName || (language === "en" ? "Client" : language === "es" ? "Cliente" : "Cliente")}</strong></p>
        <p>CNPJ: ${company?.cnpj || "N/A"}</p>
        <p>Email: ${company?.email || "N/A"}</p>
        <p>${language === "en" ? "Phone" : language === "es" ? "Teléfono" : "Telefone"}: ${company?.phone || "N/A"}</p>
      </div>
    </div>

    <div class="invoice-details">
      <table>
        <thead>
          <tr>
            <th>${t.payments.invoice.description}</th>
            <th>${t.payments.invoice.period}</th>
            <th>${t.payments.invoice.plan}</th>
            <th>${t.payments.invoice.amount}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${t.payments.invoice.subscription}</td>
            <td>${format(monthDate, monthFormat, { locale: dateLocale })}</td>
            <td>${payment.plan}</td>
            <td>${formatCurrency(payment.amount, language)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="total-section">
        <span class="total-label">${language === "en" ? "Total" : language === "es" ? "Total" : "Total"}:</span>
        <span class="total-amount">${formatCurrency(payment.amount, language)}</span>
      </div>
    </div>

    <div class="invoice-details">
      <h3 style="margin-bottom: 15px; color: #2563eb;">${t.payments.invoice.paymentInformation}</h3>
      <table>
        <tr>
          <td style="width: 200px;"><strong>${t.payments.invoice.status}:</strong></td>
          <td>
            <span class="status-badge status-${payment.status}">
              ${statusLabel}
            </span>
          </td>
        </tr>
        <tr>
          <td><strong>${t.payments.invoice.invoiceDate}:</strong></td>
          <td>${format(invoiceDate, dateFormat, { locale: dateLocale })}</td>
        </tr>
        <tr>
          <td><strong>${t.payments.invoice.referenceMonth}:</strong></td>
          <td>${format(monthDate, monthFormat, { locale: dateLocale })}</td>
        </tr>
        <tr>
          <td><strong>${t.payments.invoice.createdDate}:</strong></td>
          <td>${format(new Date(payment.createdAt), dateFormat, { locale: dateLocale })}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>${t.payments.invoice.footer.generated}</p>
      <p>${t.payments.invoice.footer.contact}</p>
      <p style="margin-top: 10px;">${t.payments.invoice.footer.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return new Response(invoiceHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
