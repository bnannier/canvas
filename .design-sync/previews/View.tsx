import { Badge, Column, Row, Typography, View } from "@nannier/canvas";

export const LabeledBlock = () => (
  <View>
    <Column cozy>
      <Typography caption medium muted>Billing</Typography>
      <Typography h4 semibold>Team plan</Typography>
      <Typography small muted>Renews on 14 December. 12 seats in use.</Typography>
    </Column>
  </View>
);

export const InRow = () => (
  <Row cozy alignCenter>
    <View>
      <Badge>Active</Badge>
    </View>
    <View>
      <Typography semibold>Payments API</Typography>
    </View>
    <View>
      <Typography small muted>99.98% uptime</Typography>
    </View>
  </Row>
);

export const Stacked = () => (
  <View>
    <Column snug>
      <View><Typography semibold>Order 4821</Typography></View>
      <View><Typography small muted>Packed and waiting for pickup</Typography></View>
      <View><Typography tiny muted>Updated 3 minutes ago</Typography></View>
    </Column>
  </View>
);
