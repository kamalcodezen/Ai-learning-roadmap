export type AuthMode = "signin" | "signup";

export interface AuthBrandPanelProps {
  mode: AuthMode;
  logo?: React.ReactNode;
  cubeSrc: string;
  onSwitch: () => void;
}

export interface AuthShellProps {
  initialMode: AuthMode;
  logo?: React.ReactNode;
  cubeSrc: string;
}