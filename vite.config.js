import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function localEditorPlugin() {
  return {
    name: 'local-editor-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/save-projects' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const projectsPath = path.resolve(__dirname, 'projects.json');
              fs.writeFileSync(projectsPath, JSON.stringify(data, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'projects.json 저장 완료!' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/upload-image' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { filename, base64Data } = JSON.parse(body);
              if (!filename || !base64Data) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: '파일명과 이미지 데이터가 필요합니다.' }));
                return;
              }
              const ext = path.extname(filename) || '.png';
              const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
              const safeName = `${base}_${Date.now()}${ext}`;
              const targetDir = path.resolve(__dirname, 'public/projects');
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              const targetPath = path.join(targetDir, safeName);
              const rawData = base64Data.replace(/^data:image\/\w+;base64,/, '');
              fs.writeFileSync(targetPath, Buffer.from(rawData, 'base64'));

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                url: `/projects/${safeName}`,
                filename: safeName,
              }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/deploy-vercel' && req.method === 'POST') {
          exec('git add projects.json public/projects && git commit -m "chore: Update portfolio content and assets via Local Visual Editor" && git push origin main', (err, stdout, stderr) => {
            res.setHeader('Content-Type', 'application/json');
            if (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message, stderr }));
            } else {
              res.end(JSON.stringify({ success: true, stdout }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    localEditorPlugin(),
  ],
});
