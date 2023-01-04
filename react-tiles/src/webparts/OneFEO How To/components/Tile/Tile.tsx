import * as React from 'react';
import { ITileProps } from './ITileProps';

export class Tile extends React.Component<ITileProps, {}> {
  public render(): React.ReactElement<ITileProps> {
    const tileStyle: React.CSSProperties = {};
    if (this.props.height) {
      tileStyle.height = `${this.props.height}px`;
    }

    return (
      <div className='col-12 col-md-4 px-40' style={tileStyle}>
        <div className='content-box-w-img'>
          <div className='box-img'>
            <img src={this.props.item.ImageUrl} alt='tempimg' className='w-100' />
          </div>
          <h3 className='gold-txt'>
            {this.props.item.title}
          </h3>
          <p>{this.props.item.description}</p>
          <a href={this.props.item.url} target='blank' className='learn-more-btn'>Learn More</a>
        </div>
      </div>
    );
  }
}
