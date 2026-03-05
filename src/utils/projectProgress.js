/**
 * projectProgress.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for computing project completion percentages.
 *
 * CALCULATION HIERARCHY
 * ─────────────────────
 *  Tasks       → a task is "done" when status ∈ {done, completed, blocked}
 *  Modules     → weight = completedTasks / totalTasks  (or status fallback)
 *  Milestones  → weight = avg(module weights)          (or status fallback)
 *  Project     → weight = avg(milestone weights) × 100 (rounded)
 *
 * STATUS FALLBACKS (when no children exist)
 * ─────────────────────────────────────────
 *  completed / done / approved → 100 %
 *  in-review / review          →  85 %
 *  active / in-progress        →  55 %
 *  on-hold                     →  30 %
 *  planning / pending / todo   →  10 %
 *  cancelled                   →   0 %
 *  (anything else)             →   0 %
 */

/** Turn a status string into a 0-1 weight */
export const statusToWeight = (status = '') => {
    const s = status.toLowerCase().trim();
    if (['completed', 'done', 'approved'].includes(s)) return 1.00;
    if (['in-review', 'review'].includes(s)) return 0.85;
    if (['active', 'in-progress', 'in progress'].includes(s)) return 0.55;
    if (['on-hold', 'on hold', 'paused'].includes(s)) return 0.30;
    if (['planning', 'pending', 'todo', 'not started'].includes(s)) return 0.10;
    if (['cancelled', 'canceled'].includes(s)) return 0.00;
    return 0.00;
};

/** Returns true when a task status counts as "done" */
export const isTaskDone = (status = '') => {
    return ['done', 'completed', 'approved', 'closed'].includes(status.toLowerCase().trim());
};

/**
 * Compute completion weight [0, 1] for a single module.
 * @param {object} mod      - Module object
 * @param {Array}  tasks    - Tasks belonging to this module
 */
export const computeModuleWeight = (mod, tasks = []) => {
    if (tasks.length > 0) {
        const done = tasks.filter(t => isTaskDone(t.status)).length;
        return done / tasks.length;
    }
    // Fallback to module status
    return statusToWeight(mod.status);
};

/**
 * Compute completion weight [0, 1] for a single milestone.
 * @param {object} ms       - Milestone object
 * @param {Array}  modules  - Modules belonging to this milestone (each may have .tasks[])
 */
export const computeMilestoneWeight = (ms, modules = []) => {
    if (modules.length > 0) {
        const weights = modules.map(mod => computeModuleWeight(mod, mod.tasks || []));
        return weights.reduce((a, b) => a + b, 0) / weights.length;
    }
    return statusToWeight(ms.status);
};

/**
 * Compute overall project progress [0, 100] from a list of milestones.
 *
 * @param {Array} milestones  - Array of milestone objects. Each may contain
 *                              milestone.modules[], and each module may contain
 *                              module.tasks[].
 * @param {object} project    - The project object (fallback to project.status)
 * @returns {number}          - Integer percentage 0-100
 */
export const computeProjectProgress = (milestones = [], project = null) => {
    if (milestones.length === 0) {
        // No milestone data — fall back to explicit field or status
        if (project == null) return 0;
        if (typeof project.progress === 'number' && project.progress >= 0) return project.progress;
        return Math.round(statusToWeight(project.status) * 100);
    }

    const weights = milestones.map(ms => computeMilestoneWeight(ms, ms.modules || []));
    const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
    return Math.min(100, Math.round(avg * 100));
};

/**
 * Lightweight version for project LIST pages where milestones aren't loaded.
 * Priority order:
 *  1. Computed from milestones (if inline in project object)
 *  2. project.progress (from API)
 *  3. Status-based fallback
 */
export const getDisplayProgress = (project) => {
    if (!project) return 0;

    const inlineMilestones = project.milestones || [];
    if (inlineMilestones.length > 0) {
        return computeProjectProgress(inlineMilestones, project);
    }

    if (typeof project.progress === 'number' && project.progress >= 0) {
        return project.progress;
    }

    // Status fallback
    return Math.round(statusToWeight(project.status) * 100);
};
