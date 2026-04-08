import { Module, Developer, Phase } from '../../types';
import { addDays, daysBetween } from '../../utils/dates';

interface CalendarHeatMapProps {
  modules: Module[];
  developers: [Developer, Developer];
  phases: Phase[];
  projectStartDate: string;
}

export default function CalendarHeatMap({ modules, developers, phases, projectStartDate }: CalendarHeatMapProps) {
  if (phases.length === 0) return null;

  const projectEndDate = phases[phases.length - 1].endDate;
  const totalDays = daysBetween(projectStartDate, projectEndDate) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  const CELL_SIZE = 16;
  const CELL_GAP = 2;
  const DAY_LABELS_WIDTH = 20;
  const DEV_LABEL_HEIGHT = 24;

  // Build density maps per developer
  const densityMaps = developers.map((dev) => {
    const devModules = modules.filter((m) => m.assignedTo === dev.id);
    const days: number[] = new Array(totalDays).fill(0);

    devModules.forEach((m) => {
      if (!m.startDate || !m.dueDate) return;
      const start = Math.max(0, daysBetween(projectStartDate, m.startDate));
      const end = Math.min(totalDays - 1, daysBetween(projectStartDate, m.dueDate));
      for (let d = start; d <= end; d++) {
        days[d]++;
      }
    });

    return { dev, days };
  });

  const maxDensity = Math.max(...densityMaps.flatMap((d) => d.days), 1);
  const svgWidth = DAY_LABELS_WIDTH + totalWeeks * (CELL_SIZE + CELL_GAP);
  const devBlockHeight = 7 * (CELL_SIZE + CELL_GAP) + DEV_LABEL_HEIGHT;

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Activity Heat Map</h3>

      <div className="overflow-x-auto">
        <svg width={svgWidth} height={densityMaps.length * devBlockHeight + 20}>
          {densityMaps.map(({ dev, days }, devIndex) => {
            const yOffset = devIndex * devBlockHeight;

            return (
              <g key={dev.id}>
                {/* Developer label */}
                <text x={0} y={yOffset + 14} className="text-[11px] font-medium" fill={dev.color}>
                  {dev.name}
                </text>

                {/* Calendar grid */}
                {days.map((density, dayIndex) => {
                  const week = Math.floor(dayIndex / 7);
                  const dayOfWeek = dayIndex % 7;
                  const x = DAY_LABELS_WIDTH + week * (CELL_SIZE + CELL_GAP);
                  const y = yOffset + DEV_LABEL_HEIGHT + dayOfWeek * (CELL_SIZE + CELL_GAP);
                  const opacity = density > 0 ? 0.2 + (density / maxDensity) * 0.8 : 0.05;

                  return (
                    <rect
                      key={dayIndex}
                      x={x}
                      y={y}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      rx={3}
                      fill={dev.color}
                      opacity={opacity}
                    >
                      <title>
                        {addDays(projectStartDate, dayIndex)}: {density} module{density !== 1 ? 's' : ''} active
                      </title>
                    </rect>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
