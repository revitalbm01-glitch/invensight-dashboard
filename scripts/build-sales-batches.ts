import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

interface Item {
  sku: string
  name: string
  warehouse: string
  unitCost: number
  avgMonthlyConsumption: number
  abcClass: 'A' | 'B' | 'C'
}

const FIELD = {
  saleId: 'fldjP63rZcBmZhama',
  item: 'fldG0Cs7GwO9kgkuE',
  itemName: 'fldk3xd0w8fxTDBOK',
  customer: 'fldrGN3Zm4p1QojsF',
  warehouse: 'fldMS1HXBJzDqsQGc',
  saleDate: 'fldzD1O7tv7Q5dIRY',
  quantity: 'fldQ6scs7rswTrkTb',
  unitPrice: 'fldGzw7Z82z9X6gR9',
  revenue: 'fldPGAAfeoY1ppFaA',
}

const CUSTOMERS = [
  'רשת סופר-פלוס', 'אלקטרו-סנטר בע"מ', 'אופנת הצפון', 'בנייה ושיפוצים גולן', 'משרדים חכמים',
  'קמעונאות דרום', 'סיטי מרקט', 'טכנו-שופ', 'מפעלי הגליל', 'הום סטייל',
]

let seed = 20261108
function rand(): number {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const randInt = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1))

const items: Item[] = JSON.parse(readFileSync('scripts/data/items.json', 'utf-8'))
const skuMap: Record<string, string> = JSON.parse(readFileSync('scripts/data/skuMap.json', 'utf-8'))

const weights = items.map((it) => (it.abcClass === 'A' ? 5 : it.abcClass === 'B' ? 2 : 1))
const totalWeight = weights.reduce((s, w) => s + w, 0)
function pickItem(): Item {
  let r = rand() * totalWeight
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

const START = Date.UTC(2025, 11, 1)
const END = Date.UTC(2026, 10, 7)

const COUNT = 250
const rows = Array.from({ length: COUNT }, () => {
  const it = pickItem()
  const date = new Date(START + Math.floor(rand() * (END - START))).toISOString().slice(0, 10)
  const quantity = Math.max(1, Math.round(it.avgMonthlyConsumption * (0.05 + rand() * 0.35)))
  const unitPrice = Math.round(it.unitCost * (1.2 + rand() * 0.5) * 100) / 100
  return { it, date, quantity, unitPrice, customer: CUSTOMERS[randInt(0, CUSTOMERS.length - 1)] }
})
rows.sort((a, b) => (a.date < b.date ? -1 : 1))

const records = rows.map((r, i) => ({
  fields: {
    [FIELD.saleId]: `SL-${String(i + 1).padStart(5, '0')}`,
    [FIELD.item]: [skuMap[r.it.sku]],
    [FIELD.itemName]: r.it.name,
    [FIELD.customer]: r.customer,
    [FIELD.warehouse]: r.it.warehouse,
    [FIELD.saleDate]: r.date,
    [FIELD.quantity]: r.quantity,
    [FIELD.unitPrice]: r.unitPrice,
    [FIELD.revenue]: Math.round(r.quantity * r.unitPrice * 100) / 100,
  },
}))

mkdirSync('scripts/batches', { recursive: true })
for (let i = 0; i < records.length; i += 50) {
  writeFileSync(`scripts/batches/sales-${i / 50 + 1}.json`, JSON.stringify(records.slice(i, i + 50)))
}
console.log('sales:', records.length, 'revenue:', Math.round(records.reduce((s, r) => s + (r.fields[FIELD.revenue] as number), 0)))
