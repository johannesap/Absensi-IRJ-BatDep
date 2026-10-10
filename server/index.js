// Server lokal / Render. Di Netlify, app yang sama dijalankan lewat functions/api.js
import app, { connectDB } from './app.js';

await connectDB();

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server berjalan di http://localhost:${port}`));
