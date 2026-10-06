export const ALGORITHMS = {
  FCFS: 'fcfs',
  SJF: 'sjf',
  RR: 'rr',
  PRIORITY: 'priority',
};

export const ALGO_INFO = {
  [ALGORITHMS.FCFS]: {
    name: 'First-Come, First-Served',
    short: 'FCFS',
    description:
      'Runs tasks in the exact order they arrive. Simple and fair, but a long job can hold up everyone behind it (convoy effect).',
  },
  [ALGORITHMS.SJF]: {
    name: 'Shortest Job First',
    short: 'SJF',
    description:
      'Runs the ready task with the shortest execution time next. Provably optimal average waiting time, but requires knowing burst times in advance.',
  },
  [ALGORITHMS.RR]: {
    name: 'Round Robin',
    short: 'RR',
    description:
      'Gives each ready task a small, equal slice of CPU time (quantum) before switching to the next. Balances responsiveness and fairness.',
  },
  [ALGORITHMS.PRIORITY]: {
    name: 'Priority Scheduling',
    short: 'Priority',
    description:
      'Assigns a rank to each task and runs the most important ones first. Lower number = higher priority.',
  },
};

export const PALETTE = [
  '#6366f1',
  '#22d3ee',
  '#f59e0b',
  '#34d399',
  '#f472b6',
  '#a78bfa',
  '#fb7185',
  '#facc15',
  '#4ade80',
  '#38bdf8',
  '#e879f9',
  '#f97316',
];

function buildStats(processes, gantt) {
  const firstStart = {};
  const completion = {};
  for (const seg of gantt) {
    if (seg.pid == null) continue;
    if (!(seg.pid in firstStart)) firstStart[seg.pid] = seg.start;
    completion[seg.pid] = seg.end;
  }
  return processes.map((p) => {
    const ct = completion[p.id];
    const tat = ct - p.arrival;
    return {
      ...p,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: tat - p.burst,
      responseTime: firstStart[p.id] - p.arrival,
    };
  });
}

export function fcfs(processes) {
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival || a.id - b.id);
  const gantt = [];
  let time = 0;
  for (const p of sorted) {
    if (time < p.arrival) {
      gantt.push({ pid: null, start: time, end: p.arrival });
      time = p.arrival;
    }
    gantt.push({ pid: p.id, start: time, end: time + p.burst });
    time += p.burst;
  }
  return { gantt, stats: buildStats(processes, gantt) };
}

function readyAt(remaining, time) {
  return remaining.filter((p) => p.burst > 0 && p.arrival <= time);
}

function nextArrivalTime(remaining) {
  return Math.min(...remaining.filter((p) => p.burst > 0).map((p) => p.arrival));
}

export function sjf(processes) {
  const remaining = processes.map((p) => ({ ...p }));
  const gantt = [];
  let time = 0;
  let completed = 0;
  const n = processes.length;
  while (completed < n) {
    const available = readyAt(remaining, time);
    if (available.length === 0) {
      const nextArrival = nextArrivalTime(remaining);
      gantt.push({ pid: null, start: time, end: nextArrival });
      time = nextArrival;
      continue;
    }
    available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival || a.id - b.id);
    const p = available[0];
    gantt.push({ pid: p.id, start: time, end: time + p.burst });
    time += p.burst;
    p.burst = 0;
    completed++;
  }
  return { gantt, stats: buildStats(processes, gantt) };
}

export function roundRobin(processes, quantum) {
  const q = Math.max(1, Math.floor(quantum));
  const remaining = processes.map((p) => ({ ...p, remainingBurst: p.burst }));
  const byArrival = [...remaining].sort((a, b) => a.arrival - b.arrival || a.id - b.id);
  const gantt = [];
  const queue = [];
  let time = 0;
  let idx = 0;
  let completed = 0;
  const n = processes.length;
  while (completed < n) {
    while (idx < n && byArrival[idx].arrival <= time) {
      queue.push(byArrival[idx]);
      idx++;
    }
    if (queue.length === 0) {
      const nextArrival = byArrival[idx].arrival;
      gantt.push({ pid: null, start: time, end: nextArrival });
      time = nextArrival;
      continue;
    }
    const p = queue.shift();
    const run = Math.min(q, p.remainingBurst);
    gantt.push({ pid: p.id, start: time, end: time + run });
    time += run;
    p.remainingBurst -= run;
    while (idx < n && byArrival[idx].arrival <= time) {
      queue.push(byArrival[idx]);
      idx++;
    }
    if (p.remainingBurst > 0) {
      queue.push(p);
    } else {
      completed++;
    }
  }
  return { gantt, stats: buildStats(processes, gantt) };
}

export function priorityScheduling(processes) {
  const remaining = processes.map((p) => ({ ...p }));
  const gantt = [];
  let time = 0;
  let completed = 0;
  const n = processes.length;
  while (completed < n) {
    const available = readyAt(remaining, time);
    if (available.length === 0) {
      const nextArrival = nextArrivalTime(remaining);
      gantt.push({ pid: null, start: time, end: nextArrival });
      time = nextArrival;
      continue;
    }
    available.sort(
      (a, b) => a.priority - b.priority || a.arrival - b.arrival || a.id - b.id
    );
    const p = available[0];
    gantt.push({ pid: p.id, start: time, end: time + p.burst });
    time += p.burst;
    p.burst = 0;
    completed++;
  }
  return { gantt, stats: buildStats(processes, gantt) };
}

export function computeSchedule(algorithm, processes, quantum) {
  let result;
  switch (algorithm) {
    case ALGORITHMS.SJF:
      result = sjf(processes);
      break;
    case ALGORITHMS.RR:
      result = roundRobin(processes, quantum);
      break;
    case ALGORITHMS.PRIORITY:
      result = priorityScheduling(processes);
      break;
    case ALGORITHMS.FCFS:
    default:
      result = fcfs(processes);
  }
  const stats = result.stats;
  const count = stats.length || 1;
  const sum = (key) => stats.reduce((acc, s) => acc + s[key], 0);
  return {
    gantt: result.gantt,
    stats,
    averages: {
      turnaroundTime: sum('turnaroundTime') / count,
      waitingTime: sum('waitingTime') / count,
      responseTime: sum('responseTime') / count,
    },
  };
}
