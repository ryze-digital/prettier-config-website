# RYZE Digital Prettier Rules

## Install

```bash
npm i @ryze-digital/prettier-config-website --save-dev
```

## Usage

Add the following to your `prettier.config.js`:

```js
import config from '@ryze-digital/prettier-config-website';

export default config;
```

## Add custom rules for your project

If you want to change (for example) the line length for your whole project, you have to change the content of your
`prettier.config.js` to the following:

```js
import config from '@ryze-digital/prettier-config-website';

export default {
    ...config,
    printWidth: 80
};
```
