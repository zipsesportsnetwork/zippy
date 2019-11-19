<p align="center">
    <figure>
        <img alt="Zippy bot avatar" src="doc/avatar.png" width="400"/>
        <figcaption>Avatar designed by Sydney Meighen (<a href="https://github.com/sydmeg">@sydmeg</a>)</figcaption>
    </figure>
</p>

# The "Zippy" Discord Bot

A WIP modular, configurable [Discord](https://discordapp.com) bot providing OAuth-based verification, role selection, moderation tools, and utility commands. 

## Table of Contents

- [Background](#background)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

"Zippy Bot", named after their [beloved mascot](https://en.wikipedia.org/wiki/Zippy_(mascot)), was written to be used to help run the Discord server of the [University of Akron's esports program](https://uakron.edu/esports). It is currently maintained by the Zips Esports Network, a student organization created to assist the program and provide working experience to interested students.

## Installation

Aside from ones run by the developers working on this, there's only one active instance of the bot, so the installation is very inconvenient. There is an issue opened to address this issue.

To start, clone the repository into a new directory (in this case, it'll be called `zippy`):

```console
git clone https://github.com/zipsesportsnetwork/zippy
```

Due to inconsistencies in development environments, you may also have to:

```console
chmod +x zippy/bin/zippy
```

This will be changed also.

## Configuration

The bootstrapping configuration is stored in JSON, while the rest is stored in a Google Sheets spreadsheet.

### JSON

Example (read from `dev.config.json` by default):

```js
{
    "google": {
        "client_id": "abcdefghijklmnopqrstuvwxyz", /* Google application client ID*/
        "client_secret": "", /* Google application client secret */
        "redirect_uri": "http://localhost:3001/bot/redirect"
    },
    "spreadsheetId": "12ZhR7QRnmJVTb46GfGmDryJcpnid_FgGYcluP8mbthg"
}
```

## Usage

## Maintainers

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License