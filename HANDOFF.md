# HANDOFF.md — מסירת הפרויקט (InvenSight)

מסמך קצר למי שמקבל את הפרויקט (מורה / מפתח חדש): מה יש, איפה זה רץ, איך מריצים ואיך בודקים. פירוט מלא: [SPEC.md](./SPEC.md), [README.md](./README.md), [Practice.md](./Practice.md).

## 1. קישורים

| מה | איפה |
|---|---|
| קוד (GitHub, ציבורי) | https://github.com/revitalbm01-glitch/invensight-dashboard |
| האתר החי (GitHub Pages) | https://revitalbm01-glitch.github.io/invensight-dashboard/ |
| עוזר ה-AI | https://revitalbm01-glitch.github.io/invensight-dashboard/#/assistant |
| שרת (Railway) – בדיקת חיים | https://proxy-production-4c5f.up.railway.app/health |
| פרויקט Railway | `invensight-proxy`, שירות `proxy` (גישה בהזמנה בלבד) |

## 2. מה המערכת עושה

דשבורד BI בעברית (RTL) לניהול מלאי, רכש, ספקים ומכירות, עם עוזר AI שעונה על שאלות מהנתונים ומציג גרפים וטבלאות צבעוניים. הנתונים הם **נתוני דמה** ב-Airtable.

## 3. ארכיטקטורה

```
דפדפן (GitHub Pages, React/Vite)
   │  GET /api/<טבלה>     POST /api/chat
   ▼
שרת Railway (server/, Node ללא תלויות)  ──►  Airtable (Token קריאה בלבד, רק בשרת)
                                          └─►  Anthropic API (מפתח רק בשרת)
```

- **האתר** הוא סטטי ואינו מכיל סודות. כל push ל-`main` מפרסם אותו אוטומטית (`.github/workflows/deploy.yml`).
- **השרת** (`server/`) הוא proxy לקריאה בלבד לטבלאות Airtable, וגם סוכן הצ'אט (Claude עם כלי שאילתה לקריאה בלבד: `describe_data`, `query_rows`, `aggregate`, `show_chart`, `show_table`, `show_grouped_table`).
- **שינוי בשרת לא מתפרסם עם ה-push לאתר.** פורסים אותו בנפרד (סעיף 5).

## 4. הרצה מקומית

דרישה: Node.js 18 ומעלה.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # בדיקת TypeScript + build
```

בברירת מחדל האתר קורא נתונים משרת ה-Railway הקיים, ולכן הוא עובד מיד, בלי קובץ `.env` ובלי מפתחות.

להרצת השרת מקומית (אופציונלי), עם משתני סביבה משלך:

```bash
cd server
# נדרשים: AIRTABLE_API_KEY, AIRTABLE_BASE_ID  | לצ'אט: ANTHROPIC_API_KEY, APP_PASSWORD
node index.mjs     # http://localhost:3000
```

ואז בקובץ `.env` של הדשבורד: `VITE_API_URL=http://localhost:3000`.

## 5. פריסת השרת ב-Railway

```bash
npm i -g @railway/cli
railway login
cd server
railway link            # לבחור את הפרויקט invensight-proxy, סביבה production
railway up -s proxy     # פריסה
```

משתני הסביבה נשמרים ב-Railway (Variables), לא בקוד:

| משתנה | תפקיד |
|---|---|
| `AIRTABLE_API_KEY` | Token של Airtable, הרשאת `data.records:read` בלבד |
| `AIRTABLE_BASE_ID` | מזהה הבסיס |
| `ANTHROPIC_API_KEY` | מפעיל את הצ'אט |
| `APP_PASSWORD` | סיסמה משותפת לצ'אט (באנגלית; מועברת בנפרד, לא בריפו) |
| `DAILY_CAP_USD`, `CHAT_PER_HOUR`, `MODEL`, `ALLOWED_ORIGINS` | אופציונליים |

## 6. בדיקות מהירות

```bash
curl https://proxy-production-4c5f.up.railway.app/health           # {"ok":true,"chat":true}
curl -s https://proxy-production-4c5f.up.railway.app/api/Sales | head -c 200   # נתוני מכירות
curl -s -X POST -H "Content-Type: application/json" -H "X-App-Password: wrong" \
  -d '{"message":"hi"}' https://proxy-production-4c5f.up.railway.app/api/chat   # 401 — סיסמה שגויה
```

לבדיקת הצ'אט עצמו: להיכנס ל"עוזר AI" באתר ולהקליד את הסיסמה (מקבלים מרויטל), ואז לשאול למשל "הצג גרף של ההכנסות ממכירות לפי חודש" או "10 הלקוחות עם אחוז הרווחיות הנמוך ומה המכירות שלהם".

## 7. אבטחה — מה חשוב לדעת

- **אין סודות בריפו.** `.env` ב-`.gitignore`; מפתחות רק ב-Variables של Railway.
- **גישה ל-Railway חושפת את המשתנים** (Airtable, Anthropic, סיסמה). מזמינים לשם רק מי שצריך. אם מפתח נחשף: מבטלים ומחליפים, לא רק מוחקים מהקוד.
- לצ'אט: סיסמה משותפת, 30 הודעות בשעה לכל IP, ותקרת עלות יומית משוערת (3$). מונה העלות בזיכרון ומתאפס בפריסה מחדש.
- הצ'אט קורא בלבד: אין SQL חופשי ואין כתיבה ל-Airtable.

## 8. מבנה הקוד בקצרה

```
src/pages/        6 מסכים (דשבורד, מלאי, לוגיסטיקה, מכירות, התראות, עוזר AI)
src/logic/        חישובי KPI, ABC, התראות, מכירות (פונקציות טהורות)
src/data/         בניית ה-dataset מ-Airtable + חישוב שדות נגזרים
src/services/     פניות לשרת (נתונים + צ'אט)
src/components/   כולל chat/ChatBlocks.tsx (גרפים וטבלאות בצ'אט)
server/           index.mjs (HTTP, CORS, הגנות) · data.mjs · agent.mjs (סוכן + כלים)
scripts/          סקריפטי הזנת נתוני הדמה ל-Airtable (חד-פעמי; לא להריץ שוב בלי צורך)
```
