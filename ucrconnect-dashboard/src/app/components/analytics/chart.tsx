import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

type ChartType = "line" | "bar";

type ChartProps = {
  data: any;
  type?: ChartType;
  xKey: string;
  yKey: string;
  color?: string;
};

export default function Chart({
  data,
  type = "line",
  xKey,
  yKey,
  color = "#249dd8",
}: ChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-600">No hay datos para mostrar.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {type === "line" ? (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={yKey} fill={color} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}