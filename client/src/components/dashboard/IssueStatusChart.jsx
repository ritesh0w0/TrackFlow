import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  TODO: '#71717a',
  IN_PROGRESS: '#f59e0b',
  DONE: '#10b981',
};

export default function IssueStatusChart({ stats }) {
  if (!stats) return null;

  const data = [
    { name: 'To Do', value: stats.todo || 0, key: 'TODO' },
    { name: 'In Progress', value: stats.inProgress || 0, key: 'IN_PROGRESS' },
    { name: 'Done', value: stats.done || 0, key: 'DONE' },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-center items-center h-64 text-zinc-500">
        <p className="text-xs font-medium">No issue status data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3 shadow-xs">
      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Status Distribution</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={COLORS[entry.key]} />
              ))}
            </Pie>
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
              formatter={(value) => <span className="text-xs text-zinc-400 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
