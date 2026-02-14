export default function getTimeAgo(
  dateInput: string | number | Date | null | undefined,
) {
  if (!dateInput) return "";

  const past: Date = new Date(dateInput);
  const now: Date = new Date();

  if (isNaN(past.getTime())) return "";

  const diffInSeconds: number = Math.floor(
    (now.getTime() - past.getTime()) / 1000,
  );

  if (diffInSeconds < 60) return "agora mesmo";

  const diffInMinutes: number = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `há ${diffInMinutes} min`;

  const diffInHours: number = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há ${diffInHours} h`;

  const diffInDays: number = Math.floor(diffInHours / 24);
  return `há ${diffInDays} dia(s)`;
}
