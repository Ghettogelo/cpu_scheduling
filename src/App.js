import React, { useMemo, useState } from 'react';
import {
  ALGORITHMS,
  ALGO_INFO,
  computeSchedule,
} from './algorithms/scheduling';
import ProcessInput from './components/ProcessInput';
import GanttChart from './components/GanttChart';
import ResultsTable from './components/ResultsTable';
import './App.css';

const DEFAULT_PROCESSES = [
  { id: 1, name: 'P1', arrival: 0, burst: 8, priority: 3 },
  { id: 2, name: 'P2', arrival: 1, burst: 4, priority: 1 },
  { id: 3, name: 'P3', arrival: 2, burst: 9, priority: 4 },
  { id: 4, name: 'P4', arrival: 3, burst: 5, priority: 2 },
];

function nextId(processes) {
  return processes.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

export default function App() {
  const [algorithm, setAlgorithm] = useState(ALGORITHMS.FCFS);
  const [quantum, setQuantum] = useState(2);
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES);

  const { gantt, stats, averages } = useMemo(() => {
    const normalized = processes.map((p) => ({
      ...p,
      arrival: Math.max(0, p.arrival || 0),
      burst: Math.max(1, p.burst || 1),
      priority: Math.max(1, p.priority || 1),
    }));
    return computeSchedule(algorithm, normalized, quantum || 1);
  }, [algorithm, processes, quantum]);

  const addProcess = () => {
    const id = nextId(processes);
    setProcesses([
      ...processes,
      { id, name: `P${id}`, arrival: 0, burst: 4, priority: id },
    ]);
  };

  const removeProcess = (id) => {
    setProcesses(processes.filter((p) => p.id !== id));
  };

  const info = ALGO_INFO[algorithm];

  return (
    <div className="app">
      <header className="app-header">
        <h1>CPU Scheduling Simulator</h1>
        <p>Compare FCFS, SJF, Round Robin and Priority scheduling side by side.</p>
      </header>

      <nav className="algo-tabs" role="tablist">
        {Object.values(ALGORITHMS).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={algorithm === key}
            className={`tab${algorithm === key ? ' active' : ''}`}
            onClick={() => setAlgorithm(key)}
            type="button"
          >
            <span className="tab-title">{ALGO_INFO[key].short}</span>
            <span className="tab-name">{ALGO_INFO[key].name}</span>
          </button>
        ))}
      </nav>

      <div className="card algo-info">
        <div>
          <h2>{info.name}</h2>
          <p>{info.description}</p>
        </div>
        {algorithm === ALGORITHMS.RR && (
          <div className="quantum-control">
            <label htmlFor="quantum">Time Quantum</label>
            <input
              id="quantum"
              className="input quantum-input"
              type="number"
              value={quantum}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  setQuantum('');
                  return;
                }
                const n = Number(raw);
                if (!Number.isNaN(n)) {
                  setQuantum(Math.max(1, n));
                }
              }}
            />
          </div>
        )}
      </div>

      <ProcessInput
        processes={processes}
        onChange={setProcesses}
        onAdd={addProcess}
        onRemove={removeProcess}
        algorithm={algorithm}
      />

      <GanttChart gantt={gantt} processes={processes} />

      <ResultsTable
        stats={stats}
        averages={averages}
        showPriority={algorithm === ALGORITHMS.PRIORITY}
      />
    </div>
  );
}
