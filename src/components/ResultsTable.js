import React from 'react';
import { PALETTE } from '../algorithms/scheduling';
import { fmt } from './GanttChart';

export default function ResultsTable({ stats, averages, showPriority }) {
  if (!stats.length) return null;

  return (
    <div className="card">
      <h2>Results</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Process</th>
              <th>Arrival</th>
              <th>Burst</th>
              {showPriority && <th>Priority</th>}
              <th>Completion</th>
              <th>Turnaround</th>
              <th>Waiting</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr key={s.id}>
                <td>
                  <span
                    className="dot"
                    style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                  />
                  {s.name || `P${s.id}`}
                </td>
                <td>{fmt(s.arrival)}</td>
                <td>{fmt(s.burst)}</td>
                {showPriority && <td>{fmt(s.priority)}</td>}
                <td>{fmt(s.completionTime)}</td>
                <td>{fmt(s.turnaroundTime)}</td>
                <td>{fmt(s.waitingTime)}</td>
                <td>{fmt(s.responseTime)}</td>
              </tr>
            ))}
            <tr className="avg-row">
              <td>Average</td>
              <td>—</td>
              <td>—</td>
              {showPriority && <td>—</td>}
              <td>—</td>
              <td>{fmt(averages.turnaroundTime)}</td>
              <td>{fmt(averages.waitingTime)}</td>
              <td>{fmt(averages.responseTime)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
