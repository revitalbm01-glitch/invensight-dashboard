import { readFileSync, writeFileSync } from 'node:fs'

interface Item {
  sku: string
}

const items: Item[] = JSON.parse(readFileSync('scripts/data/items.json', 'utf-8'))

const idBatches: string[][] = [1, 2, 3, 4, 5].map((n) =>
  JSON.parse(readFileSync(`scripts/data/items-${n}-ids.json`, 'utf-8'))
)
const allIds = idBatches.flat()

if (allIds.length !== items.length) {
  throw new Error(`Mismatch: ${allIds.length} ids vs ${items.length} items`)
}

const skuMap: Record<string, string> = {}
items.forEach((item, i) => {
  skuMap[item.sku] = allIds[i]
})

writeFileSync('scripts/data/skuMap.json', JSON.stringify(skuMap))
console.log('skuMap entries:', Object.keys(skuMap).length)
