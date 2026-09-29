import { readFileSync, writeFileSync } from 'node:fs'

interface InventoryItem {
  sku: string
  name: string
  category: string
  warehouse: string
  supplierId: string
  currentStock: number
  minStock: number
  reorderPoint: number
  maxStock: number
  unitCost: number
  stockValue: number
  avgMonthlyConsumption: number
  lastMovementDate: string
  lastUpdated: string
  abcClass: string
  stockStatus: string
}

const FIELD = {
  sku: 'fld75C3A4Xwd7a4vq',
  name: 'fld9YfqZYAn7uRdmS',
  category: 'fldabVBRVwk4AsLBz',
  warehouse: 'fldT02MSduiQylr8j',
  supplier: 'flduNEbNDn7OEcxNJ',
  currentStock: 'fldQTchKcBCf1nsd7',
  minStock: 'fld9QemeUarvrEntu',
  reorderPoint: 'fld8AI1NSjYzLCS1I',
  maxStock: 'fldBaEoEN7j5WtbeJ',
  unitCost: 'fldLDeGAVhFnLProM',
  stockValue: 'fldIW24ZgM3rUdgEl',
  avgMonthlyConsumption: 'fld5iYDJTy9qR490E',
  lastMovementDate: 'fldPUnnzs9vvLlw5E',
  lastUpdated: 'fld0MRtE2ZNztR7Mk',
  abcClass: 'fldKp5OGYOPzq6jNQ',
  stockStatus: 'fldaUCvwO9tiKRpaA',
}

const STOCK_STATUS_LABEL: Record<string, string> = {
  NORMAL: 'Normal',
  BELOW_REORDER: 'Below Reorder',
  OUT_OF_STOCK: 'Out of Stock',
  EXCESS: 'Excess',
}

const items: InventoryItem[] = JSON.parse(readFileSync('scripts/data/items.json', 'utf-8'))
const supplierMap: Record<string, string> = JSON.parse(readFileSync('scripts/data/supplierMap.json', 'utf-8'))

const records = items.map((it) => ({
  fields: {
    [FIELD.sku]: it.sku,
    [FIELD.name]: it.name,
    [FIELD.category]: it.category,
    [FIELD.warehouse]: it.warehouse,
    [FIELD.supplier]: [supplierMap[it.supplierId]],
    [FIELD.currentStock]: it.currentStock,
    [FIELD.minStock]: it.minStock,
    [FIELD.reorderPoint]: it.reorderPoint,
    [FIELD.maxStock]: it.maxStock,
    [FIELD.unitCost]: it.unitCost,
    [FIELD.stockValue]: it.stockValue,
    [FIELD.avgMonthlyConsumption]: it.avgMonthlyConsumption,
    [FIELD.lastMovementDate]: it.lastMovementDate,
    [FIELD.lastUpdated]: it.lastUpdated,
    [FIELD.abcClass]: it.abcClass,
    [FIELD.stockStatus]: STOCK_STATUS_LABEL[it.stockStatus],
  },
}))

const BATCH_SIZE = 50
let batchNum = 1
for (let i = 0; i < records.length; i += BATCH_SIZE) {
  const batch = records.slice(i, i + BATCH_SIZE)
  writeFileSync(`scripts/batches/items-${batchNum}.json`, JSON.stringify(batch))
  batchNum++
}
console.log('total items:', records.length, 'batches:', batchNum - 1)
