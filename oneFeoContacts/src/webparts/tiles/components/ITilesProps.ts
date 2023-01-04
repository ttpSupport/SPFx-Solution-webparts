import { ITilesWebPartProps } from './../TilesWebPart';
import { DisplayMode } from '@microsoft/sp-core-library';

export interface ITilesProps extends ITilesWebPartProps {
  displayMode: DisplayMode;
  setTitle: (value: string) => void;

  fUpdateProperty: (value: string) => void;
  fPropertyPaneOpen: () => void;
}
