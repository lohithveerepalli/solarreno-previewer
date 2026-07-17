export type ViewerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error"
  | "missing-key";

export interface AppViewState {
  showSolar: boolean;
  showPool: boolean;
  /** Decimal hour of day, 0–24 */
  hour: number;
  /** YYYY-MM-DD used for sun ephemeris */
  date: string;
}

export interface SharePayload extends AppViewState {
  v: 1;
}
