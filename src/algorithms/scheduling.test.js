import {
  ALGORITHMS,
  computeSchedule,
} from './scheduling';

const processes = [
  { id: 1, name: 'P1', arrival: 0, burst: 8, priority: 3 },
  { id: 2, name: 'P2', arrival: 1, burst: 4, priority: 1 },
  { id: 3, name: 'P3', arrival: 2, burst: 9, priority: 4 },
  { id: 4, name: 'P4', arrival: 3, burst: 5, priority: 2 },
];

describe('FCFS', () => {
  const { gantt, stats, averages } = computeSchedule(ALGORITHMS.FCFS, processes, 2);

  test('runs processes in arrival order', () => {
    expect(gantt.map((s) => s.pid)).toEqual([1, 2, 3, 4]);
  });

  test('computes completion times', () => {
    expect(stats.map((s) => s.completionTime)).toEqual([8, 12, 21, 26]);
  });

  test('computes waiting times', () => {
    expect(stats.map((s) => s.waitingTime)).toEqual([0, 7, 10, 18]);
  });

  test('computes response times', () => {
    expect(stats.map((s) => s.responseTime)).toEqual([0, 7, 10, 18]);
  });

  test('computes average waiting time', () => {
    expect(averages.waitingTime).toBeCloseTo(8.75);
  });
});

describe('SJF (non-preemptive)', () => {
  const { gantt, stats, averages } = computeSchedule(ALGORITHMS.SJF, processes, 2);

  test('picks shortest ready job next', () => {
    expect(gantt.map((s) => s.pid)).toEqual([1, 2, 4, 3]);
  });

  test('computes waiting times', () => {
    expect(stats.map((s) => s.waitingTime)).toEqual([0, 7, 15, 9]);
  });

  test('has lower average waiting time than FCFS', () => {
    expect(averages.waitingTime).toBeCloseTo(7.75);
  });
});

describe('Round Robin (quantum = 2)', () => {
  const { gantt, stats, averages } = computeSchedule(ALGORITHMS.RR, processes, 2);

  test('cycles through ready processes in quantum slices', () => {
    expect(gantt.map((s) => s.pid)).toEqual([
      1, 2, 3, 1, 4, 2, 3, 1, 4, 3, 1, 4, 3, 3,
    ]);
  });

  test('computes completion times', () => {
    expect(stats.map((s) => s.completionTime)).toEqual([22, 12, 26, 23]);
  });

  test('computes response times', () => {
    expect(stats.map((s) => s.responseTime)).toEqual([0, 1, 2, 5]);
  });

  test('computes average waiting time', () => {
    expect(averages.waitingTime).toBeCloseTo(12.75);
  });
});

describe('Priority (lower number = higher priority)', () => {
  const { gantt, stats } = computeSchedule(ALGORITHMS.PRIORITY, processes, 2);

  test('runs highest priority ready process next', () => {
    expect(gantt.map((s) => s.pid)).toEqual([1, 2, 4, 3]);
  });

  test('computes waiting times', () => {
    expect(stats.map((s) => s.waitingTime)).toEqual([0, 7, 15, 9]);
  });
});

describe('edge cases', () => {
  test('handles gaps between arrivals as idle time', () => {
    const sparse = [
      { id: 1, name: 'P1', arrival: 0, burst: 3, priority: 1 },
      { id: 2, name: 'P2', arrival: 10, burst: 2, priority: 1 },
    ];
    const { gantt, stats } = computeSchedule(ALGORITHMS.FCFS, sparse, 2);
    expect(gantt).toEqual([
      { pid: 1, start: 0, end: 3 },
      { pid: null, start: 3, end: 10 },
      { pid: 2, start: 10, end: 12 },
    ]);
    expect(stats[1].waitingTime).toBe(0);
  });

  test('handles processes arriving at the same time', () => {
    const sameTime = [
      { id: 1, name: 'P1', arrival: 0, burst: 5, priority: 2 },
      { id: 2, name: 'P2', arrival: 0, burst: 5, priority: 1 },
    ];
    const { gantt } = computeSchedule(ALGORITHMS.PRIORITY, sameTime, 2);
    expect(gantt[0].pid).toBe(2);
    expect(gantt[1].pid).toBe(1);
  });
});
