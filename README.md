# Space Industry Hub

מרכז בקרה אישי לתעשיית החלל, בסגנון SpaceX: נתוני שיגורים חיים, פרופילי חברות עם ציר פיתוחים, דיאגרמות חתך אינטראקטיביות לכל כלי שיגור, וספריית מקורות מבוססת Everyday Astronaut. עברית, RTL, Dark.

## הרצה מקומית

```bash
npm install
npm run dev
```

האתר עולה על http://localhost:5199

## מבנה

- **React 18 + Vite + react-router.** בלי בקאנד: הדפדפן פונה ישירות ל-APIs חיצוניים.
- **נתונים חיים:**
  - [Launch Library 2](https://ll.thespacedevs.com/) (The Space Devs): לוח שיגורים עולמי. ~15 בקשות לשעה למשתמש אנונימי, לכן מטמון localStorage של 30 דקות (`src/api.js`).
  - [Spaceflight News API](https://api.spaceflightnewsapi.net/): חדשות, כולל חיפוש פר חברה.
- **תוכן (חברות, כלים, מקורות):** קבצי JSON ב-`src/data/research/`, תוצרת צוות סוכני מחקר + אימות עובדתי. נטענים בזמן build דרך `src/data/index.js` (עם seeds גיבוי).
- **דיאגרמות חתך:** `src/components/Cutaway.jsx` מרנדר SVG בקנה מידה אמיתי מתוך רשימת sections במטרים. כל חלק לחיץ, עם קווי סימון הנדסיים ופאנל הסבר + דיאגרמת מערך מנועים (`EngineCluster.jsx`).
- **תלת ממד:** React Three Fiber בעמוד האנגר (נטען עצלה).

## Supabase (אופציונלי)

בלי Supabase האתר עובד מלא על התוכן הארוז. כדי שהתוכן יהיה ניתן לעריכה מהדשבורד בלי דיפלוי:

1. צור פרויקט ב-supabase.com.
2. הרץ ב-SQL Editor את `supabase/schema.sql` ואז את `supabase/seed.sql` (נוצר עם `node scripts/gen-seed-sql.mjs`).
3. העתק מ-Project Settings → API את ה-URL וה-anon key אל `.env` (ראה `.env.example`) ואל משתני הסביבה ב-Vercel.

שורות ב-Supabase גוברות על התוכן הארוז (`src/lib/db.js`).

## דיפלוי (Vercel)

הפרויקט סטטי לחלוטין: `vite build` → `dist/`. קובץ `vercel.json` כבר מגדיר SPA rewrites. מספיק `vercel deploy`, או חיבור הריפו ב-vercel.com.

## מפת דרכים

1. תמלילי Everyday Astronaut מלאים (yt-dlp כתוביות → אינדקס חיפוש/embeddings) מעל קטלוג הווידאו הקיים.
2. מודלי glTF אמיתיים בהאנגר במקום המודל הפרוצדורלי.
3. פונקציית edge שמרעננת את נתוני LL2 פעם ב-10 דקות ומגישה לכולם (עוקף את מגבלת הבקשות).
