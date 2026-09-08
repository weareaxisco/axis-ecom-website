export function getProductPrice(product) {
  const value = product?.price_dh ?? product?.price ?? 0
  const price = Number(value)
  return Number.isFinite(price) ? price : 0
}
