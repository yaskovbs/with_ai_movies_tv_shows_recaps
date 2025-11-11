# יוצר סיכומי וידאו חכם עם AI - Advanced Movie & TV Show Recap Maker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

פלטפורמה מתקדמת ליצירת סיכומי וידאו מקצועיים עם בינה מלאכותית שלומדת ומשתפרת. המערכת משלבת Google Gemini AI, למידה מיוטיוב, חיפוש באינטרנט ולמידה מתמשכת.

## ✨ תכונות עיקריות

### תכונות בסיסיות
- 🎬 **עיבוד וידאו מתקדם** - שימוש ב-FFmpeg.wasm ישירות בדפדפן
- 🤖 **בינה מלאכותית** - יצירת תסריטים בעברית באמצעות Google Gemini 2.5 Pro
- 🔒 **בטוח ומאובטח** - הקבצים מעובדים בדפדפן, המפתחות לא נשמרים
- 📱 **ממשק ידידותי** - עיצוב מודרני ונגיש
- ⚡ **עיבוד מהיר** - טכנולוגיית WebAssembly לביצועים מקסימליים

### תכונות מתקדמות חדשות
- 🧠 **למידה מתמשכת** - המערכת לומדת ומשתפרת מכל סיכום
- 📺 **למידה מיוטיוב** - ניתוח סגנון עריכה מערוצים מצליחים
- 🔍 **חיפוש חכם** - איסוף מידע נוסף מהאינטרנט לשיפור הדיוק
- 🎯 **המלצות אוטומטיות** - הגדרות מותאמות לפי ז'אנר על בסיס למידה
- 💾 **שמירה בענן** - שילוב Supabase לאחסון ושיתוף פרויקטים
- 📊 **ניתוח מתקדם** - דשבורד עם סטטיסטיקות ותובנות

## 🚀 התחלה מהירה

### דרישות מקדימות

- Node.js (גרסה 18 ומעלה)
- npm או yarn
- מפתח API של Google Gemini (קבל חינם מ-[Google AI Studio](https://makersuite.google.com/app/apikey))

### התקנה

1. **שכפל את הפרויקט:**
   ```bash
   git clone <repository-url>
   cd moviesandtvshowsrecapsmakerwithai-master
   ```

2. **התקן תלויות:**
   ```bash
   npm install
   ```

3. **הגדר משתני סביבה:**
   צור קובץ `.env` בתיקיית השורש והוסף את הפרטים הבאים:
   ```env
   # Google Gemini AI (חובה)
   VITE_GEMINI_API_KEY=your-gemini-api-key

   # Supabase (אופציונלי - למידע על ההתקנה ראה למטה)
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **הפעל את שרת הפיתוח:**
   ```bash
   npm run dev
   ```

5. **פתח את הדפדפן:**
   נווט אל `http://localhost:5173`

## 📖 איך להשתמש

### שימוש בסיסי
1. **העלאת וידאו** - גרור קובץ וידאו (עד 4GB) או בחר מהמחשב
2. **הגדרות בסיסיות** - קבע אורך סיכום, מרווחי חיתוך ותאר את הווידאו
3. **יצירת סיכום** - לחץ על הכפתור ותן לקסם לקרות!

### שימוש מתקדם
1. **מידע על הסרט** - הזן כותרת, ז'אנר ותיאור מפורט
2. **הפעל למידה מיוטיוב** - הזן מזהה ערוץ YouTube כדי ללמוד מהסגנון
3. **הפעל חיפוש באינטרנט** - המערכת תאסוף מידע נוסף לשיפור הדיוק
4. **המלצות AI** - קבל המלצות אוטומטיות על בסיס ז'אנר והיסטוריה

### ערוצי YouTube מומלצים ללמידה
- ערוצי recap מצליחים כמו MovieRecaps, StoryRecapped
- ערוצי review כמו Chris Stuckmann, Jeremy Jahns
- ערוצי ניתוח כמו Nerdwriter1, Every Frame a Painting

## 🛠️ טכנולוגיות

- **Frontend:** React 19, TypeScript, Vite
- **UI:** Tailwind CSS, Framer Motion
- **Video Processing:** FFmpeg.wasm (WebAssembly)
- **AI:** Google Gemini 2.5 Pro
- **Database:** Supabase (PostgreSQL)
- **APIs:** YouTube Data API v3, Google Search API
- **Storage:** Browser LocalStorage + Cloud Database
- **Icons:** Lucide React

## 📁 מבנה הפרויקט

```
src/
├── components/
│   ├── HomePage.tsx              # דף בסיסי
│   ├── AdvancedHomePage.tsx      # דף מתקדם עם AI חכם
│   ├── AdvancedRecapSettings.tsx # הגדרות מתקדמות
│   ├── VideoUploader.tsx         # העלאת וידאו
│   ├── ProcessingStatus.tsx      # סטטוס עיבוד
│   ├── ResultsSection.tsx        # תוצאות
│   ├── StatsSection.tsx          # סטטיסטיקות
│   ├── ContactPage.tsx           # צור קשר
│   ├── FAQPage.tsx               # שאלות נפוצות
│   ├── Header.tsx & Footer.tsx   # ניווט
│   └── ...
├── services/
│   └── aiLearningService.ts      # שירותי AI ולמידה
├── lib/
│   ├── localStorage.ts           # אחסון מקומי
│   └── supabaseClient.ts         # Supabase client
├── types/
│   └── index.ts                  # הגדרות TypeScript
└── App.tsx                       # אפליקציה ראשית
```

## 🔧 סקריפטים זמינים

- `npm run dev` - הפעלת שרת פיתוח
- `npm run build` - בניית הפרויקט לייצור
- `npm run preview` - תצוגה מקדימה של הבנייה
- `npm run lint` - בדיקת קוד עם ESLint

## ☁️ התקנת Supabase (אופציונלי אך מומלץ)

התכונות המתקדמות דורשות Supabase לשמירת נתוני למידה:

1. **צור פרויקט ב-Supabase:**
   - עבור ל-[Supabase Dashboard](https://app.supabase.com/)
   - צור פרויקט חדש

2. **הפעל את המיגרציות:**
   - קובץ המיגרציה נמצא במערכת
   - טבלאות: `movies_metadata`, `recap_projects`, `youtube_learning_sources`, `learning_models`, `web_search_cache`, `user_feedback`

3. **העתק את הפרטים ל-.env:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **התכונות שיופעלו:**
   - שמירת פרויקטים בענן
   - היסטוריית למידה משותפת
   - סטטיסטיקות מתקדמות
   - שיתוף פרויקטים בין מכשירים

**שימוש בלי Supabase:** המערכת תמשיך לעבוד במצב מקומי עם LocalStorage.

## 🤝 תרומה

תרומות מתקבלות בברכה! אנא:

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/AmazingFeature`)
3. Commit את השינויים (`git commit -m 'Add some AmazingFeature'`)
4. Push ל-branch (`git push origin feature/AmazingFeature`)
5. פתח Pull Request

## 📄 רישיון

פרויקט זה מוגן ברישיון MIT - ראה את קובץ [LICENSE](LICENSE) לפרטים.

## 📞 צור קשר

- **דוא"ל:** [your-email@example.com]
- **GitHub Issues:** [פתח issue](https://github.com/your-username/moviesandtvshowsrecapsmakerwithai/issues)

## 🙏 תודות

- [Google Gemini AI](https://ai.google.dev/) - עבור יכולות הבינה המלאכותית
- [FFmpeg](https://ffmpeg.org/) - עבור עיבוד וידאו מתקדם
- [Supabase](https://supabase.com/) - עבור שירותי Backend
- [React](https://reactjs.org/) ו-[Vite](https://vitejs.dev/) - עבור חוויית פיתוח מעולה

---

**הערה:** אפליקציה זו פועלת לחלוטין מקומית בדפדפן. כל הנתונים נשמרים באחסון המקומי של הדפדפן, והקבצים שלכם לעולם לא עולים לשרת חיצוני. הפרטיות והאבטחה שלכם מובטחות.
