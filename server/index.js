import app from './src/app.js';
import { config, isSupabaseConfigured } from './src/config/index.js';
import { startAiService } from './src/services/aiServiceRunner.js';

const port = Number(config.port) || 5000;

app.listen(port, '0.0.0.0', async () => {
  console.log(`ShilpSaathi API running on port ${port} (0.0.0.0:${port})`);
  console.log(`Database: ${isSupabaseConfigured() ? 'Supabase configured' : 'NOT configured - set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'}`);

  try {
    // Attempt starting or connecting to AI service
    await startAiService();
  } catch (err) {
    console.warn(`[AI-Service] Auto-start note: ${err.message}`);
  }
});
