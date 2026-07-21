type OverflowTarget = {
  style: {
    overflow: string;
  };
};

export function createScrollLockManager(root: OverflowTarget, body: OverflowTarget) {
  let activeLocks = 0;
  let rootOverflow = '';
  let bodyOverflow = '';

  return {
    acquire() {
      if (activeLocks === 0) {
        rootOverflow = root.style.overflow;
        bodyOverflow = body.style.overflow;
        root.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
      }

      activeLocks += 1;
      let released = false;

      return () => {
        if (released) return;

        released = true;
        activeLocks -= 1;

        if (activeLocks === 0) {
          root.style.overflow = rootOverflow;
          body.style.overflow = bodyOverflow;
        }
      };
    },
  };
}

let documentScrollLockManager: ReturnType<typeof createScrollLockManager> | undefined;

export function acquireDocumentScrollLock() {
  if (typeof document === 'undefined') return () => {};

  documentScrollLockManager ??= createScrollLockManager(
    document.documentElement,
    document.body,
  );

  return documentScrollLockManager.acquire();
}
