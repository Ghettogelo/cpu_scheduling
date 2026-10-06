import React from 'react';
import { PALETTE } from '../algorithms/scheduling';

export default function ProcessInput({
  processes,
  onChange,
  onAdd,
  onRemove,
  algorithm,
}) {
  const priorityActive = algorithm === 'priority';

  const update = (id, field, value) => {
    onChange(
      processes.map((p) => {
        if (p.id !== id) return p;
        if (field === 'name') return { ...p, name: value };
        const n = value === '' ? '' : Number(value);
        if (field === 'arrival') return { ...p, arrival: n };
        if (field === 'burst') return { ...p, burst: n };
        if (field === 'priority') return { ...p, priority: n };
        return p;
      })
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Processes</h2>
        <button className="btn btn-primary" onClick={onAdd} type="button">
          + Add Process
        </button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Process</th>
              <th>Arrival Time</th>
              <th>Burst Time</th>
              {priorityActive && <th>Priority</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, i) => (
              <tr key={p.id}>
                <td>
                  <span
                    className="dot"
                    style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                  />
                </td>
                <td>
                  <input
                    className="input name-input"
                    value={p.name}
                    onChange={(e) => update(p.id, 'name', e.target.value)}
                    aria-label={`Process ${p.id} name`}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={p.arrival}
                    onChange={(e) => update(p.id, 'arrival', e.target.value)}
                    aria-label={`Process ${p.id} arrival time`}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={p.burst}
                    onChange={(e) => update(p.id, 'burst', e.target.value)}
                    aria-label={`Process ${p.id} burst time`}
                  />
                </td>
                {priorityActive && (
                  <td>
                    <input
                      className="input"
                      type="number"
                      value={p.priority}
                      onChange={(e) => update(p.id, 'priority', e.target.value)}
                      aria-label={`Process ${p.id} priority`}
                    />
                  </td>
                )}
                <td>
                  <button
                    className="btn-icon"
                    onClick={() => onRemove(p.id)}
                    disabled={processes.length <= 1}
                    title="Remove process"
                    aria-label={`Remove process ${p.name}`}
                    type="button"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
