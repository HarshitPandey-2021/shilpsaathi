import app from './src/app.js';
import { config, isSupabaseConfigured } from './src/config/index.js';
import { startAiService } from './src/services/aiServiceRunner.js';

app.listen(config.port, async () => {
  console.log(`ShilpSaathi API running at http://localhost:${config.port}`);
  console.log(`Database: ${isSupabaseConfigured() ? 'Supabase configured' : 'NOT configured - set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'}`);

  // Automatically start Python AI service alongside backend
  await startAiService();
});
