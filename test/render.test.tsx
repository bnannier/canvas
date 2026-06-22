import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";

afterEach(cleanup);

const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Button (web render)", () => {
  it("renders its label", () => {
    ui(<Button>Save changes</Button>);
    expect(screen.getByText("Save changes")).toBeDefined();
  });

  it("calls onPress when pressed", () => {
    let count = 0;
    ui(<Button onPress={() => { count += 1; }}>Tap</Button>);
    fireEvent.click(screen.getByText("Tap"));
    expect(count).toBe(1);
  });

  it("does not fire onPress while disabled", () => {
    let count = 0;
    ui(<Button disabled onPress={() => { count += 1; }}>Nope</Button>);
    fireEvent.click(screen.getByText("Nope"));
    expect(count).toBe(0);
  });
});

describe("Badge (web render)", () => {
  it("renders its content", () => {
    ui(<Badge>admin</Badge>);
    expect(screen.getByText("admin")).toBeDefined();
  });
});
