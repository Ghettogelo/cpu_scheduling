import React from 'react';
import { PALETTE } from '../algorithms/scheduling';

export function fmt(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export default function GanttChart({ gantt, processes }) {
  const nameOf = new Map(processes.map((p, i) => [p.id, p.name || `P${p.id}`]));
  const colorOf = new Map(processes.map((p, i) => [p.id, PALETTE[i % PALETTE.length]]));

  if (!gantt.length) {
    return (
      <div className="card">
        <h2>Gantt Chart</h2>
        <p className="empty">Add processes to see the schedule.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Gantt Chart</h2>
      <div className="gantt-scroll">
        <div className="gantt">
          <div className="gantt-row">
            {gantt.map((seg, i) => {
              const dur = seg.end - seg.start;
              const isIdle = seg.pid == null;
              return (
                <div
                  key={i}
                  className={`gantt-seg${isIdle ? ' idle' : ''}`}
                  style={{
                    flexGrow: dur,
                    minWidth: 34,
                    backgroundColor: isIdle ? undefined : colorOf.get(seg.pid),
                  }}
                  title={
                    isIdle
                      ? `Idle: ${fmt(seg.start)} → ${fmt(seg.end)}`
                      : `${nameOf.get(seg.pid)}: ${fmt(seg.start)} → ${fmt(seg.end)}`
                  }
                >
                  <span className="gantt-label">{isIdle ? 'Idle' : nameOf.get(seg.pid)}</span>
                </div>
              );
            })}
          </div>
          <div className="gantt-row gantt-axis">
            {gantt.map((seg, i) => (
              <div
                key={i}
                className="gantt-tick"
                style={{ flexGrow: seg.end - seg.start, minWidth: 34 }}
              >
                <span>{fmt(seg.start)}</span>
                {i === gantt.length - 1 && <span className="gantt-tick-end">{fmt(seg.end)}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="legend">
        {processes.map((p, i) => (
          <span key={p.id} className="legend-item">
            <span
              className="dot"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            {p.name || `P${p.id}`}
          </span>
        ))}
      </div>
    </div>
  );
}
