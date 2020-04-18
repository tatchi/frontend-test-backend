import * as React from 'react';
import { TooltipProps } from 'recharts';
import { formatGbps } from './utils';

export const TooltipContent: React.FC<TooltipProps> = (props) => {
  const { active, label = '', payload = [] } = props;
  if (!active || !payload) return null;

  const p2p = Number(payload[0].value);
  const cdn = Number(payload[1].value);
  const total = p2p + cdn;

  const spikeReduction = (p2p / total) * 100;

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
              <span style={{ color: data.color }}>
                {formatGbps(Number(data.value))}
              </span>
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
          <span style={{ color: 'green' }}>{formatGbps(total)}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ color: 'grey' }}>Spike reduction:</span>{' '}
          <span style={{ color: payload[0].color }}>
            {spikeReduction.toFixed(2)}&nbsp;%
          </span>
        </div>
      </div>
    </div>
  );
};
