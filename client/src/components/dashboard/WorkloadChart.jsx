import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function WorkloadChart({ workload = [] }) {
  if (!workload || workload.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-center items-center h-64 text-zinc-500">
        <p className="text-xs font-medium">No team workload data yet</p>
      </div>
    );
  }

  const data = workload.map((member) => ({
    name: member.name.split(' ')[0],
    fullName: member.name,
    'Open Tasks': member.openIssues || 0,
    'Completed': member.completedIssues || 0,
  }));

  const totalAssigned = data.reduce(
    (acc, m) => acc + m['Open Tasks'] + m['Completed'],
    0
  );

  if (totalAssigned === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-center items-center h-64 text-zinc-500">
        <p className="text-xs font-medium">All project tasks currently unassigned</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Team Workload Distribution</h3>
        <span className="text-[11px] text-zinc-500 font-mono">
          {workload.length} Member{workload.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                borderColor: '#27272a',
                borderRadius: '6px',
                color: '#f4f4f5',
                fontSize: '12px',
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-zinc-400 font-medium">{value}</span>
              )}
            />
            <Bar dataKey="Open Tasks" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Completed" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
