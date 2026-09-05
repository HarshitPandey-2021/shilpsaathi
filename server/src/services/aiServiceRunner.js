import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiProcess = null;
let isShuttingDown = false;

/**
 * Check if AI service is already running
 */
async function isAiServiceRunning(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Find the best Python executable in virtual environments or system path
 */
function findPythonExecutable(aiServiceDir) {
  const isWindows = process.platform === 'win32';
  
  const possiblePaths = isWindows
    ? [
        path.join(aiServiceDir, 'venv', 'Scripts', 'python.exe'),
        path.join(aiServiceDir, '.venv', 'Scripts', 'python.exe'),
        path.join(aiServiceDir, '..', 'venv', 'Scripts', 'python.exe'),
        path.join(aiServiceDir, '..', '.venv', 'Scripts', 'python.exe'),
        'python',
        'py',
        'python3'
      ]
    : [
        path.join(aiServiceDir, 'venv', 'bin', 'python'),
        path.join(aiServiceDir, '.venv', 'bin', 'python'),
        path.join(aiServiceDir, '..', 'venv', 'bin', 'python'),
        path.join(aiServiceDir, '..', '.venv', 'bin', 'python'),
        'python3',
        'python'
      ];

  for (const pyPath of possiblePaths) {
    if (pyPath.includes(path.sep) && fs.existsSync(pyPath)) {
      return pyPath;
    }
  }

  // Fallback to system command
  return isWindows ? 'python' : 'python3';
}

/**
 * Start AI Image Service (FastAPI / Uvicorn) automatically
 */
export async function startAiService() {
  const targetUrl = config.ai?.serviceUrl || 'http://localhost:8000';

  // 1. Check if AI service is already running
  const alreadyRunning = await isAiServiceRunning(targetUrl);
  if (alreadyRunning) {
    console.log(`[AI-Service] Active and connected at ${targetUrl}`);
    return;
  }

  // 2. Resolve AI service directory
  const aiServiceDir = path.resolve(__dirname, '../../../ai-service');
  if (!fs.existsSync(aiServiceDir)) {
    console.warn(`[AI-Service] Directory not found at: ${aiServiceDir}. Skipping auto-start.`);
    return;
  }

  const pythonExec = findPythonExecutable(aiServiceDir);
  console.log(`[AI-Service] Starting AI Service from ${aiServiceDir} using "${pythonExec}"...`);

  try {
    // Launch uvicorn via python
    aiProcess = spawn(
      pythonExec,
      ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'],
      {
        cwd: aiServiceDir,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
      }
    );

    aiProcess.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) {
        console.log(`[AI-Service] ${msg}`);
      }
    });

    aiProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) {
        console.log(`[AI-Service] ${msg}`);
      }
    });

    aiProcess.on('error', (err) => {
      if (!isShuttingDown) {
        console.warn(`[AI-Service] Process warning/error: ${err.message}`);
        console.warn('[AI-Service] (Ensure Python 3.10+ and requirements in ai-service/requirements.txt are installed)');
      }
    });

    aiProcess.on('exit', (code, signal) => {
      if (!isShuttingDown && code !== 0 && code !== null) {
        console.warn(`[AI-Service] Stopped with exit code ${code}`);
      }
    });

    // Wait briefly and verify if service became ready
    let checks = 0;
    const interval = setInterval(async () => {
      checks++;
      const isUp = await isAiServiceRunning(targetUrl);
      if (isUp) {
        clearInterval(interval);
        console.log(`[AI-Service] ✅ AI Service successfully running and ready at ${targetUrl}`);
      } else if (checks >= 10) {
        clearInterval(interval);
      }
    }, 1000);

  } catch (err) {
    console.warn(`[AI-Service] Failed to auto-start Python service: ${err.message}`);
  }

  // Graceful shutdown hooks
  const cleanup = () => {
    if (aiProcess && !isShuttingDown) {
      isShuttingDown = true;
      console.log('[AI-Service] Shutting down AI service process...');
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', aiProcess.pid, '/f', '/t']);
        } else {
          aiProcess.kill('SIGTERM');
        }
      } catch (e) {
        // ignore
      }
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}
