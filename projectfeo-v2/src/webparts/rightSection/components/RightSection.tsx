import * as React from 'react';
import { IRightSectionProps } from './IRightSectionProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class RightSection extends React.Component<IRightSectionProps, {}> {
	public render(): React.ReactElement<IRightSectionProps> {

		return (
			<section id="right-section">
				<div className='search-results-con'>
					<div className='col-12'>
						<div className="subsec-margin">
							<h2 className="mb-0 no-bold gold-txt">Organisation Structure</h2>
						</div>
						<img alt='' className='w-100' src='/sites/FEO1/Style Library/FEO1/images/git_org-structure.png' />
					</div>
				</div>
			</section>
		);
	}
}
