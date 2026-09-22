# SPEC.md — מערכת BI לניהול מלאי ולוגיסטיקה
**InvenSight — Inventory & Logistics Intelligence Dashboard**

מסמך אפיון מקור (Single Source of Truth) לפיתוח המערכת. כל שינוי עתידי בקוד צריך להתאים למסמך זה; אם יש סתירה — יש לעדכן קודם את המסמך ואז את הקוד.

---

## 1. מטרת המערכת

לתת להנהלה, לכספים, לתפעול וללוגיסטיקה **תמונת מצב אחת, מהירה ומהימנה** על מצב המלאי, הרכש והשרשרת הלוגיסטית — כדי:

1. לזהות בעיות מלאי (חוסרים, עודפים, מלאי מת) לפני שהן הופכות לבעיה עסקית.
2. לעקוב אחרי ביצועי ספקים וזמני אספקה.
3. לתמוך בקבלת החלטות רכש מבוססות נתונים (כמה להזמין, ממי, מתי).
4. לתת שקיפות פיננסית על ההון הכלוא במלאי (Working Capital).
5. להתריע אוטומטית על חריגות, במקום להסתמך על בדיקה ידנית.

המערכת היא **read-only BI layer** מעל דאטה (כרגע מדומה, בעתיד מ-ERP): היא לא מערכת ERP, לא עורכת מלאי בפועל, אלא מציגה, מנתחת ומתריעה.

---

## 2. קהל יעד ותפקידים

| תפקיד | מה הוא צריך מהמערכת |
|---|---|
| **מנהל/ת כספים (CFO/Finance)** | שווי מלאי, הון כלוא, מלאי עודף/מת, מגמות עלות לאורך זמן |
| **מנהל/ת תפעול (Operations)** | זמינות מלאי, נקודות הזמנה, חוסרים צפויים, ABC |
| **מנהל/ת לוגיסטיקה (Logistics/Procurement)** | הזמנות פתוחות, איחורים, Lead Time, ביצועי ספקים, OTIF |
| **הנהלה בכירה (Executive)** | KPI-ים מרוכזים, חריגות קריטיות, מגמות כלליות — בלי לצלול לפרטים |

בשלב זה אין הפרדת הרשאות אמיתית (אין Backend/Auth), אך המסך הראשי (Executive Dashboard) מתוכנן להיות ברור מספיק לכל התפקידים, עם אפשרות Drill-Down לפרטים הרלוונטיים לכל בעל תפקיד.

---

## 3. Use Cases עיקריים

1. **בדיקת מצב יומית** — מנהל תפעול נכנס בבוקר, רואה כמה פריטים מתחת לנקודת הזמנה, וממיין לפי דחיפות.
2. **ישיבת הנהלה חודשית** — CFO מציג שווי מלאי לפי קטגוריה/מחסן ומגמת שינוי לעומת החודש הקודם.
3. **בדיקת ספק בעייתי** — מנהל רכש מזהה ספק עם OTIF נמוך ו-Lead Time גבוה, ובודק את היסטוריית ההזמנות שלו.
4. **זיהוי מלאי מת** — תפעול מאתר פריטים ללא תנועה מעל X ימים כדי להחליט על סליקה/מבצע.
5. **ניתוח ABC לתעדוף** — כספים מזהה אילו 20% מהפריטים מהווים 80% מהשווי, כדי למקד בהם בקרה הדוקה.
6. **מעקב הזמנת רכש** — לוגיסטיקה עוקבת אחרי הזמנה ספציפית מרגע פתיחה ועד קבלה בפועל, כולל חריגה מתאריך יעד.
7. **סינון ממוקד** — משתמש מסנן לפי מחסן/קטגוריה/ספק/טווח תאריכים ובודק את ההשפעה על כל שאר המסך.
8. **תגובה להתראה** — משתמש נכנס ל"התראות ניהוליות", לוחץ על התראה וקופץ (Drill-Down) ישירות לרשומה הרלוונטית.

---

## 4. מבנה הנתונים (Data Model)

כל הדאטה בשלב זה היא **דמה (Mock)**, נוצרת דטרמיניסטית (seeded) כך שתהיה עקבית בין ריצות, ונשמרת כקבצי TypeScript/JSON סטטיים תחת `src/data`.

### 4.1 Item (פריט מלאי) — `InventoryItem`

| שדה | טיפוס | תיאור |
|---|---|---|
| `sku` | string | מזהה ייחודי לפריט |
| `name` | string | שם פריט (עברית) |
| `category` | string | קטגוריה (למשל: אלקטרוניקה, מזון, טקסטיל...) |
| `warehouse` | string | מחסן (למשל: מרכז, צפון, דרום, מחסן ראשי) |
| `supplierId` | string | ספק ראשי מקושר |
| `currentStock` | number | מלאי נוכחי (יחידות) |
| `minStock` | number | מלאי מינימום |
| `reorderPoint` | number | נקודת הזמנה |
| `maxStock` | number | מלאי מקסימום |
| `unitCost` | number | עלות יחידה (₪) |
| `stockValue` | number | נגזר: `currentStock * unitCost` |
| `avgMonthlyConsumption` | number | צריכה/מכירה חודשית ממוצעת |
| `lastMovementDate` | string (ISO) | תאריך תנועת מלאי אחרונה |
| `lastUpdated` | string (ISO) | תאריך עדכון רשומה |
| `abcClass` | 'A' \| 'B' \| 'C' | נגזר מ-ABC Analysis |
| `stockStatus` | enum | נגזר: `OUT_OF_STOCK` / `BELOW_REORDER` / `EXCESS` / `NORMAL` |

### 4.2 Supplier (ספק) — `Supplier`

| שדה | טיפוס | תיאור |
|---|---|---|
| `id` | string | מזהה ספק |
| `name` | string | שם ספק |
| `avgLeadTimeDays` | number | זמן אספקה ממוצע (ימים) |
| `otifPercent` | number | אחוז אספקה בזמן ובכמות |
| `rating` | 'excellent'\|'good'\|'warning'\|'critical' | נגזר מדירוג ביצועים |

### 4.3 Purchase Order (הזמנת רכש) — `PurchaseOrder`

| שדה | טיפוס | תיאור |
|---|---|---|
| `poNumber` | string | מספר הזמנת רכש |
| `sku` | string | פריט מוזמן |
| `supplierId` | string | ספק |
| `warehouse` | string | מחסן יעד |
| `orderedQty` | number | כמות בהזמנה |
| `unitCost` | number | עלות יחידה בהזמנה |
| `orderValue` | number | נגזר |
| `orderDate` | string (ISO) | תאריך הזמנה |
| `plannedDeliveryDate` | string (ISO) | תאריך אספקה מתוכנן |
| `actualDeliveryDate` | string \| null | תאריך אספקה בפועל |
| `status` | enum | `OPEN` / `IN_TRANSIT` / `RECEIVED` / `LATE` / `CANCELLED` |
| `isLate` | boolean | נגזר: לא התקבל עד התאריך המתוכנן, או התקבל אחריו |
| `isFullQty` | boolean | נגזר: האם התקבלה הכמות המלאה (עבור OTIF) |

### 4.4 Time Series (למגמות)

נגזר מתנועות מלאי היסטוריות: `{ date, totalStockValue, warehouseId? }` ל-12 החודשים האחרונים, לצורך גרפי מגמה.

### נפח הדאטה המדומה
- כ-**250 SKUs**, 5 קטגוריות, 4 מחסנים, 12 ספקים.
- כ-**400 הזמנות רכש** (פתוחות, שהתקבלו, באיחור) על פני 12 חודשים אחרונים.
- Time series חודשי ל-12 חודשים לשווי מלאי כולל ולפי מחסן.

---

## 5. KPI-ים (הגדרות חישוב מדויקות)

| KPI | נוסחה |
|---|---|
| **שווי מלאי כולל** | `Σ(currentStock × unitCost)` על פני כל הפריטים המסוננים |
| **כמות פריטים במלאי** | `count(items)` בפילטר הנוכחי |
| **פריטים מתחת לנקודת הזמנה** | `count(currentStock <= reorderPoint AND currentStock > 0)` |
| **פריטים במלאי אפס** | `count(currentStock === 0)` |
| **מלאי עודף** | `count(currentStock > maxStock)` |
| **ימי מלאי ממוצעים (DOH)** | `Σ(currentStock) / (Σ(avgMonthlyConsumption)/30)` |
| **מחזור מלאי (Inventory Turnover)** | `(Σ avgMonthlyConsumption × 12 × avgUnitCost) / Σ stockValue` |
| **הזמנות רכש פתוחות** | `count(status IN [OPEN, IN_TRANSIT])` |
| **הזמנות באיחור** | `count(isLate === true AND status != RECEIVED)` |
| **OTIF** | `count(delivered on-time AND full qty) / count(all completed orders) × 100%` |

לכל KPI Card: ערך נוכחי, **Δ** לעומת התקופה הקודמת (חודש קודם), חץ מגמה (↑/↓) עם צבע פונקציונלי (חיובי/שלילי לפי המשמעות העסקית — למשל עלייה בהזמנות באיחור היא **שלילית** גם אם המספר "עלה"), אינדיקציית חריגה (Badge אדום/כתום) כשחוצה סף, ו-Tooltip עם הסבר הנוסחה.

---

## 6. מסכים

### 6.1 Executive Dashboard (מסך ראשי)
- שורת 10 KPI Cards (סעיף 5).
- גרף מגמת שווי מלאי (12 חודשים).
- גרף שווי מלאי לפי קטגוריה (Donut/Bar).
- טבלת "דורש טיפול מיידי" — Top חריגות (מיזוג של: חוסרים קריטיים + הזמנות באיחור חמורות + ספקים בעייתיים) עם Drill-Down.

### 6.2 ניתוח מלאי (Inventory Analysis)
1. שווי מלאי לפי קטגוריה (Bar/Donut)
2. שווי מלאי לפי מחסן (Bar)
3. מגמת שווי מלאי לאורך זמן (Line, עם toggle לפי מחסן)
4. Top 10 פריטים לפי שווי מלאי (טבלה + Bar אופקי)
5. פריטים עם מלאי עודף (טבלה ממוינת)
6. פריטים בסיכון לחוסר (טבלה: ימים עד אזילה)
7. פריטים ללא תנועה מעל 60 יום (טבלה)
8. ABC Analysis: Pareto Chart (% מצטבר) + פילוח A/B/C + טבלה ניתנת לסינון

### 6.3 לוגיסטיקה ורכש (Logistics & Procurement)
- KPI משנה: הזמנות פתוחות, שהתקבלו, באיחור, Lead Time ממוצע.
- גרף מגמת הזמנות לאורך זמן (נפתחו מול התקבלו, חודשי).
- גרף Lead Time לפי ספק (Bar).
- גרף OTIF לפי ספק (Bar, עם קו סף 95%).
- טבלת ספקים מלאה (סעיף 4.2 + מדדים).
- טבלת הזמנות רכש עם סינון וסטטוס צבעוני.

### 6.4 התראות ניהוליות (Management Alerts)
רשימת כרטיסי התראה שנוצרים דינמית מהדאטה (ראו סעיף 7), ממוינים לפי חומרה, עם ספירה לפי סוג וסינון.

---

## 7. מנוע התראות (Alert Engine) — כללים

| כלל | תנאי | חומרה |
|---|---|---|
| מלאי מתחת לנקודת הזמנה | `0 < currentStock <= reorderPoint` | כתום (אזהרה) |
| מלאי אפס | `currentStock === 0` | אדום (קריטי) |
| הזמנה באיחור | `status != RECEIVED AND today > plannedDeliveryDate` | אדום/כתום לפי מס' ימי איחור |
| מלאי עודף | `currentStock > maxStock` | כתום |
| מלאי ללא תנועה | `daysSince(lastMovementDate) > 60` | כתום |
| ספק עם Lead Time גבוה | `avgLeadTimeDays > קטגוריה-benchmark (יעד: 14 יום)` | כתום |
| ביצועים תקינים | ספק עם `otifPercent >= 95` וללא איחורים פעילים | ירוק (מידע חיובי) |

כל התראה כוללת: כותרת, תיאור דינמי עם נתונים אמיתיים (למשל: "פריט SKU-0231 — מלאי אפס, ביקוש חודשי ממוצע 45 יח'"), חומרה, וקישור Drill-Down לפריט/ספק/הזמנה הרלוונטיים.

---

## 8. פילטרים גלובליים ואינטראקטיביות

**Global Filter Context** (React Context) המשפיע על **כל** המסכים בו-זמנית:

- טווח תאריכים (Date Range Picker)
- מחסן (Multi-select)
- קטגוריה (Multi-select)
- ספק (Multi-select)
- SKU (חיפוש טקסט חופשי)
- סטטוס מלאי (חוסר / נקודת הזמנה / עודף / תקין / אפס)
- ABC Category (A/B/C)

כל שינוי פילטר מחשב מחדש (memoized selectors) את כל ה-KPIs, הגרפים והטבלאות. **Drill-Down**: לחיצה על שורת גרף/KPI/התראה מנווטת למסך המפורט עם הפילטר המתאים כבר מוחל (למשל: לחיצה על "פריטים מתחת לנקודת הזמנה" בדשבורד הראשי → מעבר למסך ניתוח מלאי עם `stockStatus=BELOW_REORDER` מסונן).

---

## 9. עיצוב, UI/UX

- **RTL מלא**, עברית כשפת ממשק ראשית (`dir="rtl"`, פונט תומך עברית).
- שפה עיצובית של מוצר BI ארגוני: נקי, מרווח, היררכיה ברורה (כותרת → KPI → ניתוח → פירוט), לא "עמוס".
- **Sidebar ניווט קבוע**: לוגו/שם מערכת, ניווט בין 4 המסכים, מצב Collapse ל-Responsive.
- פס פילטרים גלובלי עליון, נצמד (sticky).
- **צבעים פונקציונליים בלבד**: ירוק=תקין, כתום=אזהרה, אדום=חריגה/קריטי, כחול/אפור=ניטרלי/מידע. שאר הממשק בגווני אפור/לבן ניטרליים.
- Responsive: Desktop (עיקרי, layout מלא), Tablet (KPI-ים נשברים ל-2 טורים), Mobile (Sidebar הופך ל-Drawer, טבלאות הופכות לכרטיסים גלילים).
- מיקרו-אינטראקציות: Hover states, Loading skeletons, Empty states מעוצבים (לא "No Data" גולמי).
- כל KPI/גרף עם Tooltip הסברי (אייקון ⓘ).

---

## 10. דרישות טכניות

- **React 18 + TypeScript**, בנייה עם **Vite**.
- **Tailwind CSS** לעיצוב (עם קונפיגורציית RTL).
- **Recharts** לגרפים (Line, Bar, Donut/Pie, Pareto).
- **React Router** לניתוב בין מסכים.
- ניהול State: React Context + hooks (ללא Redux — לא נדרש בהיקף הזה).
- דאטה מדומה: מודול generator דטרמיניסטי (`src/data/generateMockData.ts`) שרץ פעם אחת ומייצא דאטה קבוע (לא רנדומלי בכל רינדור).
- **ללא Backend** — הכל Client-side, בר-פריסה כ-Static Site.
- תמיכה ב-**GitHub Pages** (base path יחסי, HashRouter או BrowserRouter עם 404 fallback).
- קוד באנגלית (משתנים/פונקציות), טקסט ממשק בעברית.

---

## 11. מבנה הפרויקט

```
DESHBORD/
├── SPEC.md
├── Practice.md
├── README.md
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── index.ts                  # כל טיפוסי הדאטה
    ├── data/
    │   ├── generators/                # לוגיקת יצירת דאטה מדומה
    │   │   ├── items.ts
    │   │   ├── suppliers.ts
    │   │   ├── purchaseOrders.ts
    │   │   └── timeSeries.ts
    │   ├── seed.ts                    # PRNG דטרמיניסטי
    │   └── mockData.ts                # אוסף/ייצוא סופי
    ├── logic/                         # שכבת Business Logic (נפרדת מ-UI)
    │   ├── kpiCalculations.ts
    │   ├── abcAnalysis.ts
    │   ├── alertEngine.ts
    │   ├── itemInsights.ts            # Top/עודף/בסיכון/ללא-תנועה — נגזרות משותפות
    │   ├── filters.ts
    │   └── formatters.ts
    ├── context/
    │   └── FilterContext.tsx
    ├── hooks/
    │   ├── useFilteredData.ts
    │   ├── useKpis.ts
    │   └── useAlerts.ts
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   ├── TopFilterBar.tsx
    │   │   └── PageLayout.tsx
    │   ├── kpi/
    │   │   ├── KpiCard.tsx
    │   │   └── KpiGrid.tsx
    │   ├── charts/
    │   │   ├── TrendLineChart.tsx
    │   │   ├── CategoryBarChart.tsx   # generic: groupBy="category"|"warehouse" (מחליף WarehouseBarChart)
    │   │   ├── AbcParetoChart.tsx
    │   │   ├── SupplierPerformanceChart.tsx
    │   │   └── OrdersTrendChart.tsx
    │   ├── tables/
    │   │   ├── DataTable.tsx          # טבלה גנרית reusable
    │   │   ├── ItemsTable.tsx         # מחליף TopItemsTable — reusable לכל טבלת InventoryItem
    │   │   ├── SuppliersTable.tsx
    │   │   └── PurchaseOrdersTable.tsx
    │   ├── alerts/
    │   │   ├── AlertCard.tsx
    │   │   └── AlertsPanel.tsx
    │   └── common/
    │       ├── Badge.tsx
    │       ├── Tooltip.tsx
    │       ├── SeverityIndicator.tsx
    │       ├── EmptyState.tsx
    │       ├── MultiSelect.tsx        # רכיב פילטר רב-בחירה גנרי
    │       └── ChartCard.tsx          # עטיפה אחידה לכל גרף (כותרת/tooltip/action)
    └── pages/
        ├── ExecutiveDashboard.tsx
        ├── InventoryAnalysis.tsx
        ├── Logistics.tsx
        └── ManagementAlerts.tsx
```

**עקרון הפרדה**: `data` (מקור נתונים) → `logic` (חישובים טהורים, ניתנים לבדיקה, ללא JSX) → `hooks`/`context` (חיבור לוגיקה ל-React) → `components`/`pages` (תצוגה בלבד).

**הערת מימוש**: `WarehouseBarChart` ו-`TopItemsTable` שתוכננו כקבצים נפרדים מומשו בסופו של דבר כפרמטרים גנריים בתוך `CategoryBarChart` ו-`ItemsTable` בהתאמה, כדי למנוע קוד כפול (ראו [Practice.md](./Practice.md) סעיף "Reuse over duplication").

---

## 12. שלבי הפיתוח

1. ✅ **SPEC.md** — מסמך זה.
2. Scaffold פרויקט (Vite + React + TS + Tailwind + Router), הגדרות RTL.
3. שכבת Types + Mock Data Generator (items, suppliers, purchase orders, time series).
4. שכבת Logic (KPI calculations, ABC analysis, Alert engine, filters, formatters).
5. Layout: Sidebar, Top Filter Bar, PageLayout, רכיבי Common.
6. Executive Dashboard: KPI Cards + גרפים ראשיים + טבלת "דורש טיפול".
7. Inventory Analysis: כל 8 תתי-האזורים כולל ABC.
8. Logistics & Procurement: KPI, גרפים, טבלת ספקים, טבלת הזמנות.
9. Management Alerts: מנוע ההתראות + תצוגה.
10. חיבור מלא של Global Filters + Drill-Down בין מסכים.
11. ליטוש Responsive + נגישות + Tooltips.
12. `Practice.md` + `README.md`.
13. הכנה ל-Git/GitHub + הגדרות פריסה ל-GitHub Pages.

---

## 13. הגדרת "הצלחה"

המשתמש נכנס למסך הראשי ותוך כמה שניות יודע: מה מצב המלאי הכולל, איפה יש בעיות, מה דורש טיפול, כמה כסף כלוא במלאי, ואילו ספקים/הזמנות בעייתיים — בלי לקרוא טקסט הסבר, רק דרך מבנה ויזואלי וצבע נכון.
