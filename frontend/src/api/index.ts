const BACKEND_URL = 'http://localhost:3000';

type FetchBandwidthInput = {
  from: number;
  to: number;
};

type FetchAggregatedBandwidthInput = {
  from: number;
  to: number;
  aggregate: 'sum' | 'averagre' | 'max' | 'min';
};

type FetchBandwidthResponse = {
  cdn: [number, number][];
  p2p: [number, number][];
};
type FetchBandwidthAggregatedResponse = {
  cdn: number;
  p2p: number;
};

export const fetchBandwidth = (
  input: FetchBandwidthInput
): Promise<FetchBandwidthResponse> =>
  fetch(`${BACKEND_URL}/bandwidth`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  }).then((response) => response.json());

export const fetchAggregatedBandwidth = (
  input: FetchAggregatedBandwidthInput
): Promise<FetchBandwidthAggregatedResponse> =>
  fetch(`${BACKEND_URL}/bandwidth`, {
    method: 'POST',
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  }).then((response) => response.json());
