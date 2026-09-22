import { randInt } from '../seed'
import type { Supplier } from '../../types'

const SUPPLIER_NAMES = [
  'טכנו-ספליי בע"מ',
  'גלובל אימפורט',
  'אלפא לוגיסטיקס',
  'נורת\' סחר בינלאומי',
  'דרים סטוק',
  'פרימיום סורסינג',
  'קוויק שיפ',
  'מגה חומרי גלם',
  'סנטרל דיסטריביושן',
  'יוניון טרייד',
  'אקספרס פארטס',
  'בלו הורייזן ספקים',
]

// Generates the supplier master list. Performance fields (orderCount,
// orderValue, lateOrderCount, otifPercent) are recomputed later from the
// actual purchase-order dataset in mockData.ts — the values set here are
// placeholders only.
export function generateSuppliers(): Supplier[] {
  return SUPPLIER_NAMES.map((name, i) => {
    const avgLeadTimeDays = randInt(4, 26)
    return {
      id: `SUP-${String(i + 1).padStart(3, '0')}`,
      name,
      avgLeadTimeDays,
      otifPercent: 0,
      rating: 'good' as const,
      orderCount: 0,
      orderValue: 0,
      lateOrderCount: 0,
    }
  })
}

export function rateSupplier(otifPercent: number, avgLeadTimeDays: number): Supplier['rating'] {
  if (otifPercent >= 95 && avgLeadTimeDays <= 14) return 'excellent'
  if (otifPercent >= 88) return 'good'
  if (otifPercent >= 75) return 'warning'
  return 'critical'
}
