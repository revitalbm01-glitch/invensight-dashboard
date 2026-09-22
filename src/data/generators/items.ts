import { randInt, randFloat, pick, weightedPick, chance } from '../seed'
import type { InventoryItem, StockStatus, Supplier } from '../../types'

export const CATEGORIES = ['אלקטרוניקה', 'מזון ומשקאות', 'טקסטיל והלבשה', 'חומרי גלם', 'ציוד משרדי'] as const

export const WAREHOUSES = ['מחסן מרכזי - ת"א', 'מחסן צפון - חיפה', 'מחסן דרום - באר שבע', 'מחסן מזרח - י-ם'] as const

const ITEM_NAME_PARTS: Record<string, string[]> = {
  'אלקטרוניקה': ['מטען USB-C', 'אוזניות אלחוטיות', 'רמקול Bluetooth', 'כבל HDMI', 'סוללת גיבוי', 'עכבר אלחוטי', 'מקלדת', 'מסך מחשב', 'מצלמת רשת', 'רכזת USB', 'שלט חכם', 'חיישן תנועה'],
  'מזון ומשקאות': ['קפה טחון', 'תה ירוק', 'שימורי תירס', 'שמן זית', 'אורז בסמטי', 'פסטה איטלקית', 'רוטב עגבניות', 'חטיף אנרגיה', 'מים מינרליים', 'משקה איזוטוני', 'דבש טבעי', 'קמח מלא'],
  'טקסטיל והלבשה': ['חולצת כותנה', 'מכנסי דנים', 'ז\'קט חורף', 'כובע גרב', 'גרביים', 'חגורת עור', 'תיק גב', 'כפפות תרמיות', 'צעיף צמר', 'חולצת פולו', 'מעיל גשם', 'סווטשירט'],
  'חומרי גלם': ['פלטת פלדה', 'גליל אלומיניום', 'צינור PVC', 'שרף אפוקסי', 'בד יוטה', 'חוט ריתוך', 'לוח עץ לבוד', 'פוליאסטר גולמי', 'גומי תעשייתי', 'זכוכית מחוסמת', 'בטון יבש', 'צבע תעשייתי'],
  'ציוד משרדי': ['נייר A4', 'עט ג\'ל', 'מחברת ספירלה', 'קלסר', 'מדפסת לייזר', 'מהדק שולחני', 'תיקיית קרטון', 'לוח מחיק', 'טונר למדפסת', 'מארז אחסון', 'סרט הדבקה', 'כיסא משרדי'],
}

function buildName(category: string, index: number): string {
  const parts = ITEM_NAME_PARTS[category]
  const base = pick(parts)
  return `${base} - דגם ${String(index).padStart(3, '0')}`
}

function daysAgoISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export function computeStockStatus(currentStock: number, reorderPoint: number, maxStock: number): StockStatus {
  if (currentStock <= 0) return 'OUT_OF_STOCK'
  if (currentStock <= reorderPoint) return 'BELOW_REORDER'
  if (currentStock > maxStock) return 'EXCESS'
  return 'NORMAL'
}

export function generateItems(suppliers: Supplier[], count = 250): InventoryItem[] {
  const items: InventoryItem[] = []
  const categoryWeights = [1.3, 1.1, 1, 0.9, 0.8]

  for (let i = 1; i <= count; i++) {
    const category = weightedPick(CATEGORIES, categoryWeights)
    const warehouse = pick(WAREHOUSES)
    const supplier = pick(suppliers)

    const unitCost = randFloat(8, 1800, 2)
    const maxStock = randInt(80, 2200)
    const minStock = Math.round(maxStock * randFloat(0.08, 0.18))
    const reorderPoint = Math.round(minStock * randFloat(1.3, 2.1))

    // Stock-status distribution engineered to feel realistic:
    // most items normal, a meaningful minority in each exception bucket.
    const statusRoll = chance(0.62)
      ? 'NORMAL'
      : weightedPick(['OUT_OF_STOCK', 'BELOW_REORDER', 'EXCESS'] as const, [0.15, 0.55, 0.3])

    let currentStock: number
    if (statusRoll === 'OUT_OF_STOCK') {
      currentStock = 0
    } else if (statusRoll === 'BELOW_REORDER') {
      currentStock = randInt(1, Math.max(1, reorderPoint))
    } else if (statusRoll === 'EXCESS') {
      currentStock = randInt(maxStock + 1, Math.round(maxStock * 1.8) + 10)
    } else {
      currentStock = randInt(reorderPoint + 1, maxStock)
    }

    const avgMonthlyConsumption = Math.max(1, Math.round(maxStock * randFloat(0.12, 0.45)))

    // ~14% of items are "dead stock" — no movement in 60+ days.
    const isDead = chance(0.14)
    const lastMovementDate = isDead ? daysAgoISO(randInt(61, 220)) : daysAgoISO(randInt(0, 45))
    const lastUpdated = daysAgoISO(randInt(0, 5))

    const stockValue = Math.round(currentStock * unitCost * 100) / 100
    const stockStatus = computeStockStatus(currentStock, reorderPoint, maxStock)

    items.push({
      sku: `SKU-${String(i).padStart(4, '0')}`,
      name: buildName(category, i),
      category,
      warehouse,
      supplierId: supplier.id,
      currentStock,
      minStock,
      reorderPoint,
      maxStock,
      unitCost,
      stockValue,
      avgMonthlyConsumption,
      lastMovementDate,
      lastUpdated,
      abcClass: 'C', // assigned later by ABC analysis, once full stockValue set exists
      stockStatus,
    })
  }

  return items
}
