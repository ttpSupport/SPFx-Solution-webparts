import * as React from 'react';
import * as strings from 'TilesWebPartStrings';
import { Tile } from './Tile/Tile';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';
import { Placeholder } from '@pnp/spfx-controls-react/lib/Placeholder';
import { ITilesProps } from './ITilesProps';

export class Tiles extends React.Component<ITilesProps, {}> {

  public render(): React.ReactElement<ITilesProps> {
    console.log(this.props.collectionData);
    return (
      <div className='container'>
        <WebPartTitle displayMode={this.props.displayMode}
          title={this.props.title}
          className='subsec-margin no-bold'
          updateProperty={this.props.fUpdateProperty} />
          {/* <h3 className="subsec-margin no-bold">{this.props.title}</h3> */}
        {
          this.props.collectionData && this.props.collectionData.length > 0 ? (
            <div className='row mx-neg40'>
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
    );
  }
}
