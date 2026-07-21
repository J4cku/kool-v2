type ImagePairSide = 'before' | 'after';

export function createImagePairLoadTracker() {
  const loaded = new Set<ImagePairSide>();
  let ready = false;

  return {
    markLoaded(side: ImagePairSide) {
      if (ready) return false;

      loaded.add(side);
      if (loaded.size < 2) return false;

      ready = true;
      return true;
    },
  };
}
