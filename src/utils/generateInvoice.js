function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character])
}

export function generateInvoice(order = {}) {
  const items = order.items || order.cartItems || []
  const subtotal = Number(order.subtotal ?? items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0))
  const delivery = Number(order.shippingFee ?? order.delivery_fee ?? 0)
  const invoiceNumber = order.invoiceNumber || `MDE-${String(order.id || Date.now()).slice(-8)}`
  const rows = items.map((item) => `<tr><td>${escapeHtml(item.name || 'Maison creation')}</td><td>${item.quantity || 1}</td><td>${Number(item.price || 0).toLocaleString()} DH</td><td>${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()} DH</td></tr>`).join('')
  const html = `<!doctype html><html><head><title>Invoice ${invoiceNumber}</title><style>body{font-family:Georgia,serif;color:#171717;margin:48px;line-height:1.5}header{border-bottom:2px solid #c5a059;padding-bottom:20px}h1{letter-spacing:4px;font-weight:400}small{color:#666}section{margin-top:28px}.meta{display:flex;justify-content:space-between}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{text-align:left;border-bottom:1px solid #ddd;padding:10px}th{font-size:11px;text-transform:uppercase;letter-spacing:1px}tfoot td{font-weight:bold}footer{margin-top:70px;border-top:1px solid #ddd;padding-top:14px;font:11px Arial;color:#666}</style></head><body><header><h1>MAISON DE L'ÉLÉGANCE</h1><small>Haute Joaillerie &amp; Horlogerie</small></header><section class="meta"><div><strong>Invoice #</strong><br>${escapeHtml(invoiceNumber)}<br><strong>Date</strong><br>${escapeHtml(order.date || new Date().toLocaleDateString('fr-MA'))}</div><div><strong>ICE</strong><br>${escapeHtml(order.ice || 'À compléter par la Maison')}<br><strong>IF</strong><br>${escapeHtml(order.taxId || 'À compléter par la Maison')}</div></section><section><strong>Customer</strong><br>${escapeHtml(order.customerName || order.fullName || '—')}<br>${escapeHtml(order.address || '—')}<br>${escapeHtml(order.city || 'Morocco')}<br>Ameex: ${escapeHtml(order.tracking_reference || order.trackingReference || '—')}</section><table><thead><tr><th>Creation</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="3">Subtotal</td><td>${subtotal.toLocaleString()} DH</td></tr><tr><td colspan="3">Ameex delivery</td><td>${delivery ? `${delivery.toLocaleString()} DH` : 'Complimentary'}</td></tr><tr><td colspan="3">Total</td><td>${(subtotal + delivery).toLocaleString()} DH</td></tr></tfoot></table><footer>CNDP — Vos données personnelles sont traitées conformément à la Loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.</footer></body></html>`
  const invoiceWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!invoiceWindow) throw new Error('Please allow pop-ups to print your invoice.')
  invoiceWindow.document.write(html)
  invoiceWindow.document.close()
  invoiceWindow.focus()
  invoiceWindow.print()
}
