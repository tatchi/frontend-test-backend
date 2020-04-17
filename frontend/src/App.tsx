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
  TooltipProps,
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

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active) {
    return (
      <div className="recharts-curve recharts-tooltip-cursor">
        <p className="desc">Anything you want can be displayed here.</p>
      </div>
    );
  }

  return null;
};

const ContentTooltip: React.FC<TooltipProps> = (props) => {
  const { active, label = '', payload = [] } = props;
  if (!active) return null;

  console.log(props);

  const total = Number(payload[0].value) + Number(payload[1].value);

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: 8,
        fontSize: 14,
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 6px 18px 0 rgba(0, 0, 0, 0.2)',
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
        {new Date(label).toString().split(' GMT')[0]}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {payload.map((data) => (
          <div key={data.name} style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: data.color, fontSize: 8, marginRight: 4 }}>
                ●
              </span>
              <span style={{ color: 'grey' }}>{data.name.toUpperCase()}:</span>
              &nbsp;
              <span style={{ color: data.color }}>{`${Number(
                data.value
              ).toFixed(2)} Gpbs`}</span>
            </div>
          </div>
        ))}
        <div
          style={{
            width: '100%',
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          <hr
            style={{
              width: '100%',
              border: 'none',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
        <div>
          <span style={{ color: 'grey' }}>Total:</span>{' '}
          <span style={{ color: 'green' }}>
            {total.toFixed(2)}
            &nbsp;Gbps
          </span>
        </div>
        <div style={{marginTop: 8}}>
          <span style={{ color: 'grey' }}>
            Spike reduction:
          </span>{' '}
          <span style={{ color: 'green' }}>
            {((Number(payload[0].value) / total) * 100).toFixed(2)}&nbsp;%
          </span>
        </div>
      </div>
    </div>
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
          <Tooltip content={<ContentTooltip />} />
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
            name="http"
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
