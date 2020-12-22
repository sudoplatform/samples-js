# Ad Tracker Blocker Sample Web

## Development

### Pre-reqs:

Ensure you have configured your access to Anonyome internal repos, including configuring npm with the necessary CA:
https://anonyome.atlassian.net/wiki/spaces/PLA/pages/276594736

```
npm login --registry="https://repo.tools.anonyome.com/repository/npm-hosted/" --scope="@sudoplatform"
npm login --registry="https://repo.tools.anonyome.com/repository/npm-group/" --scope="@sudoplatform"
```

To run this sample, you must provide the following configuration files:
| File | Description |
| - | - |
| [project-root]/config/sudoplatformconfig.json | Obtained from Admin Console / Project Settings / SDK Config |
| [project-root]/config/register_key.private | Obtained from Admin Console / Project Settings / Test Registration Keys |
| [project-root]/config/register_key.id | Contains the ID of the key obtained for `register_key.private` |

Once you have copied those files into place you will be ready to launch or build the sample.

### Launch

1. Clone this repository
2. `yarn install && yarn start`
3. Navigate to `localhost:3000` in your browser.

### Build Assets

1. Clone this repository
2. `yarn install && yarn build`
3. Assets will be built into `/dist` folder.
