# InvenSight — מערכת BI לניהול מלאי ולוגיסטיקה

> 🔗 **דמו חי (GitHub Pages):** [revitalbm01-glitch.github.io/invensight-dashboard](https://revitalbm01-glitch.github.io/invensight-dashboard/)
>
> 📦 **מאגר הקוד (GitHub Repository):** [github.com/revitalbm01-glitch/invensight-dashboard](https://github.com/revitalbm01-glitch/invensight-dashboard)

## תיאור

InvenSight היא מערכת **BI (Business Intelligence)** לניהול מלאי ולוגיסטיקה, ברמה של דשבורד ניהולי אמיתי — לא תרגיל בסיסי. המערכת נותנת למנהלי כספים, תפעול, לוגיסטיקה והנהלה בכירה תמונת מצב מהירה וברורה על שווי המלאי, חריגות, ביצועי ספקים ומצב הזמנות הרכש, כדי לתמוך בקבלת החלטות.

האפיון המלא (Use Cases, מבנה נתונים, נוסחאות KPI, כללי התראות ועוד) נמצא ב-[SPEC.md](./SPEC.md). הנחיות עבודה על הקוד נמצאות ב-[Practice.md](./Practice.md).

## מטרת המערכת

לתת תמונת מצב אחת ומהימנה שעונה תוך שניות על 5 שאלות ניהוליות:

1. מה מצב המלאי?
2. איפה יש בעיות?
3. מה דורש טיפול?
4. איפה נמצא הכסף (שווי מלאי כלוא)?
5. אילו ספקים/הזמנות דורשים תשומת לב?

## Features

- **Executive Dashboard** — 10 KPI Cards עם Δ לעומת תקופה קודמת, אינדיקציית חריגה ו-Tooltip הסברי; גרף מגמת שווי מלאי; פילוח לפי קטגוריה; רשימת "דורש טיפול מיידי"; Top פריטים.
- **ניתוח מלאי** — שווי לפי קטגוריה/מחסן, מגמת שווי לאורך זמן, **ABC Analysis** (עקומת פארטו + סיווג A/B/C), Top 10 פריטים, מלאי עודף, פריטים בסיכון לחוסר, מלאי ללא תנועה, טבלת כל הפריטים.
- **לוגיסטיקה ורכש** — KPIs (הזמנות פתוחות/באיחור/OTIF/Lead Time), מגמת הזמנות, Lead Time ו-OTIF לפי ספק, טבלת ספקים מלאה, טבלת הזמנות רכש.
- **מכירות** — 6 KPI-ים (הכנסות, 30 ימים אחרונים עם Δ, יחידות, עסקאות, ערך עסקה ממוצע, רווח גולמי), מגמה חודשית, Top 10 פריטים ולקוחות, עסקאות אחרונות.
- **עוזר AI** — צ'אט בעברית שעונה על שאלות מהנתונים החיים ב-Airtable (כלי שאילתה לקריאה בלבד), מוגן בסיסמה.
- **התראות ניהוליות** — מנוע התראות דינמי המבוסס על הדאטה בפועל (לא טקסט סטטי): מלאי מתחת לנקודת הזמנה, מלאי אפס, הזמנה באיחור, מלאי עודף, מלאי ללא תנועה, ספק עם Lead Time גבוה, וגם התראות "ביצועים תקינים".
- **פילטרים גלובליים** — טווח תאריכים, מחסן, קטגוריה, ספק, SKU, סטטוס מלאי, קטגוריית ABC — משפיעים על כל המסכים בו-זמנית.
- **Drill-Down** — לחיצה על KPI, עמודת גרף או התראה מנווטת למסך המפורט עם הפילטר הרלוונטי כבר מוחל.
- **RTL מלא בעברית**, עיצוב Responsive, צבעים פונקציונליים בלבד (ירוק=תקין, כתום=אזהרה, אדום=חריגה, כחול=מידע).

## KPI עיקריים

| KPI | מה זה אומר |
|---|---|
| שווי מלאי כולל | סך ההון הכלוא במלאי |
| כמות פריטים במלאי | מס' SKUs פעילים |
| מתחת לנקודת הזמנה | פריטים שצריך להזמין בקרוב |
| מלאי אפס | סיכון מיידי לאספקה |
| מלאי עודף | הון כלוא מיותר |
| ימי מלאי ממוצעים (DOH) | לכמה זמן המלאי מספיק |
| מחזור מלאי (Turnover) | כמה פעמים בשנה המלאי "מתחלף" |
| הזמנות רכש פתוחות | היקף רכש פעיל |
| הזמנות באיחור | סיכון לוגיסטי פעיל |
| OTIF | אחוז אספקה בזמן ובכמות מלאה |

נוסחאות מדויקות לכל KPI נמצאות ב-[SPEC.md](./SPEC.md#5-kpi-ים-הגדרות-חישוב-מדויקות).

## טכנולוגיות

- **React 18** + **TypeScript** (strict mode)
- **Vite** — build tool
- **Tailwind CSS** — עיצוב, עם קונפיגורציית RTL וטוקני צבע פונקציונליים
- **Recharts** — גרפים (Line, Bar, Composed/Pareto)
- **React Router** (`HashRouter`, לתאימות מלאה עם GitHub Pages)
- **Airtable** — מסד הנתונים (4 טבלאות מקושרות)
- **Railway** — שרת Node קטן (`server/`): proxy לקריאה בלבד ל-Airtable וסוכן הצ'אט (Claude API)
- הדשבורד עצמו הוא אתר סטטי (GitHub Pages) ללא סודות

## מבנה הפרויקט

```
DESHBORD/
├── SPEC.md              — אפיון מקור (Single Source of Truth)
├── Practice.md            — הנחיות עבודה על הקוד
├── README.md              — קובץ זה
├── src/
│   ├── types/             — טיפוסי TypeScript לכל מודל הנתונים
│   ├── data/               — בניית ה-dataset מ-Airtable (airtableDataset.ts) + גנרטורים לסקריפטי הזנה
│   ├── services/            — airtable.ts / chat.ts (פניות לשרת)
│   ├── logic/               — חישובי KPI, ABC Analysis, מנוע התראות, מכירות, סינון (ללא JSX)
│   ├── context/              — FilterContext (פילטרים) + DataContext (טעינה/רענון)
│   ├── hooks/                 — useFilteredData / useKpis / useAlerts
│   ├── components/             — layout / kpi / charts / tables / alerts / common
│   └── pages/                   — 6 מסכי המערכת (כולל מכירות ועוזר AI)
├── server/                  — שרת Railway: proxy ל-Airtable + סוכן צ'אט
├── scripts/                  — סקריפטי הזנת הנתונים ל-Airtable
└── public/
```

פירוט מלא של עקרון ההפרדה (Data → Logic → Hooks → Components) נמצא ב-[Practice.md](./Practice.md).

## הוראות הפעלה

**דרישה מקדימה:** [Node.js](https://nodejs.org/) גרסה 18 ומעלה (כולל npm).

```bash
# 1. התקנת תלויות
npm install

# 2. הרצת שרת פיתוח (עם Hot Reload)
npm run dev
# האפליקציה תיפתח בכתובת http://localhost:5173

# 3. בדיקת build לפרודקשן
npm run build

# 4. תצוגה מקדימה של ה-build
npm run preview
```

### הרצה מקומית מול השרת
בברירת מחדל הדשבורד (גם ב-`npm run dev`) קורא נתונים משרת ה-Railway, ולכן אין צורך בקובץ `.env`. כדי להריץ מול שרת מקומי: `cd server`, הגדרת `AIRTABLE_API_KEY` ו-`AIRTABLE_BASE_ID` (ואופציונלית `ANTHROPIC_API_KEY` ו-`APP_PASSWORD` לצ'אט) ב-environment, `node index.mjs`, ואז `VITE_API_URL=http://localhost:3000` בקובץ `.env` של הדשבורד.

## הסבר על ה-Dataset

הנתונים נשמרים ב-**Airtable** (4 טבלאות מקושרות) ונטענים בזמן ריצה דרך השרת. הם **נתוני דמה ריאליסטיים**, ולא נתונים עסקיים אמיתיים:

- **Items** — כ-250 פריטי מלאי ב-5 קטגוריות וב-4 מחסנים.
- **Suppliers** — 12 ספקים.
- **Purchase Orders** — כ-400 הזמנות רכש על פני 12 חודשים, בסטטוסים שונים.
- **Sales** — כ-250 עסקאות מכירה (כ-₪30.5 מיליון הכנסות).

מדדים שנגזרים מהנתונים (שווי מלאי, סטטוס מלאי, ABC, OTIF, דירוג ספק) **מחושבים מחדש בדפדפן** מהשדות הגולמיים, כך ששינוי ידני ב-Airtable מתבטא מיד אחרי רענון (כפתור הרענון בראש המסך).

כדי לחבר מקור אחר (למשל ERP): מספיק להחליף את שכבת הטעינה (`src/services`, `src/data/airtableDataset.ts` ואת `server/`), ולהשאיר את הטיפוסים ב-`src/types/index.ts` ללא שינוי.

## פריסה

שני חלקים: **האתר** ב-GitHub Pages ו-**השרת** ב-Railway.

### השרת (Railway)
תיקיית `server/` רצה כשירות Node ללא תלויות (`npm start`). פריסה מהטרמינל, מתוך `server/`: `railway up`. המשתנים מוגדרים ב-Railway → Variables (לא בקוד): `AIRTABLE_API_KEY` (Token עם `data.records:read` בלבד), `AIRTABLE_BASE_ID`, `ANTHROPIC_API_KEY`, `APP_PASSWORD`, ואופציונלית `MODEL`, `DAILY_CAP_USD`, `CHAT_PER_HOUR`, `ALLOWED_ORIGINS`. בדיקה: `GET /health` מחזיר `{"ok":true,"chat":true}`. פירוט מלא וההחלטות האבטחתיות ב-[SPEC.md](./SPEC.md) סעיפים 14–15.

### האתר (GitHub Pages)

הפרויקט **פרוס בפועל וחי** בכתובת שבראש הקובץ, ומתעדכן **אוטומטית בכל push ל-`main`** דרך GitHub Actions (`.github/workflows/deploy.yml`): כל push מריץ `npm ci && npm run build` ומפרסם את `dist/` ל-GitHub Pages באמצעות `actions/deploy-pages`. אין צורך בפעולה ידנית כלשהי כדי לעדכן את הדמו החי.

### הגדרה חד-פעמית (רלוונטי רק אם עושים Fork/מעתיקים את הריפו)

אם משכפלים את הפרויקט לריפו חדש משלכם, יש להפעיל את Pages פעם אחת:

1. גשו להגדרות הריפו ב-GitHub → **Settings → Pages**.
2. תחת **Build and deployment → Source**, בחרו **GitHub Actions**.
3. בצעו `push` ל-`main` — ה-workflow הקיים כבר ידאג לכל השאר.

**חשוב:** `vite.config.ts` חייב להישאר עם `base: './'` (נתיבים יחסיים) — אחרת הנכסים (JS/CSS) לא ייטענו נכון תחת נתיב תת-הריפו של GitHub Pages.

לפריסה ידנית חד-פעמית (ללא GitHub Actions) קיים גם `npm run deploy`, המשתמש בחבילת `gh-pages` לפרסום `dist/` לענף `gh-pages` — אך זו **אינה** שיטת הפריסה הפעילה כרגע בפרויקט זה (הדמו החי פרוס דרך GitHub Actions כמתואר למעלה).

## רישיון

פרויקט הדגמה פנימי — נתוני הדמה אינם מייצגים נתונים עסקיים אמיתיים.
