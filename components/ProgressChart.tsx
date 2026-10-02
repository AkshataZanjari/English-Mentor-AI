"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ProgressChart({ data }: { data: { name: string; score: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
        <XAxis dataKey="name" stroke="#ddd" />
        <YAxis stroke="#ddd" allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#a855f7"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}