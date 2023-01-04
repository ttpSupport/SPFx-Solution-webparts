import * as React from 'react';
import * as strings from 'TilesWebPartStrings';
import { Tile } from './Tile/Tile';
import { Placeholder } from '@pnp/spfx-controls-react/lib/Placeholder';
import { ITilesProps } from './ITilesProps';
import { WebPartTitle } from '@pnp/spfx-controls-react';

export class Tiles extends React.Component<ITilesProps, {}> {
  public render(): React.ReactElement<ITilesProps> {  
    return (
      <div className='container'>
         <WebPartTitle className='subsec-margin'
                displayMode={this.props.displayMode}
                title={this.props.title}
                updateProperty={this.props.setTitle} />
       <div className='dept-contacts'>
        {  this.props.collectionData && this.props.collectionData.length > 0 ? (
            <div className='row mx-neg30'>
              {
                this.props.collectionData.map((tile, idx) =>
                  <Tile key={idx} item={tile} height={this.props.tileHeight} />)
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
         </div>
      </div>
    );
  }
}
