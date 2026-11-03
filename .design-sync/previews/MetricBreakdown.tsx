import { Card, MetricBreakdown } from "@nannier/canvas";

export const Hero = () => (
  <MetricBreakdown
    value="3,771"
    label="Tokens issued"
    breakdown={[
      { label: "authorization_code", value: 1842, delta: "+12%" },
      { label: "refresh_token", value: 1264, delta: "+4%" },
      { label: "client_credentials", value: 618, delta: "-3%", down: true },
    ]}
  />
);

export const WithSparkAndRate = () => (
  <MetricBreakdown
    value="25,874"
    label="Requests"
    rate="0.74%"
    rateLabel="4xx + 5xx rate"
    rateSuccess
    spark={[180, 196, 188, 204, 210, 202, 214, 220]}
    sparkUnit="req/s"
  />
);

export const InsideCard = () => (
  <Card>
    <MetricBreakdown
      plain
      value="25,874"
      label="Requests"
      breakdown={[
        { label: "GET", value: 18248, delta: "+8%" },
        { label: "POST", value: 6104, delta: "+21%" },
        { label: "PATCH", value: 1212, delta: "-2%", down: true },
      ]}
    />
  </Card>
);

export const SparkOnly = () => (
  <MetricBreakdown value="$48,210" label="Revenue" spark={[31, 34, 33, 38, 41, 40, 46, 48]} hideSparkTag />
);
