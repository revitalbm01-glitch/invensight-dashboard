import { writeFileSync } from 'node:fs'
import { mockDataset } from '../src/data/mockData'

writeFileSync('scripts/data/suppliers.json', JSON.stringify(mockDataset.suppliers))
writeFileSync('scripts/data/items.json', JSON.stringify(mockDataset.items))
writeFileSync('scripts/data/purchaseOrders.json', JSON.stringify(mockDataset.purchaseOrders))
console.log('items:', mockDataset.items.length)
console.log('suppliers:', mockDataset.suppliers.length)
console.log('purchaseOrders:', mockDataset.purchaseOrders.length)
