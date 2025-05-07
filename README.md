# UserScripts

This repository contains a collection of scripts that I have written to automate various tasks on websites. These
scripts are intended to be used with the [Tampermonkey](https://www.tampermonkey.net/) browser extension.

## DeepWiki
[DeepWiki](https://deepwiki.com/iumix/UserScripts) is used for AI-generated wiki, not really important.

## Scripts

### DisableTwitchVisabilityAPI

This script disables the Twitch Visibility API, which is used to determine if a user is currently watching a stream.
This can be useful for streamers who want to appear offline while watching other streams.

---

### DownloadDirectoryListing

Download all files from an index page like Apache directory listing, can be a list of files on the page or can be
recursive to download all files in subdirectories.

---

### LIHKGShowHiddenVotes

Self-explanatory, show hidden votes on LIHKG. Doesn't work all the time because I wrote this so badly, maybe I'll fix it
someday (hopefully).

---

### CopyToFixupX
Modify all copy links on twitter (x.com) to (fixupx.com) to allow preview on discord.

---

### Disable Console Clear
Disable the console clear function, useful for debugging. Call `restoreConsoleClear()` to restore the function.

## Usage

Just install the script by pasting or dragging the file to the dashboard of Tampermonkey.

## Disclaimer

I am not responsible for any damage caused by the use of these scripts, including account bans, data loss, or any other
damage. Use at your own risk.

## License

No license, do whatever you want with it. Please don't sue me.
