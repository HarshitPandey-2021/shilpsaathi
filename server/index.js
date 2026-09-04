import app from './src/app.js';
import { config, isSupabaseConfigured } from './src/config/index.js';

app.listen(config.port, () => {
  console.log(`ShilpSaathi API running at http://localhost:${config.port}`);
  console.log(`Database: ${isSupabaseConfigured() ? 'Supabase configured' : 'NOT configured - set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'}`);
});
