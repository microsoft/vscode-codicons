# Visual Studio Code - Codicons

### Intro
This tool takes the Visual Studio Code icons and converts them into an font using the [icon-font-generator](https://github.com/Workshape/icon-font-generator). All icons are stored under `src > icons`. The mappings of the class names and unicode characters are stored in `src/template/mapping.json` as well as the default styles under `src/template/styles.hbs`.

### Install

```
npm install
```

### Build

```
npm run build
```

Output will be exported to a `dist` folder. We track this folder so that we can see the updated changes to the unicode characters.

### Update Packages

You can run `npm outdated` to see if there are any package updates. To update packages, run:

```
npm update
```

### Add Icons

Simply export your icons (svg) to the `src > icons` folder and run the the build command. The build command will also remove any subfolders in the `icons` folder to keep the folder structure consistent.


## How to use

When needing to reference an icon in the [Visual Studio Code source code](https://github.com/microsoft/vscode), simply create a dom element/container that contains `codicon` and the [icon name](https://microsoft.github.io/vscode-codicons/dist/codicon.html) like:

`<div class='codicon codicon-add'></div>`

It's recommended to use a single dom element for each icon and not to add children elements to it.

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Legal Notices

Microsoft and any contributors grant you a license to the Microsoft documentation and other content
in this repository under the [Creative Commons Attribution 4.0 International Public License](https://creativecommons.org/licenses/by/4.0/legalcode),
see the [LICENSE](LICENSE) file, and grant you a license to any code in the repository under the [MIT License](https://opensource.org/licenses/MIT), see the
[LICENSE-CODE](LICENSE-CODE) file.

Microsoft, Windows, Microsoft Azure and/or other Microsoft products and services referenced in the documentation
may be either trademarks or registered trademarks of Microsoft in the United States and/or other countries.
The licenses for this project do not grant you rights to use any Microsoft names, logos, or trademarks.
Microsoft's general trademark guidelines can be found at http://go.microsoft.com/fwlink/?LinkID=254653.

Privacy information can be found at https://privacy.microsoft.com/en-us/

Microsoft and any contributors reserve all other rights, whether under their respective copyrights, patents,
or trademarks, whether by implication, estoppel or otherwise.
