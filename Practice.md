# Practice.md — הנחיות עבודה על הפרויקט

מסמך זה מיועד לכל מי שממשיך לפתח את InvenSight — כולל Claude בשיחות עתידיות. הוא משלים את [SPEC.md](./SPEC.md) (האפיון המקורי) ואת [README.md](./README.md) (הפעלה ופריסה).

**כלל־על: SPEC.md הוא מקור האמת.** כל שינוי פיצ'ר/מסך/KPI/חישוב שסותר את ה-SPEC — קודם מעדכנים את SPEC.md, ורק אז את הקוד.

---

## 1. כללי פיתוח

- **TypeScript strict** — הפרויקט רץ עם `strict: true`, `noUnusedLocals`, `noUnusedParameters`. אל תעקפו עם `any` אלא אם באמת נדרש (למשל התמודדות עם טיפוסי Recharts הרחבים מדי — זה כבר קיים בכמה מקומות בכוונה).
- **JSX Runtime אוטומטי** — `tsconfig.json` מוגדר עם `"jsx": "react-jsx"`. **אל תוסיפו `import React from 'react'`** בקבצים שלא משתמשים ב-`React.something` (כמו `React.ReactNode`, `React.FC`). אם הקובץ רק כותב JSX, אין צורך לייבא React כלל — רק hooks ספציפיים (`useState`, `useMemo` וכו').
- **הפרדת שכבות קשיחה**:
  - `src/data` — רק ייצור/אחסון דאטה. אסור JSX, אסור לוגיקת KPI.
  - `src/logic` — פונקציות טהורות (pure functions) בלבד: מקבלות דאטה, מחזירות דאטה מחושב. **אסור import של React / JSX / components כאן.** קל לבדוק ב-unit tests בעתיד.
  - `src/context` + `src/hooks` — הגשר בין logic ל-React (state, memoization).
  - `src/components` — תצוגה בלבד. רכיב לא "יודע" מאיפה הדאטה שלו מגיע — הוא מקבל props.
  - `src/pages` — מרכיבים components + hooks יחד למסך שלם.
- **Reuse over duplication** — לפני שיוצרים component/טבלה/גרף חדש, בדקו אם `ItemsTable`, `DataTable`, `ChartCard`, `CategoryBarChart` (עם `groupBy` שונה) כבר עונים על הצורך. דוגמה: אין `WarehouseBarChart` נפרד — זה אותו `CategoryBarChart` עם `groupBy="warehouse"`.
- **נתוני דמה דטרמיניסטיים** — כל היצירה האקראית עוברת דרך ה-PRNG הממורכז ב-`src/data/seed.ts` (`rng`, `randInt`, `randFloat`, `pick`, `weightedPick`, `chance`). **לעולם אל תשתמשו ב-`Math.random()` ישירות** — זה שובר את העקביות בין רינדורים/רילודים.

## 2. כללי UI/UX

- **RTL תמיד** — `index.html` עם `dir="rtl"`. כל טקסט חדש בעברית. אייקונים/חצים חייבים להתאים לכיוון RTL (בדקו חזותית לפני commit).
- **צבע = משמעות, לא קישוט**. שימוש בצבעים מוגבל ל:
  - ירוק (`status-good`) = תקין
  - כתום (`status-warn`) = אזהרה
  - אדום (`status-bad`) = חריגה/קריטי
  - כחול/אפור (`brand-*`, `slate-*`) = ניטרלי/מידע
  - אל תוסיפו צבעים נוספים ל"קישוט" גרפים — לכל היותר גוונים בתוך אותה משפחה (למשל PALETTE הכחול ב-`CategoryBarChart`).
- **כל KPI/גרף עם Tooltip הסברי** — השתמשו ברכיב `Tooltip` (`src/components/common/Tooltip.tsx`, עם `tone="light"` על רקעים כהים/גרדיאנט) או ב-`tooltip` prop של `ChartCard`. אל תשאירו מדד בלי הסבר.
- **Empty States מעוצבים** — כל טבלה/רשימה שיכולה להיות ריקה (בעקבות פילטרים) חייבת EmptyState עם כותרת + תת-כותרת, לא "No Data" גולמי. `DataTable` כבר עושה את זה אוטומטית דרך `emptyTitle`/`emptySubtitle`.
- **Responsive** — בדקו כל מסך חדש ב-3 רוחבים: מובייל (~375px), טאבלט (~768px), דסקטופ (1440px+). ה-Sidebar הופך ל-Drawer מתחת ל-`lg` (ב-Tailwind: `lg:` breakpoint = 1024px).

### 2.1 מערכת העיצוב (Design System) — עודכן בסבב "גימור UI"

- **Sidebar כהה** — `Sidebar.tsx` משתמש ב-`bg-sidebar-gradient` (מוגדר ב-`tailwind.config.js theme.extend.backgroundImage`), לא בצבע שטוח. זו נקודת עוגן ה-"יוקרה" של העיצוב — אל תחזירו אותו ללבן.
- **Hero KPI Card** — לכל מסך עם `KpiGrid` יש KPI "ראשי" אחד שמודגש: `<KpiGrid featuredId="totalStockValue" />` (בדשבורד) / `featuredId="otif"` (בלוגיסטיקה). ה-KPI המודגש מקבל `featured` ב-`KpiCard.tsx` ומרונדר עם `bg-brand-gradient`, טקסט לבן, וגודל `sm:col-span-2`. **בחרו כל פעם רק KPI אחד** להדגשה — ריבוי כרטיסי hero מבטל את האפקט ההיררכי.
- **SectionHeading** (`src/components/common/SectionHeading.tsx`) — משמש לחלק עמוד ארוך לקבוצות ויזואליות ברורות (לדוגמה: "מגמות ושווי מלאי", "תובנות ניהוליות", "חריגות מלאי"). השתמשו בו לפני כל קבוצת charts/cards חדשה בעמוד, לא רק בתוך `ChartCard`.
- **צפיפות** — הפרויקט עבר סבב מכוון של "פחות שטחים לבנים": `ChartCard` הוא `p-4 sm:p-5` (לא יותר), `PageLayout`'s main הוא `py-4 lg:py-5`, שורות טבלה `py-2.5`. אם מוסיפים UI חדש — התאימו לצפיפות הזו, אל תחזרו לריווח הגדול המקורי.
- **גרפים** — קו המגמה הראשי (`TrendLineChart`) הוא Area Chart עם גרדיאנט מילוי (`<defs><linearGradient>`), לא Line רגיל. שמרו על גובה אחיד סביב 300-310px לכל הגרפים באותו עמוד לעקביות ויזואלית.

## 3. מבנה הקוד — לפני שמוסיפים קובץ חדש

1. **KPI חדש?** → הוסיפו ל-`src/logic/kpiCalculations.ts` בתוך `computeKpis`, ותעדו נוסחה ב-SPEC.md סעיף 5.
2. **גרף חדש?** → `src/components/charts/`, עם `ChartCard` כעטיפה אחידה (title/subtitle/tooltip).
3. **טבלה חדשה על InventoryItem?** → השתמשו ב-`ItemsTable` + `extraColumns`, אל תיצרו טבלה חדשה מאפס.
4. **כלל התראה חדש?** → `src/logic/alertEngine.ts`, הוסיפו `AlertType` חדש ב-`src/types/index.ts` אם צריך, ותעדו ב-SPEC.md סעיף 7.
5. **פילטר גלובלי חדש?** → הוסיפו שדה ל-`GlobalFilters` ב-`types/index.ts`, טפלו בו ב-`filterItems`/`filterPurchaseOrders` (`src/logic/filters.ts`), והוסיפו UI ב-`TopFilterBar.tsx`.

## 4. כללי שמירת נתונים

- כל הדאטה נוצרת **פעם אחת** ב-`src/data/mockData.ts` (`export const mockDataset`), בזמן טעינת המודול. **אל תקראו ל-generators האלה שוב בתוך קומפוננטות** — זה ייצור דאטה שונה ולשבור עקביות בין מסכים.
- דאטה מחושבת (KPIs, alerts, ABC) **לא נשמרת** — היא נגזרת ב-`useMemo` מתוך `mockDataset` + הפילטרים הגלובליים בכל רינדור רלוונטי. זה מכוון: אין "מקור אמת כפול".
- כשמחברים ERP אמיתי בעתיד: מחליפים את `src/data/mockData.ts` בשכבת fetch/API, אבל שומרים על אותו `MockDataset`/`InventoryItem`/וכו' shape כדי שכל שאר השכבות (`logic`, `hooks`, `components`) יישארו ללא שינוי.

## 5. כללי Git

- **Commit קטן וממוקד** — commit אחד לכל שינוי לוגי (למשל: "הוספת KPI חדש", לא "שינויים שונים").
- **הודעות commit בעברית או אנגלית — עקביות** לאורך הפרויקט (בחרו אחת והישארו איתה).
- אין להריץ `git push --force`, `git reset --hard`, או למחוק branches בלי אישור מפורש מהמשתמש.
- `node_modules/` ו-`dist/` תמיד ב-`.gitignore` — לעולם לא ל-commit אותם.
- לפני כל commit: ודאו ש-`npm run build` עובר בהצלחה (ראו סעיף 6).

## 6. איך לבדוק שהמערכת עובדת אחרי שינוי

```bash
npm install       # פעם ראשונה / אחרי שינוי ב-package.json
npm run dev        # שרת פיתוח - בדקו ויזואלית בדפדפן
npm run build       # מוודא שאין שגיאות TypeScript ושה-build תקין
npm run preview      # מריץ את ה-build הסטטי לבדיקה סופית
```

בכל שינוי:
1. **בדקו ב-4 המסכים** שהשינוי לא שבר תצוגה קיימת (במיוחד אם שיניתם `types/index.ts` או `logic/`).
2. **שנו כמה פילטרים גלובליים** ווודאו שהמסך מגיב נכון בכל המסכים (לא רק בזה ששיניתם).
3. **בדקו Empty State** — סננו לקומבינציה שלא מחזירה תוצאות ווודאו שהתצוגה נשארת מקצועית.
4. **בדקו Responsive** — לפחות ברוחב מובייל אחד.
5. אם שיניתם נוסחת KPI — עדכנו גם את ה-Tooltip הטקסטואלי שלו וגם את SPEC.md סעיף 5.

### ⚠️ תקלה אמיתית שקרתה כאן — שווה לזכור

**אם שיניתם `tailwind.config.js` (בעיקר `theme.extend.colors`/`backgroundImage`/`boxShadow`) וה-class החדש "לא נדבק" בדפדפן** (הקלאס מופיע ב-`className` אבל `getComputedStyle` מראה `none`/ברירת מחדל) — **זו כמעט תמיד תקלת cache של שרת ה-dev, לא באג בקוד שלכם**. קרה בפועל: `bg-brand-gradient` ו-`bg-sidebar-gradient` הוגדרו נכון ב-config, נכתבו נכון ב-JSX, אבל שרת ה-`vite dev` שרץ ברצף ארוך (עם הרבה HMR) פשוט לא הריץ מחדש את שרשרת ה-PostCSS/Tailwind לאחר עריכת ה-config, כך שה-class יוצא ריק בפועל. ה-`npm run build` תמיד עבד נכון (build מלא = compile נקי) — רק ה-dev server התקוע הראה עיצוב שבור.

**איך מאבחנים:** בקונסול הדפדפן (או `javascript_tool`):
```js
getComputedStyle(document.querySelector('.your-element')).backgroundImage
```
אם זה `"none"` למרות שה-class קיים ב-`className` — עצרו את שרת ה-dev (`preview_stop`) והפעילו מחדש (`preview_start`). זה פותר את זה תוך שניות.

**לקח נוסף:** אל תסמכו רק על screenshot חזותי כדי "לאמת" שינוי עיצוב — אם משהו נראה מוזר/לא עקבי, אמתו גם דרך `getComputedStyle` או `document.styleSheets`, כי לפעמים גם ה-screenshot עצמו יכול להיראות "תקוע"/לא מעודכן זמנית.

## 7. אילו חלקים אסור לשנות בלי בדיקה מדוקדקת

- **`src/data/seed.ts`** — שינוי ב-PRNG (הפונקציה `createRng` או ה-seed `20240501`) משנה את **כל** הדאטה המדומה בבת אחת (כל השווי, הסטטוסים, ה-KPIs). אם משנים — צריך לעבור שוב על כל המסכים ולוודא שהתפלגויות עדיין הגיוניות (לא כל הפריטים "מלאי אפס" למשל).
- **`src/logic/kpiCalculations.ts`** — הנוסחאות כאן חייבות להתאים בדיוק ל-SPEC.md סעיף 5. שינוי נוסחה = שינוי במשמעות העסקית של הדשבורד כולו.
- **`src/logic/abcAnalysis.ts`** — הסף של 80%/95% הוא הגדרת ABC הסטנדרטית. אל תשנו בלי לתעד למה ב-SPEC.md.
- **`src/context/FilterContext.tsx`** — כל הדשבורד תלוי בזה. שינוי במבנה `GlobalFilters` דורש עדכון בכל `filterItems`/`filterPurchaseOrders`/`TopFilterBar`.
- **`vite.config.ts` (`base: './'`)** — קריטי לפריסה ב-GitHub Pages. אל תשנו ל-`/` אלא אם עוברים לפריסה בדומיין ראשי.
- **`tailwind.config.js`** — אחרי כל שינוי כאן, אם ה-dev server כבר רץ הרבה זמן, **הפעילו אותו מחדש** (ראו הערת האזהרה בסעיף 6) לפני שמסיקים שקלאס "לא עובד".

## 8. איך להוסיף פיצ'ר — תהליך מומלץ

1. בדקו אם זה כבר מוגדר ב-SPEC.md. אם לא — הוסיפו סעיף ל-SPEC.md קודם.
2. אם זה חישוב/כלל עסקי → תתחילו מ-`src/logic/` (פונקציה טהורה, קלה לבדיקה ידנית).
3. חברו hook אם צריך state/memoization (`src/hooks/`).
4. בנו/עדכנו component (`src/components/`) — reusable, ללא לוגיקה עסקית "קשה" בפנים.
5. שלבו בעמוד הרלוונטי (`src/pages/`).
6. בדקו לפי סעיף 6 לעיל.

## 9. הנחיות לעבודה עתידית עם Claude

- **תמיד תתחילו בקריאת SPEC.md** — אל תניחו הנחות על KPI/מסך/חישוב בלי לוודא מול המסמך.
- **אם המשתמש מבקש שינוי שסותר את ה-SPEC** — עדכנו את SPEC.md כחלק מאותה משימה, לא רק את הקוד.
- **אל תוסיפו ספריות חדשות** (state management, UI kit, CSS framework נוסף) בלי סיבה חזקה — הפרויקט מכוון להישאר קליל (React + Tailwind + Recharts + React Router, ותו לא).
- **שמרו על העברית/RTL** בכל טקסט UI חדש — אל תכתבו ממשק חדש באנגלית "כברירת מחדל" ותתרגמו אחר כך.
- **בדקו ידנית תוצאה חזותית** לפני שמדווחים על סיום משימה — אם יש גישה לדפדפן/preview, פתחו את האפליקציה בפועל.
- **היצמדו לעקרון ההפרדה** (סעיף 1) — הפיתוי הכי גדול הוא "לזרוק" חישוב ישר בתוך component; זה תמיד צריך לעבור דרך `src/logic/`.
