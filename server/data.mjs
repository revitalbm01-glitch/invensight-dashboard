// Loads the four Airtable tables, resolves links to readable labels and adds the same
// derived fields the dashboard computes, so the chat answers with the dashboard's numbers.
const TTL_MS = 60_000
let cache = null

export const TABLES = ['Suppliers', 'Items', 'Purchase Orders', 'Sales']

export function stockStatus(stock, reorderPoint, maxStock) {
  if (stock <= 0) return 'OUT_OF_STOCK'
  if (stock <= reorderPoint) return 'BELOW_REORDER'
  if (stock > maxStock) return 'EXCESS'
  return 'NORMAL'
}

export async function loadDataset(fetchAllRecords) {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data
  const [sup, itm, po, sal] = await Promise.all(TABLES.map((t) => fetchAllRecords(t)))

  const supName = new Map(sup.map((r) => [r.id, r.fields['Name']]))
  const itemById = new Map(itm.map((r) => [r.id, r.fields]))
  const first = (v) => (Array.isArray(v) ? v[0] : undefined)

  const Items = itm.map((r) => {
    const f = r.fields
    const stock = f['Current Stock'] ?? 0
    return {
      SKU: f['SKU'],
      Name: f['Name'],
      Category: f['Category'],
      Warehouse: f['Warehouse'],
      Supplier: supName.get(first(f['Supplier'])) ?? null,
      'Current Stock': stock,
      'Unit Cost': f['Unit Cost'],
      'Stock Value': Math.round(stock * (f['Unit Cost'] ?? 0) * 100) / 100,
      'Reorder Point': f['Reorder Point'],
      'Min Stock': f['Min Stock'],
      'Max Stock': f['Max Stock'],
      'Avg Monthly Consumption': f['Avg Monthly Consumption'],
      'Stock Status': stockStatus(stock, f['Reorder Point'] ?? 0, f['Max Stock'] ?? Infinity),
      'Last Movement Date': f['Last Movement Date'],
      'Last Updated': f['Last Updated'],
    }
  })
  const skuOf = (link) => itemById.get(first(link))?.['SKU'] ?? null

  const PurchaseOrders = po.map((r) => {
    const f = r.fields
    return {
      'PO Number': f['PO Number'],
      Supplier: supName.get(first(f['Supplier'])) ?? null,
      SKU: skuOf(f['Item']),
      'Item Name': f['Item Name'],
      Warehouse: f['Warehouse'],
      Status: f['Status'],
      'Order Date': f['Order Date'],
      'Planned Delivery Date': f['Planned Delivery Date'],
      'Actual Delivery Date': f['Actual Delivery Date'] ?? null,
      'Ordered Qty': f['Ordered Qty'],
      'Received Qty': f['Received Qty'],
      'Unit Cost': f['Unit Cost'],
      'Order Value': f['Order Value'],
    }
  })

  const Sales = sal.map((r) => {
    const f = r.fields
    const item = itemById.get(first(f['Item'])) ?? {}
    const qty = f['Quantity'] ?? 0
    const revenue = f['Revenue'] ?? qty * (f['Unit Price'] ?? 0)
    const cost = Math.round(qty * (item['Unit Cost'] ?? 0) * 100) / 100
    return {
      'Sale ID': f['Sale ID'],
      SKU: item['SKU'] ?? null,
      'Item Name': f['Item Name'],
      Category: item['Category'] ?? null,
      Supplier: supName.get(first(item['Supplier'])) ?? null,
      Customer: f['Customer'],
      Warehouse: f['Warehouse'],
      'Sale Date': f['Sale Date'],
      Quantity: qty,
      'Unit Price': f['Unit Price'],
      Revenue: revenue,
      Cost: cost,
      'Gross Profit': Math.round((revenue - cost) * 100) / 100,
    }
  })

  const Suppliers = sup.map((r) => {
    const f = r.fields
    const mine = PurchaseOrders.filter((p) => p.Supplier === f['Name'])
    return {
      'Supplier Code': f['Supplier Code'],
      Name: f['Name'],
      Rating: f['Rating'],
      'Avg Lead Time Days': f['Avg Lead Time Days'],
      'OTIF %': f['OTIF %'],
      'Order Count': mine.length,
      'Order Value': Math.round(mine.reduce((s, p) => s + (p['Order Value'] ?? 0), 0) * 100) / 100,
    }
  })

  const data = { Suppliers, Items, 'Purchase Orders': PurchaseOrders, Sales }
  cache = { at: Date.now(), data }
  return data
}
