import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { Worker, isMainThread, workerData, parentPort } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const ogDir = path.join(process.cwd(), 'dist', 'og');
const cacheDir = path.join(process.cwd(), '.og-cache');
const manifestPath = path.join(cacheDir, 'manifest.json');
const fontPath = path.join(process.cwd(), 'public', 'fonts', 'GoogleSans-Regular.ttf');

function getMd5(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

if (isMainThread) {
  async function runMain() {
    console.log('--- OG Image Conversion Script (Optimized Multi-Threaded) ---');
    const startTime = Date.now();

    if (!fs.existsSync(ogDir)) {
      console.error(`Directory not found: ${ogDir}. Please build the project first.`);
      process.exit(1);
    }

    if (!fs.existsSync(fontPath)) {
      console.error(`Font file not found: ${fontPath}`);
      process.exit(1);
    }

    // 1. Ensure cache dir exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // 2. Load manifest
    let manifest = {};
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch (err) {
        console.warn('Failed to parse manifest, starting fresh:', err);
      }
    }

    // 3. Scan SVGs
    const svgFiles = fs.readdirSync(ogDir).filter(file => file.endsWith('.svg'));
    console.log(`Found ${svgFiles.length} SVG files.`);

    const toProcess = [];

    // 4. Determine which files need processing
    for (const file of svgFiles) {
      const slug = file.replace(/\.svg$/, '');
      const svgPath = path.join(ogDir, file);
      const pngFilename = `${slug}.png`;
      const targetPngPath = path.join(ogDir, pngFilename);
      const cachedPngPath = path.join(cacheDir, pngFilename);

      const svgContent = fs.readFileSync(svgPath, 'utf8');
      const currentHash = getMd5(svgContent);

      // Check if cache is valid and cached PNG exists
      if (manifest[slug] === currentHash && fs.existsSync(cachedPngPath)) {
        // If not in dist/og yet, copy from cache
        if (!fs.existsSync(targetPngPath)) {
          fs.copyFileSync(cachedPngPath, targetPngPath);
        }
      } else {
        toProcess.push({
          file,
          slug,
          svgPath,
          pngFilename,
          hash: currentHash
        });
      }
    }

    const cleanupSvgs = () => {
      const compiledSvgs = fs.readdirSync(ogDir).filter(file => file.endsWith('.svg'));
      for (const svgFile of compiledSvgs) {
        fs.unlinkSync(path.join(ogDir, svgFile));
      }
      console.log(`Deleted ${compiledSvgs.length} SVG files from dist/og to clean up deployment.`);
    };

    console.log(`Cache hit: ${svgFiles.length - toProcess.length}/${svgFiles.length}.`);
    if (toProcess.length === 0) {
      cleanupSvgs();
      console.log(`All images are up to date! Completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s.`);
      process.exit(0);
    }

    console.log(`Need to convert ${toProcess.length} files...`);

    // 5. Partition queue for multi-threaded rendering
    const cpuCount = Math.min(os.cpus().length, 12, toProcess.length);
    console.log(`Spawning ${cpuCount} worker threads...`);

    const chunks = Array.from({ length: cpuCount }, () => []);
    toProcess.forEach((item, index) => {
      chunks[index % cpuCount].push(item);
    });

    let completedCount = 0;
    const workerPromises = chunks.map((chunk, workerId) => {
      if (chunk.length === 0) return Promise.resolve([]);
      
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: {
            chunk,
            fontPath,
            workerId
          }
        });

        worker.on('message', (msg) => {
          if (msg.type === 'progress') {
            completedCount += msg.count;
            if (completedCount % 100 === 0 || completedCount === toProcess.length) {
              const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
              console.log(`Converted ${completedCount}/${toProcess.length} images... (${elapsed}s elapsed)`);
            }
          } else if (msg.type === 'done') {
            resolve(msg.results);
          }
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
    });

    try {
      const results = await Promise.all(workerPromises);
      
      // 6. Update manifest with successful conversions
      results.flat().forEach(item => {
        manifest[item.slug] = item.hash;
      });

      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      cleanupSvgs();

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`--- OG Image Conversion Complete! Converted ${toProcess.length} images in ${elapsed}s ---`);
    } catch (err) {
      console.error('Multi-threaded conversion failed:', err);
      process.exit(1);
    }
  }

  runMain();
} else {
  // Worker Thread Logic
  const { chunk, fontPath, workerId } = workerData;
  const results = [];
  const ogDir = path.join(process.cwd(), 'dist', 'og');
  const cacheDir = path.join(process.cwd(), '.og-cache');

  for (const item of chunk) {
    const targetPngPath = path.join(ogDir, item.pngFilename);
    const cachedPngPath = path.join(cacheDir, item.pngFilename);

    try {
      const svgContent = fs.readFileSync(item.svgPath, 'utf8');
      
      // Clean SVG for Resvg by removing base64 font rules that it cannot parse
      const cleanSvg = svgContent
        .replace(/<style>[\s\S]*?<\/style>/g, '')
        // Replace Google Sans Flex with quoted 'Google Sans' to handle space mapping
        .replace(/Google Sans Flex/g, "'Google Sans'");

      const resvg = new Resvg(cleanSvg, {
        font: {
          fontFiles: [fontPath],
          loadSystemFonts: false,
          defaultFontFamily: 'Google Sans',
        },
        fitTo: {
          mode: 'width',
          value: 1200,
        },
      });

      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      // Write to dist/og and cache
      fs.writeFileSync(targetPngPath, pngBuffer);
      fs.writeFileSync(cachedPngPath, pngBuffer);

      results.push({ slug: item.slug, hash: item.hash });
    } catch (err) {
      console.error(`Worker ${workerId} failed to convert ${item.file}:`, err);
    }

    parentPort.postMessage({ type: 'progress', count: 1 });
  }

  parentPort.postMessage({ type: 'done', results });
}
