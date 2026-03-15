import { getScoreColor } from '../utils/helpers';

export default function ScoreCircle({ score, size = 120, label }) {
  const numScore = typeof score === 'number' ? score : parseInt(score) || 0;
  const clampedScore = Math.max(0, Math.min(100, numScore));
  const color = getScoreColor(clampedScore);
  
  const strokeWidth = size > 100 ? 8 : 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedScore / 100) * circumference;
  const center = size / 2;
  
  const fontSize = size > 100 ? 'text-3xl' : size > 70 ? 'text-xl' : 'text-lg';

  return (
    <div className="score-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
            filter: `drop-shadow(0 0 6px ${color}40)`
          }}
        />
      </svg>
      <div className="score-value flex flex-col items-center">
        <span className={`${fontSize} font-extrabold`} style={{ 
          fontFamily: 'var(--font-heading)',
          color
        }}>
          {clampedScore}
        </span>
        {label && (
          <span className="text-xs" style={{ 
            color: 'var(--color-text-dim)',
            fontFamily: 'var(--font-mono)',
            WebkitTextFillColor: 'var(--color-text-dim)'
          }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
