import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration
} from '@microsoft/sp-webpart-base';

import * as strings from 'TilesWebPartStrings';
import { ITilesProps } from './components/ITilesProps';
import { ITileInfo } from './ITileInfo';
import { Tiles } from './components/Tiles';

export interface ITilesWebPartProps {
  collectionData: ITileInfo[];
  tileHeight: number;
  title: string;
}

export default class TilesWebPart extends BaseClientSideWebPart<ITilesWebPartProps> {

  // Just for suppress the tslint validation of dinamically loading of this field by using loadPropertyPaneResources()
  // tslint:disable-next-line: no-any
  private propertyFieldNumber: any;
  // Just for suppress the tslint validation of dinamically loading of this field by using loadPropertyPaneResources()
  // tslint:disable-next-line: no-any
  private propertyFieldCollectionData: any;
  // Just for suppress the tslint validation of dinamically loading of this field by using loadPropertyPaneResources()
  // tslint:disable-next-line: no-any
  private customCollectionFieldType: any;

  public render(): void {
    const element: React.ReactElement<ITilesProps> = React.createElement(
      Tiles,
      {
        title: this.properties.title,
        tileHeight: this.properties.tileHeight,
        collectionData: this.properties.collectionData,
        displayMode: this.displayMode,
        setTitle: (value: string) => {
          this.properties.title = value;
        },
        fUpdateProperty: (value: string) => {
          this.properties.title = value;
        },
        fPropertyPaneOpen: this.context.propertyPane.open
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // executes only before property pane is loaded.
  protected async loadPropertyPaneResources(): Promise<void> {
    // import additional controls/components

    const { PropertyFieldNumber } = await import(
      /* webpackChunkName: 'pnp-propcontrols-number' */
      '@pnp/spfx-property-controls/lib/propertyFields/number'
    );
    const { PropertyFieldCollectionData, CustomCollectionFieldType } = await import(
      /* webpackChunkName: 'pnp-propcontrols-colldata' */
      '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData'
    );

    this.propertyFieldNumber = PropertyFieldNumber;
    this.propertyFieldCollectionData = PropertyFieldCollectionData;
    this.customCollectionFieldType = CustomCollectionFieldType;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupFields: [
                this.propertyFieldCollectionData('collectionData', {
                  key: 'collectionData',
                  label: strings.tilesDataLabel,
                  panelHeader: strings.tilesPanelHeader,
                  // tslint:disable-next-line:max-line-length
                  panelDescription: `${strings.iconInformation} https://developer.microsoft.com/en-us/fabric#/styles/icons`,
                  manageBtnLabel: strings.tilesManageBtn,
                  value: this.properties.collectionData,
                  fields: [
                    {
                      id: 'emailaddress',
                      title: strings.emailaddressField,
                      type: this.customCollectionFieldType.string,
                      required: true
                    },
                    {
                      id: 'contactpurpose',
                      title: strings.contactpurposeField,
                      type: this.customCollectionFieldType.string,
                      required: false
                    }
                  ]
                }),
                this.propertyFieldNumber('tileHeight', {
                  key: 'tileHeight',
                  label: strings.TileHeight,
                  value: this.properties.tileHeight
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
