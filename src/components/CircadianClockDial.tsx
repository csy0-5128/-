import React from 'react';
import { CircadianPhase } from '../types';
import { minutesToTime, formatMinutesLabel } from '../utils/circadian';

interface CircadianClockDialProps {
  phases: CircadianPhase[];
  currentMinutes: number; // The active or simulated minutes (0 - 1439)
  selectedPhase: CircadianPhase;
  onSelectPhase: (phase: CircadianPhase) => void;
  isSimulating: boolean;
  onResetToLive: () => void;
}

export const CircadianClockDial: React.FC<CircadianClockDialProps> = ({
  phases,
  currentMinutes,
  selectedPhase,
  onSelectPhase,
  isSimulating,
  onResetToLive,
}) => {
  const size = 320;
  const center = size / 2;
  const outerR = 145;
  const innerR = 95;

  // Converts minutes (0-1439) to angle in radians. 00:00 is top (-PI/2)
  const minutesToRad = (min: number) => {
    const fraction = min / 1440;
    return fraction * 2 * Math.PI - Math.PI / 2;
  };

  // SVG arc path generator for annular sectors
  const getSectorPath = (startMin: number, endMin: number, rIn: number, rOut: number) => {
    let span = (endMin - startMin + 1440) % 1440;
    if (span === 0) span = 1440;

    const startAngle = minutesToRad(startMin);
    const endAngle = startAngle + (span / 1440) * 2 * Math.PI;

    const x1 = center + rOut * Math.cos(startAngle);
    const y1 = center + rOut * Math.sin(startAngle);
    const x2 = center + rOut * Math.cos(endAngle);
    const y2 = center + rOut * Math.sin(endAngle);

    const x3 = center + rIn * Math.cos(endAngle);
    const y3 = center + rIn * Math.sin(endAngle);
    const x4 = center + rIn * Math.cos(startAngle);
    const y4 = center + rIn * Math.sin(startAngle);

    const largeArcFlag = span > 720 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  };

  // Needle position
  const needleAngle = minutesToRad(currentMinutes);
  const needleOuterX = center + (outerR + 8) * Math.cos(needleAngle);
  const needleOuterY = center + (outerR + 8) * Math.sin(needleAngle);
  const needleInnerX = center + 25 * Math.cos(needleAngle);
  const needleInnerY = center + 25 * Math.sin(needleAngle);

  // Hour tick marks (0, 3, 6, 9, 12, 15, 18, 21)
  const hourTicks = [
    { hour: 0, label: '00시' },
    { hour: 3, label: '03' },
    { hour: 6, label: '06시' },
    { hour: 9, label: '09' },
    { hour: 12, label: '12시' },
    { hour: 15, label: '15' },
    { hour: 18, label: '18시' },
    { hour: 21, label: '21' },
  ];

  // Sector color palette (soft, organic, science-grade)
  const getPhaseFill = (p: CircadianPhase, isSelected: boolean) => {
    switch (p.id) {
      case 'wake_cortisol':
        return isSelected ? '#fbbf24' : '#fef3c7'; // amber
      case 'digest_nutrition':
        return isSelected ? '#34d399' : '#d1fae5'; // emerald
      case 'cognitive_peak':
        return isSelected ? '#818cf8' : '#e0e7ff'; // indigo
      case 'lunch_glycemic_walk':
        return isSelected ? '#2dd4bf' : '#ccfbf1'; // teal
      case 'caffeine_cutoff':
        return isSelected ? '#f59e0b' : '#fef3c7'; // amber dark
      case 'physical_peak':
        return isSelected ? '#fb7185' : '#ffe4e6'; // rose
      case 'dinner_winddown':
        return isSelected ? '#a78bfa' : '#ede9fe'; // violet
      case 'melatonin_prep':
        return isSelected ? '#60a5fa' : '#dbeafe'; // blue
      case 'deep_sleep_recovery':
        return isSelected ? '#64748b' : '#e2e8f0'; // slate
      default:
        return '#f1f5f9';
    }
  };

  const getPhaseStroke = (p: CircadianPhase, isSelected: boolean) => {
    return isSelected ? '#0f172a' : '#cbd5e1';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full select-none cursor-pointer drop-shadow-xs"
        >
          <defs>
            <radialGradient id="dialBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="85%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </radialGradient>
            <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#059669" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background circle */}
          <circle cx={center} cy={center} r={outerR + 2} fill="url(#dialBg)" stroke="#e2e8f0" strokeWidth="1" />

          {/* Phase annular sectors */}
          {phases.map((p) => {
            const isSelected = selectedPhase.id === p.id;
            return (
              <path
                key={p.id}
                d={getSectorPath(p.startMinutes, p.endMinutes, innerR, outerR)}
                fill={getPhaseFill(p, isSelected)}
                stroke={getPhaseStroke(p, isSelected)}
                strokeWidth={isSelected ? 2.5 : 1}
                className="transition-all duration-200 hover:opacity-90"
                onClick={() => onSelectPhase(p)}
              >
                <title>{`${p.title} (${p.timeRange})`}</title>
              </path>
            );
          })}

          {/* Inner circle mask */}
          <circle cx={center} cy={center} r={innerR - 1} fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />

          {/* Hour tick marks & labels */}
          {hourTicks.map((tick) => {
            const rad = minutesToRad(tick.hour * 60);
            const textR = outerR - 16;
            const tx = center + textR * Math.cos(rad);
            const ty = center + textR * Math.sin(rad);

            return (
              <g key={tick.hour}>
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[10px] font-mono font-semibold fill-slate-700 pointer-events-none select-none"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Live Needle line */}
          <line
            x1={needleInnerX}
            y1={needleInnerY}
            x2={needleOuterX}
            y2={needleOuterY}
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#needleGlow)"
            className="transition-all duration-300"
          />

          {/* Needle Outer Pointer Dot */}
          <circle
            cx={needleOuterX}
            cy={needleOuterY}
            r="4.5"
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Center Hub */}
          <circle cx={center} cy={center} r="26" fill="#0f172a" />
          <circle cx={center} cy={center} r="8" fill="#10b981" />
        </svg>

        {/* Center Text Info Overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ padding: '75px' }}
        >
          <div className="text-[11px] font-mono text-slate-500 font-medium">
            {formatMinutesLabel(currentMinutes)}
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900 mt-0.5">
            {minutesToTime(currentMinutes)}
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 mt-1 text-center line-clamp-1 max-w-[130px]">
            {selectedPhase.tag}
          </div>
        </div>
      </div>

      {/* Dial Legend & Reset Button */}
      <div className="flex items-center justify-between w-full max-w-xs mt-2 px-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-[11px]">
            {isSimulating ? '탐색 시뮬레이션 모드' : '실시간 생체 시계'}
          </span>
        </div>
        {isSimulating && (
          <button
            onClick={onResetToLive}
            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium underline"
          >
            현재 시각으로 복귀
          </button>
        )}
      </div>
    </div>
  );
};
