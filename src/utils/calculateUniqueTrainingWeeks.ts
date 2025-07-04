import { Intern } from '../types';

export const calculateUniqueTrainingWeeks = (interns: Intern[]): number => {
  if (!interns.length) return 0;

  // Collect all periods from internshipFields
  const periods = interns
    .flatMap((intern) =>
      intern.internshipFields
        .filter((field) => field.startDate && field.endDate) // Only include fields with both dates
        .map((field) => ({
          start: new Date(field.startDate),
          end: new Date(field.endDate!),
        }))
    );

  if (!periods.length) return 0;

  // Sort periods by start date
  periods.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Merge overlapping periods
  const mergedPeriods = [];
  let currentPeriod = periods[0];

  for (let i = 1; i < periods.length; i++) {
    if (currentPeriod.end >= periods[i].start) {
      // Overlapping period, extend the end date if necessary
      currentPeriod.end = new Date(
        Math.max(currentPeriod.end.getTime(), periods[i].end.getTime())
      );
    } else {
      // Non-overlapping period, add current to merged and start new
      mergedPeriods.push(currentPeriod);
      currentPeriod = periods[i];
    }
  }
  mergedPeriods.push(currentPeriod);

  // Calculate total weeks
  const totalDays = mergedPeriods.reduce((acc, period) => {
    const days = (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24);
    return acc + days;
  }, 0);

  // Convert days to weeks (rounded up)
  return Math.ceil(totalDays / 7);
};