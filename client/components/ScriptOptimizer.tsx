import { useEffect } from "react";

export const ScriptOptimizer = () => {
  useEffect(() => {
    // Remove unused scripts and optimize loading
    const optimizeScripts = () => {
      // Remove any non-essential scripts on initial load
      const scripts = document.querySelectorAll("script[data-non-critical]");
      scripts.forEach((script) => script.remove());

      // Defer heavy libraries until needed
      const deferLoadLibraries = () => {
        // Chart.js and other heavy libraries will be loaded only when admin is accessed
        if (window.location.pathname.includes("/admin")) {
          import("chart.js").then(() => {
            console.log("Chart.js loaded for admin");
          });
        }
      };

      // Use idle callback to defer non-critical tasks
      if ("requestIdleCallback" in window) {
        requestIdleCallback(deferLoadLibraries, { timeout: 5000 });
      } else {
        setTimeout(deferLoadLibraries, 1000);
      }
    };

    if (document.readyState === "complete") {
      optimizeScripts();
    } else {
      window.addEventListener("load", optimizeScripts);
    }

    return () => {
      window.removeEventListener("load", optimizeScripts);
    };
  }, []);

  return null;
};

// Component to handle forced reflow optimization
export const ReflowOptimizer = () => {
  useEffect(() => {
    // Batch DOM reads and writes to prevent forced reflow
    let readQueue: Array<() => void> = [];
    let writeQueue: Array<() => void> = [];
    let isScheduled = false;

    const scheduleUpdate = () => {
      if (!isScheduled) {
        isScheduled = true;
        requestAnimationFrame(() => {
          // Batch all DOM reads first
          readQueue.forEach((read) => read());
          readQueue = [];

          // Then batch all DOM writes
          writeQueue.forEach((write) => write());
          writeQueue = [];

          isScheduled = false;
        });
      }
    };

    // Expose batching functions globally for components to use
    (window as any).batchDOMRead = (fn: () => void) => {
      readQueue.push(fn);
      scheduleUpdate();
    };

    (window as any).batchDOMWrite = (fn: () => void) => {
      writeQueue.push(fn);
      scheduleUpdate();
    };

    return () => {
      delete (window as any).batchDOMRead;
      delete (window as any).batchDOMWrite;
    };
  }, []);

  return null;
};
