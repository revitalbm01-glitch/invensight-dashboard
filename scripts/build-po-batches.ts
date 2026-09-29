import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

interface PO {
  poNumber: string
  sku: string
  itemName: string
  supplierId: string
  warehouse: string
  orderedQty: number
  receivedQty: number
  unitCost: number
  orderValue: number
  orderDate: string
  plannedDeliveryDate: string
  actualDeliveryDate: string | null
  status: 'OPEN' | 'IN_TRANSIT' | 'RECEIVED' | 'LATE' | 'CANCELLED'
  isLate: boolean
  isFullQty: boolean
}

const FIELD = {
  poNumber: 'fldtikUZ1a4I8FXUi',
  item: 'fldEe2MdIHvoumMCp',
  itemName: 'fldLbdcl1RN3SSx7n',
  supplier: 'fld8ljd2CUZnWulXY',
  warehouse: 'fldu0q3ZsLLFzgt3r',
  orderedQty: 'fldKDKJsZpuIybzXK',
  receivedQty: 'fldc3mmhqljCqv5bq',
  unitCost: 'fld2zjDKP5NbCbgTx',
  orderValue: 'fld5479RDVG1SMuEj',
  orderDate: 'fldjbNKAurl2lNCtP',
  plannedDeliveryDate: 'fldt1lbfmVnv2pCgo',
  actualDeliveryDate: 'fld5AYRUVRW78hiSg',
  status: 'fldSIaa9mGWX35RGm',
  isLate: 'fldmyhI0lZdMx7xw7',
  isFullQty: 'fldMXYA1bUe9a2qYF',
}

const STATUS_LABEL: Record<PO['status'], string> = {
  OPEN: 'Open',
  IN_TRANSIT: 'In Transit',
  RECEIVED: 'Received',
  LATE: 'Late',
  CANCELLED: 'Cancelled',
}

const pos: PO[] = JSON.parse(readFileSync('scripts/data/purchaseOrders.json', 'utf-8'))
const skuMap: Record<string, string> = JSON.parse(readFileSync('scripts/data/skuMap.json', 'utf-8'))
const supplierMap: Record<string, string> = JSON.parse(readFileSync('scripts/data/supplierMap.json', 'utf-8'))

const records = pos.map((po) => {
  const itemId = skuMap[po.sku]
  const supplierRecId = supplierMap[po.supplierId]
  if (!itemId) throw new Error(`Missing item mapping for SKU ${po.sku}`)
  if (!supplierRecId) throw new Error(`Missing supplier mapping for ${po.supplierId}`)

  const fields: Record<string, unknown> = {
    [FIELD.poNumber]: po.poNumber,
    [FIELD.item]: [itemId],
    [FIELD.itemName]: po.itemName,
    [FIELD.supplier]: [supplierRecId],
    [FIELD.warehouse]: po.warehouse,
    [FIELD.orderedQty]: po.orderedQty,
    [FIELD.receivedQty]: po.receivedQty,
    [FIELD.unitCost]: po.unitCost,
    [FIELD.orderValue]: po.orderValue,
    [FIELD.orderDate]: po.orderDate,
    [FIELD.plannedDeliveryDate]: po.plannedDeliveryDate,
    [FIELD.status]: STATUS_LABEL[po.status],
    [FIELD.isLate]: po.isLate,
    [FIELD.isFullQty]: po.isFullQty,
  }
  if (po.actualDeliveryDate) {
    fields[FIELD.actualDeliveryDate] = po.actualDeliveryDate
  }
  return { fields }
})

mkdirSync('scripts/batches', { recursive: true })

const BATCH_SIZE = 50
const batchCount = Math.ceil(records.length / BATCH_SIZE)
for (let i = 0; i < batchCount; i++) {
  const batch = records.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
  writeFileSync(`scripts/batches/po-${i + 1}.json`, JSON.stringify(batch))
}
console.log('total records:', records.length, 'batches:', batchCount)
