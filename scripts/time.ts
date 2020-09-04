export function ticksToTime(ticks: number): string {
  const dsecs = ticks / 100;
  const secs = Math.floor(dsecs / 10);
  const minuts = Math.floor(secs / 60);
  const seconds = Math.floor(secs - minuts * 60);
  const dseconds = Math.floor(dsecs % 10);
  return `${minuts}:${seconds.toString().padStart(2, '0')}.${dseconds}`;
}