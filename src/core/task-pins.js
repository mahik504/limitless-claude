/**
 * Limitless Claude 8.1.0 - Task-to-Model Pinning Engine
 *
 * Allows users to pin dedicated model endpoints to specific engineering tasks
 * (e.g. Architect/Reasoning, Backend, Frontend, Fast Diffs, 3D/WebGL).
 * 
 * Works like Roo Code / Cline custom mode model assignment, but native to the
 * Limitless multi-provider routing layer.
 */

const fs = require("fs");
const path = require("path");
const { logger } = require("../utils/logger");

const CONFIG_DIR = path.resolve(__dirname, "../../config");
const DEFAULT_PINS_FILE = path.join(CONFIG_DIR, "task-pins.json");

const VALID_TASKS = [
  "fast",
  "balanced",
  "reasoning",
  "frontend",
  "backend",
  "3d",
  "review",
  "docs",
  "coding",
  "architecture"
];

class TaskPinManager {
  constructor(pinsFilePath = DEFAULT_PINS_FILE) {
    this.pinsFilePath = pinsFilePath;
  }

  loadPins() {
    try {
      if (fs.existsSync(this.pinsFilePath)) {
        const raw = fs.readFileSync(this.pinsFilePath, "utf8");
        return JSON.parse(raw);
      }
    } catch (err) {
      logger.warn(`Could not read task pins file: ${err.message}`);
    }
    return {};
  }

  savePins(pins) {
    try {
      fs.mkdirSync(path.dirname(this.pinsFilePath), { recursive: true });
      fs.writeFileSync(this.pinsFilePath, JSON.stringify(pins, null, 2), "utf8");
      return true;
    } catch (err) {
      logger.error(`Failed to save task pins: ${err.message}`);
      throw err;
    }
  }

  setPin(task, model) {
    if (!task || typeof task !== "string") {
      throw new Error("Task name must be a non-empty string");
    }
    if (!model || typeof model !== "string") {
      throw new Error("Model target must be a non-empty string (e.g., kiro/claude-sonnet-4.5)");
    }

    const normalizedTask = task.toLowerCase().trim();
    const pins = this.loadPins();
    pins[normalizedTask] = model.trim();
    this.savePins(pins);
    logger.info(`Pinned task [${normalizedTask}] -> ${model.trim()}`);
    return { task: normalizedTask, model: model.trim() };
  }

  getPin(task) {
    if (!task) return null;
    const pins = this.loadPins();
    return pins[task.toLowerCase().trim()] || null;
  }

  removePin(task) {
    if (!task) return false;
    const normalizedTask = task.toLowerCase().trim();
    const pins = this.loadPins();
    if (pins[normalizedTask]) {
      delete pins[normalizedTask];
      this.savePins(pins);
      logger.info(`Removed pin for task [${normalizedTask}]`);
      return true;
    }
    return false;
  }

  resetPins() {
    this.savePins({});
    logger.info("Reset all task pins to default");
    return true;
  }

  listPins() {
    return this.loadPins();
  }

  getValidTasks() {
    return [...VALID_TASKS];
  }
}

const defaultTaskPinManager = new TaskPinManager();

module.exports = {
  VALID_TASKS,
  TaskPinManager,
  defaultTaskPinManager
};
