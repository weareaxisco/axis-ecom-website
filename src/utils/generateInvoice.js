import { getProductPrice } from './productUtils'

function pdfText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function money(value) {
  return `${Number(value || 0).toLocaleString('en-US')} DH`
}

function createPdf(lines) {
  const content = [
    'BT',
    '/F1 11 Tf',
    '50 780 Td',
    ...lines.flatMap((line, index) => [`(${pdfText(line)}) Tj`, ...(index < lines.length - 1 ? ['0 -16 Td'] : [])]),
    'ET',
  ].join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

export function generateInvoice(order = {}) {
  const items = order.items || order.cartItems || []
  const subtotal = Number(order.subtotal ?? items.reduce((sum, item) => sum + getProductPrice(item) * Number(item.quantity || 1), 0))
  const delivery = Number(order.shippingFee ?? order.delivery_fee ?? 0)
  const total = subtotal + delivery
  const invoiceNumber = order.invoiceNumber || `MDL-${String(order.id || Date.now()).slice(-8)}`
  const lines = [
    "MAISON DE L'ELEGANCE",
    'Haute Joaillerie & Horlogerie',
    '',
    `Invoice # ${invoiceNumber}`,
    `Date: ${order.date || new Date().toLocaleDateString('fr-MA')}`,
    `ICE: ${order.ice || 'A completer par la Maison'}`,
    `IF: ${order.taxId || 'A completer par la Maison'}`,
    '',
    `Customer: ${order.customerName || order.fullName || '-'}`,
    `Address: ${order.address || '-'}`,
    `City: ${order.city || 'Morocco'}`,
    `Ameex tracking: ${order.tracking_reference || order.trackingReference || '-'}`,
    '',
    'ITEMS',
    ...items.map((item) => `${item.name || 'Maison creation'} x${item.quantity || 1} @ ${money(getProductPrice(item))} = ${money(getProductPrice(item) * Number(item.quantity || 1))}`),
    '',
    `Subtotal: ${money(subtotal)}`,
    `Ameex delivery: ${delivery ? money(delivery) : 'Complimentary'}`,
    'Tax: Included in listed prices',
    `TOTAL: ${money(total)}`,
    '',
    'CNDP - Personal data processed under Moroccan Law 09-08.',
  ]
  const blob = createPdf(lines)
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `Invoice_${invoiceNumber}.pdf`
  link.click()
  URL.revokeObjectURL(link.href)
}
