import * as React from 'react';
import './App.css';
import 'react-day-picker/lib/style.css';
import {
  AreaChart,
  Area,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  ResponsiveContainer,
  Label,
} from 'recharts';
import {
  fetchBandwidth,
  FetchBandwidthResponse,
  fetchAggregatedBandwidth,
} from './api';
import { formatTimestamp, toGbps, formatGbps } from './utils';
import { TooltipContent } from './TooltipContent';
import { DateRangePicker } from './DateRangePicker';

/** Does not display unit for the first item */
const CustomYAxisTick: React.FC = (props: any) => {
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
  const [bandwidth, setBandwidth] = React.useState<FetchBandwidthResponse>({
    cdn: [],
    p2p: [],
  });
  const [maxBandwidth, setMaxBandwidth] = React.useState<{
    cdn: number;
    p2p: number;
  }>({ cdn: 0, p2p: 0 });

  const [dateFilter, setDateFilter] = React.useState(() => {
    const now = new Date(Date.now());
    const from = new Date(new Date(now).setDate(now.getDate() - 10));
    return {
      from,
      to: now,
    };
  });

  React.useEffect(() => {
    const from = dateFilter.from.getTime();
    const to = dateFilter.to.getTime();
    Promise.all([
      fetchBandwidth({
        from,
        to,
      }),
      fetchAggregatedBandwidth({
        from,
        to,
        aggregate: 'max',
      }),
    ]).then(([bandwidth, maxBandwidth]) => {
      setBandwidth(bandwidth);
      setMaxBandwidth({
        cdn: maxBandwidth.cdn,
        p2p: maxBandwidth.p2p,
      });
    });
  }, [dateFilter]);

  const areaChartData = React.useMemo(() => {
    if (!bandwidth) return [];
    const { cdn, p2p } = bandwidth;
    return cdn.map(([timestamp, cdn], index) => {
      return {
        timestamp,
        cdn: toGbps(cdn),
        p2p: toGbps(p2p[index][1]),
      };
    });
  }, [bandwidth]);

  return (
    <div style={{ padding: 30 }}>
      <div className="App" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={areaChartData} margin={{ top: 40 }}>
            <XAxis
              dataKey="timestamp"
              type="category"
              interval="preserveStartEnd"
              minTickGap={90}
              tickFormatter={formatTimestamp}
            />
            <YAxis tick={<CustomYAxisTick />} />
            <Tooltip content={<TooltipContent />} />
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
              y={toGbps(maxBandwidth?.cdn)}
              stroke="#B2125C"
              strokeDasharray="5 3"
              strokeWidth={2}
            >
              <Label position="insideLeft" dy={-10} fontSize={14}>
                {`Maximum CDN contribution: ${formatGbps(
                  toGbps(maxBandwidth?.cdn)
                )}`}
              </Label>
            </ReferenceLine>
            <ReferenceLine
              y={toGbps(maxBandwidth?.p2p)}
              stroke="green"
              strokeDasharray="5 3"
              strokeWidth={2}
              position="start"
            >
              <Label position="insideRight" dy={-10} fontSize={14}>
                {`Maximum throughput: ${formatGbps(toGbps(maxBandwidth?.p2p))}`}
              </Label>
            </ReferenceLine>
            <Brush
              width={400}
              height={40}
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              data={areaChartData}
            >
              <AreaChart width={400} height={300} data={areaChartData}>
                <Area
                  type="monotone"
                  dataKey="p2p"
                  stackId="2"
                  stroke="#40A3D4"
                  strokeWidth={2}
                  fill="#6AB8DD"
                />
              </AreaChart>
            </Brush>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div>
        <DateRangePicker
          {...dateFilter}
          onFromDateChange={(from) => setDateFilter({ ...dateFilter, from })}
          onToDateChange={(to) => setDateFilter({ ...dateFilter, to })}
        />
      </div>
    </div>
  );
}

export default App;
