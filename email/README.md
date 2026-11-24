# Sudo Email JS Sample App

## Overview

This project provides examples for interacting with the Sudo Email JS SDK on the [Sudo Platform](https://sudoplatform.com/).

## Version Support

| Engine            | Supported version |
| ----------------- | ----------------- |
| Node              | >= 16             |
| Safari            | >= 14             |
| Firefox           | last 2 versions   |
| Chromium and Edge | last 2 versions   |
| IE                | _not supported_   |

## Getting Started

To run this sample app you must first add a TEST registration key and SDK configuration file to the project.

1. Follow the steps in the [Getting Started guide](https://docs.sudoplatform.com/guides/getting-started) and in [User Registration](https://docs.sudoplatform.com/guides/users/registration) to obtain a config file (sudoplatformconfig.json) and a TEST registration key, respectively.

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
2. `yarn install --frozen-lockfile && yarn start`
3. Navigate to `http://localhost:3000` in your browser.

### Building Assets

1. Clone this repository
2. `yarn install --frozen-lockfile && yarn build`
3. Assets will be built into the `dist` folder.

## Federated Sign In

Choose **Federated SignIn** on the sign in page to use Federated Single Sign On (FSSO). It needs a `federatedSignIn` section in `sudoplatformconfig.json`, and its `signInRedirectUri` and `signOutRedirectUri` must each be a single URL, `http://localhost:3000/callback`, which must also be an allowed callback and sign out URL of the Cognito app client. A shared config may list several comma separated URLs for the mobile apps; replace the list with the single URL, as the web SDK sends the value to Cognito unchanged. The browser leaves the app for the sign in page and returns to `/callback` with the result, which the app then completes. Signing out also sends the browser to the sign in page to clear its cookies.

**Sign Out** in the header signs out the way you signed in and keeps your registration and keys. **Account > User Details** has **Sign Out and Remove Data** for federated users and **Deregister** for TEST registrations, which deletes the user and all of their data.

The app refreshes the session when the service rejects its tokens, and returns to the sign in page when the session can't be refreshed.

## Keys

The sign in page has a **Single key for all email addresses** switch. When it is on, every email address provisioned in the session shares one key pair, created when the first address is provisioned. When it is off, each address gets its own key pair.

Like the other Sudo Platform JS sample apps, this app keeps keys in memory only: the sign in session, the keys that unseal email messages, and the keys that encrypt Sudos. Reloading the page, or signing in with Federated Sign In, which reloads the page, starts without them. To read existing Sudos and email, export a key backup from **Account > Import/Export Keys** and import it after signing in again. Key backup is only available to FSSO users, because a TEST registration is tied to the browser it was made in.

Each browser session creates a random Sudo key unless a backup is imported, whose current key then encrypts new Sudos. The fixed demo key earlier versions of this app used is always kept as well, so Sudos they created stay readable.

The backup is a password protected file in the key backup format shared with the Android and iOS sample apps, with the Sudo keys under `sudoProfiles` and the email keys under `sudoEmail`. Entries for other SDKs in an imported backup are skipped.

A Sudo encrypted with a key that is in no backup can't be read again, and the Sudo Profiles SDK fails the whole Sudo list when any Sudo can't be read. When that happens, **Sudos > Manage** lists which Sudos need a key this browser doesn't have and lets you delete them. This also happens when a federated user signs in who has Sudos created by another app, such as the Telephony sample app.

## More Documentation

Refer to the following documents for more information:

- [Getting Started on Sudo Platform](https://docs.sudoplatform.com/guides/getting-started)
- [Sudo Email SDK](https://docs.sudoplatform.com/guides/email)

## Issues and Support

File issues you find with this sample app in this Github repository. Ensure that you do not include any Personally Identifiable Information (PII), API keys, custom endpoints, etc. when reporting an issue.

For general questions about the Sudo Platform please contact [partners@sudoplatform.com](mailto:partners@sudoplatform.com)
