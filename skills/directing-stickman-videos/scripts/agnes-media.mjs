#!/usr/bin/env node
/**
 * Agnes AI Media Adapter for directing-stickman-videos
 * 
 * Generates stickman scenes using Agnes AI's OpenAI-compatible image endpoint.
 * Official Endpoint: https://apihub.agnes-ai.com/v1/images/generations
 * Supported Models: agnes-image-2.5-flash (default), agnes-image-2.1-flash, agnes-image-2.0-flash
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Auto-load .env if AGNES_API_KEY is not already in process.env
function loadEnv() {
  if (process.env.AGNES_API_KEY) return;
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env')
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env[key]) process.env[key] = value.trim();
        }
      }
      break;
    }
  }
}
loadEnv();

const [kind, ...args] = process.argv.slice(2);
const value = flag => args[args.indexOf(flag) + 1];
const required = flag => {
  if (!args.includes(flag) || !value(flag) || value(flag).startsWith('--')) {
    throw new Error(`Required ${flag}`);
  }
  return value(flag);
};

export async function generateAgnesImage(options) {
  const {
    prompt,
    output,
    model = 'agnes-image-2.5-flash',
    size = '1024x1024',
    baseUrl = process.env.AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1',
    apiKey = process.env.AGNES_API_KEY,
    normalize = false
  } = options;

  if (!apiKey) throw new Error('Set AGNES_API_KEY in the environment or .env file');
  if (!prompt) throw new Error('Prompt is required');
  if (!output) throw new Error('Output path is required');

  const resolvedOutput = path.resolve(output);
  const receipt = `${resolvedOutput}.request.json`;

  fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });

  const record = {
    provider: 'agnes-ai',
    model,
    requested_at: new Date().toISOString(),
    request_id: crypto.randomUUID(),
    prompt,
    size,
    status: 'submitted_or_unknown'
  };
  fs.writeFileSync(receipt, JSON.stringify(record, null, 2), { flag: 'w' });

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/images/generations`;

  const payload = {
    model,
    prompt,
    n: 1,
    size,
    response_format: 'b64_json'
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(180000)
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Agnes AI HTTP ${response.status}: ${errorBody.slice(0, 300)}`);
  }

  const data = await response.json();
  const firstItem = data.data?.[0];
  if (!firstItem) throw new Error('No image data returned from Agnes AI');

  let imageBuffer;
  if (firstItem.b64_json) {
    imageBuffer = Buffer.from(firstItem.b64_json, 'base64');
  } else if (firstItem.url) {
    const imgRes = await fetch(firstItem.url);
    if (!imgRes.ok) throw new Error(`Failed to download image from ${firstItem.url}`);
    const arrayBuf = await imgRes.arrayBuffer();
    imageBuffer = Buffer.from(arrayBuf);
  } else {
    throw new Error('Image response missing both b64_json and url');
  }

  // Optional background normalization via Sharp
  if (normalize) {
    try {
      const { createRequire } = await import('node:module');
      const req = createRequire(import.meta.url);
      const sharp = req('sharp');
      const raw = await sharp(imageBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const threshold = 215;
      for (let i = 0; i < raw.data.length; i += 4) {
        if (raw.data[i] >= threshold && raw.data[i + 1] >= (threshold - 5) && raw.data[i + 2] >= (threshold - 10)) {
          raw.data[i + 3] = 0;
        }
      }
      const trimmed = await sharp(raw.data, { raw: { width: raw.info.width, height: raw.info.height, channels: 4 } })
        .trim()
        .toBuffer();
      const safeCanvas = 1024;
      const safeMax = Math.round(safeCanvas * 0.85);
      const scaled = await sharp(trimmed)
        .resize({ width: safeMax, height: safeMax, fit: 'inside' })
        .toBuffer();
      imageBuffer = await sharp({
        create: { width: safeCanvas, height: safeCanvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
      })
        .composite([{ input: scaled, gravity: 'center' }])
        .png()
        .toBuffer();
    } catch {
      // Fallback: keep raw imageBuffer if Sharp normalization fails
    }
  }

  fs.writeFileSync(resolvedOutput, imageBuffer);
  const sha256 = crypto.createHash('sha256').update(imageBuffer).digest('hex');

  Object.assign(record, {
    status: 'complete',
    output: resolvedOutput,
    sha256,
    completed_at: new Date().toISOString()
  });
  fs.writeFileSync(receipt, JSON.stringify(record, null, 2));

  return { output: resolvedOutput, receipt, sha256, model, status: 'complete' };
}

async function main() {
  if (kind !== 'image') {
    throw new Error('Agnes AI Media Adapter currently supports: image');
  }
  if (!args.includes('--allow-network')) {
    throw new Error('Network disabled; require explicit --allow-network after user authorization');
  }

  const model = args.includes('--model') ? value('--model') : 'agnes-image-2.5-flash';
  const output = path.resolve(required('--output'));

  let prompt = '';
  if (args.includes('--prompt-file')) {
    prompt = fs.readFileSync(path.resolve(value('--prompt-file')), 'utf8').trim();
  } else if (args.includes('--prompt')) {
    const p = value('--prompt');
    if (fs.existsSync(p)) prompt = fs.readFileSync(p, 'utf8').trim();
    else prompt = p.trim();
  } else {
    throw new Error('Prompt required via --prompt or --prompt-file');
  }

  const normalize = args.includes('--normalize');
  const size = args.includes('--size') ? value('--size') : '1024x1024';

  const res = await generateAgnesImage({ prompt, output, model, size, normalize });
  console.log(JSON.stringify(res, null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(e => {
    console.error(e.message);
    process.exitCode = 1;
  });
}
