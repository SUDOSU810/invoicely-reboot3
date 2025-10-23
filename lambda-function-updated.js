import AWS from "aws-sdk";
import PDFDocument from "pdfkit";
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  // --- Parse Event ---
  let invoiceData;
  try {
    invoiceData = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Invalid JSON in request body" }),
    };
  }

  const invoiceId = invoiceData.invoiceNumber || `INV-${Date.now()}`;
  const userId = invoiceData.userId || invoiceData.businessInfo?.email || "unknown-user";

  if (!userId || !invoiceId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Missing userId or invoiceId" }),
    };
  }

  // --- Auto Calculate Totals ---
  let subtotal = 0;
  invoiceData.lineItems = invoiceData.lineItems || [];
  for (const item of invoiceData.lineItems) {
    item.total = (item.quantity || 0) * (item.unitPrice || 0);
    subtotal += item.total;
  }

  const discountRate = Number(invoiceData.discountRate) || 0;
  const taxRate = Number(invoiceData.taxRate) || 18;
  const discountAmount = (subtotal * discountRate) / 100;
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const total = subtotal - discountAmount + taxAmount;

  invoiceData.subtotal = subtotal;
  invoiceData.discountAmount = discountAmount;
  invoiceData.taxAmount = taxAmount;
  invoiceData.total = total;

  // === PDF Generation ===
  const doc = new PDFDocument({ size: "A4", margin: 36 });
  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  // --- Add Logo (FIXED) ---
  let logoAdded = false;
  const logoData = invoiceData.businessInfo?.logo || invoiceData.logo || invoiceData.companyLogo || invoiceData.businessLogo;

  if (logoData) {
    try {
      let logoBuffer;

      // Check if it's base64 data (starts with data:image/)
      if (logoData.startsWith('data:image/')) {
        // Extract base64 data (remove data:image/jpeg;base64, prefix)
        const base64Data = logoData.split(',')[1];
        logoBuffer = Buffer.from(base64Data, 'base64');
        console.log('✅ Logo processed from base64 data');
      } else if (logoData.startsWith('http')) {
        // Handle URL-based logos (your original code)
        const https = await import('https');
        logoBuffer = await new Promise((resolve, reject) => {
          https.get(logoData, (res) => {
            const data = [];
            res.on("data", (chunk) => data.push(chunk));
            res.on("end", () => resolve(Buffer.concat(data)));
            res.on("error", reject);
          });
        });
        console.log('✅ Logo processed from URL');
      }

      if (logoBuffer) {
        // Add logo to PDF with proper positioning
        doc.image(logoBuffer, 42, 20, {
          width: 80,
          height: 60,
          fit: [80, 60],
          align: 'left'
        });
        logoAdded = true;
        console.log('✅ Logo added to PDF successfully');
      }
    } catch (error) {
      console.warn('⚠️ Logo processing failed:', error.message);
      // Continue without logo
    }
  }

  // --- Header Bar (adjusted for logo) ---
  const headerStartX = logoAdded ? 130 : 42;
  doc.rect(0, 0, doc.page.width, 80)
    .fill("#0077b6")
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(34)
    .text("INVOICE", headerStartX, 30)
    .fillColor("black");

  // --- Business Info ---
  doc.font("Helvetica").fontSize(12).fillColor("#333");
  doc.text("From:", 40, 100);
  doc.font("Helvetica-Bold").text(invoiceData.businessInfo?.name || "");
  doc.font("Helvetica").fillColor("#333");
  doc.text(invoiceData.businessInfo?.address || "");
  doc.text(invoiceData.businessInfo?.email || "");
  doc.text(invoiceData.businessInfo?.phone || "");
  if (invoiceData.businessInfo?.website) doc.text(invoiceData.businessInfo.website);

  // --- Client Info ---
  doc.font("Helvetica").fontSize(12).fillColor("#333").text("Bill To:", 340, 100);
  doc.font("Helvetica-Bold").text(invoiceData.clientInfo?.name || "", 340);
  doc.font("Helvetica").fillColor("#333");
  doc.text(invoiceData.clientInfo?.address || "", 340);
  doc.text(invoiceData.clientInfo?.email || "", 340);
  doc.text(invoiceData.clientInfo?.phone || "", 340);

  let y = 200;
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#0077b6")
    .text("Invoice #:", 40, y, { continued: true })
    .font("Helvetica").fillColor("black")
    .text(invoiceData.invoiceNumber);

  doc.font("Helvetica-Bold").fillColor("#0077b6")
    .text("Date:", 40, y + 20, { continued: true })
    .font("Helvetica").fillColor("black")
    .text(invoiceData.date || new Date().toISOString().slice(0, 10));

  doc.font("Helvetica-Bold").fillColor("#0077b6")
    .text("Due Date:", 40, y + 40, { continued: true })
    .font("Helvetica").fillColor("black")
    .text(invoiceData.dueDate || "");

  // --- Items Table Header ---
  y += 70;
  doc.rect(40, y, 515, 28).fill("#f1f3f4");
  doc.fillColor("#0077b6").font("Helvetica-Bold").fontSize(12);
  doc.text("Description", 45, y + 8, { width: 180 });
  doc.text("Qty", 235, y + 8, { width: 40, align: "center" });
  doc.text("Unit Price", 285, y + 8, { width: 90, align: "center" });
  doc.text("Line Total", 415, y + 8, { width: 90, align: "right" });

  // --- Items ---
  doc.font("Helvetica").fontSize(11).fillColor("black");
  let currentY = y + 28;
  for (const [i, item] of invoiceData.lineItems.entries()) {
    const rowColor = i % 2 === 0 ? "#ffffff" : "#f9f9ff";
    doc.rect(40, currentY, 515, 25).fill(rowColor);
    doc.fillColor("black");
    doc.text(item.description, 45, currentY + 7, { width: 180 });
    doc.text(item.quantity, 235, currentY + 7, { width: 40, align: "center" });
    doc.text(item.unitPrice.toFixed(2), 285, currentY + 7, { width: 90, align: "center" });
    doc.text(item.total.toFixed(2), 415, currentY + 7, { width: 90, align: "right" });
    currentY += 25;
  }

  // --- Totals Section ---
  const summaryX = 330;
  let summaryY = currentY + 30;

  // Draw clean bordered box
  doc.roundedRect(summaryX - 15, summaryY - 15, 250, 130, 8)
    .lineWidth(1)
    .strokeColor("#0077b6")
    .stroke();

  const c = invoiceData.currency || "INR";

  // Subtotal
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000")
    .text("Subtotal:", summaryX, summaryY, { continued: true })
    .font("Helvetica")
    .text(`${c} ${subtotal.toFixed(2)}`, { align: "right", width: 200 });
  summaryY += 18;

  // Discount
  if (discountRate > 0) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000")
      .text(`Discount (${discountRate}%):`, summaryX, summaryY, { continued: true })
      .font("Helvetica").fillColor("#D32F2F")
      .text(`- ${c} ${discountAmount.toFixed(2)}`, { align: "right", width: 200 });
    summaryY += 18;
  }

  // Tax
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000")
    .text(`GST (${taxRate}%):`, summaryX, summaryY, { continued: true })
    .font("Helvetica").fillColor("#000000")
    .text(`${c} ${taxAmount.toFixed(2)}`, { align: "right", width: 200 });
  summaryY += 18;

  // Divider line
  doc.moveTo(summaryX, summaryY + 5)
    .lineTo(summaryX + 200, summaryY + 5)
    .strokeColor("#0077b6")
    .lineWidth(1)
    .stroke();
  summaryY += 12;

  // Total
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#0077b6")
    .text("Total:", summaryX, summaryY, { continued: true })
    .text(`${c} ${total.toFixed(2)}`, { align: "right", width: 200 });

  doc.moveDown(2);

  // --- Notes & Payment Terms ---
  summaryY += 80;
  if (invoiceData.notes) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000")
      .text("Notes:", 40, summaryY);
    doc.font("Helvetica").fontSize(10).fillColor("#000000")
      .text(invoiceData.notes, 40, summaryY + 15, { width: 480 });
    summaryY += 40;
  }

  if (invoiceData.paymentTerms) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000")
      .text("Payment Terms:", 40, summaryY);
    doc.font("Helvetica").fontSize(10).fillColor("#000000")
      .text(invoiceData.paymentTerms, 40, summaryY + 15, { width: 480 });
  }

  // --- Footer Message ---
  doc.font("Helvetica-Oblique").fontSize(11).fillColor("#555")
    .text("Thank you for your business!", 40, 760, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleString()}`, 40, 775, { align: "center" });

  doc.end();

  const pdfBuffer = await new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(buffers)))
  );

  // --- Upload to S3 ---
  const bucketName = process.env.S3_BUCKET_NAME;
  const pdfKey = `invoices/${userId}_${invoiceId}.pdf`;

  await s3.putObject({
    Bucket: bucketName,
    Key: pdfKey,
    Body: pdfBuffer,
    ContentType: "application/pdf",
  }).promise();

  const pdfUrl = s3.getSignedUrl("getObject", {
    Bucket: bucketName,
    Key: pdfKey,
    Expires: 7 * 24 * 60 * 60, // 7 days instead of 20 minutes
  });

  // --- Save to DynamoDB ---
  const tableName = process.env.DYNAMODB_TABLE_NAME;
  const item = {
    userId,
    invoiceId,
    invoiceNumber: invoiceId,
    businessInfo: invoiceData.businessInfo,
    clientInfo: invoiceData.clientInfo,
    lineItems: invoiceData.lineItems,
    subtotal,
    discountRate,
    discountAmount,
    taxRate,
    taxAmount,
    total,
    notes: invoiceData.notes,
    date: invoiceData.date,
    dueDate: invoiceData.dueDate,
    paymentTerms: invoiceData.paymentTerms,
    currency: invoiceData.currency,
    pdfUrl,
    logoIncluded: logoAdded, // Track if logo was successfully added
  };

  try {
    await dynamodb.put({ TableName: tableName, Item: item }).promise();

    const successMessage = logoAdded
      ? "✅ Invoice created with logo, PDF generated, and uploaded successfully!"
      : "✅ Invoice created, PDF generated, and uploaded successfully!";

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        message: successMessage,
        pdfUrl,
        invoice: item,
        logoProcessed: logoAdded,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "DynamoDB error", error: err.message }),
    };
  }
};