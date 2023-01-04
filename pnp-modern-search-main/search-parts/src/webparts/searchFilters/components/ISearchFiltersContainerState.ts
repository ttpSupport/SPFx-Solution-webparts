import { IDataFilter, IDataFilterInternal } from "@pnp/modern-search-extensibility";

export interface ISearchFiltersContainerState {

    /**
     * The selected/unselected filters sent to the Handlebars templates as context for rendering
     */
    currentUiFilters: IDataFilterInternal[];

    /**
     * Filters submitted to the data source
     */
    submittedFilters: IDataFilter[];

    sortBy:String;
    searchIn:String;
    divBu:String[];
    contentType:String[];
    modifiedBy:String[];
    contentTypeColl:String[];
    lastModified:String[];
    filterFormat:String[];
    divBuColl:String[];
    workProcessColl:String[];
    workProcess:String[];
}