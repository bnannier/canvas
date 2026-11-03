import { Pagination } from "@nannier/canvas";

export const Numbered = () => <Pagination defaultPage={3} total={12} />;

export const Compact = () => <Pagination compact defaultPage={2} total={8} itemCount={76} />;

export const WithPageSize = () => <Pagination withSize defaultPage={1} total={10} itemCount={96} defaultPageSize={10} pageSizes={[10, 25, 50]} />;

export const Small = () => <Pagination small defaultPage={5} total={9} />;

export const Disabled = () => <Pagination disabled defaultPage={2} total={6} />;
