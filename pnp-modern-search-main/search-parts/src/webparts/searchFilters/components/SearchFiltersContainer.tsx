import * as React from 'react';
import { ISearchFiltersContainerProps } from './ISearchFiltersContainerProps';
import { TemplateRenderer } from '../../../controls/TemplateRenderer/TemplateRenderer';
import { ISearchFiltersContainerState } from './ISearchFiltersContainerState';
import { isEqual, cloneDeep, sortBy } from '@microsoft/sp-lodash-subset';
import { WebPartTitle } from "@pnp/spfx-controls-react/lib/WebPartTitle";
import * as webPartStrings from 'SearchFiltersWebPartStrings';
import * as commonStrings from 'CommonStrings';
import update from 'immutability-helper';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import {
	IDataFilterInternal,
	IDataFilterValueInternal,
	IDataFilterConfiguration,
	IDataFilterResult,
	IDataFilterResultValue,
	IDataFilter,
	FilterComparisonOperator,
	IDataFilterInfo,
	ExtensibilityConstants,
	FilterConditionOperator,
	LayoutRenderType
} from '@pnp/modern-search-extensibility';
import { ISearchFiltersTemplateContext } from '../../../models/common/ITemplateContext';
import { flatten } from '@microsoft/sp-lodash-subset';
import { DisplayMode, Log } from '@microsoft/sp-core-library';
import { DataFilterHelper } from '../../../helpers/DataFilterHelper';
import { UrlHelper } from '../../../helpers/UrlHelper';
import { BuiltinFilterTemplates } from '../../../layouts/AvailableTemplates';
import { spfi, SPFx, DefaultInit, DefaultHeaders, RequestDigest } from '@pnp/sp';
import "@pnp/sp/taxonomy";
import { ITermGroups, ITermSets, IChildren } from "@pnp/sp/taxonomy";


const DEEPLINK_QUERYSTRING_PARAM = 'f';

export default class SearchFiltersContainer extends React.Component<ISearchFiltersContainerProps, ISearchFiltersContainerState> {

	private componentRef: React.RefObject<any>;

	public constructor(props: ISearchFiltersContainerProps) {
		super(props);
		this.state = {
			currentUiFilters: [],
			submittedFilters: [],
			sortBy: "bestMatch",
			searchIn: "",
			modifiedBy: [],
			lastModified: [],
			filterFormat: [],
			divBuColl: [],
			divBu: [],
			contentTypeColl: [],
			contentType: [],
			workProcessColl: [],
			workProcess: []
		};

		this.componentRef = React.createRef();

		this.onFilterValuesUpdated = this.onFilterValuesUpdated.bind(this);
		this.ResetFilter = this.ResetFilter.bind(this);
	}

	public render(): React.ReactElement<ISearchFiltersContainerProps> {

		let renderWpContent: JSX.Element = null;
		let templateContent: string = null;
		let renderTitle: JSX.Element = null;

		// WP title
		renderTitle = <WebPartTitle
			displayMode={this.props.webPartTitleProps.displayMode}
			title={this.props.webPartTitleProps.title}
			updateProperty={this.props.webPartTitleProps.updateProperty}
			className={this.props.webPartTitleProps.className}
		/>;

		// If no filter 
		if (this.state.currentUiFilters.length === 0) {

			if (this.props.webPartTitleProps.displayMode === DisplayMode.Edit) {
				renderWpContent = <MessageBar messageBarType={MessageBarType.info}>{webPartStrings.General.NoAvailableFilterMessage}</MessageBar>;
			}
		} else {
			// Content loading
			templateContent = this.props.templateService.getTemplateMarkup(this.props.templateContent);
			const templateContext = this.getTemplateContext();

			renderWpContent = <TemplateRenderer
				key={JSON.stringify(templateContext)}
				templateContent={templateContent}
				templateContext={templateContext}
				templateService={this.props.templateService}
				instanceId={this.props.instanceId}
				renderType={LayoutRenderType.Handlebars} // Only allow Handlebars for filters
			/>;
		}

		// return <div ref={this.componentRef} data-instance-id={this.props.instanceId}>
		// 	{renderTitle}
		// 	{renderWpContent}
		// </div>;
		return <div className='with-side-menu' ref={this.componentRef} data-instance-id={this.props.instanceId}>
			<aside className='side-menu' >
				<div className='side-menu-title'>
					<h5 className="mb-0">
						<i className="fa-solid fa-sliders d-inline-block pe-3"></i><b>Refine </b>
					</h5>
				</div>
				<div id='asideMove'>
					<div className='ps-0 move-to-acc'>
						<div className='refine-list ps-0'>
							{/* Sort by */}
							<div className="refine-items">
								<h6>Sort By</h6>
								<div className="refine-sort selected">
									<input type="radio" id="bestMatch" name="sortBy" value="bestMatch" checked={this.state.sortBy === "bestMatch"} onChange={(e) => this.setState({ sortBy: e.target.value })} />
									<label htmlFor="bestMatch">Best Match</label>
								</div>
								<div className="refine-sort">
									<input type="radio" id="newest" name="sortBy" value="newest" checked={this.state.sortBy === "newest"} onChange={(e) => this.setState({ sortBy: e.target.value })} />
									<label htmlFor="newest">Newest</label>
								</div>
								<div className="refine-sort mb-0">
									<input type="radio" id="mostPopular" name="sortBy" value="mostPopular" checked={this.state.sortBy === "mostPopular"} onChange={(e) => this.setState({ sortBy: e.target.value })} />
									<label htmlFor="mostPopular">Most Popular</label>
								</div>
							</div>
							{/* Search In */}
							<div className="refine-items">
								<h6>Search In </h6>
								<div className="refine-sort">
									<input type="radio" id="si-all" name="searchIn" value="all" checked={this.state.searchIn == "all"} className="hidden-filter-radio" onChange={(e) => this.setState({ searchIn: e.target.value })} />
									<label htmlFor="si-all">All</label>
								</div>
								<div className="refine-sort">
									<input type="radio" id="FinalRepository" name="searchIn" value="FinalRepository" checked={this.state.searchIn == "FinalRepository"} className="show-filter-radio" onChange={(e) => this.setState({ searchIn: e.target.value })} />
									<label htmlFor="FinalRepository">Final Repository</label>
								</div>
								<div className="refine-sort">
									<input type="radio" id="eMemo" name="searchIn" value="eMemo" className="show-filter-radio" checked={this.state.searchIn == "eMemo"} onChange={(e) => this.setState({ searchIn: e.target.value })} />
									<label htmlFor="eMemo">eMemo</label>
								</div>
								<div className="refine-sort">
									<input type="radio" id="FEONet" name="searchIn" value="FEONet" className="hidden-filter-radio" checked={this.state.searchIn == "FEONet"} onChange={(e) => this.setState({ searchIn: e.target.value })} />
									<label htmlFor="FEONet">FEONet</label>
								</div>
								<div className="refine-sort">
									<input type="radio" id="iPortal" name="searchIn" value="iPortal" className="hidden-filter-radio" checked={this.state.searchIn == "iPortal"} onChange={(e) => this.setState({ searchIn: e.target.value })} />
									<label htmlFor="iPortal">iPortal</label>
								</div>
								<div className="refine-sort mb-0">
									<input type="radio" id="CollaborationSpace" name="searchIn" value="CollaborationSpace" checked={this.state.searchIn == "CollaborationSpace"} className="hidden-filter-radio" onChange={(e) => this.setState({ searchIn: e.target.value })} />
									<label htmlFor="CollaborationSpace">Collaboration Space</label>
								</div>
							</div>
							<div className="refine-items b-none">
								<h6 className="mb-0">Filter By</h6>
							</div>
							{/* Div Bu's */}
							{(this.state.searchIn == "" || (this.state.searchIn == "FinalRepository" && this.state.searchIn == "eMemo")) &&
								<div>
									<div className="refine-items">
										<a id="acc1" href="javascript:void(0)" className="refine-items-link" data-bs-toggle="collapse" data-bs-target="#businessCat" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Div / BUs", "divBuColl")}>Div / BUs</a>
										<div id="businessCat" className="refine-filter-con collapse " >
											{this.state.divBuColl != undefined && this.state.divBuColl.length > 0 && this.state.divBuColl.map((item, key) =>
												<div key={key} className="refine-filter-item">
													<input type="checkbox" id={"businessCat-feo" + key} name="divBu" value={item.toString()} checked={this.state.divBu.indexOf(item.toString()) > -1} onChange={this.handleChange.bind(this, "divBu")} />
													<label htmlFor={"businessCat-feo" + key}>{item}</label>
												</div>
											)}
										</div>
									</div>
									{/* Content Type */}
									<div className="refine-items">
										<a id="acc2" href="#" className="refine-items-link" data-bs-toggle="collapse" data-bs-target="#contentType" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Content Types", "contentTypeColl")}>Content Type</a>
										<div id="contentType" className="refine-filter-con collapse">
											{this.state.contentTypeColl.length > 0 && this.state.contentTypeColl.map((val, key) =>
												<div key={key} className="refine-filter-item mb-0">
													<input type="checkbox" id={"contentType-tm" + key} name="contentType" value={val.toString()} checked={this.state.contentType.indexOf(val.toString()) > -1} onChange={this.handleChange.bind(this, "contentType")} />
													<label htmlFor={"contentType-tm" + key}>{val}</label>
												</div>
											)}
										</div>
									</div>
									{/*Work Process*/}
									<div className="refine-items">
										<a id="acc3" href="#" className="refine-items-link" data-bs-toggle="collapse" data-bs-target="#workProcessType" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Work Processes", "workProcessColl")}>Work Process</a>
										<div id="workProcessType" className="refine-filter-con collapse " >
											{this.state.workProcessColl.length > 0 && this.state.workProcessColl.map((val, key) =>
												<div key={key} className="refine-filter-item">
													<input type="checkbox" id={"wp-" + key} name="workProcess" value={val.toString()} checked={this.state.workProcess.indexOf(val.toString()) > -1} onChange={this.handleChange.bind(this, "workProcess")} />
													<label htmlFor={"wp-" + key}>{val}</label>
												</div>
											)}
										</div>
									</div>
								</div>}
							{/*Format*/}
							<div className="refine-items">
								<a id="acc1" href="javascript:void(0)" className="refine-items-link collapsed" data-bs-toggle="collapse" data-bs-target="#format" aria-expanded="false">Format</a>
								<div id="format" className="refine-filter-con collapse">
									<div className="refine-filter-item">
										<input type="checkbox" id="format-pdf" name="filterFormat" value="pdf" checked={this.state.filterFormat.indexOf("pdf") > -1} onChange={this.handleChange.bind(this, "filterFormat")} />
										<label htmlFor="format-pdf">.pdf</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="format-docx" name="filterFormat" value="docx" checked={this.state.filterFormat.indexOf("docx") > -1} onChange={this.handleChange.bind(this, "filterFormat")} />
										<label htmlFor="format-docx">.doc / .docx</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="format-xls" name="filterFormat" value="xls" checked={this.state.filterFormat.indexOf("xls") > -1} onChange={this.handleChange.bind(this, "filterFormat")} />
										<label htmlFor="format-xls">.xls / .xlsx</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="format-ppt" name="filterFormat" value="ppt" checked={this.state.filterFormat.indexOf("ppt") > -1} onChange={this.handleChange.bind(this, "filterFormat")} />
										<label htmlFor="format-ppt">.ppt / .pptx</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="format-img" name="filterFormat" value="img" checked={this.state.filterFormat.indexOf("img") > -1} onChange={this.handleChange.bind(this, "filterFormat")} />
										<label htmlFor="format-img">.jpg/png/gir</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="format-vid" name="filterFormat" value="vid" checked={this.state.filterFormat.indexOf("vid") > -1} onChange={this.handleChange.bind(this, "filterFormat")} />
										<label htmlFor="format-vid">.mpe/ .webm</label>
									</div>
								</div>
							</div>
							{/* Modified By */}
							<div className="refine-items">
								<a id="acc2" href="javascript:void(0)" className="refine-items-link collapsed" data-bs-toggle="collapse" data-bs-target="#creator" aria-expanded="false">Modified By</a>
								<div id="creator" className="refine-filter-con collapse">
									<div className="refine-filter-item">
										<input type="checkbox" id="creator-john" name="modifiedBy" value="creator-john" checked={this.state.modifiedBy.indexOf("creator-john") > -1} onChange={this.handleChange.bind(this, "modifiedBy")} />
										<label htmlFor="creator-john">John</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="creator-cindy" name="modifiedBy" value="creator-cindy" checked={this.state.modifiedBy.indexOf("creator-cindy") > -1} onChange={this.handleChange.bind(this, "modifiedBy")} />
										<label htmlFor="creator-cindy">Cindy</label>
									</div>
								</div>
							</div>
							{/* Last Modified Date */}
							<div className="refine-items">
								<a id="acc3" href="javascript:void(0)" className="refine-items-link collapsed" data-bs-toggle="collapse" data-bs-target="#createDate" aria-expanded="false">Last Modified</a>
								<div id="createDate" className="refine-filter-con collapse">
									<div className="refine-filter-item">
										<input type="checkbox" id="lastModAny" name="lastModified" value="lastModAny" checked={this.state.lastModified.indexOf("lastModAny") > -1} onChange={this.handleChange.bind(this, "lastModified")} />
										<label htmlFor="lastModAny">Any time</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="lastModDay" name="lastModified" value="lastModDay" checked={this.state.lastModified.indexOf("lastModDay") > -1} onChange={this.handleChange.bind(this, "lastModified")} />
										<label htmlFor="lastModDay">Past 24 hours</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="lastModWeek" name="lastModified" value="lastModWeek" checked={this.state.lastModified.indexOf("lastModWeek") > -1} onChange={this.handleChange.bind(this, "lastModified")} />
										<label htmlFor="lastModWeek">Past Week</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="lastModMnth" name="lastModified" value="lastModMnth" checked={this.state.lastModified.indexOf("lastModMnth") > -1} onChange={this.handleChange.bind(this, "lastModified")} />
										<label htmlFor="lastModMnth">Past Month</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="lastMod3Mnths" name="lastModified" value="lastMod3Mnths" checked={this.state.lastModified.indexOf("lastMod3Mnths") > -1} onChange={this.handleChange.bind(this, "lastModified")} />
										<label htmlFor="lastMod3Mnths">Past 3 Months</label>
									</div>
									<div className="refine-filter-item">
										<input type="checkbox" id="lastModYear" name="lastModified" value="lastModYear" checked={this.state.lastModified.indexOf("lastModYear") > -1} onChange={this.handleChange.bind(this, "lastModified")} />
										<label htmlFor="lastModYear">Past Year</label>
									</div>
								</div>
							</div>
						</div>
						<div className="resetform">
							<button type="button" className="reset-all" onClick={this.ResetFilter}>Reset all</button>
						</div>
					</div>
				</div>
			</aside>
		</div>;
	}

	private async GetDataCollection(termData: any, termstate: any) {
		console.log("state length - ", this.state[termstate].length);
		let tempArray = [];
		if (this.state[termstate].length == 0) {
			const sp = spfi(window.location.origin + "/sites/FEOSearch").using(SPFx(this.context)).using(RequestDigest());
			try {
				const info = await sp.termStore.groups();
				let fill = info.filter(f => { if (f.name == "FEO") return f; });
				console.log(fill);
				console.log("inside get term function");
				const TermSetsinfo = await sp.termStore.groups.getById(fill[0].id).sets();
				console.log(TermSetsinfo);
				let termsetFill = TermSetsinfo.filter(s => { if (s.localizedNames[0].name == "FEO term set") return s; })
				const TermSetinfo = await sp.termStore.groups.getById(fill[0].id).sets.getById(termsetFill[0].id).children();
				let CurrentTermFilter = TermSetinfo.filter(t => { if (t.labels[0].name == termData) return t; })
				const TermSetChildren = await sp.termStore.groups.getById(fill[0].id).sets.getById(termsetFill[0].id).getTermById(CurrentTermFilter[0].id).children();
				console.log(TermSetChildren);
				for (let index = 0; index < TermSetChildren.length; index++) {
					const element = TermSetChildren[index];
					tempArray.push(element.labels[0].name);
				}
			} catch (e) {
				console.log("error at getting terms");
				console.error(e);
			}
			if (termstate == "divBuColl") {
				this.setState({ divBuColl: tempArray });
			} else if (termstate == "contentTypeColl") {
				this.setState({ contentTypeColl: tempArray });
			} else if (termstate == "workProcessColl") {
				this.setState({ workProcessColl: tempArray });
			}
		}
	}
	private ResetFilter() {
		var that = this;
		that.setState({
			sortBy: "bestMatch",
			modifiedBy: [],
			lastModified: [],
			filterFormat: [],
			contentType: [],
			divBu: [],
			workProcess: []
		});
	}

	private handleChange(stateName: any, e: any) {
		let currentState = this.state[stateName];

		if (currentState.indexOf(e.target.value) > -1) {
			currentState.pop(1, currentState.indexOf(e.target.value));
		} else {
			currentState.push(e.target.value);
		}
		if (stateName == "modifiedBy") {
			this.setState({ modifiedBy: currentState });
		} else if (stateName == "lastModified") {
			this.setState({ lastModified: currentState });
		} else if (stateName == "filterFormat") {
			this.setState({ filterFormat: currentState });
		} else if (stateName == "divBu") {
			this.setState({ divBu: currentState });
		} else if (stateName == "contentType") {
			this.setState({ contentType: currentState });
		} else if (stateName == "workProcess") {
			this.setState({ workProcess: currentState });
		}
	}


	public componentDidMount() {

		// Bind events when filter values are selected
		this.bindFilterEvents();

		// Bind events when mutli valued filter value are applied for a specific filter
		this.bindApplyFiltersEvents();

		// Bind events when mutli valued filter value are cleared for a specific filter
		this.bindClearFiltersEvents();

		// Bind events when the values operator is updated for a specific filter
		// Use case when the opeartor control is used directly in the Handlebars template. Otherwise, for nested component usage (ex: combo box), the operator value will be changed through the IDataFilterInfo interface direcrtly and not trought a JavaScript event.
		this.bindFilterValueOperatorUpdated();

		// Initial state
		this.getFiltersToDisplay(this.props.availableFilters, [], this.props.filtersConfiguration);

		// Process deep links
		this.getFiltersDeepLink();

		// this.GetTerms();

		console.log("pnp print");

		//console.log($pnp.TermStores.prototype.get().then(console.log));

		this._handleQueryStringChange();

		$('.refine-items-link').on('click', function (e) {
			//aria-expanded
			$($(this).attr("data-bs-target")).toggle();
			if ($($(this).attr("data-bs-target")).css('display') == 'none') {
				$(this).attr("aria-expanded", "false");
			} else {
				$(this).attr("aria-expanded", "true");
			}
		});
	}

	public async GetTerms() {
		//const sp =  spfi().using(DefaultInit(), DefaultHeaders(), BrowserFetchWithRetry(), DefaultParse());

		const sp = spfi(window.location.origin + "/sites/FEOSearch").using(SPFx(this.context)).using(RequestDigest());
		try {
			const info = await sp.termStore.groups();
			let fill = info.filter(f => { if (f.name == "FEO") return f; });
			console.log(fill);
			console.log("inside get term function");
			const TermSetsinfo = await sp.termStore.groups.getById(fill[0].id).sets();
			console.log(TermSetsinfo);
			let termsetFill = TermSetsinfo.filter(s => { if (s.localizedNames[0].name == "FEO term set") return s; })
			const TermSetinfo: IChildren = await sp.termStore.groups.getById(fill[0].id).sets.getById(termsetFill[0].id).children();
			for (let index = 0; index < TermSetinfo.length; index++) {
				const Termelement = TermSetinfo[index];
				const TermSetChildren: IChildren = await sp.termStore.groups.getById(fill[0].id).sets.getById(termsetFill[0].id).getTermById(Termelement.id).children();
				console.log(TermSetChildren);
			}
			console.log(info.length);
		} catch (e) {
			console.log("error at getting terms");
			console.error(e);
		}
	}

	public componentDidUpdate(prevProps: ISearchFiltersContainerProps, prevState: ISearchFiltersContainerState) {

		// When filters configuration is updated or the layout is changed 
		if (!isEqual(prevProps.selectedLayoutKey, this.props.selectedLayoutKey)
			|| !isEqual(prevProps.properties, this.props.properties)) {

			const updatedfilters = this.resetSelectedFilterValues(this.state.currentUiFilters);
			const submittedFilters = this.getSelectedFiltersFromUIFilters(updatedfilters);

			this.getFiltersToDisplay(this.props.availableFilters, [], this.props.filtersConfiguration);

			this.resetFiltersDeepLink();

			this.props.onUpdateFilters(submittedFilters);
		}

		// When new filters are received from the data source
		if (!isEqual(prevProps.availableFilters, this.props.availableFilters)) {

			this.getFiltersToDisplay(this.props.availableFilters, this.state.currentUiFilters, this.props.filtersConfiguration);

			const submittedFilters = this.getSelectedFiltersFromUIFilters(this.state.currentUiFilters);

			this.setState({
				submittedFilters: submittedFilters
			});
		}
	}

	/**
	 * Determines filters to be sent to the Handlebars templates as context with enhanced information from configuration
	 * @param availableFilters the available filter results returned from the data source
	 * @param currentUIFilters the current selected filters in the UI
	 * @param filtersConfiguration the filter configuration from the property pane
	 */
	private getFiltersToDisplay(availableFilters: IDataFilterResult[], currentUiFilters: IDataFilterInternal[], filtersConfiguration: IDataFilterConfiguration[]): void {

		const updatedFilters: IDataFilterInternal[] = availableFilters.map(availableFilter => {

			let values: IDataFilterValueInternal[] = [];

			// Get the corresponding configuration for this filter
			const filterConfiguration = DataFilterHelper.getConfigurationForFilter(availableFilter, filtersConfiguration);

			if (filterConfiguration) {

				// Determine if the filter is already selected in the current UI filters 
				const selectedFilterIdx = currentUiFilters.map(selectedFilter => { return selectedFilter.filterName; }).indexOf(availableFilter.filterName);

				// When the selected filters combination have no results, we set the selected value counts for the current filter to 0 to be able to reset it in the UI.
				if (availableFilter.values.length === 0) {

					if (selectedFilterIdx !== -1) {

						// Set count to 0
						values = currentUiFilters[selectedFilterIdx].values.map(value => {

							// Reset the count for already selected refiners
							if (((value.selected || value.selectedOnce) && filterConfiguration.isMulti) || (value.selected && !filterConfiguration.isMulti)) {
								value.count = 0;
							} else {
								return null;
							}

							return value;
						}).filter(value => value);
					}

				} else {

					// Merge available filters with currently selected filters to ajust the count information
					values = availableFilter.values.map((availableValue: IDataFilterResultValue) => {

						const filterValueInternal: IDataFilterValueInternal = {
							name: availableValue.name,
							selected: false,
							selectedOnce: false,
							disabled: false,
							value: availableValue.value,
							count: availableValue.count
						};

						if (selectedFilterIdx !== -1) {

							const valueIdx = currentUiFilters[selectedFilterIdx].values.map(value => { return value.value; }).indexOf(availableValue.value);

							// A new filter value is available
							if (valueIdx === -1) {
								return filterValueInternal;
							} else {

								// Update the count + name information
								const updatedValue = currentUiFilters[selectedFilterIdx].values[valueIdx];
								updatedValue.count = availableValue.count;
								updatedValue.name = availableValue.name;
								return updatedValue;
							}

						} else {
							// A new filter with new values is available
							return filterValueInternal;
						}
					});
				}

				// Add leftover values added outside of filter values range (ex: from a date range component or taxonomy picker)
				if (selectedFilterIdx !== -1) {
					const additionalValues = currentUiFilters[selectedFilterIdx].values.map(value => {

						const valueIdx = values.map(v => { return v.value; }).indexOf(value.value);
						if (valueIdx === -1 && value.selected) {
							return value;
						}
					});

					values = values.concat(additionalValues.filter(value => value));
				}

				const selectedOnce = selectedFilterIdx !== -1 && currentUiFilters[selectedFilterIdx].selectedOnce ? currentUiFilters[selectedFilterIdx].selectedOnce : values.filter(value => { return value.selectedOnce; }).length > 0;
				const hasSelectedValues = values.filter(value => { return value.selected; }).length > 0;

				// Determine if the user has updated the filter values (used for apply/clear buttons state)
				const currentSelectedValuesInUiForFilter = values.filter(value => { return value.selected; }).map(v => v.value).sort();
				const alreadySubmittedValuesForFilter = flatten(this.state.submittedFilters.filter(s => s.filterName === availableFilter.filterName).map(v => v.values)).map(t => t.value).sort();

				const canApply = !isEqual(currentSelectedValuesInUiForFilter, alreadySubmittedValuesForFilter);
				const canClear = alreadySubmittedValuesForFilter.length > 0;

				// Disabled all unselected values if the configuration is not multi to prevent multiple selection at once
				values = values.map(value => {
					if (!filterConfiguration.isMulti && hasSelectedValues && !value.selected) {
						value.disabled = true;
					} else {
						value.disabled = false;
					}

					return value;
				});

				const filterOperator = currentUiFilters[selectedFilterIdx] ? currentUiFilters[selectedFilterIdx].operator : filterConfiguration.operator;

				// Merge information with filter configuration and other useful proeprties
				const filterResultInternal: IDataFilterInternal = {
					displayName: filterConfiguration.displayValue ? filterConfiguration.displayValue : availableFilter.filterName,
					filterName: availableFilter.filterName,
					isMulti: !filterConfiguration.isMulti ? false : filterConfiguration.isMulti,
					showCount: !filterConfiguration.showCount ? false : filterConfiguration.showCount,
					expandByDefault: !filterConfiguration.expandByDefault ? false : filterConfiguration.expandByDefault,
					selectedOnce: selectedOnce,
					selectedTemplate: filterConfiguration.selectedTemplate,
					hasSelectedValues: hasSelectedValues,
					values: values,
					operator: filterOperator,
					sortIdx: filterConfiguration.sortIdx,
					canApply: canApply,
					canClear: canClear
				};

				return filterResultInternal;
			}
		});

		this.setState({
			currentUiFilters: update(this.state.currentUiFilters, { $set: sortBy(updatedFilters.filter(updatedFilter => updatedFilter), 'sortIdx') })
		});
	}

	/**
	 * Update the filter status in the state according to values
	 * @param filterInfo the information about the updated filter
	 */
	private onFilterValuesUpdated(filterInfo: IDataFilterInfo) {

		let currentUiFilters: IDataFilterInternal[] = [];

		// Get the configuration for this filter
		const filterConfigIdx = this.props.filtersConfiguration.map(filter => { return filter.filterName; }).indexOf(filterInfo.filterName);

		if (filterConfigIdx !== -1) {

			const filterConfiguration = this.props.filtersConfiguration[filterConfigIdx];

			// Get the index of the filter in the current selected filters collection
			const filterIdx = this.state.currentUiFilters.map(filter => { return filter.filterName; }).indexOf(filterInfo.filterName);

			if (filterIdx !== -1) {

				currentUiFilters = cloneDeep(this.state.currentUiFilters);

				// If a control specifies an operator to use between values explictly, we update it in the current collection (ex: the FilterValueOperator component nested in the combo box component)
				if (filterInfo.operator) {
					currentUiFilters = update(currentUiFilters, { [filterIdx]: { operator: { $set: filterInfo.operator } } });
				}

				// Addition or merge scenario
				filterInfo.filterValues.map(filterValue => {

					const filterValueInternal: IDataFilterValueInternal = {
						selected: filterValue.selected,
						name: filterValue.name,
						value: filterValue.value,
						operator: filterValue.operator,
						selectedOnce: true
					};

					const valueIdx = currentUiFilters[filterIdx].values.map(value => { return value.value; }).indexOf(filterValue.value);

					if (valueIdx === -1) {
						// If the value does not exist yet, we add it to the selected values
						currentUiFilters = update(currentUiFilters, { [filterIdx]: { values: { $push: [filterValueInternal] } } });
					} else {
						// Otherwise, we update the value in selected values
						currentUiFilters = update(currentUiFilters, { [filterIdx]: { values: { [valueIdx]: { $set: filterValueInternal } } } });
					}
				});

			} else {

				const filterValuesInternal: IDataFilterValueInternal[] = filterInfo.filterValues.map(filterValue => {
					return {
						selected: filterValue.selected,
						name: filterValue.name,
						value: filterValue.value,
						selectedOnce: true
					};
				});

				const filterResultInternal: IDataFilterInternal = {
					displayName: filterConfiguration.displayValue ? filterConfiguration.displayValue : filterInfo.filterName,
					filterName: filterInfo.filterName,
					hasSelectedValues: filterInfo.filterValues.filter(value => value.selected).length > 0,
					selectedOnce: true,
					isMulti: !filterConfiguration.isMulti ? false : filterConfiguration.isMulti,
					showCount: !filterConfiguration.showCount ? false : filterConfiguration.showCount,
					expandByDefault: !filterConfiguration.expandByDefault ? false : filterConfiguration.expandByDefault,
					values: filterValuesInternal,
					operator: filterInfo.operator ? filterInfo.operator : currentUiFilters[filterIdx].operator,
					selectedTemplate: filterConfiguration.selectedTemplate,
					sortIdx: filterConfiguration.sortIdx
				};

				// If does not exist, add to selected filters collection
				currentUiFilters = update(this.state.currentUiFilters, { $push: [filterResultInternal] });
			}

			if (!filterConfiguration.isMulti || filterInfo.forceUpdate) {

				const submittedFilters = this.getSelectedFiltersFromUIFilters(currentUiFilters);

				this.setState({
					submittedFilters: submittedFilters
				}, () => {

					// Send only selected filters to the data source
					this.props.onUpdateFilters(submittedFilters);

					// Set the filter links in URL
					this.setFiltersDeepLink(submittedFilters);

					// Force a UI refresh is the submitted filters come from 'Apply' button to get the correct disabled/active state set
					if (filterConfiguration.isMulti) {
						this.forceUpdate();
					}
				});
			}

			this.getFiltersToDisplay(this.props.availableFilters, currentUiFilters, this.props.filtersConfiguration);
		}
	}

	/**
	 * Gets only the selected filters from the UI and convert them to format sent to the data source
	 * @param currentUiFilters the current UI filters (selected or not)
	 */
	private getSelectedFiltersFromUIFilters(currentUiFilters: IDataFilterInternal[]): IDataFilter[] {

		const selectedFilters: IDataFilter[] = currentUiFilters.map(selectedFilter => {

			const newSelectedFilter = cloneDeep(selectedFilter);

			// Update the operator to 'or' when single value mode is selected and multiple values are submitted
			if (selectedFilter.values.some(v => v.selected) && !selectedFilter.isMulti && selectedFilter.selectedTemplate !== BuiltinFilterTemplates.DateRange) {
				newSelectedFilter.operator = FilterConditionOperator.OR;
			}

			const values = newSelectedFilter.values.filter(selectedValue => {
				return selectedValue.selected;
			});

			if (values.length > 0) {

				newSelectedFilter.values = values.map(value => {

					let newValue = cloneDeep(value);

					// Remove useless properties since we don't want to expose them in the data source, especially for consumers
					delete newValue.selected;
					delete newValue.selectedOnce;
					delete newValue.count;

					// 'Equals' by default
					if (!newValue.operator) newValue.operator = FilterComparisonOperator.Eq;

					return newValue;
				});

				// Remove useless properties since we don't want to expose them in the data source, especially for consumers
				// We need to return only proeprties used for IDataFilter to avoid confusion
				delete newSelectedFilter.expandByDefault;
				delete newSelectedFilter.hasSelectedValues;
				delete newSelectedFilter.selectedOnce;
				delete newSelectedFilter.showCount;
				delete newSelectedFilter.isMulti;
				delete newSelectedFilter.displayName;
				delete newSelectedFilter.canApply;
				delete newSelectedFilter.canClear;
				delete newSelectedFilter.sortIdx;
				delete newSelectedFilter.selectedTemplate;

				return newSelectedFilter;
			}
		});

		return selectedFilters.filter(filter => filter);
	}

	/**
	 * Binds event fired from filter value web components ('When an single filter value is selected')
	 */
	private bindFilterEvents() {

		this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_UPDATED, ((ev: CustomEvent) => {

			// We ensure the event if not propagated outside the component (i.e. other Web Part instances)
			ev.stopImmediatePropagation();

			const dataFilterInfo = ev.detail as IDataFilterInfo;

			// Need the 'selected' because web components are stateless so we need to know if the filter has been selected or removed
			this.onFilterValuesUpdated(dataFilterInfo);

		}).bind(this));
	}

	/**
	 * Binds event fired from filter value web components ('When all filter values are applied (multi values filter)')
	 */
	private bindApplyFiltersEvents() {

		this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_APPLY_ALL, ((ev: CustomEvent) => {

			ev.stopImmediatePropagation();

			const submittedFilters = this.getSelectedFiltersFromUIFilters(this.state.currentUiFilters);

			// Set the filter links in URL
			this.setFiltersDeepLink(submittedFilters);

			// Refresh the UI
			this.getFiltersToDisplay(this.props.availableFilters, this.state.currentUiFilters, this.props.filtersConfiguration);

			this.setState({
				submittedFilters: submittedFilters
			});

			// Send selected filters to the data source
			this.props.onUpdateFilters(submittedFilters);

		}).bind(this));
	}

	/**
	 * Binds event fired from filter value web components ('When all filter values are cleared (multi values filter)')
	 */
	private bindClearFiltersEvents() {

		this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_CLEAR_ALL, ((ev: CustomEvent) => {

			ev.stopImmediatePropagation();

			const updatedfilters = this.state.currentUiFilters.map(selectedFilter => {

				const updatedFilter = cloneDeep(selectedFilter);

				if (updatedFilter.filterName === ev.detail.filterName) {
					updatedFilter.values = [];
					updatedFilter.selectedOnce = true;
					updatedFilter.hasSelectedValues = false;
				} else {
					updatedFilter.values = updatedFilter.values.filter(filter => filter.selected);
				}
				return updatedFilter;
			});

			const updateSubmittedFilters = this.state.submittedFilters.map(submittedFilter => {
				if (submittedFilter.filterName === ev.detail.filterName) {
					submittedFilter.values = [];
				}
				return submittedFilter;
			});

			this.setState({
				submittedFilters: updateSubmittedFilters
			});

			// Refresh the UI
			this.getFiltersToDisplay(this.props.availableFilters, updatedfilters, this.props.filtersConfiguration);

			this.resetFiltersDeepLink();

			// Send selected filters to the data source
			this.props.onUpdateFilters(updateSubmittedFilters);

		}).bind(this));
	}

	/**
	 * Binds events fired from the filter operator components
	 */
	private bindFilterValueOperatorUpdated() {

		this.componentRef.current.addEventListener(ExtensibilityConstants.EVENT_FILTER_VALUE_OPERATOR_UPDATED, ((ev: CustomEvent) => {

			ev.stopImmediatePropagation();

			// Find the filter wit hthis specific name
			const filters = this.state.currentUiFilters.map(filter => {

				const selectedValues = filter.values.filter(v => v.selected);
				// Submitted values for the current filter name
				const submittedValues = this.state.submittedFilters.filter(f => f.filterName === ev.detail.filterName && f.values.filter(v => selectedValues.map(s => s.value).indexOf(v.value) !== -1));

				if (filter.filterName === ev.detail.filterName) {

					// We let the user apply the new filters only if the operator changes or has at least two selected values      
					filter.canApply = (!filter.canApply && filter.operator !== ev.detail.operator && selectedValues.length > 1) || (filter.canApply && submittedValues.length === 0);
					filter.operator = ev.detail.operator;
				}

				return filter;
			});

			this.setState({
				currentUiFilters: filters
			});

		}).bind(this));
	}

	// Build the template context
	private getTemplateContext(): ISearchFiltersTemplateContext {

		return {
			filters: this.state.currentUiFilters,
			selectedFilters: this.state.submittedFilters,
			instanceId: this.props.instanceId,
			theme: this.props.themeVariant,
			strings: commonStrings.Filters,
			selectedOnce: this.state.currentUiFilters.filter(currentFilter => currentFilter.selectedOnce).length > 0,
			properties: {
				...this.props.properties
			},
		};
	}

	/**
	 * Retrieves the default filters from the URL and set them as initial state
	 */
	private getFiltersDeepLink() {

		const queryString = UrlHelper.getQueryStringParam(DEEPLINK_QUERYSTRING_PARAM, window.location.href);

		if (queryString) {

			try {

				const dataFilters: IDataFilter[] = JSON.parse(decodeURIComponent(queryString));
				const currentUiFilters = dataFilters.map(filter => {

					const filterConfiguration = DataFilterHelper.getConfigurationForFilter(filter, this.props.filtersConfiguration);

					return {
						displayName: filterConfiguration.displayValue ? filterConfiguration.displayValue : filter.filterName,
						expandByDefault: filterConfiguration.expandByDefault,
						filterName: filter.filterName,
						isMulti: filterConfiguration.isMulti,
						selectedTemplate: filterConfiguration.selectedTemplate,
						showCount: filterConfiguration.showCount,
						selectedOnce: true,
						operator: filter.operator,
						values: filter.values.map((value: IDataFilterValueInternal) => {
							value.selected = true;
							value.selectedOnce = true;
							return value;
						}),
						canApply: false,
						canClear: true
					} as IDataFilterInternal;
				});

				// Update the connected data source (if applicable)
				this.props.onUpdateFilters(dataFilters);

				// Update selected filters in the UI
				this.setState({
					currentUiFilters: currentUiFilters,
					submittedFilters: dataFilters
				});

			} catch (e) {
				Log.verbose(`[SearchFiltersContainer.getFiltersDeepLink]`, `Filters format in the query string is invalid.`);
			}
		}
	}

	/**
	 * Set the current selected filters as query string in the URL for deep linking
	 * @param submittedFilters the current submitted filters
	 */
	private setFiltersDeepLink(submittedFilters: IDataFilter[]) {

		let filtersDeepLinkUrl: string;
		if (submittedFilters.length > 0) {
			filtersDeepLinkUrl = UrlHelper.addOrReplaceQueryStringParam(window.location.href, DEEPLINK_QUERYSTRING_PARAM, JSON.stringify(submittedFilters));
		} else {
			filtersDeepLinkUrl = UrlHelper.removeQueryStringParam(DEEPLINK_QUERYSTRING_PARAM, window.location.href);
		}

		window.history.pushState({ path: filtersDeepLinkUrl }, '', filtersDeepLinkUrl);
	}

	private resetFiltersDeepLink() {
		// Reset filters query string
		const filtersDeepLinkUrl = UrlHelper.removeQueryStringParam(DEEPLINK_QUERYSTRING_PARAM, window.location.href);
		window.history.pushState({ path: filtersDeepLinkUrl }, '', filtersDeepLinkUrl);
	}

	/**
	 * Subscribes to URL query string change events using SharePoint page router
	 * https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/guidance/intercepting-query-changes-in-webparts
	 */
	private _handleQueryStringChange() {

		((history) => {
			var pushState = history.pushState;
			history.pushState = (state, key, path) => {
				pushState.apply(history, [state, key, path]);
				this.getFiltersDeepLink();
			};
		})(window.history);

		// When the browser 'back' or 'forward' button is pressed
		window.onpopstate = (ev) => {

			const queryString = UrlHelper.getQueryStringParam(DEEPLINK_QUERYSTRING_PARAM, window.location.href);

			// Initial state where no filter are selected
			if (!queryString) {

				this.setState({
					currentUiFilters: this.resetSelectedFilterValues(this.state.currentUiFilters),
					submittedFilters: []
				});

				// Notify connected Web Parts
				this.props.onUpdateFilters([]);
			}

			this.getFiltersDeepLink();
		};
	}

	private resetSelectedFilterValues(currentUiFilters: IDataFilterInternal[]): IDataFilterInternal[] {

		const updatedfilters = currentUiFilters.map(selectedFilter => {
			const updatedFilter = cloneDeep(selectedFilter);
			updatedFilter.values = [];
			return updatedFilter;
		});

		return updatedfilters;
	}
}
