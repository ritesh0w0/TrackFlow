import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PRIORITY_COLORS = {
  Critical: '#f43f5e',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#71717a',
};

export default function PriorityChart({ priority }) {
  if (!priority) return null;

  const data = [
    { name: 'Critical', value: priority.critical || 0 },
    { name: 'High', value: priority.high || 0 },
    { name: 'Medium', value: priority.medium || 0 },
    { name: 'Low', value: priority.low || 0 },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-center items-center h-64 text-zinc-500">
        <p className="text-xs font-medium">No priority distribution data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3 shadow-xs">
      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Priority Breakdown</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
