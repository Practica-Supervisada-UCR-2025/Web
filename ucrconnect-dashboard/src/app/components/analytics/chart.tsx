import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from "recharts";

type ChartType = "line" | "bar";

type ChartProps = {
  data: any[];
  type?: ChartType;
  xKey: string;
  yKey: string;
  color?: string;
  barColors?: string[];
  margin?: { top?: number; right?: number; left?: number; bottom?: number };
};

export default function Chart({
  data, type = "line", xKey, yKey, color = "#249dd8",
  barColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a0522d', '#00bcd4', '#ff69b4', '#7b68ee'],
  margin = { top: 20, right: 30, left: 20, bottom: 30 },
}: ChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-600">No hay datos para mostrar.</p>;
  }

  const tooltipStyle = {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '8px',
    color: '#333',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  };

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={margin}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis dataKey={xKey} stroke="#8884d8" />
          <YAxis stroke="#8884d8" />
          <Tooltip wrapperStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey={yKey}
            name="Cantidad"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={{ stroke: color, strokeWidth: 2, r: 4, fill: "white" }}
            activeDot={{ r: 6, strokeWidth: 3, stroke: color, fill: "white" }}
          />
          <Legend
            wrapperStyle={{ color: '#000' }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={margin}>
        <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
        <XAxis dataKey={xKey} stroke="#8884d8" />
        <YAxis stroke="#8884d8" />
        <Tooltip wrapperStyle={tooltipStyle} />
        <Bar dataKey={yKey} name="Cantidad">
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
          ))}
        </Bar>
        <Legend
          wrapperStyle={{ color: '#000' }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
