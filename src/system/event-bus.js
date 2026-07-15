export const AWAKEN_EVENTS = Object.freeze({
  APP_OPENED: "awaken:app-opened",
  APP_CLOSED: "awaken:app-closed",
  FILE_OPENED: "awaken:file-opened",
  FILE_SAVED: "awaken:file-saved",
  MEDIA_STARTED: "awaken:media-started",
  MEDIA_PAUSED: "awaken:media-paused",
  MEDIA_STOPPED: "awaken:media-stopped",
  USER_ACTIVE: "awaken:user-active",
  USER_IDLE: "awaken:user-idle",
  USER_RETURNED: "awaken:user-returned",
  TRANSMISSION_SHOWN: "awaken:transmission-shown",
  TRANSMISSION_DISMISSED: "awaken:transmission-dismissed",
  TRANSMISSION_ACTION: "awaken:transmission-action",
  CONTENT_UPDATED: "awaken:content-updated",
  FILESYSTEM_UPDATED: "awaken:filesystem-updated",
  MIND_UPDATED: "awaken:mind-updated",
  CONNECTION_CHANGED: "awaken:connection-changed",
  ADS_SCHEDULE: "ads:schedule",
  ADS_SPAWN: "ads:spawn",
  ADS_CLOSE: "ads:close",
  ADS_ACTION: "ads:action",
  MEMORY_RECOVER_REQUESTED: "memory:recover-requested",
  MEMORY_RECOVER_COMPLETED: "memory:recover-completed",
  MEMORY_RECOVER_FAILED: "memory:recover-failed",
  INTRUSION_START: "intrusion:start",
  INTRUSION_STAGE: "intrusion:stage",
  INTRUSION_CANCEL: "intrusion:cancel",
  INTRUSION_COMPLETE: "intrusion:complete",
  GALLERY_OPEN: "gallery:open",
  GALLERY_SAVE: "gallery:save",
  GALLERY_SAVED: "gallery:saved",
  GALLERY_DIRTY_STATE: "gallery:dirty-state",
  FILESYSTEM_FILE_CREATED: "filesystem:file-created",
  MEDIA_OPEN: "media:open",
  MEDIA_PLAY: "media:play",
  MEDIA_PAUSE: "media:pause",
  MEDIA_STOP: "media:stop"
});

export class EventBus {
  constructor(target = new EventTarget()) {
    this.target = target;
  }

  emit(type, payload = {}) {
    this.target.dispatchEvent(new CustomEvent(type, { detail: payload }));
  }

  on(type, callback) {
    const handler = (event) => callback(event.detail, event);
    this.target.addEventListener(type, handler);
    return () => this.target.removeEventListener(type, handler);
  }
}

export const awakenBus = new EventBus(globalThis);
