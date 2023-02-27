import { Log } from '@microsoft/sp-core-library';
import {
	BaseApplicationCustomizer,
	PlaceholderContent,
	PlaceholderName
} from '@microsoft/sp-application-base';
import * as React from "react";
import * as ReactDom from 'react-dom';
import { Dialog } from '@microsoft/sp-dialog';
import 'jquery';
// import $ from 'jquery';
// import 'bootstrap';
// require('bootstrap');
// require('browser');
// require('react');
// require('reactDom');
import { SPComponentLoader } from '@microsoft/sp-loader';

import * as strings from 'CommonHeaderandFooterApplicationCustomizerStrings';
import SiteBreadcrumb from './components/SiteBreadcrumb';
import { ISiteBreadcrumbProps } from './components/ISiteBreadcrumb';
const LOG_SOURCE: string = 'CommonHeaderandFooterApplicationCustomizer';

import HeaderFooterDataService from './services/HeaderFooterDataService';
import IHeaderFooterData from './model/IHeaderFooterData';
import ComponentManager from './components/ComponentManager';

// for pnp
import { DefaultHeaders, DefaultInit, SPBrowser, SPFI, spfi } from '@pnp/sp';
import "@pnp/sp/webs";
import {AadTokenProvider } from "@microsoft/sp-http";
import { Web } from "@pnp/sp/webs";
import "@pnp/sp/comments/clientside-page";
import "@pnp/sp/clientside-pages/web";
import { Caching, BrowserFetchWithRetry, DefaultParse } from "@pnp/queryable";
import { IItemUpdateResult } from "@pnp/sp/items";

import { ClientsidePageFromFile, IClientsidePage } from '@pnp/sp/clientside-pages/types';
import { getSP } from './pnpjsConfig';

let cssURL = "https://ttponline.sharepoint.com/sites/FEO1/Style Library/FEO1/css/bootstrap.css?r=" + Math.random();
SPComponentLoader.loadCss(cssURL);
let cssURL1 = "https://ttponline.sharepoint.com/sites/FEO1/Style Library/FEO1/css/style.css?r=" + Math.random();
SPComponentLoader.loadCss(cssURL1);
// let cssURL2 = "https://ttponline.sharepoint.com/sites/FEO1/Style Library/FEO1/css/header.css?r=" + Math.random();
// SPComponentLoader.loadCss(cssURL2);

let cssURL3 = "https://ttponline.sharepoint.com/sites/FEO1/Style Library/FEO1/css/footer.css?r=" + Math.random();
SPComponentLoader.loadCss(cssURL3);

let cssURL4 = "https://ttponline.sharepoint.com/sites/FEO1/Style Library/FEO1/css/fontawsome.css?r=" + Math.random();
SPComponentLoader.loadCss(cssURL4);

let cssURL5 = "https://ttponline.sharepoint.com/sites/FEO1/Style Library/FEO1/css/root.css?r=" + Math.random();
SPComponentLoader.loadCss(cssURL5);

let cssURL6 = "https://ttponline.sharepoint.com/sites/FEO1/Style Library/FEO1/css/custom.css?r=" + Math.random();
SPComponentLoader.loadCss(cssURL6);
//add browser.js, react.js and react-dom.js links
// let jsURl3 = "https://ttponline.sharepoint.com/sites/FEO1/Style%20Library/FEO1/js/browser.js?r=" + Math.random();
// SPComponentLoader.loadScript(jsURl3);

// let jsURl4 = "https://ttponline.sharepoint.com/sites/FEO1/Style%20Library/FEO1/js/react.js?r=" + Math.random();
// SPComponentLoader.loadScript(jsURl4);

// let jsURl5 = "https://ttponline.sharepoint.com/sites/FEO1/Style%20Library/FEO1/js/react-dom.js?r=" + Math.random();
// SPComponentLoader.loadScript(jsURl5);

let jsURl1 = "https://ttponline.sharepoint.com/sites/FEO1/Style%20Library/FEO1/js/pnp.min.js?r=" + Math.random();
SPComponentLoader.loadScript(jsURl1);

let jsURl2 = "https://ttponline.sharepoint.com/sites/FEO1/Style%20Library/FEO1/js/Footer.js?r=" + Math.random();
SPComponentLoader.loadScript(jsURl2);

let jsURl = "https://ttponline.sharepoint.com/sites/FEO1/Style Library/FEO1/js/custom.js?r=" + Math.random();
SPComponentLoader.loadScript(jsURl);


/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICommonHeaderandFooterApplicationCustomizerProperties {
	// This is an example; replace with your own property
	testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class CommonHeaderandFooterApplicationCustomizer
	extends BaseApplicationCustomizer<ICommonHeaderandFooterApplicationCustomizerProperties> {
	private _headerPlaceholder: PlaceholderContent;
	private _sp: SPFI;
	private aadTokenProvider: AadTokenProvider;

	public onInit(): Promise<void> {
		Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
		this._sp = getSP();
		let message: string = this.properties.testMessage;
		if (!message) {
			message = '(No properties were provided.)';
		}

		// sessionStorage.clear();

		this.getAccessToken();


		

		//Dialog.alert(`Hello from ${strings.Title}:\n\n${message}`);




		this.context.placeholderProvider.changedEvent.add(this, this.bootstrap);
		//this.context.placeholderProvider.changedEvent.add(this, this.CheckcurrentPagelayout)

		//checking current page pagelayoutType is Article or not, if yes then it will change to HOME
		console.log("current page page layout type check started...");

		this.CheckcurrentPagelayout()


		// Call render method for generating the needed html elements
		//this.bootstrap();
		//this._renderPlaceHolders();


		return Promise.resolve();
	}

	private async getAccessToken() {
		this.aadTokenProvider = await this.context.aadTokenProviderFactory.getTokenProvider()
		this.aadTokenProvider.getToken("https://graph.microsoft.com",false).then((token: string) => {
			sessionStorage.setItem("AAdAccessToken", token);
			// console.log("token is - ", token);
		});
	}


	private async CheckcurrentPagelayout() {
		console.log("test page")
		try {
			let currentPageID = this.context.pageContext.listItem.id;
			let webURL = this.context.pageContext.web.absoluteUrl;
			const sp = spfi().using(SPBrowser({ baseUrl: webURL }));
			const currentPageURL = this.context.pageContext.legacyPageContext["serverRequestPath"];
			console.log("current page url is - ", currentPageURL);


			// const spCache = spfi(this._sp).using(Caching({ store: "session" }))
			// const page2: IClientsidePage = await spCache.web.loadClientsidePage(currentPageURL)
			// await page2.load();
			// const value1 = page2.pageLayout
			// our page instance
			//const page1: IClientsidePage = await sp.web.loadClientsidePage(currentPageURL);
			const page1 = await sp.web.lists.getByTitle("Site Pages").items.getById(currentPageID).fieldValuesAsText();

			//const page1: IClientsidePage = await ClientsidePageFromFile(sp.web.getFileByServerRelativePath(currentPageURL))
			console.log(page1);
			//await page1.load();
			const value1 = page1["PageLayoutType"]
			// our page instance
			// const page: IClientsidePage = await sp.web.loadClientsidePage(currentPageURL);
			// const value = page.pageLayout;
			console.log("Current Page layout Type - ", value1);
			if (value1 == "Article") {
				console.log("inside value if condition")
				const updateItem = await sp.web.lists.getByTitle("Site Pages").items.getById(currentPageID).update({
					PageLayoutType: "Home"
				});
				console.log(updateItem);
				// page1.pageLayout = "Home"
				// await page1.save(false);
			}
			// const page2: IClientsidePage = await sp.web.loadClientsidePage(currentPageURL);
			// await page2.load();
			// console.log("after updating Page layout Type - ", page2.pageLayout);
		} catch (error) {
			console.log(error);

		}
	}

	private bootstrap(): void {
		console.log("tesitngggg");
		// For now this is hard-coded
		// -- UPLOAD JSON WITH MENU CONTENTS AND PUT THE URL HERE --
		// const url = './sample//HeaderFooterData.json.txt';
		const url = 'https://ttponline.sharepoint.com/sites/FEO1/Shared Documents/HeaderFooterData.json.txt';
		// Read JSON containing the header and footer data
		HeaderFooterDataService.get(url)
			.then((data: IHeaderFooterData) => {

				// Get the elements from SPFx
				const header: PlaceholderContent = this.context.placeholderProvider.tryCreateContent(
					PlaceholderName.Top,
					{ onDispose: this._onDispose }
				);
				const footer: PlaceholderContent = this.context.placeholderProvider.tryCreateContent(
					PlaceholderName.Bottom,
					{ onDispose: this._onDispose }
				);

				if (header || footer) {
					// If we have at least one placeholder, render into it
					ComponentManager.render(header ? header.domElement : null,
						footer ? footer.domElement : null, data);
				}
				if (this.context.pageContext.legacyPageContext["isWebWelcomePage"] == false) {
					console.log("inside if condition");
					this._renderPlaceHolders();
				}
				//this._renderPlaceHolders();
				console.log(this.context.pageContext.legacyPageContext["isWebWelcomePage"])
				console.log(this.context)
				console.log(this.context.pageContext)


			})
			.catch((error: string) => {
				console.log(`Error in CustomHeaderFooterApplicationCustomizer: ${error}`);
			});

		return;
	}


	private _renderPlaceHolders(): void {

		// Check if the header placeholder is already set and if the header placeholder is available
		if (!this._headerPlaceholder && this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1) {
			this._headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
				onDispose: this._onDispose
			});

			// The extension should not assume that the expected placeholder is available.
			if (!this._headerPlaceholder) {
				console.error('The expected placeholder (PageHeader) was not found.');
				return;
			}

			if (this._headerPlaceholder.domElement) {

				const element: React.ReactElement<ISiteBreadcrumbProps> = React.createElement(
					SiteBreadcrumb,
					{
						context: this.context
					}
				);
				ReactDom.render(element, this._headerPlaceholder.domElement);
			}
		}
	}

	private _onDispose(): void {
		console.log('[Breadcrumb._onDispose] Disposed breadcrumb.');
	}


}