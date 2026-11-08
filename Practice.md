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
- **Reuse over duplication** — לפני שיוצרים component/טבלה/גרף חדש, בדקו אם `ItemsTable`, `DataTable`, `ChartCard`, `CategoryDonutChart` (עם `groupBy` שונה) כבר עונים על הצורך. דוגמה: אין `WarehouseBarChart`/`WarehouseDonutChart` נפרד — זה אותו `CategoryDonutChart` עם `groupBy="warehouse"`.
- **נתוני דמה דטרמיניסטיים (לסקריפטי ההזנה)** — הנתונים חיים ב-Airtable (סעיף 4), אבל כל יצירה אקראית של נתוני דמה חדשים (למשל `scripts/build-sales-batches.ts`) עוברת דרך ה-PRNG הממורכז ב-`src/data/seed.ts` (`rng`, `randInt`, `randFloat`, `pick`, `weightedPick`, `chance`) או PRNG עם seed קבוע. **לעולם אל תשתמשו ב-`Math.random()` ישירות** — זה שובר את היכולת לשחזר את הנתונים.
- **סודות — כלל ברזל:** לעולם לא מכניסים Token/מפתח למשתנה `VITE_*` ולא לקוד הדשבורד: Vite נאפה אותם לתוך ה-JS הציבורי. מפתחות (Airtable, Anthropic, סיסמת הצ'אט) חיים רק ב-Variables של Railway וב-`.env` מקומי (ב-`.gitignore`). לא מדביקים אותם בצ'אט, ב-issues או ב-commit. אם מפתח נחשף — מבטלים ומחליפים, לא רק מוחקים מהקוד. כשמדפיסים משתני סביבה בטרמינל, מסתירים את הערכים לגמרי, לא חלקית.
- **Backend (`server/`):** Node ללא תלויות חדשות, קריאה בלבד מ-Airtable, רשימת טבלאות מותרת, CORS מצומצם. כל כלי חדש לסוכן הצ'אט חייב להיות קריאה-בלבד, עם שמות שדות מאומתים ותוצאה מקוצצת. אל תוסיפו SQL חופשי או כתיבה.

## 2. כללי UI/UX

- **RTL תמיד** — `index.html` עם `dir="rtl"`. כל טקסט חדש בעברית. אייקונים/חצים חייבים להתאים לכיוון RTL (בדקו חזותית לפני commit).
- **צבע = משמעות + זהות ויזואלית (עודכן)**. שני שכבות צבע נפרדות בפרויקט, אל תערבבו ביניהן:
  1. **צבעי סטטוס פונקציונליים** (Badges, Alerts, DataTable, נקודות סטטוס): ירוק (`status-good`)=תקין, כתום (`status-warn`)=אזהרה, אדום (`status-bad`)=חריגה/קריטי, כחול/אפור=ניטרלי/מידע. **כאן אסור לסטות** — זו השפה שמאפשרת למשתמש לזהות בעיה תוך שנייה.
  2. **פלטת KPI/Donut דקורטיבית** (`kpi.teal`/`kpi.orange`/`kpi.purple`/`kpi.blue`, ב-`tailwind.config.js`): משמשת לגיוון ויזואלי בכרטיסי `KpiCard` וב-`CategoryDonutChart` בלבד, מסתובבת לפי סדר קבוע. **`kpi.danger` (אדום) שמור בלעדית לחריגה** (`kpi.isBreached`) ואסור שיהיה חלק מהרוטציה הרגילה — כלומר גם בשכבה הדקורטיבית, אדום נשאר "משמעות" ולא "קישוט".
- **כל KPI/גרף עם Tooltip הסברי** — השתמשו ברכיב `Tooltip` (`src/components/common/Tooltip.tsx`, עם `tone="light"` על רקעים כהים/גרדיאנט) או ב-`tooltip` prop של `ChartCard`. אל תשאירו מדד בלי הסבר.
- **Empty States מעוצבים** — כל טבלה/רשימה שיכולה להיות ריקה (בעקבות פילטרים) חייבת EmptyState עם כותרת + תת-כותרת, לא "No Data" גולמי. `DataTable` כבר עושה את זה אוטומטית דרך `emptyTitle`/`emptySubtitle`.
- **Responsive** — בדקו כל מסך חדש ב-3 רוחבים: מובייל (~375px), טאבלט (~768px), דסקטופ (1440px+). ה-Sidebar הופך ל-Drawer מתחת ל-`lg` (ב-Tailwind: `lg:` breakpoint = 1024px).

### 2.1 מערכת העיצוב (Design System) — עודכן בסבב "גימור UI"

- **Sidebar כהה** — `Sidebar.tsx` משתמש ב-`bg-sidebar-gradient` (מוגדר ב-`tailwind.config.js theme.extend.backgroundImage`), לא בצבע שטוח. זו נקודת עוגן ה-"יוקרה" של העיצוב — אל תחזירו אותו ללבן.
- **כרטיסי KPI צבעוניים (עודכן)** — כל כרטיס `KpiCard` הוא גרדיאנט צבעוני עם טקסט לבן (לא כרטיס לבן עוד). `KpiGrid` מעביר `colorIndex` מסתובב (0-3) לכל כרטיס שאינו hero/breached, וה-`KpiCard` בוחר גרדיאנט: `kpi.isBreached` → `bg-kpi-danger` (תמיד, עוקף הכל) → אחרת `featured` → `bg-kpi-teal` → אחרת `PALETTE_CLASSES[colorIndex % 4]`. **אל תוסיפו צבע נוסף לרוטציה בלי לעדכן גם את `tailwind.config.js` וגם את `SPEC.md` סעיף 9.**
- **Hero KPI Card** — לכל מסך עם `KpiGrid` יש KPI "ראשי" אחד שמודגש: `<KpiGrid featuredId="totalStockValue" />` (בדשבורד) / `featuredId="otif"` (בלוגיסטיקה). ה-KPI המודגש מקבל `featured` ב-`KpiCard.tsx`, גרדיאנט טורקיז קבוע (`bg-kpi-teal`), וגודל `sm:col-span-2`. **בחרו כל פעם רק KPI אחד** להדגשה — ריבוי כרטיסי hero מבטל את האפקט ההיררכי.
- **CategoryDonutChart** (`src/components/charts/CategoryDonutChart.tsx`) — הרכיב הגנרי לפילוח חלק-מתוך-שלם (קטגוריה/מחסן), מחליף את `CategoryBarChart` הישן (נמחק). Donut עם innerRadius, תווית "סה\"כ" במרכז, ומקרא מתחתיו. שימוש: `groupBy="category"|"warehouse"` + `onSliceClick`. **אל תשתמשו ב-Donut לגרפים עם יותר מ-6-7 פרוסות** (לא קריא) — לזה יש עדיין Bar/Area בשאר הרכיבים.
- **SectionHeading** (`src/components/common/SectionHeading.tsx`) — משמש לחלק עמוד ארוך לקבוצות ויזואליות ברורות (לדוגמה: "מגמות ושווי מלאי", "תובנות ניהוליות", "חריגות מלאי"). השתמשו בו לפני כל קבוצת charts/cards חדשה בעמוד, לא רק בתוך `ChartCard`.
- **צפיפות** — הפרויקט עבר סבב מכוון של "פחות שטחים לבנים": `ChartCard` הוא `p-4 sm:p-5` (לא יותר), `PageLayout`'s main הוא `py-4 lg:py-5`, שורות טבלה `py-2.5`. אם מוסיפים UI חדש — התאימו לצפיפות הזו, אל תחזרו לריווח הגדול המקורי.
- **גרפים** — קו המגמה הראשי (`TrendLineChart`) הוא Area Chart עם גרדיאנט מילוי (`<defs><linearGradient>`), לא Line רגיל. שמרו על גובה אחיד סביב 300-310px לכל הגרפים באותו עמוד לעקביות ויזואלית.

## 3. מבנה הקוד — לפני שמוסיפים קובץ חדש

1. **KPI חדש?** → הוסיפו ל-`src/logic/kpiCalculations.ts` בתוך `computeKpis`, ותעדו נוסחה ב-SPEC.md סעיף 5.
2. **גרף חדש?** → `src/components/charts/`, עם `ChartCard` כעטיפה אחידה (title/subtitle/tooltip).
3. **טבלה חדשה על InventoryItem?** → השתמשו ב-`ItemsTable` + `extraColumns`, אל תיצרו טבלה חדשה מאפס.
4. **כלל התראה חדש?** → `src/logic/alertEngine.ts`, הוסיפו `AlertType` חדש ב-`src/types/index.ts` אם צריך, ותעדו ב-SPEC.md סעיף 7.
5. **פילטר גלובלי חדש?** → הוסיפו שדה ל-`GlobalFilters` ב-`types/index.ts`, טפלו בו ב-`filterItems`/`filterPurchaseOrders`/`filterSales` (`src/logic/filters.ts`), והוסיפו UI ב-`TopFilterBar.tsx`.
6. **מסך חדש?** → קובץ ב-`src/pages/`, route ב-`src/App.tsx`, פריט ב-`NAV_ITEMS` ב-`Sidebar.tsx`, ופרק ב-SPEC.md סעיף 6. דוגמה: `Sales.tsx` (+ `src/logic/salesAnalytics.ts`).
7. **טבלה/שדה חדש ב-Airtable?** → הוסיפו את הטיפוס ב-`types/index.ts` ואת המיפוי ב-`src/data/airtableDataset.ts`; אם הצ'אט צריך אותו, גם ב-`server/data.mjs`. תעדו ב-SPEC.md סעיף 4.
8. **שאלה/יכולת חדשה לעוזר ה-AI?** → קודם נסו לעבוד עם `describe_data` / `query_rows` / `aggregate` ב-`server/agent.mjs`; הוסיפו שדה נגזר ב-`server/data.mjs` אם צריך. שדה נגזר חייב להיות מחושב באותה נוסחה כמו בדשבורד.

## 4. כללי שמירת נתונים

- **מקור האמת הוא Airtable.** הדשבורד טוען את 4 הטבלאות דרך השרת (`src/services/airtable.ts`), `fetchAirtableDataset()` ב-`src/data/airtableDataset.ts` בונה מהן את ה-dataset, ו-`DataContext` מספק אותו (`useDataset`, `useDataStatus` עם טעינה/שגיאה/רענון). **אל תקראו ל-`fetchAllRecords` מתוך קומפוננטות** — כל גישה לנתונים עוברת דרך `DataContext`.
- **שדות נגזרים לא נקראים מ-Airtable** (`stockValue`, `stockStatus`, `abcClass`, סיכומי ספק) — הם מחושבים מחדש מהשדות הגולמיים ב-`airtableDataset.ts`. אחרת עריכה ידנית בטבלה לא תתבטא במדדים. אם משנים נוסחה, צריך לעדכן גם את `server/data.mjs` כדי שהצ'אט ימשיך להתאים לדשבורד.
- דאטה מחושבת (KPIs, alerts, ABC) **לא נשמרת** — היא נגזרת ב-`useMemo` מה-dataset + הפילטרים הגלובליים. זה מכוון: אין "מקור אמת כפול".
- הגנרטורים ב-`src/data/generators/` ו-`mockData.ts` אינם בשימוש בזמן ריצה (נשארו לסקריפטי הזנה ולפונקציות משותפות כמו `computeStockStatus`). חיבור מקור אחר (ERP): מחליפים את שכבת הטעינה ושומרים על אותם טיפוסים ב-`src/types/index.ts`.
- **אל תייבאו שוב נתונים ל-Airtable** בלי בקשה מפורשת — זה מוחק עריכות ידניות ועלול ליצור כפילויות.

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
1. **בדקו בכל 6 המסכים** (דשבורד, מלאי, לוגיסטיקה, מכירות, התראות, עוזר AI) שהשינוי לא שבר תצוגה קיימת (במיוחד אם שיניתם `types/index.ts` או `logic/`).
2. **שנו כמה פילטרים גלובליים** ווודאו שהמסך מגיב נכון בכל המסכים (לא רק בזה ששיניתם).
3. **בדקו Empty State** — סננו לקומבינציה שלא מחזירה תוצאות ווודאו שהתצוגה נשארת מקצועית.
4. **בדקו Responsive** — לפחות ברוחב מובייל אחד.
5. אם שיניתם נוסחת KPI — עדכנו גם את ה-Tooltip הטקסטואלי שלו וגם את SPEC.md סעיף 5.

### פריסה ובדיקת השרת

- **האתר:** כל push ל-`main` מפעיל את `.github/workflows/deploy.yml` ופורס ל-GitHub Pages. הדשבורד אינו מכיל סודות, ולכן ה-workflow לא צריך אותם.
- **השרת:** `cd server && railway up` (הפרויקט `invensight-proxy`, השירות `proxy`). משתני הסביבה נשמרים ב-Railway בין פריסות. בדיקה: `GET /health` חייב להחזיר `{"ok":true,"chat":true}`; `GET /api/Sales` מחזיר 250 רשומות; `POST /api/chat` עם סיסמה שגויה מחזיר 401.
- **שינוי בשרת לא מתפרסם עם ה-push לאתר** — צריך להריץ `railway up` בנפרד.
- אחרי שינוי בנתונים או בנוסחאות, וודאו שהצ'אט והדשבורד מחזירים אותו מספר (למשל מספר הפריטים מתחת לנקודת הזמנה).

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
