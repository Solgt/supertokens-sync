[![npm latest package](https://img.shields.io/npm/v/@solgt/supertokens-sync/latest.svg)](https://www.npmjs.com/package/@solgt/supertokens-sync)

# supertokens-sync 📡

```
         App 1          App 2          App 3          App 4
           |              |              |              |
   supertokens-sync  supertokens-sync  supertokens-sync  supertokens-sync
           |              |              |              |
           \______________|______________|______________/
                           |
                    ----------------
                   |                |
                   |   Supertokens  |
                   |      Core      |
                   |________________|

```

Sync your Supertokens roles and permissions to a local file. If you have many
apps that need to be in sync with what roles and permissions _actually_ exist in
your Supertokens core instance while you develop or as a safety check during
build, you can use `supertokens-sync` to maintain a central auth config file
that includes roles, permissions and roles with permissions.

The script will retrieve roles and permissions from both Supertokens development
and production cores, and perform a comparison. If there is a mismatch between
the cores in terms of roles and permissions, the script will prioritize one set
and generate a config file based on it (in the config you can select which to
prioritize).

Also retrieves and compares tenants, but only by ID.

## Prerequisites

Expected `.env` and `.env.production` populated with the required keys for
operation.

If you have a local `.prettierrc`, the script will pick it up and format the
output according it, otherwise prettier defaults will be used.

## Usage

-   Navigate to your project root.
-   Install with `npm i @solgt/supertokens-sync`.
-   Run with `npx supertokens-sync`.
-   ⚠️ First run will create a local `supertokens-sync-config.json` (and will
    likely need to be set up).
-   Make use of the generated auth config file. The `.ts` version also exports
    types.

From here you can put `npx supertokens-sync` in front of your development
command, during pre-build or just as an isolated command.

## Caveats

Keys generated out of roles and permissions are capitalized, and any characters
_not_ a letter or a number will be replaced with an underscore. For example: if
a permission is the string `"read:feature:lists"`, the generated key will be
`READ_FEATURE_LISTS`.

## Configuration

The configuration file `supertokens-sync-config.json` is automaticaly generated
with defaults when no config file is detected.

| Key                         | Possible Values              | Default                        |
| --------------------------- | ---------------------------- | ------------------------------ |
| `logLevel`                  | `"debug"`, `"info"`          | `"info"`                       |
| `mode`                      | `"verify"`, `"sync"`         | `"sync"`                       |
| `outputExtension`           | `".json"`, `".ts"`           | `".ts"`                        |
| `outputPath`                | _any valid path string_      | `"./"`                         |
| `outputFileName`            | _any valid file name string_ | `"supertokensAuthConfig"`      |
| `priority`                  | `"dev"`, `"prod"`            | `"prod"`                       |
| `authConfigObjectName`      | _string_                     | `"supertokensAuthConfig"`      |
| `envKeyNames`               | _EnvKeyNames object_         | _(required)_                   |
| `envKeyNames.connectionUri` | _string_                     | `"SUPERTOKENS_CONNECTION_URI"` |
| `envKeyNames.apiKey`        | _string_                     | `"SUPERTOKENS_API_KEY"`        |

## Release Pipeline

Currently manual.

-   `npm run build`
-   `npm publish --access public`

## License

MIT
