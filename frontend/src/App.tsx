import React from 'react';
import './App.css';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchBandwidth, FetchBandwidthResponse } from './api';

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const [day] = date.toLocaleDateString().split('/');
  const [_, month] = date.toDateString().split(' ');
  return `${day}. ${month}`;
};

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dx={-30} fill="#666">
        <tspan textAnchor="middle" x="0">
          {payload.value}
        </tspan>
        {props.index > 0 && (
          <tspan textAnchor="middle" x="0" dy="20" dx={-30}>
            Gbps
          </tspan>
        )}
      </text>
    </g>
  );
};

function App() {
  const [
    bandwidth,
    setBandwidth,
  ] = React.useState<FetchBandwidthResponse | null>(null);
  React.useEffect(() => {
    fetchBandwidth({
      from: 1586072930418,
      to: 1587052130418,
    }).then(setBandwidth);
  }, []);

  const areaChartData = React.useMemo(() => {
    if (!bandwidth) return [];
    const { cdn, p2p } = bandwidth;
    const dates = new Set<string>();
    return cdn.map(([timestamp, cdn], index) => {
      const formattedDate = formatTimestamp(timestamp);
      const result = {
        timestamp,
        cdn: cdn * 1e-9,
        p2p: p2p[index][1] * 1e-9,
        date: dates.has(formattedDate) ? '' : formattedDate,
      };
      dates.add(formattedDate);
      return result;
    });
  }, [bandwidth]);

  const CustomizedXAxisTick = (props: any) => {
    const { x, y } = props;

    if (!areaChartData[props.index]?.date) {
      return null;
    }

    return (
      <>
        <line
          type="category"
          orientation="bottom"
          width="1560"
          height="30"
          x="90"
          y="270"
          className="recharts-cartesian-axis-tick-line"
          stroke="#666"
          fill="none"
          x1={x}
          y1={y - 2}
          x2={x}
          y2={y - 8}
        ></line>
        <text
          type="category"
          orientation="bottom"
          width="1560"
          height="30"
          x={x}
          y={y}
          stroke="none"
          fill="#666"
          className="recharts-text recharts-cartesian-axis-tick-value"
          text-anchor="middle"
        >
          <tspan x={x} dy={16}>
            {areaChartData[props.index].date}
          </tspan>
        </text>
      </>
    );
  };

  console.log(areaChartData);

  return (
    <div className="App" style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={areaChartData}
          margin={{
            top: 30,
            right: 30,
            left: 30,
            bottom: 0,
          }}
        >
          <XAxis
            dataKey="timestamp"
            type="category"
            interval={0}
            tickLine={false}
            tick={<CustomizedXAxisTick />}
          />
          <YAxis tick={<CustomYAxisTick />} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="cdn"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
          />
          <Area
            type="monotone"
            dataKey="p2p"
            stackId="1"
            stroke="#82ca9d"
            fill="#82ca9d"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
