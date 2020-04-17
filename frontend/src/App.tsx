import React from 'react';
import './App.css';
import {
  AreaChart,
  Area,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import {
  fetchBandwidth,
  FetchBandwidthResponse,
  fetchAggregatedBandwidth,
} from './api';

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
  const [maxBandwidth, setMaxBandwidth] = React.useState<{
    cdn: number;
    p2p: number;
  } | null>(null);
  React.useEffect(() => {
    Promise.all([
      fetchBandwidth({
        from: 1586072930418,
        to: 1587052130418,
      }),
      fetchAggregatedBandwidth({
        from: 1586072930418,
        to: 1587052130418,
        aggregate: 'max',
      }),
    ]).then(([bandwidth, maxBandwidth]) => {
      setBandwidth(bandwidth);
      setMaxBandwidth({
        cdn: maxBandwidth.cdn * 1e-9,
        p2p: maxBandwidth.p2p * 1e-9,
      });
    });
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
          textAnchor="middle"
        >
          <tspan x={x} dy={16}>
            {areaChartData[props.index].date}
          </tspan>
        </text>
      </>
    );
  };

  console.log(maxBandwidth?.cdn);

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
            dataKey="p2p"
            stackId="2"
            stroke="#40A3D4"
            strokeWidth={2}
            fill="#6AB8DD"
          />
          <Area
            type="monotone"
            dataKey="cdn"
            stackId="1"
            stroke="#B2125C"
            strokeWidth={2}
            fill="#C54D85"
          />
          <ReferenceLine
            y={maxBandwidth?.cdn}
            stroke="#B2125C"
            strokeDasharray="5 3"
            strokeWidth={2}
          >
            <Label position="insideLeft" dy={-10} fontSize={14}>
              {`Maximum CDN contribution: ${maxBandwidth?.cdn.toFixed(2)} Gbps`}
            </Label>
          </ReferenceLine>
          <ReferenceLine
            y={maxBandwidth?.p2p}
            stroke="green"
            strokeDasharray="5 3"
            strokeWidth={2}
            position="start"
          >
            <Label position="insideRight" dy={-10} fontSize={14}>
              {`Maximum throughput: ${maxBandwidth?.p2p.toFixed(2)} Gbps`}
            </Label>
          </ReferenceLine>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;
