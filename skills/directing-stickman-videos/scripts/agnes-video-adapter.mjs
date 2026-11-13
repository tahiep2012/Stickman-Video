#!/usr/bin/env node
/**
 * Agnes AI Video Adapter for directing-stickman-videos (Director Mode)
 * 
 * Interacts with Agnes AI video endpoints:
 * - Task Creation: POST https://apihub.agnes-ai.com/v1/videos
 * - Task Polling:  GET  https://apihub.agnes-ai.com/v1/videos/:taskId
 * 
 * Supported Models:
 * - agnes-video-2.5-flash
 * - agnes-video-2.5
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Auto-load .env
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

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Submits a video generation task to Agnes AI.
 */
export async function submitAgnesVideoTask(options) {
  const {
    prompt,
    model = process.env.AGNES_VIDEO_MODEL || 'agnes-video-2.5-flash',
    aspect_ratio = '16:9',
    size = '720P',
    seconds = 5,
    mode = 'text',
    baseUrl = process.env.AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1',
    apiKey = process.env.AGNES_API_KEY
  } = options;

  if (!apiKey) throw new Error('Set AGNES_API_KEY in the environment or .env file');
  if (!prompt) throw new Error('Prompt is required for video generation');

  // Clamp seconds between 4 and 12
  const clampedSeconds = Math.max(4, Math.min(12, Math.round(seconds)));

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/videos`;
  const payload = {
    model,
    mode,
    prompt,
    aspect_ratio,
    size,
    seconds: clampedSeconds
  };

  const bodyString = JSON.stringify(payload);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyString).toString(),
      'Authorization': `Bearer ${apiKey}`
    },
    body: bodyString,
    signal: AbortSignal.timeout(60000)
  });

  const rawText = await response.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`Failed to parse response: ${response.status} ${rawText}`);
  }

  if (!response.ok) {
    const errorMsg = data.message || data.error?.message || rawText;
    const err = new Error(`Agnes Video API error (${response.status}): ${errorMsg}`);
    err.status = response.status;
    err.code = data.code || data.error?.code;
    err.data = data;
    throw err;
  }

  // Extract task ID from potential response formats
  const taskId = data.id || data.task_id || data.data?.id || data.data?.task_id;
  if (!taskId) {
    throw new Error(`Task ID missing in Agnes AI response: ${rawText}`);
  }

  return {
    taskId,
    model,
    seconds: clampedSeconds,
    status: data.status || data.data?.status || 'processing',
    raw: data
  };
}

/**
 * Polls status of a video generation task until completion.
 */
export async function pollAgnesVideoTask(taskId, options = {}) {
  const {
    baseUrl = process.env.AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1',
    apiKey = process.env.AGNES_API_KEY,
    intervalMs = 5000,
    timeoutMs = 600000, // 10 minutes
    onProgress = null
  } = options;

  if (!apiKey) throw new Error('Set AGNES_API_KEY in the environment or .env file');
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/videos/${encodeURIComponent(taskId)}`;
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    let res, data;
    try {
      res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        signal: AbortSignal.timeout(30000)
      });
      const text = await res.text();
      data = JSON.parse(text);
    } catch (err) {
      if (onProgress) onProgress({ status: 'polling_retry', error: err.message });
      await sleep(intervalMs);
      continue;
    }

    // Status checking
    const status = (data.status || data.data?.status || data.state || '').toLowerCase();
    const videoUrl = data.video_url || data.data?.video_url || data.data?.url || data.url;

    if (onProgress) {
      onProgress({ status, elapsedMs: Date.now() - startTime, raw: data });
    }

    if (status === 'succeeded' || status === 'success' || status === 'completed' || videoUrl) {
      if (!videoUrl) {
        throw new Error(`Task marked complete but video_url not found in response: ${JSON.stringify(data)}`);
      }
      return {
        taskId,
        status: 'succeeded',
        videoUrl,
        raw: data
      };
    }

    if (status === 'failed' || status === 'error') {
      const reason = data.error || data.message || data.data?.error || 'Unknown failure';
      throw new Error(`Video task ${taskId} failed: ${JSON.stringify(reason)}`);
    }

    await sleep(intervalMs);
  }

  throw new Error(`Video task ${taskId} timed out after ${Math.round(timeoutMs / 1000)}s`);
}

/**
 * Downloads a video file from a given URL to disk.
 */
export async function downloadVideoFile(url, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const response = await fetch(url, {
    signal: AbortSignal.timeout(180000)
  });

  if (!response.ok) {
    throw new Error(`Failed to download video from ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer);

  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  return {
    outputPath,
    bytes: buffer.length,
    sha256: hash
  };
}

/**
 * Complete video generation pipeline for one clip: Submit -> Poll -> Download -> Save receipt.
 */
export async function generateAgnesVideo(options) {
  const {
    prompt,
    output,
    model = process.env.AGNES_VIDEO_MODEL || 'agnes-video-2.5-flash',
    aspect_ratio = '16:9',
    size = '720P',
    seconds = 5,
    maxRetries = 5,
    onProgress = null
  } = options;

  if (!output) throw new Error('Output path is required');
  const resolvedOutput = path.resolve(output);
  const receiptPath = `${resolvedOutput}.request.json`;

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (onProgress) onProgress({ attempt, stage: 'submitting', prompt, seconds });

      const task = await submitAgnesVideoTask({
        prompt,
        model,
        aspect_ratio,
        size,
        seconds
      });

      if (onProgress) onProgress({ attempt, stage: 'polling', taskId: task.taskId });

      const result = await pollAgnesVideoTask(task.taskId, {
        onProgress: info => {
          if (onProgress) onProgress({ attempt, stage: 'polling_step', ...info });
        }
      });

      if (onProgress) onProgress({ attempt, stage: 'downloading', videoUrl: result.videoUrl });

      const download = await downloadVideoFile(result.videoUrl, resolvedOutput);

      const receipt = {
        provider: 'agnes-ai',
        model,
        taskId: task.taskId,
        prompt,
        aspect_ratio,
        size,
        target_seconds: seconds,
        completed_at: new Date().toISOString(),
        videoUrl: result.videoUrl,
        output_file: path.basename(resolvedOutput),
        bytes: download.bytes,
        sha256: download.sha256
      };
      fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');

      return {
        outputPath: resolvedOutput,
        receiptPath,
        receipt
      };
    } catch (err) {
      lastError = err;
      const isRetryable = err.status === 503 || err.status === 429 || (err.message && (
        err.message.includes('queue is full') ||
        err.message.includes('video_queue_full') ||
        err.message.includes('rate limit') ||
        err.message.includes('Failed to read request body') ||
        err.message.includes('timeout')
      ));
      if (isRetryable && attempt < maxRetries) {
        const delayMs = attempt * 10000;
        if (onProgress) onProgress({ attempt, stage: 'retry_wait', delayMs, error: err.message });
        await sleep(delayMs);
      } else {
        throw err;
      }
    }
  }

  throw lastError;
}
