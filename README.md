# TaskFlow — simple task manager

A clean, responsive task manager built with Next.js, React, TypeScript and CSS. It is ready to push to GitHub and deploy on Vercel.

## Features
- Create, edit and delete tasks
- Set start dates, due dates and priorities
- Track progress from 0–100% and update task status
- Automatic activity history when task details, status or progress change
- Dashboard counts, progress overview, search and status filters
- Due soon and overdue indicators
- Data is saved in the browser using `localStorage`

## Run locally
1. Install Node.js 18.17+.
2. Extract this ZIP and open the folder in your terminal.
3. Run `npm install`
4. Run `npm run dev`
5. Open http://localhost:3000

## Deploy with GitHub + Vercel
1. Create a new GitHub repository.
2. Add the extracted project files and push them to the repository:
   ```bash
   git init
   git add .
   git commit -m "Build TaskFlow task manager"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```
3. Sign in to Vercel, choose **Add New → Project**, and import the GitHub repository.
4. Keep the detected Next.js settings and click **Deploy**. No environment variables are needed for this starter.

## Important note about storage
This starter stores tasks in the current browser's local storage. That makes it easy to run and deploy without configuring a database, but tasks do not sync between devices or users and can be lost if browser storage is cleared.

For a multi-device / multi-user production app, connect a database and authentication (for example Supabase). The app is intentionally structured as a simple starter so that this can be added next.

## Notifications
The dashboard flags tasks that are overdue or due within the next three days whenever you open the app. It does not send background email, push or SMS notifications.
