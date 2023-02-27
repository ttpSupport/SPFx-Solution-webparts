import * as React from 'react';
import styles from './AdvanceSearch.module.scss';
import { IAdvanceSearchProps } from './IAdvanceSearchProps';
import { escape } from '@microsoft/sp-lodash-subset';
import AdvanceSearchFilters from '../../../shared/commonSearchFilters';
import { ISearchResultsContainerState } from '../../searchResults/components/ISearchResultsContainerState';

export interface IAdvanceSearchState {
  search: string;
  searchResult: any[];
  sortBy: string;
  searchIn: string;
  allThesewords: string;
  exactPhrase: string;
  anyOfTheseWords: string;
  noneOfTheseWords: string;
  modifiedBy: string[];
  lastModified: string[];
  filterFormat: string[];
  divBuColl: string[];
  divBu: string[];
  contentTypeColl: string[];
  contentType: string[];
  workProcessColl: string[];
  workProcess: string[];
  property: string[];
  country: string[];
  modifiedByColl: String[];
  filterFormatColl: String[];
  data: null,
  isLoading: true,
  errorMessage: '',
  renderedOnce: false,
  selectedItemKeys: [],
  searchQueryText: "",

}

export default class AdvanceSearch extends React.Component<IAdvanceSearchProps, ISearchResultsContainerState> {
  constructor(props: IAdvanceSearchProps) {
    super(props);
    this.state = {
      data: null,
      rawData: null,
      isLoading: true,
      errorMessage: '',
      renderedOnce: false,
      selectedItemKeys: [],
      filterFormatColl: [],
      modifiedByColl: [],
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
      divBuColl: [],
      divBu: [],
      contentTypeColl: [],
      contentType: [],
      workProcessColl: [],
      workProcess: [],
      property: [],
      country: [],
      itemsPerPage: 10,
      termJSONData:[],
      selectedFilterOption:{}
    };
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.handleCheckBoxChange = this.handleCheckBoxChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  private async handleRadioChange(stateName: any, e: any) {
    if (stateName == "sortBy") {
      this.setState({ sortBy: e.target.value });
    } else if (stateName == "searchIn") {
      this.setState({ searchIn: e.target.value });
    }
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


  private async handleCheckBoxChange(stateName: any, e: any) {
    console.log(stateName, e.target.value);
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
  componentDidMount(): void {
    fetch("/sites/OneFEO/SiteAssets/OrgStructure.js")
      .then((res) => {
        return res.json();
      }).then((data) => {
        console.log(data);
        let selectedFilterOption = this.state.selectedFilterOption;
        for (let i = 0; i < data.length; i++) {
          selectedFilterOption[data[i].termNode.replace(/ /g, "_")] = [];
        }
        this.setState({ termJSONData: data, selectedFilterOption });
      });
  }
  public render(): React.ReactElement<IAdvanceSearchProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.advanceSearch} ${hasTeamsContext ? styles.teams : ''}`}>
        <AdvanceSearchFilters stateValue={this.state} handleRadioChange={this.handleRadioChange} handleCheckBoxChange={this.handleCheckBoxChange} handleChange={this.handleChange} context={this.props.context} />
      </section>
    );
  }
}
