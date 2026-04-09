import dotenv from 'dotenv'
import app from './app.js'

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 NutriTalk Node API running on http://localhost:${PORT}`);
  console.log(`📡 AI Service proxied from ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
