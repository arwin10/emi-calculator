# EMI Calculator (Updated)

This project is a React + Vite + Tailwind app with Recharts that calculates EMI for Home/Car/Personal loans.

### What's new in this build
- Dark mode toggle (persisted)
- Input validation and currency-as-you-type formatting
- Export Pie & Bar charts as SVG/PNG
- Option to show full loan-term bar chart (capped for performance)
- Unit tests using Vitest for the EMI utility
- GitHub Actions workflow to run tests and build on push

### Run locally
1. npm install
2. npm run dev
3. Open the URL shown by Vite (e.g. http://localhost:5173)

### Build
npm run build
The production files will be in `dist/`

### Test
npm run test

### Deploy
Deploy `dist/` to Vercel / Netlify / GitHub Pages (see earlier instructions in the conversation).
