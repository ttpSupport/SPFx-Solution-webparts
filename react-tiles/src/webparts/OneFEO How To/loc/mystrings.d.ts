declare interface ITilesWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TilesListDescription: string;
  TileHeight: string;
  iconInformation: string;

  // Properties
  tilesDataLabel: string;
  tilesPanelHeader: string;
  tilesManageBtn: string;

  // Tile fields
  titleField: string;
  descriptionField: string;
  urlField: string;
  imageUrlField: string;
  iconField: string;
  targetField: string;

  targetCurrent: string;
  targetNew: string;

  // Component
  noTilesIconText: string;
  noTilesConfigured: string;
  noTilesBtn: string;
}

declare module 'TilesWebPartStrings' {
  const strings: ITilesWebPartStrings;
  export = strings;
}
