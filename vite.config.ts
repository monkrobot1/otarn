import { defineConfig, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

// Plugin to allow saving JSON files from the frontend
function jsonSaverPlugin() {
  return {
    name: 'json-saver',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/saveData' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: any) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const body = Buffer.concat(chunks).toString('utf8');
              const { filePath, data } = JSON.parse(body);
              const fullPath = path.resolve(__dirname, filePath);
              fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else if (req.url === '/api/uploadSprite' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: any) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const body = Buffer.concat(chunks).toString('utf8');
              const { fileName, base64Data } = JSON.parse(body);
              const assetsDir = path.resolve(__dirname, 'public/assets');
              if (!fs.existsSync(assetsDir)) {
                fs.mkdirSync(assetsDir, { recursive: true });
              }

              let finalUrl = `/assets/${fileName}`;
              let extraMetadata: any = null;

              if (fileName.endsWith('.zip')) {
                  const zip = new AdmZip(Buffer.from(base64Data, 'base64'));
                  const zipEntries = zip.getEntries();
                  
                  // 1. Find the JSON and the Image
                  const jsonEntry = zipEntries.find(e => e.entryName.endsWith('.json'));
                  if (!jsonEntry) throw new Error("No JSON manifest found in ZIP");
                  
                  const manifest = JSON.parse(jsonEntry.getData().toString('utf8'));
                  const imageName = manifest.meta?.image;
                  if (!imageName) throw new Error("Manifest has no 'meta.image' field");
                  
                  const imgEntry = zipEntries.find(e => e.entryName.includes(imageName));
                  if (!imgEntry) throw new Error(`Image '${imageName}' not found in ZIP`);

                  // 2. Extract specific image file (saving it as the original name or with unique suffix)
                  const cleanImageName = fileName.replace('.zip', '') + '_' + imageName;
                  const imgBuffer = imgEntry.getData();
                  fs.writeFileSync(path.join(assetsDir, cleanImageName), imgBuffer);
                  
                  finalUrl = `/assets/${cleanImageName}`;

                  // 3. Calculate Sprite Data (Lazy Parse the Makko format)
                  // Grid check: We look at first frame vs meta.size
                  const firstFrameKey = Object.keys(manifest.frames)[0];
                  const firstFrame = manifest.frames[firstFrameKey].frame;
                  
                  const cols = Math.floor((manifest.meta.size.w + 1) / firstFrame.w);
                  const rows = Math.floor((manifest.meta.size.h + 1) / firstFrame.h);
                  const totalFrames = Object.keys(manifest.frames).length;
                  const durationMs = manifest.frames[firstFrameKey].duration || 83;
                  const fps = Math.round(1000 / durationMs);

                  extraMetadata = { cols, rows, totalFrames, fps };
              } else {
                  // Standard raw image upload
                  const filePath = path.join(assetsDir, fileName);
                  const buffer = Buffer.from(base64Data, 'base64');
                  fs.writeFileSync(filePath, buffer);
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                  success: true, 
                  url: finalUrl,
                  meta: extraMetadata
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else if (req.url === '/api/log' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: any) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const body = Buffer.concat(chunks).toString('utf8');
              const { level, prefix, message, data } = JSON.parse(body);
              
              // Define simple colors for Node console
              const colors: any = {
                error: '\x1b[31m', // Red
                warn: '\x1b[33m',  // Yellow
                info: '\x1b[36m',  // Cyan
                debug: '\x1b[35m', // Magenta
                reset: '\x1b[0m'
              };

              // Safely stringify data for terminal
              const dataStr = data ? `\n    └─ Data: ${JSON.stringify(data)}` : '';
              const color = colors[level] || colors.reset;

              // Print it to the backend terminal
              console.log(`${color}${prefix} ${message}${colors.reset}${dataStr}`);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), jsonSaverPlugin()],
  server: {
    port: 3000,
  }
});
