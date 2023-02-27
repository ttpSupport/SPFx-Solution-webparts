import * as React from 'react';
import { ICurrentNavProps } from './ICurrentNavProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class CurrentNav extends React.Component<ICurrentNavProps, {}> {
	public render(): React.ReactElement<ICurrentNavProps> {
		return (
			<section id="left-section">
				<div className='search-results-con'>
					<div className='col-12'>
						<div className="refine-results">
							<div className="refine-title">
								<h4 className="mb-0 gold-txt">About Us</h4>
							</div>
							<div className="refine-list">
								<div className="refine-items">
									<a href="javascript:void(0)" className="side-nav-item">Our Mission, Vision and Values</a>
								</div>
								<div className="refine-items">
									<a href="javascript:void(0)" className="side-nav-item active">Organisation Structure</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}
}