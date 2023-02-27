# My Approvals

## Summary

This web part demonstrates displaying the list of approval requests of Power Automate. Power Automate provides a new workflow feature that replaces SharePoint workflows, but it is a Power Platform feature, not a Microsoft 365 feature. You can display approval requests from only Power Automate site. This web part enable to display approval requests from SharePoint site.

![Web part preview](./assets/react-my-approvals.gif)

## Compatibility

![SPFx 1.15.2](https://img.shields.io/badge/SPFx-1.15.2-green.svg)
![Node.js v16 | v14 | v12](https://img.shields.io/badge/Node.js-v16%20%7C%20v14%20%7C%20v12-green.svg) 
![Compatible with SharePoint Online](https://img.shields.io/badge/SharePoint%20Online-Compatible-green.svg)
![Does not work with SharePoint 2019](https://img.shields.io/badge/SharePoint%20Server%202019-Incompatible-red.svg "SharePoint Server 2019 requires SPFx 1.4.1 or lower")
![Does not work with SharePoint 2016 (Feature Pack 2)](https://img.shields.io/badge/SharePoint%20Server%202016%20(Feature%20Pack%202)-Incompatible-red.svg "SharePoint Server 2016 Feature Pack 2 requires SPFx 1.1")
![Local Workbench Unsupported](https://img.shields.io/badge/Local%20Workbench-Unsupported-red.svg "Local workbench is no longer available as of SPFx 1.13 and above")
![Hosted Workbench Compatible (with permissions)](https://img.shields.io/badge/Hosted%20Workbench-Compatible-yellow.svg "Requires API permissions")
![Compatible with Remote Containers](https://img.shields.io/badge/Remote%20Containers-Compatible-green.svg)

> NodeJS version must match >=10.13.0 <11.0.0 on >=12.13.0 <13.0.0 or >=14.15.0 <15.0.0

## Prerequisites

This web part uses *Microsoft Flow Service* API. You need to approve the API request after deploying the package.

- `Approvals.Read.All`
- `Flows.Read.All`

For more information, see [docs](https://docs.microsoft.com/ja-jp/sharepoint/dev/spfx/use-aadhttpclient).

## Minimal Path to Awesome

- Clone this repository (or [download this solution as a .ZIP file](https://pnp.github.io/download-partial/?url=https://github.com/pnp/sp-dev-fx-webparts/tree/main/samples/react-my-approvals) then unzip it)
- From your command line, change your current directory to the directory containing this sample (`react-my-approvals`, located under `samples`)
- in the command-line run:
  - `npm install`
  - `gulp serve`

> This sample can also be opened with [VS Code Remote Development](https://code.visualstudio.com/docs/remote/remote-overview). Visit https://aka.ms/spfx-devcontainer for further instructions.

## Solution

Solution|Author(s)
--------|---------
react-my-approvals|[Takashi Shinohara](https://github.com/karamem0) ([@karamem0](https://twitter.com/karamem0))

## Version history

Version|Date|Comments
-------|----|--------
1.3|November 2, 2022|Updated to support responsive layouts; Upgraded to SPFx v1.15.2
1.2|March 28, 2022|Upgraded to SPFx v1.14
1.1|January 22, 2022|Updated to allow multiple environments to be selected
1.0|January 11, 2022|Initial release

## Help

We do not support samples, but this community is always willing to help, and we want to improve these samples. We use GitHub to track issues, which makes it easy for  community members to volunteer their time and help resolve issues.

If you're having issues building the solution, please run [spfx doctor](https://pnp.github.io/cli-microsoft365/cmd/spfx/spfx-doctor/) from within the solution folder to diagnose incompatibility issues with your environment.

You can try looking at [issues related to this sample](https://github.com/pnp/sp-dev-fx-webparts/issues?q=label%3A%22sample%3A%20react-my-approvals%22) to see if anybody else is having the same issues.

You can also try looking at [discussions related to this sample](https://github.com/pnp/sp-dev-fx-webparts/discussions?discussions_q=react-my-approvals) and see what the community is saying.

If you encounter any issues while using this sample, [create a new issue](https://github.com/pnp/sp-dev-fx-webparts/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected%2Csample%3A%20react-my-approvals&template=bug-report.yml&sample=react-my-approvals&authors=@karamem0&title=react-my-approvals%20-%20).

For questions regarding this sample, [create a new question](https://github.com/pnp/sp-dev-fx-webparts/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Aquestion%2Csample%3A%20react-my-approvals&template=question.yml&sample=react-my-approvals&authors=@karamem0&title=react-my-approvals%20-%20).

Finally, if you have an idea for improvement, [make a suggestion](https://github.com/pnp/sp-dev-fx-webparts/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Aenhancement%2Csample%3A%20react-my-approvals&template=suggestion.yml&sample=react-my-approvals&authors=@karamem0&title=react-my-approvals%20-%20).


## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

<img src="https://pnptelemetry.azurewebsites.net/sp-dev-fx-webparts/samples/react-my-approvals" />
