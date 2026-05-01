/*
 Centralizes article-related logic to ensure consistent data handling across the app.
 */

/*
 Normalizes different API response structures into a single article object.
 */
export function getArticleFromResponse(response) {
  return response?.data ?? response?.article ?? response ?? null;
}

/*
 Standardizes date formatting for native HTML date inputs (YYYY-MM-DD).
 */
export function formatDateToInput(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
 Formats a date string for HTML time input (HH:MM).
 */
export function formatTimeToInput(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

/*
 Converts a 24-hour HH:MM string to a 12-hour string with AM/PM.
 */
export function to12Hour(hhmm) {
  if (!hhmm) return "";

  const parts = hhmm.split(":");
  if (parts.length !== 2) return "";

  const [hh, mm] = parts.map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return "";

  const period = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;

  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
}

/*
 Converts 12-hour components to a 24-hour HH:MM string.
 */
export function to24Hour(hour12, minute, period) {
  let hours = parseInt(hour12, 10);
  const minutes = parseInt(minute, 10);

  if (period === "AM") {
    if (hours === 12) hours = 0;
  } else if (hours !== 12) {
    hours += 12;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/*
 Formats a date string from YYYY-MM-DD to MM/DD/YYYY.
 */
export function formatDateMMDDYYYY(yyyyMmDd) {
  if (!yyyyMmDd) return "";

  const parts = yyyyMmDd.split("-");
  if (parts.length !== 3) return "";

  const [year, month, day] = parts;
  return `${month}/${day}/${year}`;
}

/*
 Pads a value with a leading zero if it's less than 10.
 */
export function pad2(value) {
  return String(value).padStart(2, "0");
}

/*
 Formats a date string to a human-readable full date (e.g., Monday, January 1, 2024).
 */
export function formatFullDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/*
 Formats a date string to a human-readable time (e.g., 12:00 PM).
 */
export function formatFullTime(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
