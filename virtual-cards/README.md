# Sudo Virtual Cards JS Sample App

## Overview

This project provides examples for interacting with the Sudo Virtual Cards JS SDK on the [Sudo Platform](https://sudoplatform.com/).

## Version Support

| Engine            | Supported version |
| ----------------- |-------------------|
| Node              | >= 16             |
| Safari            | >= 14             |
| Firefox           | last 2 versions   |
| Chromium and Edge | last 2 versions   |
| IE                | _not supported_   |

## Getting Started

To run this sample app you must first add a TEST registration key and SDK configuration file to the project.

1. Follow the steps in the [Getting Started guide](https://docs.sudoplatform.com/guides/getting-started) and in [User Registration](https://docs.sudoplatform.com/guides/users/registration) to obtain a config file (sudoplatformconfig.json) and a TEST registration key, respectively

2. Place both files in the following location with these names:

```
[project-root]/config/sudoplatformconfig.json
[project-root]/config/register_key.private
```

3. Create a text file named `register_key.id` containing the TEST registration key ID in the same location:

```
[project-root]/config/register_key.id
```

### Launching the app

1. Follow the above steps in "Getting Started".
2. `npm install && npm run start` or `yarn install && yarn start`
3. Navigate to `https://localhost:3000` in your browser.

### Building Assets

1. Clone this repository
2. `npm install && npm run build` or `yarn install && yarn build`
3. Assets will be built into the `dist` folder.

## More Documentation

Refer to the following documents for more information:

- [Getting Started on Sudo Platform](https://docs.sudoplatform.com/guides/getting-started)
- [Sudo Virtual Cards SDK](https://docs.sudoplatform.com/guides/virtual-cards)

## Issues and Support

File issues you find with this sample app in this Github repository. Ensure that you do not include any Personally Identifiable Information (PII), API keys, custom endpoints, etc. when reporting an issue.

For general questions about the Sudo Platform please contact [partners@sudoplatform.com](mailto:partners@sudoplatform.com)
