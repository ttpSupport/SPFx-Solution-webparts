import { IDataSourceData } from "@pnp/modern-search-extensibility";

export interface ISearchResultsContainerState {

    /**
     * The current loaded data
     */
    data: IDataSourceData;

    /**
     * The current selected item keys in results regardless the page
     */
    selectedItemKeys: string[];    
    
    /**
     * Flag indicating if results are loading
     */
    isLoading: boolean;

    /**
     * Error message display in the message bar
     */
    errorMessage: string;

    /**
     * Indicates if the data have already been rendered once.
     */
    renderedOnce: boolean;    
    searchQueryText:string;

    sortBy: String;
    rawData: IDataSourceData,
    searchIn: String;
    divBu: String[];
    contentType: String[];
    modifiedBy: String[];
    modifiedByColl: String[];
    contentTypeColl: String[];
    lastModified: String[];
    filterFormat: String[];
    filterFormatColl: String[];
    divBuColl: String[];
    workProcessColl: String[];
    workProcess: String[];
    search: '',
    searchResult: string[],
    allThesewords: String,
    exactPhrase: String,
    anyOfTheseWords: String,
    noneOfTheseWords: String,
    country: string[],
    property: string[],
    itemsPerPage: number,
    termJSONData:any[],
    selectedFilterOption:{},
}