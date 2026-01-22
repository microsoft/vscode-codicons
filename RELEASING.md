## Pre-release

Pre-release builds are created automatically for each push to `main`. The builds have the same `major.minor.patch` version as the latest release, but with an additional pre-release identifier `-N`, where `N` is the number of pre-releases since the latest release. For example, if the latest release is `0.0.0` and there have been 5 pre-releases since then, the next pre-release build will be versioned `0.0.0-5`.

## Stable release

Stable releases are created by triggering the release pipeline: https://monacotools.visualstudio.com/Monaco/_build?definitionId=631
To create a stable release, you'll need to specify one of the following release types in the "Release Version" parameter:
- `prerelease`: for creating a pre-release build
- `patch`: for backward-compatible bug fixes
- `minor`: for backward-compatible new features
- `major`: for changes that break backward compatibility

Most of the time, you'll want to use `patch` or `minor`. For any of the above release types, the version number will be incremented automatically based on the latest stable release.

To create a stable release at a specific version, you can use `X.X.X` format (e.g., `1.2.3`). In this case, the version number will be set exactly as specified, regardless of the previous latest stable release.

## Releasing from other branches

To release from a branch other than `main`, you can choose the branch from the "Select pipeline version by branch/tag" dropdown when you run the pipeline. 
Then, specify the desired release type as described above.

Releasing from other branches is useful for creating recovery releases and pre-releases for testing.

## Adopting updates in microsoft/vscode

Update the `@vscode/codicons` dependency version in `microsoft/vscode`'s `package.json`s:

- https://github.com/microsoft/vscode/blob/main/remote/web/package.json
- https://github.com/microsoft/vscode/blob/main/package.json

Then, run `npm i` in `microsoft/vscode` to update the `package-lock.json`s and make a PR with your changes.