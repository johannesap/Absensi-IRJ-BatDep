// Server lokal. Di Vercel, app yang sama dijalankan lewat api/index.mjs
import app, { connectDB } from './app.js';

await connectDB();

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server berjalan di http://localhost:${port}`));
