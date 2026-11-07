/**
 * Limitless Claude 8.1.0 - Granular File-Level Checkpoint & Undo Engine
 *
 * Provides Cline-style atomic file-level checkpoints and instant rollback.
 * Captures file states before autonomous coding loops, permitting granular
 * per-file or turn-level undo without touching git commit history.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { logger } = require("../utils/logger");

const DEFAULT_CHECKPOINTS_DIR = path.resolve(process.cwd(), ".limitless", "checkpoints");

class FileCheckpointManager {
  constructor(baseDir = DEFAULT_CHECKPOINTS_DIR) {
    this.baseDir = baseDir;
  }

  ensureDir() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  generateId() {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const rand = crypto.randomBytes(3).toString("hex");
    return `ckpt-${ts}-${rand}`;
  }

  createCheckpoint(description = "Manual checkpoint", filePaths = []) {
    this.ensureDir();
    const id = this.generateId();
    const ckptDir = path.join(this.baseDir, id);
    const filesDir = path.join(ckptDir, "files");

    fs.mkdirSync(filesDir, { recursive: true });

    const backedUp = [];

    for (const filePath of filePaths) {
      try {
        const absPath = path.resolve(filePath);
        if (fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
          const content = fs.readFileSync(absPath);
          const hash = crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
          const relPath = path.relative(process.cwd(), absPath);
          
          // Flatten destination file name to avoid deep nested dir issues
          const safeName = Buffer.from(relPath).toString("base64url");
          const destFile = path.join(filesDir, safeName);

          fs.writeFileSync(destFile, content);

          backedUp.push({
            originalPath: absPath,
            relativePath: relPath,
            safeName,
            hash,
            size: content.length
          });
        }
      } catch (err) {
        logger.warn(`Could not snapshot file ${filePath}: ${err.message}`);
      }
    }

    const manifest = {
      id,
      timestamp: new Date().toISOString(),
      description,
      filesCount: backedUp.length,
      files: backedUp
    };

    fs.writeFileSync(path.join(ckptDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
    logger.info(`Created file checkpoint ${id} with ${backedUp.length} files: "${description}"`);

    return manifest;
  }

  listCheckpoints() {
    this.ensureDir();
    const entries = fs.readdirSync(this.baseDir, { withFileTypes: true });
    const list = [];

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith("ckpt-")) {
        const manifestPath = path.join(this.baseDir, entry.name, "manifest.json");
        try {
          if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
            list.push(manifest);
          }
        } catch (_) {}
      }
    }

    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  getCheckpoint(id) {
    this.ensureDir();
    const manifestPath = path.join(this.baseDir, id, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  }

  restoreCheckpoint(id, { dryRun = false } = {}) {
    const manifest = this.getCheckpoint(id);
    if (!manifest) {
      throw new Error(`Checkpoint '${id}' not found in ${this.baseDir}`);
    }

    const filesDir = path.join(this.baseDir, id, "files");
    const restored = [];

    for (const file of manifest.files) {
      const storedPath = path.join(filesDir, file.safeName);
      if (fs.existsSync(storedPath)) {
        if (!dryRun) {
          fs.mkdirSync(path.dirname(file.originalPath), { recursive: true });
          fs.copyFileSync(storedPath, file.originalPath);
        }
        restored.push(file.relativePath);
      }
    }

    logger.info(`[${dryRun ? "DRY-RUN " : ""}RESTORE] Reverted ${restored.length} files from checkpoint ${id}`);
    return {
      checkpointId: id,
      dryRun,
      restoredFiles: restored
    };
  }

  undoLast({ dryRun = false } = {}) {
    const list = this.listCheckpoints();
    if (list.length === 0) {
      throw new Error("No file checkpoints found to undo");
    }
    return this.restoreCheckpoint(list[0].id, { dryRun });
  }
}

const defaultFileCheckpointManager = new FileCheckpointManager();

module.exports = {
  FileCheckpointManager,
  defaultFileCheckpointManager
};
