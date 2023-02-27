import { spfi, SPFx, DefaultInit, DefaultHeaders, RequestDigest } from '@pnp/sp/presets/all';
import * as moment from 'moment';
import * as React from 'react';
import { ISearchResultsContainerState } from '../webparts/searchResults/components/ISearchResultsContainerState';
import { SPFI, TermStore } from "@pnp/sp/presets/all";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { LogLevel } from 'adaptivecards';
import { Caching } from '@pnp/queryable';
import { taxonomy, ITermStore, ITermSet } from '@pnp/sp-taxonomy';
import * as $ from 'jquery';
require('bootstrap/dist/js/bootstrap.min.js');
export interface ICommonSearchFiltersProps {
    handleRadioChange(stateName: any, e: any): void;
    handleCheckBoxChange(stateName: any, e: any): void;
    stateValue: ISearchResultsContainerState;
    handleChange(e: any): void;
    context: any;
}

export interface IAdvanceSearchFiltersState {
    // description: string;
    // handleRadioChange: void;
    // stateValue: ISearchResultsContainerState;
    data: null,
    isLoading: true,
    errorMessage: '',
    renderedOnce: false,
    selectedItemKeys: [],
    searchQueryText: "",
    sortBy: "bestMatch",
    searchIn: "FinalRepository",
    modifiedBy: string[],
    lastModified: string[],
    filterFormat: string[],
    divBuColl: [],
    divBu: [],
    contentTypeColl: [],
    contentType: [],
    workProcessColl: [],
    workProcess: [],
    termJSONData: string[]
}

export default class AdvanceSearchFilters extends React.Component<ICommonSearchFiltersProps, ISearchResultsContainerState> {
    private _sp: SPFI;
    public constructor(props: ICommonSearchFiltersProps) {
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
            lastModified: [],
            filterFormat: [],
            modifiedByColl: [],
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
        this.handleOnClick = this.handleOnClick.bind(this);
        this.redirectToSearch = this.redirectToSearch.bind(this);
        // this.GetDataCollection = this.GetDataCollection.bind(this);
    }
    handleRadioChange = (name, event) => {
        this.props.handleRadioChange(name, event);
    }
    handleChange(e: any) {
        this.props.handleChange(e);
    }
    handleCheckBoxChange = (name, event) => {
        this.props.handleCheckBoxChange(name, event);
    }
    // async GetDataCollection(termData: any, termstate: any, e) {
    //     e.preventDefault();
    //     console.log(e);
    //     const { name, value } = e.target;
    //     console.log(name, value);
    //     console.log("state length - ", this.state[termstate].length);
    //     let tempArray = [];
    //     if (this.state[termstate].length == 0) {
    //         let context = this.props.context;
    //         console.log(context, this.context);
    //         const sp = spfi(window.location.origin + "/sites/OneFEO").using(SPFx(context)).using(RequestDigest());
    //         // const spCache = spfi(this._sp).using(Caching(this.context));
    //         console.log(sp);
    //         try {
    //             const info = await sp.termStore;
    //             console.log("info - ", info);
    //             const termGroup = await info.groups();
    //             console.log(termGroup);
    //             let fill = termGroup.filter(f => { if (f.name == "OneFEO") return f; });
    //             console.log(fill);
    //             console.log("inside get term function");
    //             const TermSetsinfo = await sp.termStore.groups.getById(fill[0].id).sets();
    //             console.log(TermSetsinfo);
    //             // let termsetFill = TermSetsinfo.filter(s => { if (s.localizedNames[0].name == "FEO term set") return s; })
    //             // const TermSetinfo = await sp.termStore.groups.getById(fill[0].id).sets.getById(termsetFill[0].id).children();
    //             let CurrentTermFilter = TermSetsinfo.filter(t => { if (t.localizedNames[0].name == termData) return t; });
    //             console.log("CurrentTermFilter = ", CurrentTermFilter);
    //             const TermSetChildren = await sp.termStore.groups.getById(TermSetsinfo[0].id).sets.getById(CurrentTermFilter[0].id).getAllChildrenAsOrderedTree();
    //             console.log(TermSetChildren);
    //             for (let index = 0; index < TermSetChildren.length; index++) {
    //                 const element = TermSetChildren[index];
    //                 tempArray.push(element.labels[0].name);
    //             }
    //         } catch (e) {
    //             console.log("error at getting terms");
    //             console.error(e);
    //         }
    //         if (termstate == "divBuColl") {
    //             this.setState({ divBuColl: tempArray });
    //         } else if (termstate == "contentTypeColl") {
    //             this.setState({ contentTypeColl: tempArray });
    //         } else if (termstate == "workProcessColl") {
    //             this.setState({ workProcessColl: tempArray });
    //         }
    //     }
    //     // this.handleOnClick(this);
    // }
    renderChildTerm(node, idx, parentTermName) {
        return node.childTermNodes.map((data, id) =>
        (data.childTermNodes.length > 0 ? (<div>
            <div className="refine-filter-item" key={id}>
                <input type="checkbox" id={data.termID} name="filter" value={data.childTerm} />
                <a href="javascript:void(0)" className="refine-items-link" data-bs-toggle="collapse" data-bs-target={"#Child_" + data.termID} aria-expanded="false">
                    <span>{data.childTerm}</span>
                </a>
            </div>
            <div id={"Child_" + data.termID} className="refine-filter-con level--2 collapse">
                {this.renderChildTerm(data, id, parentTermName)}
            </div>
        </div>
        ) : (<div className="refine-filter-item" key={id}>
            <input type="checkbox" id={"term_" + data.termID + "_" + id} name={data.termID} value={data.childTerm.toString()} onChange={this.handleCheckBoxChange.bind(this, parentTermName)} />
            <label htmlFor={"term_" + data.termID + "_" + id}>{data.childTerm}</label>
        </div>
        ))
        )
    }
    renderTermData() {
        return this.props.stateValue.termJSONData.map((item, id) =>
            <div key={id} className="refine-items">
                <a id={"acc" + id} href="javascript:void(0)" className="refine-items-link" data-bs-toggle="collapse" data-bs-target={"#term_" + item.termID} aria-expanded="false">{item.termNode}</a>
                <div id={"term_" + item.termID} className="refine-filter-con collapse">
                    {item.childTermNodes.length > 0 ? (
                        this.renderChildTerm(item, id, item.termNode.replace(/ /g, ""))
                    ) : (
                        <div className="refine-filter-item">
                            <input type="checkbox" id={"term_" + item.termID + "_" + id} name={item.termID} value={item.termNode.toString()} onChange={this.handleCheckBoxChange.bind(this, item.termNode.replace(/ /g, ""))} />
                            <label htmlFor={"term_" + item.termID + "_" + id}>{item.termNode}</label>
                        </div>
                    )}
                </div>
            </div>
        )
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
    redirectToSearch() {
        let tempArray = [];
        for (let key in this.props.stateValue) {
            if (this.props.stateValue.hasOwnProperty(key)) {
                //check state value for array and string if not empty then push to IDataFilter array
                if ((Array.isArray(this.props.stateValue[key]) && this.props.stateValue[key].length > 0) || (typeof this.props.stateValue[key] === "string" && this.props.stateValue[key] !== "")) {
                    let tempObj = {
                        filterName: key,
                        values: [this.props.stateValue[key]]
                    };
                    tempArray.push(tempObj);
                }
            }
        }
        // console.log(tempArray);
        location.href = "/sites/OneFEO/sitepages/search.aspx?kql=" + JSON.stringify(tempArray);
    }
    renderTermDataForAdvanceSearch() {
        return this.props.stateValue.termJSONData.map((item, id) =>
            <div className="row">
                <div className="col-12 col-sm-4 col-lg-2 d-none d-md-block">
                    <h5 className="pt-3">{item.termNode}</h5>
                </div>
                <div className="col-12 col-md-8 col-lg-6">
                    <div key={id} className="refine-items">
                        <a id="acc1" href="javascript:void(0)" className="refine-items-link" data-bs-toggle="collapse" data-bs-target={"#term_" + item.termID} aria-expanded="false">{item.termNode}</a>
                        <div id={"term_" + item.termID} className="refine-filter-con collapse">
                            {item.childTermNodes.length > 0 ? (
                                this.renderChildTerm(item, id, item.termNode.replace(/ /g, "_"))
                            ) : (
                                <div className="refine-filter-item">
                                    <input type="checkbox" id={"businessCat-feo" + id} name={item.termID} value={item.termNode.toString()} onChange={this.handleCheckBoxChange.bind(this, item.termNode.replace(/ /g, ""))} />
                                    <label htmlFor={"businessCat-" + item.termID + id}>{item.termNode}</label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    render() {
        return (
            <div className={location.href.indexOf("SitePages/Advance-Search.aspx") > -1 && 'container'}>
                <div className='with-side-menu'>
                    <aside className={location.href.indexOf("SitePages/Advance-Search.aspx") == -1 ? 'side-menu' : "side-menu w-100"}>
                        {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 ? (<div className='side-menu-title'>
                            <h5 className="mb-0">
                                <i className="fa-solid fa-sliders d-inline-block pe-3"></i><b>Refine </b>
                            </h5>
                        </div>) : (
                            <div className="page-action mb-3 pb-3">
                                <a href="#"><i className="fa-solid fa-angle-left"></i> <i className="fa-solid fa-angle-left"></i> Back To
                                    Previous</a>
                            </div>
                        )}
                        <div id='asideMove'>
                            <div className='ps-0 move-to-acc'>
                                <div className='refine-list ps-0'>
                                    {/* Sort by */}
                                    {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 && (
                                        <div className="refine-items">
                                            <h6>Sort By</h6>
                                            <div className="refine-sort selected">
                                                <input type="radio" id="bestMatch" name="sortBy" value="bestMatch" checked={this.props.stateValue.sortBy.toLowerCase() === "bestMatch".toLowerCase()} onChange={this.handleRadioChange.bind(this, "sortBy")} />
                                                <label htmlFor="bestMatch">Best Match</label>
                                            </div>
                                            <div className="refine-sort">
                                                <input type="radio" id="newest" name="sortBy" value="newest" checked={this.props.stateValue.sortBy.toLowerCase() === "newest".toLowerCase()} onChange={this.handleRadioChange.bind(this, "sortBy")} />
                                                <label htmlFor="newest">Newest</label>
                                            </div>
                                            <div className="refine-sort mb-0">
                                                <input type="radio" id="mostPopular" name="sortBy" value="mostPopular" checked={this.props.stateValue.sortBy.toLowerCase() === "mostPopular".toLowerCase()} onChange={this.handleRadioChange.bind(this, "sortBy")} />
                                                <label htmlFor="mostPopular">Most Popular</label>
                                            </div>
                                        </div>)}
                                    {/* Search In */}
                                    {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 ? (<div className="refine-items">
                                        <h6>Search In </h6>
                                        <div className="refine-sort">
                                            <input type="radio" id="si-all" name="searchIn" value="all" checked={this.props.stateValue.searchIn.toLowerCase() == "all".toLowerCase()} className="hidden-filter-radio" onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                            <label htmlFor="si-all">All</label>
                                        </div>
                                        <div className="refine-sort">
                                            <input type="radio" id="FinalRepository" name="searchIn" value="FinalRepository" checked={this.props.stateValue.searchIn.toLowerCase() == "FinalRepository".toLowerCase()} className="show-filter-radio" onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                            <label htmlFor="FinalRepository">Final Repository</label>
                                        </div>
                                        <div className="refine-sort">
                                            <input type="radio" id="eMemo" name="searchIn" value="eMemo" className="show-filter-radio" checked={this.props.stateValue.searchIn.toLowerCase() == "eMemo".toLowerCase()} onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                            <label htmlFor="eMemo">eMemo</label>
                                        </div>
                                        <div className="refine-sort">
                                            <input type="radio" id="FEONet" name="searchIn" value="FEONet" className="hidden-filter-radio" checked={this.props.stateValue.searchIn.toLowerCase() == "FEONet".toLowerCase()} onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                            <label htmlFor="FEONet">FEONet</label>
                                        </div>
                                        <div className="refine-sort">
                                            <input type="radio" id="iPortal" name="searchIn" value="iPortal" className="hidden-filter-radio" checked={this.props.stateValue.searchIn.toLowerCase() == "iPortal".toLowerCase()} onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                            <label htmlFor="iPortal">iPortal</label>
                                        </div>
                                        <div className="refine-sort mb-0">
                                            <input type="radio" id="CollaborationSpace" name="searchIn" value="CollaborationSpace" checked={this.props.stateValue.searchIn.toLowerCase() == "CollaborationSpace".toLowerCase()} className="hidden-filter-radio" onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                            <label htmlFor="CollaborationSpace">Collaboration Space</label>
                                        </div>
                                    </div>) : (
                                        <div className="search-in">
                                            <ul>
                                                <li className="d-none d-md-block">Search in:</li>
                                                <li>
                                                    <div className="refine-sort">
                                                        <input type="radio" id="si-all" name="searchIn" value="all" checked={this.props.stateValue.searchIn == "all"} className="hidden-filter-radio" onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                        <label htmlFor="si-all">All</label>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="refine-sort">
                                                        <input type="radio" id="FinalRepository" name="searchIn" value="FinalRepository" checked={this.props.stateValue.searchIn == "FinalRepository"} className="show-filter-radio" onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                        <label htmlFor="FinalRepository">Final Repository</label>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="refine-sort">
                                                        <input type="radio" id="eMemo" name="searchIn" value="eMemo" className="show-filter-radio" checked={this.props.stateValue.searchIn == "eMemo"} onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                        <label htmlFor="eMemo">eMemo</label>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="refine-sort">
                                                        <input type="radio" id="FEONet" name="searchIn" value="FEONet" className="hidden-filter-radio" checked={this.props.stateValue.searchIn == "FEONet"} onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                        <label htmlFor="FEONet">FEONet</label>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="refine-sort">
                                                        <input type="radio" id="iPortal" name="searchIn" value="iPortal" className="hidden-filter-radio" checked={this.props.stateValue.searchIn == "iPortal"} onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                        <label htmlFor="iPortal">iPortal</label>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="refine-sort mb-0">
                                                        <input type="radio" id="CollaborationSpace" name="searchIn" value="CollaborationSpace" checked={this.props.stateValue.searchIn == "CollaborationSpace"} className="hidden-filter-radio" onChange={this.handleRadioChange.bind(this, "searchIn")} />
                                                        <label htmlFor="CollaborationSpace">Collaboration Space</label>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                    {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 ? (<div className="refine-items b-none">
                                        <h5 className="mb-0">Filter By</h5>
                                    </div>) : (
                                        <div className="side-content-item no-bg-title">
                                            <div className="max-content">
                                                <div className="row mb-3">
                                                    <div className="col-12 col-md-8">
                                                        <h4>Find your files with: </h4>
                                                    </div>
                                                    <div className="col-4 d-none d-md-block">
                                                        <p>To do this in the search box</p>
                                                    </div>
                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-12 col-sm-4 col-lg-2">
                                                        <p><b>All these words:</b></p>
                                                    </div>
                                                    <div className="col-12 col-sm-8 col-lg-6">
                                                        <input type="text" className="w-100 mb-3" name="allThesewords" onChange={this.handleChange.bind(this)} value={this.props.stateValue.allThesewords.toString()} />
                                                    </div>
                                                    <div className="col-12 col-lg-4">
                                                        <p>Type the important words: tri-colour rat terrier</p>
                                                    </div>

                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-12 col-sm-4 col-lg-2">
                                                        <p><b>The exact word or phrase:</b></p>
                                                    </div>
                                                    <div className="col-12 col-sm-8 col-lg-6">
                                                        <input type="text" className="w-100 mb-3" name="exactPhrase" value={this.props.stateValue.exactPhrase.toString()} onChange={this.handleChange.bind(this)} />
                                                    </div>
                                                    <div className="col-12 col-lg-4">
                                                        <p>Put exact words in quotes: "rat terrier"
                                                        </p>
                                                    </div>

                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-12 col-sm-4 col-lg-2">
                                                        <p><b>Any of these words:</b></p>
                                                    </div>
                                                    <div className="col-12 col-sm-8 col-lg-6">
                                                        <input type="text" className="w-100 mb-3" name="anyOfTheseWords" value={this.props.stateValue.anyOfTheseWords.toString()} onChange={this.handleChange.bind(this)} />
                                                    </div>
                                                    <div className="col-12 col-lg-4">
                                                        <p>Type OR between all the words you want: miniature OR standard</p>
                                                    </div>

                                                </div>
                                                <div className="row mb-3">
                                                    <div className="col-12 col-sm-4 col-lg-2">
                                                        <p><b>None of these words:</b></p>
                                                    </div>
                                                    <div className="col-12 col-sm-8 col-lg-6">
                                                        <input type="text" className="w-100 mb-3" name="noneOfTheseWords" value={this.props.stateValue.noneOfTheseWords.toString()} onChange={this.handleChange.bind(this)} />
                                                    </div>
                                                    <div className="col-12 col-lg-4">
                                                        <p>Put a minus sign just before words that you don't want: -rodent, -"Jack Russell"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {location.href.indexOf("SitePages/Advance-Search.aspx") != -1 && (
                                        <div className="row">
                                            <div className="col-12 col-md-8">
                                                <h4>Then narrow your results </h4>
                                            </div>
                                            <div className="col-12 col-lg-4">
                                            </div>
                                        </div>
                                    )}
                                    {/* Div Bu's */}
                                    {(this.props.stateValue.searchIn.toLowerCase() == "" || this.props.stateValue.searchIn.toLowerCase() == "FinalRepository".toLowerCase() || this.props.stateValue.searchIn.toLowerCase() == "eMemo".toLowerCase()) &&
                                        <div>
                                            {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 ? this.renderTermData() : this.renderTermDataForAdvanceSearch()}
                                            {/*location.href.indexOf("SitePages/Advance-Search.aspx") == -1 ? (<div className="refine-items">
                                                <a id="acc1" href="javascript:void(0)" className="refine-items-link" data-bs-toggle="collapse" data-bs-target="#businessCat" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Associated BU", "divBuColl")}>Div / BUs</a>
                                                <div id="businessCat" className="refine-filter-con collapse " >
                                                    {this.state.divBuColl != undefined && this.state.divBuColl.length > 0 && this.state.divBuColl.map((item, key) =>
                                                        <div key={key} className="refine-filter-item">
                                                            <input type="checkbox" id={"businessCat-feo" + key} name="divBu" value={item.toString()} checked={this.props.stateValue.divBu.indexOf(item) > -1} onChange={this.handleCheckBoxChange.bind(this, "divBu")} />
                                                            <label htmlFor={"businessCat-feo" + key}>{item}</label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>) : (
                                                <div className="row">
                                                    <div className="col-12 col-sm-4 col-lg-2 d-none d-md-block">
                                                        <h5 className="pt-3">Div/BUs</h5>
                                                    </div>
                                                    <div className="col-12 col-md-8 col-lg-6">
                                                        <div className="refine-items">
                                                            <a id="acc1" href="#" className="refine-items-link" data-bs-toggle="collapse" data-bs-target="#businessCat" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Associated BU", "divBuColl")}>Div / BUs</a>
                                                            <div id="businessCat" className="refine-filter-con collapse " >
                                                                {this.state.divBuColl != undefined && this.state.divBuColl.length > 0 && this.state.divBuColl.map((item, key) =>
                                                                    <div key={key} className="refine-filter-item">
                                                                        <input type="checkbox" id={"businessCat-feo" + key} name="divBu" value={item.toString()} checked={this.props.stateValue.divBu.indexOf(item.toString()) > -1} onChange={this.handleCheckBoxChange.bind(this, "divBu")} />
                                                                        <label htmlFor={"businessCat-feo" + key}>{item}</label>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Content Type
                                            {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 ? (<div className="refine-items">
                                                <a id="acc2" href="#" className="refine-items-link" data-bs-toggle="collapse" data-bs-target="#contentType" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Content Type", "contentTypeColl")}>Content Type</a>
                                                <div id="contentType" className="refine-filter-con collapse">
                                                    {this.state.contentTypeColl.length > 0 && this.state.contentTypeColl.map((val, key) =>
                                                        <div key={key} className="refine-filter-item">
                                                            <input type="checkbox" id={"contentType-tm" + key} name="contentType" value={val.toString()} checked={this.props.stateValue.contentType.indexOf(val) > -1} onChange={this.handleCheckBoxChange.bind(this, "contentType")} />
                                                            <label htmlFor={"contentType-tm" + key}>{val}</label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>) : (
                                                <div className="row">
                                                    <div className="col-12 col-sm-4 col-lg-2 d-none d-md-block">
                                                        <h5 className="pt-3">Content Type</h5>
                                                    </div>
                                                    <div className="col-12 col-md-8 col-lg-6">
                                                        <div className="refine-items">
                                                            <a id="acc2" href="#" className="refine-items-link" data-bs-toggle="collapse" data-bs-target="#contentType" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Content Type", "contentTypeColl")}>Content Type</a>
                                                            <div id="contentType" className="refine-filter-con collapse">
                                                                {this.state.contentTypeColl.length > 0 && this.state.contentTypeColl.map((val, key) =>
                                                                    <div key={key} className="refine-filter-item">
                                                                        <input type="checkbox" id={"contentType-tm" + key} name="contentType" value={val.toString()} checked={this.props.stateValue.contentType.indexOf(val.toString()) > -1} onChange={this.handleCheckBoxChange.bind(this, "contentType")} />
                                                                        <label htmlFor={"contentType-tm" + key}>{val}</label>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {/*Work Process
                                            {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 ? (<div className="refine-items">
                                                <a id="acc3" href="#" className="refine-items-link" data-bs-toggle="collapse" data-bs-target="#workProcessType" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Work Process", "workProcessColl")}>Work Process</a>
                                                <div id="workProcessType" className="refine-filter-con collapse " >
                                                    {this.state.workProcessColl.length > 0 && this.state.workProcessColl.map((val, key) =>
                                                        <div key={key} className="refine-filter-item">
                                                            <input type="checkbox" id={"wp-" + key} name="workProcess" value={val.toString()} checked={this.props.stateValue.workProcess.indexOf(val) > -1} onChange={this.handleCheckBoxChange.bind(this, "workProcess")} />
                                                            <label htmlFor={"wp-" + key}>{val}</label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>) : (
                                                <div className="row">
                                                    <div className="col-12 col-sm-4 col-lg-2 d-none d-md-block">
                                                        <h5 className="pt-3">Work Process</h5>
                                                    </div>
                                                    <div className="col-12 col-md-8 col-lg-6">
                                                        <div className="refine-items">
                                                            <a id="acc3" href="#" className="refine-items-link" data-bs-toggle="collapse" data-bs-target="#workProcessType" aria-expanded="false" onClick={this.GetDataCollection.bind(this, "Work Process", "workProcessColl")}>Work Process</a>
                                                            <div id="workProcessType" className="refine-filter-con collapse " >
                                                                {this.state.workProcessColl.length > 0 && this.state.workProcessColl.map((val, key) =>
                                                                    <div key={key} className="refine-filter-item">
                                                                        <input type="checkbox" id={"wp-" + key} name="workProcess" value={val.toString()} checked={this.props.stateValue.workProcess.indexOf(val.toString()) > -1} onChange={this.handleCheckBoxChange.bind(this, "workProcess")} />
                                                                        <label htmlFor={"wp-" + key}>{val}</label>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}*/}
                                        </div>}
                                    {/*Format*/}
                                    {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 && (<div className="refine-items">
                                        <a id="acc4" href="#" className="refine-items-link collapsed" aria-expanded="false" onClick={this.handleOnClick.bind(this)}>Format</a>
                                        <div id="format" className="refine-filter-con collapse">
                                            {this.props.stateValue.filterFormatColl != undefined && this.props.stateValue.filterFormatColl.length > 0 && this.props.stateValue.filterFormatColl.map((item, key) =>
                                                <div key={key} className="refine-filter-item">
                                                    <input type="checkbox" id={"format-" + key} name="filterFormat" value={item.toString()} checked={this.props.stateValue.filterFormat.indexOf(item.toString()) > -1} onChange={this.handleCheckBoxChange.bind(this, "filterFormat")} />
                                                    <label htmlFor={"format-" + key}>{item}</label>
                                                </div>
                                            )}
                                        </div>
                                    </div>)}
                                    {/* Modified By */}
                                    {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 && (<div className="refine-items">
                                        <a id="acc5" href="#" className="refine-items-link collapsed" aria-expanded="false" onClick={this.handleOnClick.bind(this)}>Modified By</a>
                                        <div id="creator" className="refine-filter-con collapse">
                                            {this.props.stateValue.modifiedByColl.length > 0 && this.props.stateValue.modifiedByColl.map((val, key) =>
                                                <div key={key} className="refine-filter-item">
                                                    <input type="checkbox" id={"creator-" + key} name="modifiedBy" value={"ModifiedBy:" + val.toString()} checked={this.props.stateValue.modifiedBy.indexOf("ModifiedBy:" + val.toString()) > -1} onChange={this.handleCheckBoxChange.bind(this, "modifiedBy")} />
                                                    <label htmlFor={"creator-" + key}>{val}</label>
                                                </div>
                                            )}
                                        </div>
                                    </div>)}
                                    {/* Last Modified Date */}
                                    {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 ? (<div className="refine-items">
                                        <a id="acc6" href="#" className="refine-items-link collapsed" aria-expanded="false" onClick={this.handleOnClick.bind(this)}>Last Modified</a>
                                        <div id="createDate" className="refine-filter-con collapse">
                                            <div className="refine-filter-item">
                                                <input type="checkbox" id="lastModAny" name="lastModified" value={moment().subtract(1000, 'days').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(1000, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                <label htmlFor="lastModAny">Any time</label>
                                            </div>
                                            <div className="refine-filter-item">
                                                <input type="checkbox" id="lastModDay" name="lastModified" value={moment().subtract(1, 'days').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(1, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                <label htmlFor="lastModDay">Past 24 hours</label>
                                            </div>
                                            <div className="refine-filter-item">
                                                <input type="checkbox" id="lastModWeek" name="lastModified" value={moment().subtract(7, 'days').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(7, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                <label htmlFor="lastModWeek">Past Week</label>
                                            </div>
                                            <div className="refine-filter-item">
                                                <input type="checkbox" id="lastModMnth" name="lastModified" value={moment().subtract(30, 'days').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(30, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                <label htmlFor="lastModMnth">Past Month</label>
                                            </div>
                                            <div className="refine-filter-item">
                                                <input type="checkbox" id="lastMod3Mnths" name="lastModified" value={moment().subtract(3, 'months').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(3, 'months').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                <label htmlFor="lastMod3Mnths">Past 3 Months</label>
                                            </div>
                                            <div className="refine-filter-item">
                                                <input type="checkbox" id="lastModYear" name="lastModified" value={moment().subtract(1, 'year').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(1, 'year').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                <label htmlFor="lastModYear">Past Year</label>
                                            </div>
                                        </div>
                                    </div>) : (
                                        <div className="row">
                                            <div className="col-12 col-sm-4 col-lg-2 d-none d-md-block">
                                                <h5 className="pt-3">Last Modified</h5>
                                            </div>
                                            <div className="col-12 col-md-8 col-lg-6">
                                                <div className="refine-items">
                                                    <a id="acc3" href="#" className="refine-items-link collapsed" data-bs-toggle="collapse" data-bs-target="#createDate" aria-expanded="false">Last Modified</a>
                                                    <div id="createDate" className="refine-filter-con collapse">
                                                        <div className="refine-filter-item">
                                                            <input type="checkbox" id="lastModAny" name="lastModified" value={moment().subtract(1000, 'days').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(1000, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                            <label htmlFor="lastModAny">Any time</label>
                                                        </div>
                                                        <div className="refine-filter-item">
                                                            <input type="checkbox" id="lastModDay" name="lastModified" value={moment().subtract(1, 'days').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(1, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                            <label htmlFor="lastModDay">Past 24 hours</label>
                                                        </div>
                                                        <div className="refine-filter-item">
                                                            <input type="checkbox" id="lastModWeek" name="lastModified" value={moment().subtract(7, 'days').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(7, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                            <label htmlFor="lastModWeek">Past Week</label>
                                                        </div>
                                                        <div className="refine-filter-item">
                                                            <input type="checkbox" id="lastModMnth" name="lastModified" value={moment().subtract(30, 'days').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(30, 'days').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                            <label htmlFor="lastModMnth">Past Month</label>
                                                        </div>
                                                        <div className="refine-filter-item">
                                                            <input type="checkbox" id="lastMod3Mnths" name="lastModified" value={moment().subtract(3, 'months').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(3, 'months').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                            <label htmlFor="lastMod3Mnths">Past 3 Months</label>
                                                        </div>
                                                        <div className="refine-filter-item">
                                                            <input type="checkbox" id="lastModYear" name="lastModified" value={moment().subtract(1, 'year').format("YYYY-MM-DD")} checked={this.props.stateValue.lastModified.indexOf(moment().subtract(1, 'year').format("YYYY-MM-DD")) > -1} onChange={this.handleCheckBoxChange.bind(this, "lastModified")} />
                                                            <label htmlFor="lastModYear">Past Year</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {location.href.indexOf("SitePages/Advance-Search.aspx") == -1 ? (
                                    <div className="resetform">
                                        <button type="button" className="reset-all" onClick={this.ResetFilter}>Reset all</button>
                                    </div>) : (
                                    <div className="row">
                                        <div className="col-12 col-sm-4 col-lg-2">
                                        </div>
                                        <div className="col-12 col-md-8 col-lg-6">
                                            <a onClick={this.redirectToSearch} className="learn-more-btn ms-auto">Advanced Search</a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        );
    }
}
function PnPLogging(Warning: any): import("@pnp/core").TimelinePipe<any> {
    throw new Error('Function not implemented.');
}

