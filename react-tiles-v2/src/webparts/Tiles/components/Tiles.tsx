import * as React from 'react';
import * as strings from 'TilesWebPartStrings';
// import styles from './Tiles.module.scss';
import { ITileInfo, ITilesProps } from '.';
import { Tile } from './tile';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';
import { Placeholder } from '@pnp/spfx-controls-react/lib/Placeholder';
import { createstyles } from './ThemeVariantTypeStyle.styles';
import { css } from "@uifabric/utilities/lib/css";

export class Tiles extends React.Component<ITilesProps, {}> {

  /**
   * Default React remder method
   */
  public render(): React.ReactElement<ITilesProps> {
    const CustomStyles = createstyles(this.props.themeVariant);

    return (
      <div>
        <WebPartTitle displayMode={this.props.displayMode}
          title={this.props.title}
          updateProperty={this.props.fUpdateProperty} />

        {
          this.props.collectionData && this.props.collectionData.length > 0 ? (
            <div className='row mx-neg40'>
              {
                this.props.collectionData.map((tile, idx) =>
                <Tile key={idx} item={tile} tileHeight={this.props.tileHeight} tileWidth={this.props.tileWidth} tileColour={this.props.tileColour} tileFont={this.props.tileFont} staticWidth={this.props.staticWidth} colourMode={this.props.colourMode} themeVariant={this.props.themeVariant} ThemeColorsFromWindow={this.props.ThemeColorsFromWindow} />)
              }
            </div>
          ) : (
            <Placeholder
              iconName='Edit'
              iconText={strings.noTilesIconText}
              description={strings.noTilesConfigured}
              buttonLabel={strings.noTilesBtn}
              onConfigure={this.props.fPropertyPaneOpen} />
          )
        }
      </div >
    );
  }
}
