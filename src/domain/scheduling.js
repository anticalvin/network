export function isActiveWindow(item, now = new Date(), timezone = "UTC") {
  if (!item || item.status !== "published") return false;
  const time = now.getTime();
  if (item.startAt && time < new Date(item.startAt).getTime()) return false;
  if (item.endAt && time >= new Date(item.endAt).getTime()) return false;
  if (!item.recurrence) return true;
  const parts = zonedParts(now, timezone);
  if (item.recurrence.days?.length && !item.recurrence.days.includes(parts.weekday)) return false;
  const minutes = parts.hour * 60 + parts.minute;
  return minutes >= parseTime(item.recurrence.start) && minutes < parseTime(item.recurrence.end);
}

export function eligibleTransmission(item, context) {
  if (!isActiveWindow(item, context.now, context.timezone)) return false;
  if (context.mobile && !item.mobileEligible) return false;
  if (!context.mobile && !item.desktopEligible) return false;
  if (item.routes?.length && !item.routes.includes(context.route)) return false;
  const record = context.dismissals?.[item.id];
  if (record?.dismissed && item.dismissal !== "session") return false;
  const shown = context.displayCounts?.[item.id] || 0;
  return shown < (item.frequency?.maxDisplays ?? 1);
}

export function selectTransmissions(items, context, limit = 1) {
  return items.filter((item) => eligibleTransmission(item, context)).sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, limit);
}

function parseTime(value = "00:00") {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function zonedParts(date, timezone) {
  const fields = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (type) => fields.find((field) => field.type === type)?.value;
  return { weekday: get("weekday"), hour: Number(get("hour")), minute: Number(get("minute")) };
}
