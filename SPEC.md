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

המערכת היא **read-only BI layer** מעל דאטה שנשמר ב-**Airtable** (נתוני דמו, ובעתיד חיבור ל-ERP): היא לא מערכת ERP, לא עורכת מלאי בפועל, אלא מציגה, מנתחת ומתריעה. בנוסף יש **עוזר AI** (צ'אט) שעונה על שאלות בעברית מאותם נתונים חיים (סעיף 15).

---

## 2. קהל יעד ותפקידים

| תפקיד | מה הוא צריך מהמערכת |
|---|---|
| **מנהל/ת כספים (CFO/Finance)** | שווי מלאי, הון כלוא, מלאי עודף/מת, מגמות עלות לאורך זמן |
| **מנהל/ת תפעול (Operations)** | זמינות מלאי, נקודות הזמנה, חוסרים צפויים, ABC |
| **מנהל/ת לוגיסטיקה (Logistics/Procurement)** | הזמנות פתוחות, איחורים, Lead Time, ביצועי ספקים, OTIF |
| **הנהלה בכירה (Executive)** | KPI-ים מרוכזים, חריגות קריטיות, מגמות כלליות — בלי לצלול לפרטים |

בשלב זה אין הפרדת הרשאות לפי תפקיד. הדשבורד עצמו פתוח; רק עוזר ה-AI מוגן בסיסמה משותפת (סעיף 15). המסך הראשי (Executive Dashboard) מתוכנן להיות ברור מספיק לכל התפקידים, עם אפשרות Drill-Down לפרטים הרלוונטיים לכל בעל תפקיד.

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

**מקור האמת לנתונים הוא Airtable** (בסיס עם 4 טבלאות: `Suppliers`, `Items`, `Purchase Orders`, `Sales`; ראו סעיף 14). הנתונים עצמם הם **דמה**, שנוצרה דטרמיניסטית (seeded) והוזנה ל-Airtable. הקשרים בין הטבלאות הם שדות Link (פריט ↔ ספק, הזמנת רכש ↔ פריט/ספק, מכירה ↔ פריט).

**שדות נגזרים אינם נשמרים כמקור אמת**: `stockValue`, `stockStatus`, `abcClass` וכן `orderCount` / `orderValue` / `lateOrderCount` / `otifPercent` / `rating` של ספק מחושבים מחדש בדפדפן מהשדות הגולמיים בכל טעינה (`src/data/airtableDataset.ts`). כך שינוי ידני ב-Airtable (למשל `Current Stock`) מתבטא מיד בכל המדדים. הגנרטורים ב-`src/data/generators/` נשארו רק לשימוש סקריפטי ההזנה והלוגיקה המשותפת (`computeStockStatus`).

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
| `otifPercent` | number | אחוז אספקה בזמן ובכמות — נגזר בפועל מכלל הזמנות הרכש של הספק |
| `rating` | 'excellent'\|'good'\|'warning'\|'critical' | נגזר מדירוג ביצועים (OTIF + Lead Time) |
| `orderCount` | number | נגזר: מספר הזמנות הרכש הכולל של הספק |
| `orderValue` | number | נגזר: שווי כולל של הזמנות הרכש של הספק |
| `lateOrderCount` | number | נגזר: מספר הזמנות פעילות שבאיחור |

### 4.3 Purchase Order (הזמנת רכש) — `PurchaseOrder`

| שדה | טיפוס | תיאור |
|---|---|---|
| `poNumber` | string | מספר הזמנת רכש |
| `sku` | string | פריט מוזמן |
| `itemName` | string | שם הפריט המוזמן (מוצג ישירות בטבלאות, ללא צורך ב-lookup) |
| `supplierId` | string | ספק |
| `warehouse` | string | מחסן יעד |
| `orderedQty` | number | כמות שהוזמנה |
| `receivedQty` | number | כמות שהתקבלה בפועל (עשויה להיות חלקית) |
| `unitCost` | number | עלות יחידה בהזמנה |
| `orderValue` | number | נגזר |
| `orderDate` | string (ISO) | תאריך הזמנה |
| `plannedDeliveryDate` | string (ISO) | תאריך אספקה מתוכנן |
| `actualDeliveryDate` | string \| null | תאריך אספקה בפועל |
| `status` | enum | `OPEN` / `IN_TRANSIT` / `RECEIVED` / `LATE` / `CANCELLED` |
| `isLate` | boolean | נגזר: לא התקבל עד התאריך המתוכנן, או התקבל אחריו |
| `isFullQty` | boolean | נגזר: האם התקבלה הכמות המלאה (עבור OTIF) |

### 4.4 Time Series (למגמות)

שני מבני נתונים נגזרים, ל-12 החודשים האחרונים, לצורך גרפי מגמה:

- **`StockValuePoint`**: `{ date, label, totalStockValue, byWarehouse: Record<string, number> }` — שווי מלאי כולל וגם מפורק לפי מחסן, לכל חודש.
- **`OrdersTrendPoint`**: `{ date, label, opened, received }` — מספר הזמנות רכש שנפתחו מול שהתקבלו בפועל, לכל חודש.

### 4.5 Sale (עסקת מכירה) — `Sale`

| שדה | טיפוס | תיאור |
|---|---|---|
| `saleId` | string | מזהה עסקה (`SL-00001`) |
| `sku` / `itemName` | string | הפריט שנמכר (Link לטבלת Items) |
| `category` / `supplierId` | string | נגזר מהפריט המקושר |
| `customer` | string | שם לקוח |
| `warehouse` | string | מחסן ממנו נמכר |
| `saleDate` | string (ISO) | תאריך עסקה |
| `quantity` | number | יחידות שנמכרו |
| `unitPrice` | number | מחיר ליחידה (₪) |
| `revenue` | number | הכנסה (`quantity × unitPrice`, כפי שמאוחסן ב-Airtable) |
| `cost` | number | נגזר: `quantity × unitCost` של הפריט |

### נפח הדאטה המדומה
- כ-**250 SKUs**, 5 קטגוריות, 4 מחסנים, 12 ספקים.
- כ-**250 עסקאות מכירה** על פני 12 חודשים, כ-₪30.5 מיליון הכנסות (נתוני דמו).
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

### 5.1 KPI-ים של מכירות (מסך מכירות)

| KPI | נוסחה |
|---|---|
| **סה"כ הכנסות** | `Σ revenue` בפילטר הנוכחי |
| **הכנסות 30 ימים אחרונים** | `Σ revenue` ב-30 הימים האחרונים, עם Δ מול 30 הימים שקדמו להם |
| **יחידות שנמכרו** | `Σ quantity` |
| **מספר עסקאות** | `count(sales)` |
| **ערך עסקה ממוצע** | `Σ revenue / count(sales)` |
| **רווח גולמי %** | `(Σ revenue − Σ cost) / Σ revenue × 100` |

לכל KPI Card: ערך נוכחי, **Δ** לעומת התקופה הקודמת (חודש קודם), חץ מגמה (↑/↓) עם צבע פונקציונלי (חיובי/שלילי לפי המשמעות העסקית — למשל עלייה בהזמנות באיחור היא **שלילית** גם אם המספר "עלה"), אינדיקציית חריגה (Badge אדום/כתום) כשחוצה סף, ו-Tooltip עם הסבר הנוסחה.

---

## 6. מסכים

### 6.1 Executive Dashboard (מסך ראשי)
- שורת 10 KPI Cards (סעיף 5).
- גרף מגמת שווי מלאי (12 חודשים).
- גרף שווי מלאי לפי קטגוריה (Donut Chart).
- טבלת "דורש טיפול מיידי" — Top חריגות (מיזוג של: חוסרים קריטיים + הזמנות באיחור חמורות + ספקים בעייתיים) עם Drill-Down.

### 6.2 ניתוח מלאי (Inventory Analysis)
1. שווי מלאי לפי קטגוריה (Donut Chart)
2. שווי מלאי לפי מחסן (Donut Chart — אותו רכיב `CategoryDonutChart` עם `groupBy="warehouse"`, מוצג זה-לצד-זה עם הדונאט של הקטגוריה)
3. מגמת שווי מלאי לאורך זמן (Area Chart עם גרדיאנט, toggle לפי מחסן → Line מרובה)
4. Top 10 פריטים לפי שווי מלאי (טבלה ממוינת)
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

### 6.5 מכירות (Sales)
- שורת 6 KPI-ים (סעיף 5.1), כשסה"כ הכנסות הוא ה-Hero.
- גרף עמודות: הכנסות חודשיות ל-12 החודשים האחרונים (`SalesTrendChart`).
- Top 10 פריטים נמכרים (יחידות, הכנסות, רווח גולמי) ו-Top 10 לקוחות (עסקאות, יחידות, הכנסות).
- טבלת 40 העסקאות האחרונות.
- הפילטרים הגלובליים (מחסן, קטגוריה, ספק, חיפוש SKU, טווח תאריכים) חלים גם על המכירות (`filterSales`).

### 6.6 עוזר AI
צ'אט בעברית על הנתונים החיים, מוגן בסיסמה. פירוט בסעיף 15.

---

## 7. מנוע התראות (Alert Engine) — כללים

כל התראה מסווגת ל-`AlertType` אחד: `BELOW_REORDER` / `OUT_OF_STOCK` / `LATE_ORDER` / `EXCESS_STOCK` / `NO_MOVEMENT` / `HIGH_LEAD_TIME` / `SUPPLIER_OK`.

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

- **RTL מלא**, עברית כשפת ממשק ראשית (`dir="rtl"`, פונט Assistant/Heebo).
- שפה עיצובית של מוצר BI ארגוני **צפוף ומקצועי** (לא "אוורירי") — היררכיה ברורה דרך ניגודיות, צבע וגודל, לא דרך ריווח לבן. כותרת → KPI → ניתוח → פירוט, עם `SectionHeading` (פס צבע + כותרת uppercase קטנה) שמפריד קבוצות תוכן בתוך עמוד ארוך.
- **Sidebar כהה קבוע**: רקע גרדיאנט כהה (`bg-sidebar-gradient`, navy), לוגו עם badge גרדיאנט מותג, ניווט בין 6 המסכים (דשבורד ראשי, ניתוח מלאי, לוגיסטיקה ורכש, מכירות, התראות ניהוליות, עוזר AI) עם אינדיקציית מסך פעיל (פס צבע + הדגשת רקע), הופך ל-Drawer מתחת ל-`lg` breakpoint (1024px).
- **Hero KPI Card**: בכל מסך עם שורת KPIs, מדד אחד (הכי חשוב לאותו מסך — שווי מלאי כולל בדשבורד הראשי, OTIF בלוגיסטיקה) מודגש בכרטיס גדול (2 עמודות) עם גרדיאנט טורקיז (`bg-kpi-teal`), כדי ליצור נקודת מיקוד ויזואלית ברורה מעל שאר המדדים.
- **פלטת KPI צבעונית (עודכן)**: כרטיסי KPI **כולם** (לא רק ה-Hero) הם כרטיסי גרדיאנט צבעוניים עם טקסט לבן — לא כרטיסים לבנים/ניטרליים. פלטת רוטציה קבועה של 4 גוונים (`bg-kpi-teal` / `bg-kpi-orange` / `bg-kpi-purple` / `bg-kpi-blue`) עוברת בין הכרטיסים לפי סדר, לגיוון ויזואלי ותחושת "מוצר עשיר" (בהשראת דשבורדים עסקיים מודרניים כמו Airtable-connected dashboards). **חריגה נשארת פונקציונלית**: כרטיס KPI שחצה סף (`isBreached`) עוקף את הרוטציה ותמיד מקבל גרדיאנט אדום ייעודי (`bg-kpi-danger`), שאינו חלק מהרוטציה הרגילה — כך ש"אדום = בעיה" נשאר חד-משמעי בכל מקום במערכת. ה-Delta pill (↑/↓) נשאר בצבע פונקציונלי ירוק/אדום על רקע לבן שקוף, קריא בכל צבע כרטיס.
- **Donut Charts**: פילוח "שווי מלאי לפי קטגוריה/מחסן" מוצג כ-Donut Chart (לא Bar) עם תווית "סה\"כ" במרכז וחוק מקרא מתחתיו — משתמש באותה פלטת צבעים כמו כרטיסי ה-KPI. בדשבורד הראשי: donut אחד (קטגוריה). בניתוח מלאי: שני donuts זה-לצד-זה (קטגוריה + מחסן), בהשראת הפריסה הזוגית הנפוצה בדשבורדים פיננסיים. שאר הגרפים (מגמות, דירוגי ספקים, Pareto) נשארים Bar/Area — donut מתאים רק לפילוח חלק-מתוך-שלם עם מעט קטגוריות.
- פס פילטרים גלובלי עליון, נצמד (sticky), עם badge מספרי שמציג כמה פילטרים פעילים כרגע.
- **צבע = זהות ויזואלית + פונקציונליות משולבים**: כרטיסי KPI ו-Donut Charts משתמשים בפלטה צבעונית דקורטיבית (טורקיז/כתום/סגול/כחול) לגיוון, אך **אדום נשאר שמור בלעדית לאינדיקציית חריגה/בעיה** בכל מקום — כרטיס KPI חורג, Badge בטבלה, נקודת סטטוס, Alert. ירוק/כתום נשארים פונקציונליים בתוך התראות, Badges וטבלאות (תקין/אזהרה). ה-Sidebar נשאר כהה וניטרלי (navy) כרקע לניווט, ללא צבעי הפלטה.
- Responsive: Desktop (עיקרי, KPI grid עד 5 טורים), Tablet/Mobile (KPI-ים נשברים ל-2-3 טורים, Sidebar הופך ל-Drawer, טבלאות גוללות אופקית בתוך כרטיס).
- מיקרו-אינטראקציות: Hover states (הרמה קלה + הצללה), Empty states מעוצבים (לא "No Data" גולמי), נקודת "live" מהבהבת (pulse) לאינדיקציית עדכניות.
- כל KPI/גרף עם Tooltip הסברי (אייקון ⓘ, כולל גרסת `tone="light"` לרקעים כהים/גרדיאנט — משמש כעת בכל כרטיסי ה-KPI).
- גרפים: קו המגמה הראשי הוא Area Chart עם גרדיאנט מילוי (לא קו שטוח). פילוח קטגוריה/מחסן הוא Donut (ראו לעיל); שאר הגרפים (מגמות, השוואות, Pareto) נשארים Bar/Area לקריאות מדויקת.

---

## 10. דרישות טכניות

- **React 18 + TypeScript**, בנייה עם **Vite**.
- **Tailwind CSS** לעיצוב (עם קונפיגורציית RTL).
- **Recharts** לגרפים (Area/Line, Bar, Donut/Pie לפילוח קטגוריה-מחסן, Composed/Pareto) — ראו סעיף 9.
- **React Router** לניתוב בין מסכים — נבחר **`HashRouter`** (לא `BrowserRouter`) כדי לעבוד ללא צורך בקונפיגורציית שרת/404 fallback כלשהי תחת GitHub Pages.
- ניהול State: React Context + hooks (ללא Redux — לא נדרש בהיקף הזה).
- נתונים: נטענים בזמן ריצה מ-Airtable דרך שרת ה-Railway (`src/services/airtable.ts` → `src/data/airtableDataset.ts`), עם `DataContext` (טעינה / שגיאה / רענון). לוגיקת הגנרטורים הדטרמיניסטיים (`src/data/generators/`) נשארה לסקריפטי ההזנה ולחישובים משותפים.
- **Backend קטן ב-Railway** (`server/`, Node ללא תלויות): proxy לקריאה בלבד מ-Airtable + סוכן הצ'אט. הדשבורד עצמו נשאר אתר סטטי (סעיף 14).
- תמיכה ב-**GitHub Pages** — `vite.config.ts` עם `base: './'` (נתיבים יחסיים) + `HashRouter`. **בפועל פרוס**: ראו קישור בראש [README.md](./README.md), עם פריסה אוטומטית דרך `.github/workflows/deploy.yml` בכל push ל-`main`.
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
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml            # פריסה אוטומטית ל-GitHub Pages בכל push ל-main
├── server/                       # שרת Railway: proxy ל-Airtable + סוכן צ'אט
│   ├── index.mjs                 # HTTP, CORS, סיסמה, מגבלות קצב ועלות
│   ├── data.mjs                  # טעינת הטבלאות, פתרון Links, שדות נגזרים
│   ├── agent.mjs                 # לולאת Claude + כלי describe_data / query_rows / aggregate
│   └── package.json
├── scripts/                      # סקריפטי הזנת הנתונים ל-Airtable (חד-פעמיים)
├── .claude/
│   └── launch.json                # קונפיגורציית dev server לתצוגה מקדימה
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
    ├── services/
    │   ├── airtable.ts               # קריאת טבלאות מהשרת (API_URL)
    │   └── chat.ts                   # קריאה ל-/api/chat
    ├── context/
    │   ├── FilterContext.tsx
    │   └── DataContext.tsx           # טעינה / שגיאה / רענון נתונים
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
    │   │   ├── CategoryDonutChart.tsx # generic: groupBy="category"|"warehouse" (Donut, מחליף WarehouseBarChart/CategoryBarChart)
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
    │       ├── EmptyState.tsx
    │       ├── MultiSelect.tsx        # רכיב פילטר רב-בחירה גנרי
    │       ├── ChartCard.tsx          # עטיפה אחידה לכל גרף (כותרת/tooltip/action)
    │       └── SectionHeading.tsx     # כותרת קבוצת תוכן בתוך עמוד (פס צבע + טקסט uppercase)
    └── pages/
        ├── ExecutiveDashboard.tsx
        ├── InventoryAnalysis.tsx
        ├── Logistics.tsx
        ├── Sales.tsx
        ├── ManagementAlerts.tsx
        └── Assistant.tsx             # צ'אט AI
```

קבצים נוספים לתחום המכירות: `src/logic/salesAnalytics.ts` (מגמה, Top פריטים/לקוחות, 30 מול 30), `src/components/charts/SalesTrendChart.tsx`, ו-`filterSales` ב-`src/logic/filters.ts`.

**עקרון הפרדה**: `data` (מקור נתונים) → `logic` (חישובים טהורים, ניתנים לבדיקה, ללא JSX) → `hooks`/`context` (חיבור לוגיקה ל-React) → `components`/`pages` (תצוגה בלבד).

**הערת מימוש**: `WarehouseBarChart` ו-`TopItemsTable` שתוכננו כקבצים נפרדים מומשו בסופו של דבר כפרמטרים גנריים בתוך `CategoryDonutChart` ו-`ItemsTable` בהתאמה, כדי למנוע קוד כפול (ראו [Practice.md](./Practice.md) סעיף "Reuse over duplication"). `CategoryBarChart` (הגרסה המקורית, מבוססת Bar) הוחלפה ב-`CategoryDonutChart` בסבב עיצוב הדונאטים ונמחקה מהקוד — ראו סעיף 9.

---

## 12. שלבי הפיתוח

1. ✅ **SPEC.md** — מסמך זה.
2. ✅ Scaffold פרויקט (Vite + React + TS + Tailwind + Router), הגדרות RTL.
3. ✅ שכבת Types + Mock Data Generator (items, suppliers, purchase orders, time series).
4. ✅ שכבת Logic (KPI calculations, ABC analysis, Alert engine, filters, formatters).
5. ✅ Layout: Sidebar, Top Filter Bar, PageLayout, רכיבי Common.
6. ✅ Executive Dashboard: KPI Cards + גרפים ראשיים + טבלת "דורש טיפול".
7. ✅ Inventory Analysis: כל 8 תתי-האזורים כולל ABC.
8. ✅ Logistics & Procurement: KPI, גרפים, טבלת ספקים, טבלת הזמנות.
9. ✅ Management Alerts: מנוע ההתראות + תצוגה.
10. ✅ חיבור מלא של Global Filters + Drill-Down בין מסכים.
11. ✅ ליטוש Responsive + נגישות + Tooltips.
12. ✅ `Practice.md` + `README.md`.
13. ✅ הכנה ל-Git/GitHub + הגדרות פריסה ל-GitHub Pages.
14. ✅ **סבב עיצוב מחדש** — מראה BI ארגוני צפוף ויוקרתי: Sidebar כהה, Hero KPI Cards, SectionHeading, גרפי Area עם גרדיאנט (ראו סעיף 9 המעודכן).
15. ✅ **פריסה בפועל** — Repository ציבורי ב-GitHub, פרוס אוטומטית ל-GitHub Pages דרך GitHub Actions בכל push ל-`main` (קישורים ב-README.md).
16. ✅ **סבב פלטת KPI צבעונית + Donut Charts** — כרטיסי KPI עברו לפלטת גרדיאנט מסתובבת (טורקיז/כתום/סגול/כחול, אדום שמור לחריגה בלבד), פילוח קטגוריה/מחסן עבר מ-Bar ל-Donut Chart (`CategoryDonutChart`), בהשראת דשבורד עסקי-צבעוני שהוצג כרפרנס. ראו סעיף 9 המעודכן.
17. ✅ **חיבור ל-Airtable** — הנתונים הועברו לבסיס Airtable עם קישורים בין הטבלאות; הדשבורד טוען אותם בזמן ריצה ומחשב מחדש שדות נגזרים; כפתור רענון נתונים.
18. ✅ **מסך מכירות** — טבלת `Sales` ב-Airtable (250 עסקאות דמו), 6 KPI-ים, מגמה חודשית, Top פריטים ולקוחות.
19. ✅ **שרת Railway** — ה-Token של Airtable הועבר לצד השרת; הדשבורד קורא דרך proxy לקריאה בלבד (סעיף 14).
20. ✅ **עוזר AI** — צ'אט בעברית מעל הנתונים החיים, עם סיסמה ומגבלות (סעיף 15).

---

## 13. הגדרת "הצלחה"

המשתמש נכנס למסך הראשי ותוך כמה שניות יודע: מה מצב המלאי הכולל, איפה יש בעיות, מה דורש טיפול, כמה כסף כלוא במלאי, ואילו ספקים/הזמנות בעייתיים — בלי לקרוא טקסט הסבר, רק דרך מבנה ויזואלי וצבע נכון.

---

## 14. ארכיטקטורה ואבטחה

```
דפדפן (GitHub Pages, אתר סטטי)
   │  GET /api/<Table>          POST /api/chat  (+ X-App-Password)
   ▼
שרת Railway  (server/, Node)  ──►  Airtable API   (Token קריאה בלבד, רק בשרת)
   │                          └─►  Anthropic API  (מפתח רק בשרת)
```

| רכיב | תפקיד | איפה רץ |
|---|---|---|
| **דשבורד** | React/Vite, מחשב KPI-ים והתראות בדפדפן | GitHub Pages (פריסה אוטומטית בכל push ל-`main`) |
| **שרת** | proxy לקריאה בלבד (`GET /api/<Table>`) + סוכן הצ'אט (`POST /api/chat`) + `/health` | Railway, פרויקט `invensight-proxy`, שירות `proxy` |
| **נתונים** | 4 טבלאות עם Links | Airtable |

**החלטות ונימוקים**
- **ה-Token של Airtable רק בשרת.** משתני `VITE_*` נאפים לתוך קוד ה-JS הציבורי; לכן הדשבורד לא מחזיק מפתחות ופונה רק לשרת. הכתובת (`VITE_API_URL`, ברירת מחדל: שרת ה-Railway) אינה סוד.
- **Token בהרשאת `data.records:read` בלבד**, מוגבל לבסיס אחד. לשרת רשימת טבלאות מותרות; כל בקשה אחרת נדחית (404). כתיבה לא נתמכת.
- **CORS** מצומצם ל-`ALLOWED_ORIGINS` (ברירת מחדל: אתר ה-Pages ו-localhost).
- **שדות נגזרים מחושבים בצד הלקוח** כדי שהדשבורד יציג תמיד את מצב הנתונים העדכני ב-Airtable (סעיף 4).
- **רענון:** הנתונים נטענים בכל כניסה, ויש כפתור רענון ידני; אין עדכון בזמן אמת (push).

**משתני סביבה בשרת (Railway → Variables)**

| משתנה | תפקיד |
|---|---|
| `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` | גישה ל-Airtable |
| `ANTHROPIC_API_KEY` | מפעיל את הצ'אט (בלעדיו `/api/chat` מחזיר 503) |
| `APP_PASSWORD` | סיסמה משותפת לצ'אט |
| `MODEL` | מודל הצ'אט (ברירת מחדל `claude-sonnet-5-5`) |
| `DAILY_CAP_USD`, `CHAT_PER_HOUR` | תקרת עלות יומית משוערת (3$) והודעות בשעה לכל IP (30) |
| `ALLOWED_ORIGINS` | מקורות CORS מותרים |

סודות נשמרים אך ורק ב-Variables של Railway וב-`.env` מקומי (ב-`.gitignore`); `.env.example` מתעד את השמות. אין להדביק מפתחות בקוד, ב-issues או בצ'אט.

---

## 15. עוזר AI (צ'אט)

**מטרה:** לענות בעברית על שאלות על מלאי, ספקים, הזמנות רכש ומכירות — עם מספרים שזהים לדשבורד — בלי שהמשתמש יצטרך לנווט במסכים. דוגמאות: "כמה פריטים מתחת לנקודת ההזמנה?", "הכנסות לפי חודש", "שלושת הספקים עם ערך ההזמנות הגבוה ביותר".

**איך זה עובד:** `POST /api/chat` עם `{ message, history }`. השרת מריץ לולאת סוכן מול Claude (עד 6 סבבים) עם שלושה כלים לקריאה בלבד:

| כלי | מה הוא עושה |
|---|---|
| `describe_data` | מחזיר טבלאות, מספר שורות, שמות שדות ושורה לדוגמה |
| `query_rows` | שורות מטבלה עם פילטרים (`eq/ne/gt/gte/lt/lte/contains/in`), מיון ובחירת שדות (עד 50) |
| `aggregate` | `count/sum/avg/min/max`, עם קיבוץ לפי שדה או לפי חודש |
| `show_chart` | מציג למשתמש גרף צבעוני (`bar` / `line` / `pie`). מקבל את אותה שאילתה כמו `aggregate`; **השרת מריץ אותה ובונה את הגרף**, כך שהמספרים בגרף תמיד מהנתונים ולא מטקסט שהמודל כתב |
| `show_table` | מציג למשתמש טבלה צבעונית (עד 50 שורות). מקבל את אותה שאילתה כמו `query_rows`, וגם כאן השרת מריץ אותה |

| `show_grouped_table` | טבלה צבעונית עם שורה לכל קבוצה (לקוח / פריט / קטגוריה / חודש) **וכמה מדדים יחד**, למשל לקוח ← אחוז רווחיות, הכנסות, מספר מכירות. השרת מחשב ומציג |

**אחוזים ויחסים:** המדד `ratio_pct` מחשב `100 × Σ(field) / Σ(denominator_field)`, למשל אחוז רווח גולמי לפי לקוח = `Σ Gross Profit / Σ Revenue`. הוא זמין ב-`aggregate`, ב-`show_chart` וב-`show_grouped_table`.

**תצוגה חזותית:** תשובת `/api/chat` כוללת `blocks` (עד 3 לתשובה) לצד הטקסט. הדפדפן מצייר אותם ב-`src/components/chat/ChatBlocks.tsx` באותה פלטת צבעים של כרטיסי ה-KPI: קו למגמות בזמן, עמודות צבעוניות לדירוגים, עוגה לחלקים מתוך שלם (עד 6 פרוסות), וטבלה עם כותרת גרדיאנט, שורות לסירוגין, כותרות עמודה בעברית, ערכי כסף בפורמט ₪ ותגיות צבע לסטטוסים (אזל / מתחת לנקודת הזמנה / עודף / תקין, דירוג ספק, סטטוס הזמנה). **מספרים בגרפים:** בכל גרף מוצגים הערכים עצמם (מעל כל עמודה / נקודה), ובעוגה אחוז בכל פרוסה ובמקרא ליד הערך. סכומי כסף גדולים (מעל ₪10,000) מוצגים **באלפי ₪**, עם הערה "באלפי ₪" ליד הכותרת; סכומים קטנים נשארים ב-₪. שדות באחוזים (למשל `OTIF %`) מוצגים עם סימן %. המודל מנחה להציג חזותית דירוגים, מגמות, פילוחים ורשימות, ולכתוב טקסט קצר עם התובנה בלבד.

**עקרונות**
- **ללא SQL וללא כתיבה:** המודל יכול רק לסנן, למיין ולצבור את 4 הטבלאות.
- **אותם מספרים כמו הדשבורד:** `Stock Status` ו-`Stock Value` מחושבים בשרת בדיוק לפי הכללים בסעיף 4/5; Links מפוענחים לשמות ספקים ולמק"טים.
- **אין המצאת מספרים:** כל נתון חייב לבוא מתוצאת כלי; אם הנתונים לא עונים — אומרים זאת. תוכן רשומות נחשב נתונים, לא הוראות (הגנה מפני prompt injection).
- **גם נתוני מכירות והזמנות רכש הם דמו**, והעוזר מציין זאת.

**הגנות:** סיסמה משותפת (`X-App-Password`, השוואה ב-`timingSafeEqual`; סיסמה שגויה → 401), 30 הודעות בשעה לכל כתובת IP (429), תקרת עלות יומית משוערת (429), הודעה עד 2,000 תווים, היסטוריה עד 20 הודעות, גוף בקשה עד 64KB, וקיצוץ תוצאות כלי ל-12,000 תווים. הסיסמה נשמרת ב-`sessionStorage` בלבד ונמחקת בסגירת הלשונית.

**מגבלות ידועות:** מונה העלות והמגבלות נשמרים בזיכרון השרת ואופסים בפריסה מחדש; התשובות אינן זורמות (streaming); אין שמירת היסטוריית שיחות בשרת; סיסמה משותפת אחת במקום משתמשים. שדרוג אפשרי: Postgres להיסטוריה ולמונה עלות, streaming, ותשובות עם טבלאות/גרפים.
