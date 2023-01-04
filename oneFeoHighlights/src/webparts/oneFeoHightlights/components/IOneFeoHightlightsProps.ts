import { DisplayMode } from "@microsoft/sp-core-library";

export interface IOneFeoHightlightsProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  displayMode: DisplayMode;
  editorSection: any[];
  title: string;
  setTitle: (value: string) => void;
}
