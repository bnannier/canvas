import { forwardRef } from "react";
import type { View } from "react-native";

export interface CorrectProps { label?: string }
export interface MistakenProps { label?: string }
export interface OtherProps { label?: string }

/** @ref Ref owned by Correct. */
export function createCorrect() {
  return forwardRef<View, CorrectProps>(() => null);
}

/** @ref This belongs to Other, despite the factory's name. */
export function createMistaken() {
  return forwardRef<View, OtherProps>(() => null);
}
