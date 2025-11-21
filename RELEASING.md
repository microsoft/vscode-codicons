## Pre-release

Pre-release builds are created automatically for each push to `main`. The builds have the same `major.minor.patch` version as the latest release, but with an additional pre-release identifier `-N`, where `N` is the number of pre-releases since the latest release. For example, if the latest release is `0.0.0` and there have been 5 pre-releases since then, the next pre-release build will be versioned `0.0.0-5`.

## Stable release

Stable releases are created by triggering the release pipeline: https://monacotools.visualstudio.com/Monaco/_build?definitionId=631
To create a stable release, you'll need to specify one of the following release types in the "Release Version" parameter:
- `patch`: for backward-compatible bug fixes
- `minor`: for backward-compatible new features
- `major`: for changes that break backward compatibility
- `X.X.X`: for specifying an exact version number

Most of the time, you'll want to use `patch` or `minor`.