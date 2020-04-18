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

  const [dateFilter, setDateFilter] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(() => {
    const now = new Date(Date.now());
    const from = new Date(new Date(now).setDate(now.getDate() - 10));
    return {
      from,
      to: now,
    };
  });

  /** Fetch both bandwidth data (cdn and p2p) as well as their aggregated max value
   * We could have have derived that max value from the bandwidth data instead
   * of making an extra http request.
   */
  React.useEffect(() => {
    if (!dateFilter.from || !dateFilter.to) {
      return;
    }
    const from = dateFilter.from.getTime();
    const to = dateFilter.to.getTime();
    // Wait for both promises to resolve
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

  /** Compute data in a way which is consumable by
   * the AreaChart
   */
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
              /* Arbitrary value here. Can be improved since currently we
                can have multiple time the same tick value (ie 17.Apr) or skip one 
                or multiple of them. At a certain point I used a `CustomizedXAxisTick` to 
                handle that but it turns out to make ticks overlap each other when the screen becomes smaller.
                I chose to remove it because the added complexity was probably not worth it.
                See commit #e08d24011a7269bdf86397e63ec097711ad42226 
              */
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
      <div style={{ marginTop: 30, marginLeft: 30 }}>
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
