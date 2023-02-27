import * as React from 'react';
import { ISearchResultsContainerProps } from './ISearchResultsContainerProps';
import { ISearchResultsContainerState } from './ISearchResultsContainerState';
import { TemplateRenderer } from "../../../controls/TemplateRenderer/TemplateRenderer";
import { Shimmer, ShimmerElementType as ElemType, ShimmerElementsGroup, SelectionZone, Selection, SelectionMode } from 'office-ui-fabric-react';
import { isEqual, cloneDeep, merge, isEmpty } from "@microsoft/sp-lodash-subset";
import { ITemplateService } from '../../../services/templateService/ITemplateService';
import { TemplateService } from '../../../services/templateService/TemplateService';
import { Log, DisplayMode } from "@microsoft/sp-core-library";
import { MessageBar, MessageBarType, Overlay, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { IDataSourceData, IDataFilterResult, BuiltinTemplateSlots, IDataFilter, IDataContext } from '@pnp/modern-search-extensibility';
import { ISearchResultsTemplateContext } from '../../../models/common/ITemplateContext';
// import styles from './SearchResultsContainer.module.scss';
import { Constants, AutoCalculatedDataSourceFields, TestConstants } from '../../../common/Constants';
import { ITemplateSlot } from '@pnp/modern-search-extensibility';
import { ObjectHelper } from '../../../helpers/ObjectHelper';
import { BuiltinLayoutsKeys } from '../../../layouts/AvailableLayouts';
import { WebPartTitle } from '@pnp/spfx-controls-react/lib/WebPartTitle';
import * as webPartStrings from 'SearchResultsWebPartStrings';
import { spfi, SPFx, DefaultInit, DefaultHeaders, RequestDigest } from '@pnp/sp';
import "@pnp/sp/taxonomy";
// import { ITermGroups, ITermSets, IChildren } from "@pnp/sp/taxonomy";
// import { ComponentType } from '../../../common/ComponentType';

import * as $ from 'jquery';
// import { UrlHelper } from '../../../helpers/UrlHelper';

// import AdvanceSearchFilters from '../../../shared/commonSearchFilters';
import * as moment from 'moment';
import AdvanceSearchFilters from '../../../shared/commonSearchFilters';


const LogSource = "SearchResultsContainer";

/**
 * Cached data structure for a data source
 */
export interface IDataSourceCacheData {
    data: IDataSourceData;
    itemsCount: number;
}

export default class SearchResultsContainer extends React.Component<ISearchResultsContainerProps, ISearchResultsContainerState> {

    /**
     * A template service instance
     */
    private templateService: ITemplateService = undefined;

    /**
     * Store the last available filters
     */
    private _lastAvailableSearchFilters: IDataFilterResult[] = [];

    /**
     * The current total items count
     */
    private _totalItemsCount: number = 0;

    /**
     * The current selection information in the template
     */
    private _selection: Selection;

    private _lastPageNumber: number;
    private _lastPageSelectedKeys: string[] = [];

    public constructor(props: ISearchResultsContainerProps) {

        super(props);

        this.state = {
            data: null,
            rawData: null,
            isLoading: true,
            errorMessage: '',
            renderedOnce: false,
            selectedItemKeys: [],
            searchQueryText: "",
            search: '',
            searchResult: [],
            sortBy: "bestMatch",
            searchIn: "FinalRepository",
            allThesewords: "",
            exactPhrase: "",
            anyOfTheseWords: "",
            noneOfTheseWords: "",
            modifiedBy: [],
            modifiedByColl: [],
            lastModified: [],
            filterFormat: [],
            filterFormatColl: [],
            divBuColl: [],
            divBu: [],
            contentTypeColl: [],
            contentType: [],
            workProcessColl: [],
            workProcess: [],
            property: [],
            country: [],
            itemsPerPage: 10,
            termJSONData: [],
            selectedFilterOption: {}
        };

        this.handleCheckBoxChange = this.handleCheckBoxChange.bind(this);
        this.handleRadioChange = this.handleRadioChange.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.GetDataCollection = this.GetDataCollection.bind(this);
        this.handleOnClick = this.handleOnClick.bind(this);

        this.templateService = this.props.serviceScope.consume<ITemplateService>(TemplateService.ServiceKey);

        this._onSelectionChanged = this._onSelectionChanged.bind(this);
        this.ResetFilter = this.ResetFilter.bind(this);

        this._selection = new Selection({
            onSelectionChanged: this._onSelectionChanged,
            getKey: (item, index) => {
                // Not suitable as keys
                // - Stringified object as we can't rely on field values. Ex they can diverge from calls with SharePoint (ex: piSearchResultId with SharePoint)
                return item.key = `${this.props.dataContext.pageNumber}${index}`;
            },
        });
    }
    handleOnClick(e: any) {
        e.preventDefault();
        console.log("clicked");
        if (e.target.className.indexOf("collapsed") > -1) {
            $(e.target).removeClass("collapsed");
            $(e.target).attr("aria-expanded", "true");
            $(e.target).next(".refine-filter-con").addClass("show");
        } else {
            $(e.target).addClass("collapsed");
            $(e.target).attr("aria-expanded", "false");
            $(e.target).next(".refine-filter-con").removeClass("show");
        }
        e.stopPropagation();
    }
    async GetDataCollection(termData: any, termstate: any, e) {
        e.preventDefault();
        console.log(e);
        const { name, value } = e.target;
        console.log(name, value);
        console.log("state length - ", this.state[termstate].length);
        let tempArray = [];
        if (this.state[termstate].length == 0) {
            const sp = spfi(window.location.origin + "/sites/OneFEO").using(SPFx(this.context)).using(RequestDigest());
            try {
                const info = await sp.termStore.groups();
                let fill = info.filter(f => { if (f.name == "OneFEO") return f; });
                console.log(fill);
                console.log("inside get term function");
                const TermSetsinfo = await sp.termStore.groups.getById(fill[0].id).sets();
                console.log(TermSetsinfo);
                // let termsetFill = TermSetsinfo.filter(s => { if (s.localizedNames[0].name == "FEO term set") return s; })
                // const TermSetinfo = await sp.termStore.groups.getById(fill[0].id).sets.getById(termsetFill[0].id).children();
                let CurrentTermFilter = TermSetsinfo.filter(t => { if (t.localizedNames[0].name == termData) return t; });
                console.log("CurrentTermFilter = ", CurrentTermFilter);
                const TermSetChildren = await sp.termStore.groups.getById(TermSetsinfo[0].id).sets.getById(CurrentTermFilter[0].id).getAllChildrenAsOrderedTree();
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
        this.handleOnClick(e);
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

    private async handleRadioChange(stateName: any, e: any) {
        if (stateName == "sortBy") {
            this.setState({ sortBy: e.target.value });
        } else if (stateName == "searchIn") {
            this.setState({ searchIn: e.target.value });
        }
        await this.getDataFromDataSource(0);
    }

    private async handleCheckBoxChange(stateName: any, e: any) {
        console.log(stateName, e.target.value);
        if (stateName == "modifiedBy" || stateName == "lastModified" || stateName == "filterFormat") {
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
            }
        } else {
            let selectedFilterOption = this.state.selectedFilterOption;
            console.log(selectedFilterOption);
            if (selectedFilterOption[stateName].indexOf(e.target.value) > -1) {
                selectedFilterOption[stateName].pop(1, selectedFilterOption[stateName].indexOf(e.target.value));
            } else {
                selectedFilterOption[stateName].push(e.target.value);
            }
            this.setState({ selectedFilterOption }, function () {
                console.log(this.state.selectedFilterOption);
            });
        }
        await this.getDataFromDataSource(0);
    }

    handleChange(e) {
        const { name, value } = e.target;
        let that = this;
        switch (name) {
            case "allThesewords":
                that.setState({ allThesewords: value });
                break;
            case "exactPhrase":
                that.setState({ exactPhrase: value });
                break;
            case "anyOfTheseWords":
                that.setState({ anyOfTheseWords: value });
                break;
            case "noneOfTheseWords":
                that.setState({ noneOfTheseWords: value });
                break;
            default:
                break;
        }
    };

    public render(): React.ReactElement<ISearchResultsContainerProps> {

        let renderTemplate: JSX.Element = null;
        let renderOverlay: JSX.Element = null;
        let templateContent: string = null;
        let renderTitle: JSX.Element = null;

        // Web Part title
        renderTitle = <div data-ui-test-id={TestConstants.SearchResultsWebPartTitle}>
            <WebPartTitle
                displayMode={this.props.webPartTitleProps.displayMode}
                title={this.props.webPartTitleProps.title}
                updateProperty={this.props.webPartTitleProps.updateProperty}
                moreLink={this.props.webPartTitleProps.moreLink}
                themeVariant={this.props.webPartTitleProps.themeVariant}
                className={this.props.webPartTitleProps.className}
            />
        </div>;

        // Content loading
        templateContent = this.templateService.getTemplateMarkup(this.props.templateContent);
        const templateContext = this.getTemplateContext();
        let renderType = this.props.renderType;

        let selectionMode = SelectionMode.none;
        if (this.props.properties.itemSelectionProps && this.props.properties.itemSelectionProps.allowItemSelection) {
            selectionMode = this.props.properties.itemSelectionProps.allowMulti ? SelectionMode.multiple : SelectionMode.single;
        }

        renderTemplate = <SelectionZone
            selection={this._selection}
            selectionMode={selectionMode}>
            <TemplateRenderer
                templateContent={templateContent}
                templateContext={templateContext}
                templateService={this.templateService}
                instanceId={this.props.instanceId}
                renderType={renderType}
            />
        </SelectionZone>;

        // Determine if the component should show content according to Web Part parameters  
        if (this.state.data && this.state.data.items.length === 0) {

            if (this.props.properties.showBlankIfNoResult) {

                // Edit mode
                if (this.props.webPartTitleProps.displayMode === DisplayMode.Edit) {

                    // We keep the debug view if display mode to help user debug...
                    if (this.props.properties.selectedLayoutKey !== BuiltinLayoutsKeys.ResultsDebug) {
                        renderTemplate = <MessageBar messageBarType={MessageBarType.info}>{webPartStrings.General.ShowBlankEditInfoMessage}</MessageBar>;
                    }

                } else {

                    // Display Mode
                    renderTitle = null;
                    renderTemplate = null;
                }
            }
        }

        if (this.state.isLoading) {

            // Overlay
            if (this.state.renderedOnce) {

                renderOverlay = <div data-ui-test-id={TestConstants.SearchResultsLoadingOverlay}>
                    <Overlay isDarkThemed={false} className={"overlay"}>
                        <Spinner size={SpinnerSize.medium} />
                    </Overlay>
                </div>;

            } else {

                // Placeholder loading (first load scenario)
                let renderShimmerElements: JSX.Element = null;
                templateContent = this.templateService.getPlaceholderMarkup(this.props.templateContent);

                if (templateContent) {
                    renderShimmerElements = <TemplateRenderer
                        templateContent={templateContent}
                        templateContext={this.getTemplateContext()}
                        templateService={this.templateService}
                        instanceId={this.props.instanceId}
                        renderType={this.props.renderType}
                    />;
                } else {
                    renderShimmerElements = this.getDefaultShimmerElements();
                }

                renderTemplate = renderShimmerElements;
            }
        }

        let errorTemplate = null;
        // Error handling
        if (this.state.errorMessage) {
            errorTemplate = <div className={TestConstants.SearchResultsErrorMessage} data-ui-test-id={TestConstants.SearchResultsErrorMessage}><MessageBar messageBarType={MessageBarType.error}>{this.state.errorMessage}</MessageBar></div>;
        }

        let renderCountTemplate = <div id="siInput" className="search-input-value"><p>Your search word/phrase: <b>{this.state.searchQueryText}</b> has <b>{this.state.data != null && this.state.data.totalItemsCount + " results"}</b></p></div>;
        return (
            <main>
                <div className='row'>
                    <div className='col-md-4'>

                        <AdvanceSearchFilters stateValue={this.state} handleRadioChange={this.handleRadioChange} handleCheckBoxChange={this.handleCheckBoxChange} handleChange={this.handleChange} context={this.context} />

                        {/*<div className='with-side-menu' data-instance-id={this.props.instanceId}>
                            <aside className='side-menu' >
                                <div className='side-menu-title'>
                                    <h5 className="mb-0">
                                        <i className="fa-solid fa-sliders d-inline-block pe-3"></i><b>Refine </b>
                                    </h5>
                                </div>
                                <div id='asideMove'>
                                    <div className='ps-0 move-to-acc'>
                                        <div className='refine-list ps-0'>
                                            {/* Sort by 
                                            <div className="refine-items">
                                                <h6>Sort By</h6>
                                                <div className="refine-sort selected">
                                                    <input type="radio" id="bestMatch" name="sortBy" value="bestMatch" checked={this.state.sortBy === "bestMatch"} onChange={this.handleRadioChange.bind(this, "sortBy")} />
                                                    <label htmlFor="bestMatch">Best Match</label>
                                                </div>
                                                <div className="refine-sort">
                                                    <input type="radio" id="newest" name="sortBy" value="newest" checked={this.state.sortBy === "newest"} onChange={this.handleRadioChange.bind(this, "sortBy")} />
                                                    <label htmlFor="newest">Newest</label>
                                                </div>
                                                <div className="refine-sort mb-0">
                                                    <input type="radio" id="mostPopular" name="sortBy" value="mostPopular" checked={this.state.sortBy === "mostPopular"} onChange={this.handleRadioChange.bind(this, "sortBy")} />
                                                    <label htmlFor="mostPopular">Most Popular</label>
                                                </div>
                                            </div>
                                            {/* Search In 
                                            <div className="refine-items">
                                                <h6>Search In </h6>
                                                <div className="refine-sort">
                                                    <input type="radio" id="si-all" name="searchIn" value="all" checked={this.state.searchIn == "all"} className="hidden-filter-radio" onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                    <label htmlFor="si-all">All</label>
                                                </div>
                                                <div className="refine-sort">
                                                    <input type="radio" id="FinalRepository" name="searchIn" value="FinalRepository" checked={this.state.searchIn == "FinalRepository"} className="show-filter-radio" onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                    <label htmlFor="FinalRepository">Final Repository</label>
                                                </div>
                                                <div className="refine-sort">
                                                    <input type="radio" id="eMemo" name="searchIn" value="eMemo" className="show-filter-radio" checked={this.state.searchIn == "eMemo"} onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                    <label htmlFor="eMemo">eMemo</label>
                                                </div>
                                                <div className="refine-sort">
                                                    <input type="radio" id="FEONet" name="searchIn" value="FEONet" className="hidden-filter-radio" checked={this.state.searchIn == "FEONet"} onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                    <label htmlFor="FEONet">FEONet</label>
                                                </div>
                                                <div className="refine-sort">
                                                    <input type="radio" id="iPortal" name="searchIn" value="iPortal" className="hidden-filter-radio" checked={this.state.searchIn == "iPortal"} onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                    <label htmlFor="iPortal">iPortal</label>
                                                </div>
                                                <div className="refine-sort mb-0">
                                                    <input type="radio" id="CollaborationSpace" name="searchIn" value="CollaborationSpace" checked={this.state.searchIn == "CollaborationSpace"} className="hidden-filter-radio" onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                    <label htmlFor="CollaborationSpace">Collaboration Space</label>
                                                </div>
                                            </div>
                                            <div className="refine-items b-none">
                                                <h6 className="mb-0">Filter By</h6>
                                            </div>
                                            {/* Div Bu's 
                                            {(this.state.searchIn == "" || this.state.searchIn == "FinalRepository" || this.state.searchIn == "eMemo") &&
                                                <div>
                                                    <div className="refine-items">
                                                        <a id="acc1" href="#" className="refine-items-link" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Associated BU", "divBuColl")}>Div / BUs</a>
                                                        <div id="businessCat" className="refine-filter-con collapse " >
                                                            {this.state.divBuColl != undefined && this.state.divBuColl.length > 0 && this.state.divBuColl.map((item, key) =>
                                                                <div key={key} className="refine-filter-item">
                                                                    <input type="checkbox" id={"businessCat-feo" + key} name="divBu" value={item.toString()} checked={this.state.divBu.indexOf(item.toString()) > -1} onChange={this.handleCheckBoxChange.bind(this, "divBu")} />
                                                                    <label htmlFor={"businessCat-feo" + key}>{item}</label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Content Type 
                                                    <div className="refine-items">
                                                        <a id="acc2" href="#" className="refine-items-link" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Content Type", "contentTypeColl")}>Content Type</a>
                                                        <div id="contentType" className="refine-filter-con collapse">
                                                            {this.state.contentTypeColl.length > 0 && this.state.contentTypeColl.map((val, key) =>
                                                                <div key={key} className="refine-filter-item mb-0">
                                                                    <input type="checkbox" id={"contentType-tm" + key} name="contentType" value={val.toString()} checked={this.state.contentType.indexOf(val.toString()) > -1} onChange={this.handleCheckBoxChange.bind(this, "contentType")} />
                                                                    <label htmlFor={"contentType-tm" + key}>{val}</label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/*Work Process
                                                    <div className="refine-items">
                                                        <a id="acc3" href="#" className="refine-items-link" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Work Process", "workProcessColl")}>Work Process</a>
                                                        <div id="workProcessType" className="refine-filter-con collapse " >
                                                            {this.state.workProcessColl.length > 0 && this.state.workProcessColl.map((val, key) =>
                                                                <div key={key} className="refine-filter-item">
                                                                    <input type="checkbox" id={"wp-" + key} name="workProcess" value={val.toString()} checked={this.state.workProcess.indexOf(val.toString()) > -1} onChange={this.handleCheckBoxChange.bind(this, "workProcess")} />
                                                                    <label htmlFor={"wp-" + key}>{val}</label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>}
                                            {/*Format 
                                            <div className="refine-items">
                                                <a id="acc4" href="#" className="refine-items-link collapsed" aria-expanded="false" onClick={this.handleOnClick.bind(this)}>Format</a>
                                                <div id="format" className="refine-filter-con collapse">
                                                    {this.state.filterFormatColl != undefined && this.state.filterFormatColl.length > 0 && this.state.filterFormatColl.map((item, key) =>
                                                        <div key={key} className="refine-filter-item">
                                                            <input type="checkbox" id={"format-" + key} name="filterFormat" value={item.toString()} checked={this.state.filterFormat.indexOf(item.toString()) > -1} onChange={this.handleCheckBoxChange.bind(this, "filterFormat")} />
                                                            <label htmlFor={"format-" + key}>{item}</label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Modified By  
                                            <div className="refine-items">
                                                <a id="acc5" href="#" className="refine-items-link collapsed" aria-expanded="false" onClick={this.handleOnClick.bind(this)}>Modified By</a>
                                                <div id="creator" className="refine-filter-con collapse">
                                                    {this.state.modifiedByColl.length > 0 && this.state.modifiedByColl.map((val, key) =>
                                                        <div key={key} className="refine-filter-item">
                                                            <input type="checkbox" id={"creator-" + key} name="modifiedBy" value={"ModifiedBy:" + val.toString()} checked={this.state.modifiedBy.indexOf("ModifiedBy:" + val.toString()) > -1} onChange={this.handleCheckBoxChange.bind(this, "modifiedBy")} />
                                                            <label htmlFor={"creator-" + key}>{val}</label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Last Modified Date 
                                            <div className="refine-items">
                                                <a id="acc6" href="#" className="refine-items-link collapsed" aria-expanded="false" onClick={this.handleOnClick.bind(this)}>Last Modified</a>
                                                <div id="createDate" className="refine-filter-con collapse">
                                                    <div className="refine-filter-item">
                                                        <input type="checkbox" id="lastModAny" name="lastModified" value={moment().subtract(1000, 'days').format("YYYY-MM-DD")} checked={this.state.lastModified.indexOf(moment().subtract(1000, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                        <label htmlFor="lastModAny">Any time</label>
                                                    </div>
                                                    <div className="refine-filter-item">
                                                        <input type="checkbox" id="lastModDay" name="lastModified" value={moment().subtract(1, 'days').format("YYYY-MM-DD")} checked={this.state.lastModified.indexOf(moment().subtract(1, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                        <label htmlFor="lastModDay">Past 24 hours</label>
                                                    </div>
                                                    <div className="refine-filter-item">
                                                        <input type="checkbox" id="lastModWeek" name="lastModified" value={moment().subtract(7, 'days').format("YYYY-MM-DD")} checked={this.state.lastModified.indexOf(moment().subtract(7, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                        <label htmlFor="lastModWeek">Past Week</label>
                                                    </div>
                                                    <div className="refine-filter-item">
                                                        <input type="checkbox" id="lastModMnth" name="lastModified" value={moment().subtract(30, 'days').format("YYYY-MM-DD")} checked={this.state.lastModified.indexOf(moment().subtract(30, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                        <label htmlFor="lastModMnth">Past Month</label>
                                                    </div>
                                                    <div className="refine-filter-item">
                                                        <input type="checkbox" id="lastMod3Mnths" name="lastModified" value={moment().subtract(3, 'months').format("YYYY-MM-DD")} checked={this.state.lastModified.indexOf(moment().subtract(3, 'months').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                        <label htmlFor="lastMod3Mnths">Past 3 Months</label>
                                                    </div>
                                                    <div className="refine-filter-item">
                                                        <input type="checkbox" id="lastModYear" name="lastModified" value={moment().subtract(1, 'year').format("YYYY-MM-DD")} checked={this.state.lastModified.indexOf(moment().subtract(1, 'year').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
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
                        </div>*/}
                    </div>
                    <div className='col-md-8'>
                        <div data-instance-id={this.props.instanceId}
                            data-ui-test-id={TestConstants.SearchResultsWebPart}>
                            {renderOverlay}
                            {renderTitle}
                            {errorTemplate}
                            {renderCountTemplate}
                            {renderTemplate}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // public async componentWillMount() {
    //     console.log("componentWillMount");
    //     await this.getDataFromDataSource(this.props.dataContext.pageNumber);
    // }

    public async componentDidMount() {
        //add onclick for search-button-main using jquery.
        if (this.getUrlParameter("kql") != "" || this.getUrlParameter("q") != "") {
            const queryParameter = this.getUrlParameter("kql") != "" ? this.getUrlParameter("kql") : this.getUrlParameter("q");
            if (this.getUrlParameter("kql") != "") {
                let parsedParamsValue = JSON.parse(queryParameter);
                if (parsedParamsValue.length > 0) {
                    let that = this;
                    //update state based on queryparameter
                    for (let index = 0; index < parsedParamsValue.length; index++) {
                        const element = parsedParamsValue[index];
                        let stateName = this.state[element.filterName];
                        let queryValue = element.values[0];
                        switch (element.filterName) {
                            case "sortBy":
                                this.setState({ sortBy: queryValue });
                                break;
                            case "searchIn":
                                this.setState({ searchIn: queryValue });
                                break;
                            case "modifiedBy":
                                this.setState({ modifiedBy: queryValue });
                                break;
                            case "lastModified":
                                this.setState({ lastModified: queryValue });
                                break;
                            case "filterFormat":
                                this.setState({ filterFormat: queryValue });
                                break;
                            case "divBu":
                                this.setState({ divBu: queryValue });
                                break;
                            case "contentType":
                                this.setState({ contentType: queryValue });
                                break;
                            case "workProcess":
                                this.setState({ workProcess: queryValue });
                                break;
                            case "allThesewords" || "exactPhrase" || "anyOfTheseWords" || "noneOfTheseWords" || "searchQueryText":
                                this.setState({ searchQueryText: queryValue });
                            default:
                                break;
                        }
                    }
                    await this.getDataFromDataSource(this.props.dataContext.pageNumber);
                }
            } else {
                let parsedParamsValue = queryParameter;
                this.setState({ searchQueryText: parsedParamsValue }, async function () {
                    await this.getDataFromDataSource(this.props.dataContext.pageNumber);
                });
            }
        }
        $(".search-button-main").on("click", async (e) => {
            e.preventDefault();
            await this.getDataFromDataSource(this.props.dataContext.pageNumber);
        });
        $(".search-input-main").on("keypress", async (e) => {
            var key = e.key;
            if (key === "Enter") {
                e.preventDefault();
                await this.getDataFromDataSource(this.props.dataContext.pageNumber);
            }
        });

        //getting filter values
        fetch("/sites/OneFEO/SiteAssets/OrgStructure.js")
            .then((res) => {
                return res.json();
            }).then((data) => {
                console.log(data);
                let selectedFilterOption = this.state.selectedFilterOption;
                for (let i = 0; i < data.length; i++) {
                    selectedFilterOption[data[i].termNode.replace(/ /g, "")] = [];
                }
                this.setState({ termJSONData: data, selectedFilterOption });
            });
    }

    public async componentDidUpdate(prevProps: ISearchResultsContainerProps, prevState: ISearchResultsContainerState) {
        // if (!isEqual(prevProps.dataSourceKey, this.props.dataSourceKey)
        //     || !isEqual(prevProps.dataContext, this.props.dataContext)
        //     // || !isEqual(prevProps.dataContext, tempData)
        //     || !isEqual(prevProps.properties.dataSourceProperties, this.props.properties.dataSourceProperties)
        //     || !isEqual(prevProps.properties.templateSlots, this.props.properties.templateSlots)
        //     || !isEqual(prevProps.dataContext.pageNumber, this.props.dataContext.pageNumber)) {
        if (!isEqual(prevProps.dataContext.pageNumber, this.props.dataContext.pageNumber)) {
            this._lastPageSelectedKeys = this._selection.getSelection().map(item => item.key as string);
            await this.getDataFromDataSource(this.props.dataContext.pageNumber);
        }

        console.log(this.props.dataContext.pageNumber);
        if (!this.props.properties.itemSelectionProps.allowItemSelection && this.state.data) {
            // Reset already selected items
            this._selection.setItems(this.state.data.items, true);
        }

        //updating css and adding dynamic content
        // setTimeout(() => {
        if (this.state.data != undefined) {
            let rawData = this.state.data.items;
            setTimeout(() => {
                $('.file-prev-btn').on('click', function (e) {
                    e.preventDefault();
                    var iframe = document.createElement('iframe');
                    let iframeContainer = document.querySelectorAll(".file-prev-container #iframe-Content");
                    let currentItemID = $(this).attr("data-bs-target");
                    let currentItemIndex = $(this).attr("data-index");
                    if (iframeContainer != null && iframeContainer[currentItemIndex].childElementCount < 1) {
                        iframeContainer[currentItemIndex].appendChild(iframe);
                        // provide height and width to it
                        iframe.id = "currentIframe";
                        iframe.setAttribute("style", "height:450px;width:100%;border:none;");
                        iframe.src = $(this).attr('data-frame-url');
                        console.log(currentItemID);
                        $(currentItemID).toggle();
                        console.log($(currentItemID).css('display'));
                        if ($(currentItemID).css('display') == 'none') {
                            console.log("inside if condition");
                            $(this).attr("aria-expanded", "true");
                            $(currentItemID).show();
                        } else {
                            console.log("inside else condition");
                            $(this).attr("aria-expanded", "true");
                            $(currentItemID).hide();
                        }
                        var posX = $(this).offset().left, posY = $(this).offset().top;

                        var previewParentTop = posY - 360 + "px";
                        var previewParentLeft = posX - 480 + "px";
                        // var previewParentTop = "170px";
                        // var previewParentLeft = "73%";
                        $("#previewParent").css({ top: previewParentTop, left: previewParentLeft });
                    }
                });
            }, 500);
            // $('.close-prev').on('click', function (e) {
            //     e.preventDefault();
            //     $("#" + $(this).attr("data-bs-target")).toggle();
            //     if ($("#" + $(this).attr("data-bs-target")).css('display') == 'block') {
            //         $(this).attr("aria-expanded", "false");
            //         $("#" + $(this).attr("data-bs-target")).css("display", "none");
            //     } else {
            //         $(this).attr("aria-expanded", "true");
            //     }

            //     $("#" + $(this).attr("data-bs-target")).removeClass("show");
            //     var iframe = document.getElementById('currentIframe');
            //     iframe.parentNode.removeChild(iframe);
            // });

            //updating css and adding dynamic content
            setTimeout(() => {
                if (this.state.data && this.state.data.items.length > 0) {
                    let PREVIEW_HEADER_CLASS = $("#_previewFileName");
                    let PREVIEW_MODIFYBY_CLASS = $("#_previewFileModifiedBy");
                    let PREVIEW_MODIFIEDON_CLASS = $("#_previewFileModifiedOn");
                    let ITEM_AUTHOR = $(".Item_Author");
                    let ITEM_MODIFIED = $(".Item_ModifiedDate");
                    let ITEM_TAGS = $(".template--listItem--tags");
                    let ITEM_SUMMARY = $(".template--summary");
                    let ITEM_LOCATION = $(".result-item-location");
                    let FILE_PREV_BTN = $(".file-prev-btn");
                    let CLOSE_PREV_BTN = $(".close-prev");
                    let FILE_PREV_CONTAINER = $(".file-prev-container");
                    //for template--listItem--title
                    let Template_Title = $(".template--listItem--title .gold-link");
                    for (let i = 0; i < this.state.data.items.length; i++) {
                        let item = this.state.data.items[i];
                        let previewHeader = PREVIEW_HEADER_CLASS[i];
                        let previewModifiedBy = PREVIEW_MODIFYBY_CLASS[i];
                        let previewModifiedOn = PREVIEW_MODIFIEDON_CLASS[i];
                        let itemAuthorClassItem = ITEM_AUTHOR[i];
                        let ModifiedClassItem = ITEM_MODIFIED[i];
                        let ITEM_SUMMARY_CLASS = ITEM_SUMMARY[i];
                        let ITEM_TAGS_CLASS = ITEM_TAGS[i];
                        let ITEM_LOCATION_CLASS = ITEM_LOCATION[i];
                        let FILE_PREV_BTN_CLASS = FILE_PREV_BTN[i];
                        let CLOSE_PREV_BTN_CLASS = CLOSE_PREV_BTN[i];
                        let FILE_PREV_CONTAINER_CLASS = FILE_PREV_CONTAINER[i];
                        let Template_Title_CLASS = Template_Title[i];
                        if (previewHeader) {
                            previewHeader.innerHTML = item.Title;
                        }
                        if (previewModifiedBy) {
                            previewModifiedBy.innerHTML = "Modified By: " + item.CreatedBy;
                        }
                        if (previewModifiedOn) {
                            previewModifiedOn.innerHTML = "Modified Date: " + moment(item.LastModifiedTime).format("DD MM YY");
                        }
                        // console.log("ModifiedClassItem - ", ModifiedClassItem)
                        if (ModifiedClassItem) {
                            ModifiedClassItem.innerHTML = "<span class='bold'>Modified Date:</span> "
                            if (item.LastModifiedTime != null) {
                                ModifiedClassItem.innerHTML += moment(item.LastModifiedTime).format("DD MM YY");
                            }
                        }
                        if (itemAuthorClassItem) {
                            itemAuthorClassItem.innerHTML = "<span class='bold'>Modified By:</span> "
                            if (item.ModifiedBy != null) {
                                itemAuthorClassItem.innerHTML += item.ModifiedBy;
                            }
                        }
                        if (ITEM_TAGS_CLASS) {
                            ITEM_TAGS_CLASS.innerHTML = "<span class='bold'>Tags: </span> ";
                            if (item.OneFEOTags != null) {
                                ITEM_TAGS_CLASS.innerHTML += item.OneFEOTags.split(";").join(" , ");
                            }
                        }
                        if (ITEM_SUMMARY_CLASS && item.OneFEOSummary != null) {
                            ITEM_SUMMARY_CLASS.innerHTML = item.OneFEOSummary.replace(/\\n/g, "<br />");
                        }
                        if (FILE_PREV_BTN_CLASS) {
                            if (item.OriginalPath != null) {
                                FILE_PREV_BTN_CLASS.setAttribute("data-frame-url", item.OriginalPath);
                            }
                            FILE_PREV_BTN_CLASS.setAttribute("data-bs-target", "#" + "PreviewFile_" + i);
                        }
                        if (CLOSE_PREV_BTN_CLASS) {
                            CLOSE_PREV_BTN_CLASS.setAttribute("data-bs-target", "#" + "PreviewFile_" + i);
                        }
                        if (FILE_PREV_CONTAINER_CLASS) {
                            FILE_PREV_CONTAINER_CLASS.setAttribute("id", "PreviewFile_" + i);
                        }
                        if (ITEM_LOCATION_CLASS) {
                            if (item.ConfigURL != null) {
                                ITEM_LOCATION_CLASS.innerHTML = item.ConfigURL;
                                ITEM_LOCATION_CLASS.setAttribute("href", item.ConfigURL);
                                Template_Title_CLASS.setAttribute("href", item.ConfigURL);
                            } else if (item.OriginalPath != null) {
                                ITEM_LOCATION_CLASS.innerHTML = item.OriginalPath;
                                ITEM_LOCATION_CLASS.setAttribute("href", item.OriginalPath);
                                Template_Title_CLASS.setAttribute("href", item.OriginalPath);
                            }
                        }
                    }
                }
            }, 100);
        }
    }

    /**
     * Retrieves the data from the selected data source
     * @param pageNumber the current page number
     */
    private async getDataFromDataSource(pageNumber: number): Promise<void> {

        this.setState({
            isLoading: true,
            errorMessage: ''
        });

        this.forceUpdate();

        try {

            let data: IDataSourceData = {
                items: [],
                totalItemsCount: 0,
            };

            let availableFilters: IDataFilterResult[] = [];
            let totalItemsCount = 0;
            console.log(this.state.data);
            // if (this.state.data == null || pageNumber == 0) {
            const localDataContext = cloneDeep(this.props.dataContext);

            // Fetch live data
            data = await this.props.dataSource.getData(localDataContext);

            // Compute preview information for items ('AutoXX' properties)
            data = await this.getItemsPreview(data, this.convertTemplateSlotsToHashtable(this.props.properties.templateSlots));

            // Determine total items count and page number
            totalItemsCount = this.props.dataSource.getItemCount();

            if (data.filters) {
                if (data.filters.length === 0) {

                    // Send back the previous filters with reset values to the Data Filter WP to keep selected values in the UI and be able to reset them if necessary
                    // (Ex: Multi values filters, date range)
                    availableFilters = this._lastAvailableSearchFilters.map(lastAvailableFilter => {
                        lastAvailableFilter.values = [];
                        return lastAvailableFilter;
                    });

                } else {
                    availableFilters = data.filters;
                    this._lastAvailableSearchFilters = availableFilters;
                }
            }

            this.props.onDataRetrieved(this.getAvailableFieldsFromResults(data), availableFilters, pageNumber);

            //getting data from pnpsearchdemo
            // if (this.props.dataContext.inputQueryText || this.getUrlParameter("kql") != "" || this.getUrlParameter("q") != "" || this.getUrlParameter("k") != "") {
            let data1: IDataSourceData = {
                items: [],
                filters: [],
                totalItemsCount: 0
            };
            data1 = await this.getSearchData(this.state.searchQueryText);
            // Persist the total items count
            this._totalItemsCount = data1.totalItemsCount;
            this.setState({ data: data1 });
            // }


            // } else {
            //     console.log(this.state.rawData);
            //     console.log("start - ", (this.props.dataContext.pageNumber - 1) * this.state.itemsPerPage);
            //     console.log("end - ", this.props.dataContext.pageNumber * this.state.itemsPerPage);
            //     let currentPageData = this.state.rawData.items.slice((this.props.dataContext.pageNumber - 1) * this.state.itemsPerPage, this.props.dataContext.pageNumber * this.state.itemsPerPage);
            //     console.log(currentPageData);
            //     let CurrentPagedataItems: IDataSourceData = {
            //         items: currentPageData,
            //         filters: [],
            //         totalItemsCount: this.state.rawData.totalItemsCount
            //     };
            //     this.setState({ data: CurrentPagedataItems });
            // }

            this.setState({
                isLoading: false,
                renderedOnce: !this.state.renderedOnce ? true : this.state.renderedOnce,
                searchQueryText: this.props.dataContext.inputQueryText
            });

            // Create a cloned copy of items to avoid mutation by the selection class
            this._selection.setItems(cloneDeep(data.items));
            this._lastPageNumber = pageNumber;
        } catch (error) {

            this.setState({
                isLoading: false,
                errorMessage: error.message
            });

            Log.error(LogSource, error, this.props.serviceScope);

            // To be able to retrace the stack trace.
            throw error;
        }
    }
    public getUrlParameter(name: string) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    private async getSearchData(searchQueryText: string): Promise<IDataSourceData> {
        const data: IDataSourceData = {
            items: [],
            filters: [],
            totalItemsCount: 0
        };

        return new Promise<IDataSourceData>((resolve, reject) => {
            let Refiners = [];
            const queryParameter = this.getUrlParameter('kql');
            if (queryParameter && queryParameter != "") {
                let parsedParamsValue = JSON.parse(queryParameter);
                if (parsedParamsValue.length > 0) {
                    //loop through all params and add in refiners
                    for (let index = 0; index < parsedParamsValue.length; index++) {
                        const element = parsedParamsValue[index];
                        if (element.filterName != "sortBy") {
                            if (element.filterName == "searchIn") {
                                switch (element.values[0]) {
                                    case "eMemo":
                                        // let tempUrl = "https://ttponline.sharepoint.com/sites/FEO2/Shared_Documents/* ";
                                        // Refiners += Refiners + ' contenttype:"eMemo" AND Path:' + tempUrl + '';
                                        Refiners.push('contenttype:"eMemo"');
                                        break;
                                    case "iPortal":
                                        // Refiners += Refiners + ' contenttype:"ServiceNow Page" AND Path:https://ttponline.sharepoint.com/sites/FEO1/SiteAssets/* ';

                                        Refiners.push('contenttype:"ServiceNow Page"');
                                        break;
                                    case "FEONet":
                                        // Refiners += Refiners + ' path:https://ttponline.sharepoint.com/sites/feonet/* ';

                                        Refiners.push('contenttype:"FEONet"');
                                        break;
                                    default:
                                        Refiners.push(' contenttype:"Final Repository"');
                                }
                            } else if (element.filterName == "allThesewords" || element.filterName == "exactPhrase" || element.filterName == "anyOfTheseWords" || element.filterName == "noneOfTheseWords") {
                                Refiners.push(element.values[0]);
                            }
                            else {
                                Refiners.push(element.filterName + ':' + element.values[0]);
                            }
                        }
                    }
                }
            } else {
                if (this.state.searchIn != "" && this.state.searchIn != undefined && this.state.searchIn != "All") {
                    switch (this.state.searchIn) {
                        case "eMemo":
                            // let tempUrl = "https://ttponline.sharepoint.com/sites/FEO2/Shared_Documents/*";
                            // Refiners = Refiners + ' contenttype:"eMemo" AND Path:' + tempUrl + '';
                            Refiners.push('contenttype:"eMemo"');
                            break;
                        case "iPortal":
                            // Refiners = Refiners + ' contenttype:"ServiceNow Page" AND Path:https://ttponline.sharepoint.com/sites/FEO1/SiteAssets/*';
                            Refiners.push('contenttype:"ServiceNow Page"');
                            break;
                        case "FEONet":
                            // Refiners = Refiners + ' path:https://ttponline.sharepoint.com/sites/feonet/*';
                            Refiners.push('contenttype:"FEONet"');
                            break;
                        case "FinalRepository":
                            Refiners.push('contenttype:"Final Repository"');
                            break;
                    }
                }
                if (this.props.dataContext.inputQueryText && Refiners.indexOf(this.props.dataContext.inputQueryText) == -1) {
                    Refiners.push('"' + this.props.dataContext.inputQueryText + '"');
                }
            }

            if (this.state.searchIn == "FinalRepository" || this.state.searchIn == "eMemo") {
                let filterObj = Object.keys(this.state.selectedFilterOption);
                for (let i = 0; i < filterObj.length; i++) {
                    let currentObjKeyName = filterObj[i];
                    let currentObj = this.state.selectedFilterOption[currentObjKeyName];
                    if (currentObj.length > 0) {
                        if (currentObjKeyName == "ContentType"){
                            Refiners.push('(' + "OneFEOContentType" + ":" + currentObj.join(' OR ') + ')')
                        } else {
                            Refiners.push('(' + currentObjKeyName + ":" + currentObj.join(' OR ') + ')')
                        }
                        
                    }
                }

                //for div bu filter
                if (this.state.divBu && this.state.divBu.length > 0) {
                    Refiners.push('(' + this.state.divBu.join(' OR ') + ')')
                }
                //for content type filter
                if (this.state.contentType && this.state.contentType.length > 0) {
                    Refiners.push('(' + this.state.contentType.join(' OR ') + ')')
                }
                //for workprocess filter
                if (this.state.workProcess && this.state.workProcess.length > 0) {
                    Refiners.push('(' + this.state.workProcess.join(' OR ') + ')')
                }
            }

            //for format filter
            if (this.state.filterFormat && this.state.filterFormat.length > 0) {
                Refiners.push('(FileType=' + this.state.filterFormat.join(' OR ') + ')')
            }

            //for modified by filter
            if (this.state.modifiedBy && this.state.modifiedBy.length > 0) {
                Refiners.push('(' + this.state.modifiedBy.join(' OR ') + ')')
            }
            //for last modified date filter
            if (this.state.lastModified && this.state.lastModified.length > 0) {
                Refiners.push('(LastModifiedTime >= "' + this.state.lastModified.join(' OR ') + '")')
            }

            console.log("KQL is - " + Refiners.join(" AND ") + " -ContentClass=urn:content-class:SPSPeople");
            const xhr = new XMLHttpRequest();
            let currentPageLimit = (this.props.dataContext.pageNumber - 1) * 10;
            let searchQueryUrl = `https://pnpsearchdemo.azurewebsites.net/api/SearchByAppId?querytext=${Refiners.join(" AND ")}&refiner=${currentPageLimit}`;
            xhr.open("GET", searchQueryUrl, false);
            //add try catch to handle error'
            try {
                xhr.send();
            } catch (error) {
                console.log(error);
            }
            console.log(xhr);
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                console.log("response......");
                console.log(response);
                if (response.length > 0 && response[0].resultRows.length > 0) {
                    data.items = response[0].resultRows;
                    data.totalItemsCount = response[0].totalRows;
                }
                if (response.length > 1 && response[1].resultRows.length > 0) {
                    // for file type refiners
                    let fileForatRefines = response[1].resultRows.filter((item) => {
                        return item.RefinerName == "FileType";
                    });
                    if (fileForatRefines.length > 0) {
                        let fileFormatRefines = [];
                        fileForatRefines.forEach((item) => {
                            fileFormatRefines.push(item.RefinementValue);
                        });
                        this.setState({ filterFormatColl: fileFormatRefines })
                    }

                    // for modified by refiners
                    let modifiedByRefines = response[1].resultRows.filter((item) => {
                        return item.RefinerName == "ModifiedBy";
                    });
                    if (modifiedByRefines.length > 0) {
                        let modifiedByColl = [];
                        modifiedByRefines.forEach((item) => {
                            modifiedByColl.push(item.RefinementValue);
                        });
                        this.setState({ modifiedByColl: modifiedByColl });
                    }
                }
                console.log("after KQL is - " + response[0].properties.QueryModification);
            }
            console.log("total data coll");
            console.log(data);
            resolve(data);
        })
    }

    /**
     * Enhance items properties with preview information
     * @param data the data to enhance
     * @param slots the configured slots
     */
    private async getItemsPreview(data: IDataSourceData, slots: { [key: string]: string }): Promise<IDataSourceData> {

        // const validPreviewExt = ["SVG", "MOVIE", "PAGES", "PICT", "SKETCH", "AI", "PDF", "PSB", "PSD", "3G2", "3GP", "ASF", "BMP", "HEVC", "M2TS", "M4V", "MOV", "MP3", "MP4", "MP4V", "MTS", "TS", "WMV", "DWG", "FBX", "ERF", "ZIP", "ZIP", "DCM", "DCM30", "DICM", "DICOM", "PLY", "HCP", "GIF", "HEIC", "HEIF", "JPEG", "JPG", "JPE", "MEF", "MRW", "NEF", "NRW", "ORF", "PANO", "PEF", "PNG", "SPM", "TIF", "TIFF", "XBM", "XCF", "KEY", "LOG", "CSV", "DIC", "DOC", "DOCM", "DOCX", "DOTM", "DOTX", "POT", "POTM", "POTX", "PPS", "PPSM", "PPSX", "PPT", "PPTM", "PPTX", "XD", "XLS", "XLSB", "XLSX", "SLTX", "EML", "MSG", "VSD", "VSDX", "CUR", "ICO", "ICON", "EPUB", "ODP", "ODS", "ODT", "ARW", "CR2", "CRW", "DNG", "RTF", "ABAP", "ADA", "ADP", "AHK", "AS", "AS3", "ASC", "ASCX", "ASM", "ASP", "ASPX", "AWK", "BAS", "BASH", "BASH_LOGIN", "BASH_LOGOUT", "BASH_PROFILE", "BASHRC", "BAT", "BIB", "BSH", "BUILD", "BUILDER", "C", "CAPFILE", "CBK", "CC", "CFC", "CFM", "CFML", "CL", "CLJ", "CMAKE", "CMD", "COFFEE", "CPP", "CPT", "CPY", "CS", "CSHTML", "CSON", "CSPROJ", "CSS", "CTP", "CXX", "D", "DDL", "DI.DIF", "DIFF", "DISCO", "DML", "DTD", "DTML", "EL", "EMAKE", "ERB", "ERL", "F90", "F95", "FS", "FSI", "FSSCRIPT", "FSX", "GEMFILE", "GEMSPEC", "GITCONFIG", "GO", "GROOVY", "GVY", "H", "HAML", "HANDLEBARS", "HBS", "HRL", "HS", "HTC", "HTML", "HXX", "IDL", "IIM", "INC", "INF", "INI", "INL", "IPP", "IRBRC", "JADE", "JAV", "JAVA", "JS", "JSON", "JSP", "JSX", "L", "LESS", "LHS", "LISP", "LOG", "LST", "LTX", "LUA", "M", "MAKE", "MARKDN", "MARKDOWN", "MD", "MDOWN", "MKDN", "ML", "MLI", "MLL", "MLY", "MM", "MUD", "NFO", "OPML", "OSASCRIPT", "OUT", "P", "PAS", "PATCH", "PHP", "PHP2", "PHP3", "PHP4", "PHP5", "PL", "PLIST", "PM", "POD", "PP", "PROFILE", "PROPERTIES", "PS", "PS1", "PT", "PY", "PYW", "R", "RAKE", "RB", "RBX", "RC", "RE", "README", "REG", "REST", "RESW", "RESX", "RHTML", "RJS", "RPROFILE", "RPY", "RSS", "RST", "RXML", "S", "SASS", "SCALA", "SCM", "SCONSCRIPT", "SCONSTRUCT", "SCRIPT", "SCSS", "SGML", "SH", "SHTML", "SML", "SQL", "STY", "TCL", "TEX", "TEXT", "TEXTILE", "TLD", "TLI", "TMPL", "TPL", "TXT", "VB", "VI", "VIM", "WSDL", "XAML", "XHTML", "XOML", "XML", "XSD", "XSL", "XSLT", "YAML", "YAWS", "YML", "ZSH", "HTM", "HTML", "Markdown", "MD", "URL"];
        const validPreviewExt = ["PDF", "CSV", "DOC", "DOCX", "PPT", "PPTX", "XLS", "XLSX"];

        // Auto determined preview URL 
        // We do not make these call if layouts does not allow preview ('enablePreview' property, specific to 'CardsLayout' and 'SimpleListLayout')
        if (slots[BuiltinTemplateSlots.PreviewUrl] === AutoCalculatedDataSourceFields.AutoPreviewUrl) {

            // TODO: I'd like to move this logic over to each provider
            data.items = data.items.map(item => {
                let contentClass = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.ContentClass]);
                const hasContentClass = !isEmpty(contentClass);
                const isLibItem = hasContentClass && contentClass.indexOf("Library") !== -1;

                let contentTypeId = this.props.dataSource.getTemplateSlots()[BuiltinTemplateSlots.IsFolder];
                const isContainer = contentTypeId ? contentTypeId.indexOf('0x0120') !== -1 : false;

                let pathProperty = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.Path]);
                if (!pathProperty || (hasContentClass && !isLibItem)) {
                    pathProperty = ObjectHelper.byPath(item, BuiltinTemplateSlots.Path); // Fallback to using Path for if DefaultEncodingURL is missing
                }
                if (pathProperty && pathProperty.indexOf("?") === -1 && !isContainer) {
                    item.AutoPreviewUrl = pathProperty + "?web=1";
                } else {
                    item.AutoPreviewUrl = pathProperty;
                }
                return item;
            });
        }

        // Auto determined preview image URL (thumbnail)
        if (slots[BuiltinTemplateSlots.PreviewImageUrl] === AutoCalculatedDataSourceFields.AutoPreviewImageUrl) {

            // TODO: I'd like to move this logic over to each provider
            data.items = data.items.map(item => {

                let contentClass = ObjectHelper.byPath(item, BuiltinTemplateSlots.ContentClass);

                if (!isEmpty(contentClass) && (contentClass.toLocaleLowerCase() == "sts_site" || contentClass.toLocaleLowerCase() == "sts_web")) {
                    item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = ObjectHelper.byPath(item, "SiteLogo");
                }
                else {
                    let siteId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.SiteId]);
                    let webId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.WebId]);
                    let listId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.ListId]);
                    let itemId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.ItemId]); // Could be UniqueId or item ID

                    let isFolder = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.IsFolder]);
                    const isContainerType = isFolder === "true" || isFolder === "1" || (isFolder && isFolder.indexOf('0x0120') !== -1);

                    if (siteId && listId && itemId && !isContainerType) {
                        // SP item logic
                        siteId = this.getGuidFromString(siteId);
                        listId = this.getGuidFromString(listId);
                        itemId = this.getGuidFromString(itemId);

                        if (webId) {
                            siteId = siteId + "," + this.getGuidFromString(webId); // add web id if present, needed for sub-sites
                        }

                        const itemFileType = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.FileType]);

                        if (itemFileType && validPreviewExt.indexOf(itemFileType.toUpperCase()) !== -1) {
                            // Can lead to 404 errors but it is a trade of for performances. We take a guess with this url instead of batching calls for all items and process only 200.
                            item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = `${this.props.pageContext.site.absoluteUrl}/_api/v2.1/sites/${siteId}/lists/${listId}/items/${itemId}/driveItem/thumbnails/0/large/content?preferNoRedirect=true`;
                        }
                    } else {
                        // Graph items logic
                        const driveId = ObjectHelper.byPath(item, slots[BuiltinTemplateSlots.DriveId]);
                        //GET /drives/{drive-id}/items/{item-id}/thumbnails
                        if (driveId && siteId && itemId) {
                            item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = `${this.props.pageContext.site.absoluteUrl}/_api/v2.1/sites/${siteId}/drives/${driveId}/items/${itemId}/thumbnails/thumbnails/0/large/content?preferNoRedirect=true`;
                        }
                    }
                }

                if (!this.isOnlineDomain(item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl])) {
                    item[AutoCalculatedDataSourceFields.AutoPreviewImageUrl] = null;
                }
                return item;
            });
        }

        return data;
    }

    /**
     * Check if we're on an online domain
     * @param domain
     */
    private isOnlineDomain(url: string) {
        return !isEmpty(url) && url.toLocaleLowerCase().indexOf(window.location.hostname.split('.').slice(-2).join('.').toLocaleLowerCase()) !== -1;
    }

    /**
     * Extracts the GUID value from a string
     * @param value the string value containing a GUID
     */
    private getGuidFromString(value: string): string {

        if (value) {
            const matches = value.match(/(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/);
            if (matches) {
                return matches[0];
            }
        }

        return value;
    }

    /**
     * Returns default shimmers if the template does not provide any
     */
    private getDefaultShimmerElements(): JSX.Element {

        let i = 0;
        let renderShimmerElements: JSX.Element[] = [];
        const shimmerContent: JSX.Element = <div style={{ display: 'flex' }}>
            <ShimmerElementsGroup
                shimmerElements={[
                    { type: ElemType.line, width: 40, height: 40 },
                    { type: ElemType.gap, width: 10, height: 40 }
                ]}
            />
            <ShimmerElementsGroup
                flexWrap={true}
                width="100%"
                shimmerElements={[
                    { type: ElemType.line, width: '100%', height: 10 },
                    { type: ElemType.line, width: '75%', height: 10 },
                    { type: ElemType.gap, width: '25%', height: 20 }
                ]}
            />
        </div>;

        while (i < 4) {
            renderShimmerElements.push(
                <Shimmer
                    key={i}
                    customElementsGroup={shimmerContent}
                    width="100%"
                    style={{ marginBottom: "20px" }}
                />);
            i++;
        }

        return <div>{renderShimmerElements}</div>;
    }

    // Build the template context
    private getTemplateContext(): ISearchResultsTemplateContext {

        let adaptiveCardsHostConfig = null;

        // Gets information about current page context
        const { site, web, list, listItem, user, cultureInfo } = this.props.pageContext;

        // Expose only relevant properties
        const trimmedProperties = cloneDeep(this.props.properties);

        delete trimmedProperties.filtersDataSourceReference;
        delete trimmedProperties.inlineTemplateContent;
        delete trimmedProperties.documentationLink;
        delete trimmedProperties.externalTemplateUrl;

        try {
            adaptiveCardsHostConfig = JSON.parse(this.props.properties.adaptiveCardsHostConfig);
        } catch (error) {
            Log.warn(LogSource, `Invalid host config provided. Refer to https://docs.microsoft.com/en-us/adaptive-cards/rendering-cards/host-config for more details`, this.props.serviceScope);
        }

        return {
            // The data source data
            data: {
                totalItemsCount: this._totalItemsCount,
                ...this.state.data
            },
            paging: {
                currentPageNumber: this.props.dataContext.pageNumber
            },
            // Current theme infos
            theme: this.props.themeVariant,
            // The Web Part properties;
            properties: {
                ...trimmedProperties
            },
            // The connected filters information
            filters: {
                selectedFilters: this.props.dataContext.filters.selectedFilters,
                filterOperator: this.props.dataContext.filters.filterOperator,
                instanceId: this.props.dataContext.filters.instanceId,
                filtersConfiguration: this.props.dataContext.filters.filtersConfiguration
            },
            // Sorting information
            sort: {
                selectedSortFieldName: this.props.dataContext.sorting.selectedSortFieldName,
                selectedSortDirection: this.props.dataContext.sorting.selectedSortDirection
            },
            // The connected verticals information
            verticals: {
                selectedVertical: this.props.dataContext.verticals.selectedVertical
            },
            inputQueryText: this.props.dataContext.inputQueryText,
            // The available template slots 
            slots: this.convertTemplateSlotsToHashtable(this.props.properties.templateSlots),
            // The current page context
            context: {
                site: site,
                web: web,
                list: list,
                user: user,
                cultureInfo: cultureInfo,
                listItem: listItem
            },
            // The Web Part instance ID for scoped CSS styles
            instanceId: this.props.instanceId,
            // Any other useful informations
            utils: {
                defaultImage: Constants.DEFAULT_IMAGE_CONTENT,
                adaptiveCardsHostConfig: adaptiveCardsHostConfig
            },
            selectedKeys: this.state.selectedItemKeys
        };
    }

    /**
     * Converts the configured template slots to an hashtable to be used in the Handlebars templates
     * @param templateSlots the configured template slots
     */
    private convertTemplateSlotsToHashtable(templateSlots: ITemplateSlot[]): { [key: string]: string } {

        // Transform the slots as an hashtable for the HB templates (easier to manipulate rather than a full object)
        let slots: { [key: string]: string } = {};

        if (templateSlots) {
            templateSlots.forEach(templateSlot => {
                slots[templateSlot.slotName] = templateSlot.slotField;
            });
        }

        return slots;
    }

    /**
     * Retrieves the available fields from results
     * @param data the current data
     */
    private getAvailableFieldsFromResults(data: IDataSourceData): string[] {

        if (data.items != undefined && data.items.length > 0) {

            let mergedItem: any = {};

            // Consolidate all available properties from all items 
            data.items.forEach(item => {
                mergedItem = merge(mergedItem, item);
            });

            // Flatten properties (ex: a.b.c)
            mergedItem = ObjectHelper.flatten(mergedItem);

            return Object.keys(mergedItem).map(key => {
                return key;
            });

        } else {
            return [];
        }
    }

    private _onSelectionChanged() {

        // When page is updated, the selection changed is fired clearing all previous selection
        // We need to ensure the state is not updated during this phase 
        if (this.props.dataContext.pageNumber === this._lastPageNumber) {

            const currentSelectedItems = this._selection.getSelection();

            const currentPageSelectionKeys = currentSelectedItems.map(item => item.key as string);

            this.props.onItemSelected(currentSelectedItems);

            // Update curent selected keys and values
            this.setState({
                selectedItemKeys: [...this._lastPageSelectedKeys, ...currentPageSelectionKeys]
            }, () => {
                this.forceUpdate();
            });
        }

    }
}
