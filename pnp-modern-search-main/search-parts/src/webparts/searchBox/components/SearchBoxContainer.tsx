import * as React from 'react';
import { ISearchBoxContainerProps } from './ISearchBoxContainerProps';
import { QueryPathBehavior, UrlHelper, PageOpenBehavior } from '../../../helpers/UrlHelper';
import { MessageBar, MessageBarType, SearchBox, IconButton, ITheme, ISearchBox } from 'office-ui-fabric-react';
import { ISearchBoxContainerState } from './ISearchBoxContainerState';
import { isEqual } from '@microsoft/sp-lodash-subset';
import * as webPartStrings from 'SearchBoxWebPartStrings';
import SearchBoxAutoComplete from './SearchBoxAutoComplete/SearchBoxAutoComplete';
import styles from './SearchBoxContainer.module.scss';
import { BuiltinTokenNames } from '../../../services/tokenService/TokenService';

import * as $ from 'jquery';

export default class SearchBoxContainer extends React.Component<ISearchBoxContainerProps, ISearchBoxContainerState> {

    public constructor(props: ISearchBoxContainerProps) {

        super(props);

        this.state = {
            searchInputValue: (props.inputValue) ? decodeURIComponent(props.inputValue) : '',
            errorMessage: null,
            showClearButton: !!props.inputValue,
        };

        this._onSearch = this._onSearch.bind(this);
    }

    private renderSearchBoxWithAutoComplete(): React.ReactElement {
        return <SearchBoxAutoComplete
            inputValue={this.props.inputValue}
            onSearch={this._onSearch}
            placeholderText={this.props.placeholderText}
            suggestionProviders={this.props.suggestionProviders}
            themeVariant={this.props.themeVariant}
            domElement={this.props.domElement}
            numberOfSuggestionsPerGroup={this.props.numberOfSuggestionsPerGroup}
        />;
    }


    private renderBasicSearchBox(): JSX.Element {

        let searchBoxRef = React.createRef<ISearchBox>();

        return (
            <div className="side-content-item no-bg-title">
                <div className="search-bar-main">
                    <input
                        type="text"
                        value={this.state.searchInputValue}
                        onChange={(event) => this.setState({ searchInputValue: event && event.currentTarget ? event.currentTarget.value : "" })}
                        className="search-input-main search-second"
                        placeholder="Search OneFEO"
                    />
                    <a className="search-button-main gold-link">
                        <i onClick={() => this._onSearch(this.state.searchInputValue)} className="fas fa-search"></i>
                    </a>
                    <ul id="aflMain" style={{ display: "none" }}>
                        <li className="auto-fill-item">
                            <a>Lumen SOC 1 Type II Final Report</a>
                        </li>
                    </ul>
                    <a id="clear" href=""></a>
                </div>
                <div className="d-flex justify-content-between w-100" style={{ maxWidth: "750px" }}>
                    <div className="recent-search">
                        <div className="left">
                            <a href="javascript:void(0)" className="recent-link">My Recent Searches</a>
                            <ul className="recent-search-items">
                                <li><a href="javascript:void(0)">Lumen 2020</a></li>
                                <li><a href="javascript:void(0)">SOC Type 1</a></li>
                                <li><a href="javascript:void(0)">Audit report</a></li>
                                <li>
                                    <a href="javascript:void(0)">Jelco Properties Pte Ltd Certificate of Title</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="right">
                        <button type="button" className="btn btn-primary round-btn" data-bs-toggle="modal" onClick={this.OpenModel} data-bs-target="#exampleModal">
                            Advanced Search
                        </button>
                        <div id="wrap_popup1" className="wrap_popup" style={{display: "block;"}}>
                            <div className="popup">
                                <div className="popup-item">
                                    <div className="title">
                                        <h5>Find documents that have...</h5>
                                    </div>
                                    <form className="input-popup">
                                        <div className="input-popup-items">
                                            <div className="input-title">
                                                <span>All of these words:</span>
                                            </div>
                                            <div className="input-box">
                                                <input type="text" />
                                            </div>
                                        </div>
                                        <div className="input-popup-items">
                                            <div className="input-title">
                                                <span>The exact phrase:</span>
                                            </div>
                                            <div className="input-box">
                                                <input type="text" />
                                            </div>
                                        </div>
                                        <div className="input-popup-items">
                                            <div className="input-title">
                                                <span>Any of these words:</span>
                                            </div>
                                            <div className="input-box">
                                                <input type="text" />
                                            </div>
                                        </div>
                                        <div className="input-popup-items">
                                            <div className="input-title">
                                                <span>None of these words:</span>
                                            </div>
                                            <div className="input-box">
                                                <input type="text" />
                                            </div>
                                        </div>
                                        <div className="input-popup-items">
                                            <div className="input-title">
                                                <span>Result Type:</span>
                                            </div>
                                            <div className="input-box">
                                                <select name="select">
                                                    <option value="All Results">
                                                        All Results
                                                    </option>
                                                    <option value="lorem">Lorem, ipsum</option>
                                                    <option value="lorem">Lorem, ipsum</option>
                                                    <option value="lorem">Lorem, ipsum</option>
                                                    <option value="lorem">Lorem, ipsum</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="input-popup-items">
                                            <div className="input-title"></div>
                                            <div className="input-box">
                                                <input type="submit" value="Submit" />
                                            </div>
                                        </div>
                                        <div className="input-popup-items mb-0">
                                            <span>Improve Your searches with search tips</span>
                                        </div>
                                    </form>
                                    <button onClick={this.CloseModel} className="close-btn">
                                        <i className="fa-solid fa-circle-xmark"></i>
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/*<div className="modal fade" id="exampleModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-body">
                                        <div className="popup">
                                            <div className="popup-item">
                                                <div className="title">
                                                    <h5>Find documents that have...</h5>
                                                </div>
                                                <div className="input-popup">
                                                    <div className="input-popup-items">
                                                        <div className="input-title">
                                                            <span>All of these words:</span>
                                                        </div>
                                                        <div className="input-box">
                                                            <input type="text" />
                                                        </div>
                                                    </div>
                                                    <div className="input-popup-items">
                                                        <div className="input-title">
                                                            <span>The exact phrase:</span>
                                                        </div>
                                                        <div className="input-box">
                                                            <input type="text" />
                                                        </div>
                                                    </div>
                                                    <div className="input-popup-items">
                                                        <div className="input-title">
                                                            <span>Any of these words:</span>
                                                        </div>
                                                        <div className="input-box">
                                                            <input type="text" />
                                                        </div>
                                                    </div>
                                                    <div className="input-popup-items">
                                                        <div className="input-title">
                                                            <span>None of these words:</span>
                                                        </div>
                                                        <div className="input-box">
                                                            <input type="text" />
                                                        </div>
                                                    </div>
                                                    <div className="input-popup-items">
                                                        <div className="input-title">
                                                            <span>Result Type:</span>
                                                        </div>
                                                        <div className="input-box">
                                                            <select name="select">
                                                                <option value="All Results">
                                                                    All Results
                                                                </option>
                                                                <option value="lorem">Lorem, ipsum</option>
                                                                <option value="lorem">Lorem, ipsum</option>
                                                                <option value="lorem">Lorem, ipsum</option>
                                                                <option value="lorem">Lorem, ipsum</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="input-popup-items">
                                                        <div className="input-title"></div>
                                                        <div className="input-box">
                                                            <input type="submit" value="Submit" />
                                                        </div>
                                                    </div>
                                                    <div className="input-popup-items mb-0">
                                                        <span>Improve Your searches with search tips</span>
                                                    </div>
                                                </div>
                                                <button type='button' className="close-btn" onClick={this.CloseModel}>
                                                    <i className="fa-solid fa-circle-xmark"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
        </div>*/}
                        {/*<div id="wrap_popup1" className="wrap_popup">
                            <div className="popup">
                                <div className="popup-item">
                                    <div className="title">
                                        <h5>Find documents that have...</h5>
                                    </div>
                                    <form className="input-popup">
                                        <div className="input-popup-items">
                                            <div className="input-title">
                                                <span>All of these words:</span>
                                            </div>
                                            <div className="input-box">
                                                <input type="text" />
                                            </div>
                                        </div>
                                        <div className="input-popup-items">
                                            <div className="input-title">
                                                <span>The exact phrase:</span>
                                            </div>
                                            <div className="input-box">
                                                <input type="text" />
                                            </div>
                                        </div>
                                        <div className="input-popup-items">
                                            <div className="input-title">
                                                <span>Any of these words:</span>
                                            </div>
                                            <div className="input-box">
                                                <input type="text" />
                                            </div>
                                        </div>
                                        <div className="input-popup-items">
                                            <div className="input-title">
                                                <span>None of these words:</span>
                                            </div>
                                            <div className="input-box">
                                                <input type="text" />
                                            </div>
                                        </div>
                                        <div className="input-popup-items">
                                            <div className="input-title">
                                                <span>Result Type:</span>
                                            </div>
                                            <div className="input-box">
                                                <select name="select">
                                                    <option value="All Results">
                                                        All Results
                                                    </option>
                                                    <option value="lorem">Lorem, ipsum</option>
                                                    <option value="lorem">Lorem, ipsum</option>
                                                    <option value="lorem">Lorem, ipsum</option>
                                                    <option value="lorem">Lorem, ipsum</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="input-popup-items">
                                            <div className="input-title"></div>
                                            <div className="input-box">
                                                <input type="submit" value="Submit" />
                                            </div>
                                        </div>
                                        <div className="input-popup-items mb-0">
                                            <span>Improve Your searches with search tips</span>
                                        </div>
                                    </form>
                                    <button className="close-btn">
                                        <i className="fa-solid fa-circle-xmark"></i>
                                    </button>
                                </div>
                            </div>
                        </div>*/}
                    </div>
                </div>
                {/*<SearchBox
                    componentRef={searchBoxRef}
                    placeholder={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
                    ariaLabel={this.props.placeholderText ? this.props.placeholderText : webPartStrings.SearchBox.DefaultPlaceholder}
                    theme={this.props.themeVariant as ITheme}
                    className={styles.searchTextField}
                    value={this.state.searchInputValue}
                    autoComplete="off"
                    onChange={(event) => this.setState({ searchInputValue: event && event.currentTarget ? event.currentTarget.value : "" })}
                    onSearch={() => this._onSearch(this.state.searchInputValue)}
                    onClear={() => {
                        this._onSearch('', true);
                        searchBoxRef.current.focus();
                    }}
                />*/}
                {/*<div className={styles.searchButton}>
                    {this.state.searchInputValue &&
                        <IconButton
                            onClick={() => this._onSearch(this.state.searchInputValue)}
                            iconProps={{ iconName: 'Forward' }}
                            ariaLabel={webPartStrings.SearchBox.SearchButtonLabel}
                        />
                    }
                </div>*/}
            </div>
        );
    }

    public OpenModel() {
        $("#wrap_popup1").fadeIn(250);
    }

    public CloseModel() {
        $("#wrap_popup1").fadeOut(250);
    }

    /**
     * Handler when a user enters new keywords
     * @param queryText The query text entered by the user
     */
    public async _onSearch(queryText: string, isReset: boolean = false) {

        // Don't send empty value
        if (queryText || isReset) {

            this.setState({
                searchInputValue: queryText,
                showClearButton: !isReset
            });

            if (this.props.searchInNewPage && !isReset && this.props.pageUrl) {

                this.props.tokenService.setTokenValue(BuiltinTokenNames.inputQueryText, queryText);
                queryText = await this.props.tokenService.resolveTokens(this.props.inputTemplate);
                const urlEncodedQueryText = encodeURIComponent(queryText);

                const tokenizedPageUrl = await this.props.tokenService.resolveTokens(this.props.pageUrl);
                const searchUrl = new URL(tokenizedPageUrl);

                let newUrl;

                if (this.props.queryPathBehavior === QueryPathBehavior.URLFragment) {
                    searchUrl.hash = urlEncodedQueryText;
                    newUrl = searchUrl.href;
                }
                else {
                    newUrl = UrlHelper.addOrReplaceQueryStringParam(searchUrl.href, this.props.queryStringParameter, queryText);
                }

                // Send the query to the new page
                const behavior = this.props.openBehavior === PageOpenBehavior.NewTab ? '_blank' : '_self';
                window.open(newUrl, behavior);

            } else {

                // Notify the dynamic data controller
                this.props.onSearch(queryText);
            }
        }
    }


    public componentDidUpdate(prevProps: ISearchBoxContainerProps, prevState: ISearchBoxContainerState) {

        if (!isEqual(prevProps.inputValue, this.props.inputValue)) {

            let query = this.props.inputValue;
            try {
                query = decodeURIComponent(this.props.inputValue);

            } catch (error) {
                // Likely issue when q=%25 in spfx
            }

            this.setState({
                searchInputValue: query,
            });
        }
    }

    public render(): React.ReactElement<ISearchBoxContainerProps> {
        let renderErrorMessage: JSX.Element = null;

        if (this.state.errorMessage) {
            renderErrorMessage = <MessageBar messageBarType={MessageBarType.error}
                dismissButtonAriaLabel='Close'
                isMultiline={false}
                onDismiss={() => {
                    this.setState({
                        errorMessage: null,
                    });
                }}
                className={styles.errorMessage}>
                {this.state.errorMessage}</MessageBar>;
        }

        const renderSearchBox = this.props.enableQuerySuggestions ?
            this.renderSearchBoxWithAutoComplete() :
            this.renderBasicSearchBox();
        return (
            <div className={styles.searchBox}>
                {renderErrorMessage}
                {renderSearchBox}
            </div>
        );
    }
}
