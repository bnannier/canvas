// A react-router-dom shim backed by Expo Router, so the existing Vite docs components
// (which import react-router-dom) render UNCHANGED on the Expo web target — same DOM,
// same CSS classes, exact visual parity. Metro/tsc alias "react-router-dom" here.
import { type ReactNode } from "react";
import {
  Link as ExpoLink,
  Redirect,
  Slot,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";

export function useLocation() {
  return { pathname: usePathname(), search: "", hash: "", state: null, key: "default" };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  return useLocalSearchParams() as unknown as T;
}

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, opts?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (to < 0) router.back();
      return;
    }
    if (opts?.replace) router.replace(to as never);
    else router.push(to as never);
  };
}

export function Outlet() {
  return <Slot />;
}

export function Navigate({ to }: { to: string; replace?: boolean }) {
  return <Redirect href={to as never} />;
}

type LinkProps = {
  to: string;
  children?: ReactNode;
  className?: string;
  style?: Record<string, unknown>;
  onClick?: (e: unknown) => void;
  "aria-label"?: string;
  title?: string;
  [key: string]: unknown;
};

export function Link({ to, children, className, style, onClick, ...rest }: LinkProps) {
  return (
    <ExpoLink href={to as never} className={className} style={style as never} onPress={onClick as never} {...rest}>
      {children as never}
    </ExpoLink>
  );
}

type NavLinkProps = {
  to: string;
  end?: boolean;
  className?: string | ((s: { isActive: boolean }) => string);
  children?: ReactNode | ((s: { isActive: boolean }) => ReactNode);
  onClick?: (e: unknown) => void;
  title?: string;
  "aria-label"?: string;
  [key: string]: unknown;
};

export function NavLink({ to, end, className, children, onClick, ...rest }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  const cls = typeof className === "function" ? className({ isActive }) : className;
  const kids = typeof children === "function" ? children({ isActive }) : children;
  return (
    <ExpoLink href={to as never} className={cls} onPress={onClick as never} {...(rest as object)}>
      {kids as never}
    </ExpoLink>
  );
}
