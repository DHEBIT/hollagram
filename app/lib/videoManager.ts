const activeVideos = new Set<HTMLVideoElement>();

export function registerVideo(el: HTMLVideoElement) {
  activeVideos.add(el);
}

export function unregisterVideo(el: HTMLVideoElement) {
  activeVideos.delete(el);
}

export function pauseOtherVideos(current: HTMLVideoElement) {
  activeVideos.forEach((video) => {
    if (video !== current && !video.paused) {
      video.pause();
    }
  });
}