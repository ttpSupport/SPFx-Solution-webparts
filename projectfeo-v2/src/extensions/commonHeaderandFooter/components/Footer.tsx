import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ILink from '../model/ILink';

require ('./HeaderFooter.scss');

export interface IFooterProps {
    message: string;
    links: ILink[];
}

export class Footer extends React.Component<IFooterProps, {}> {

    constructor(props: IFooterProps) {
        super(props);
    }

    public render(): JSX.Element {
        return (
			<footer>
				<div className="container">
					<div className="row mx-neg40">
						<div className="col-12 col-md-4 px-40">
							<div className="footer-container">
								<h4>My Recent Documents</h4>
							</div>
						</div>
						<div className="col-12 col-md-4 px-40">
							<div className="footer-container">
								<h4>My Recent Sites</h4>
							</div>
						</div>
						<div className="col-12 col-md-4 px-40">
							<div className="footer-container">
								<h4>My Quicklinks</h4>
							</div>
						</div>
					</div>
				</div>
			</footer>
        );
    }
}