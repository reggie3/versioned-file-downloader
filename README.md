# Versioned File Downloader
## A package that uses the Expo FileSystem API to download files to a mobile device.
### Why use this?
You need to download files to a mobile device, and you need to be able to download files again when their versions change.

### Why not use this?
You're not downloading files to a mobile device

[![npm](https://img.shields.io/npm/v/versioned-file-downloader.svg)](https://www.npmjs.com/package/versioned-file-downloader)
[![npm](https://img.shields.io/npm/dm/versioned-file-downloader.svg)](https://www.npmjs.com/package/versioned-file-downloader)
[![npm](https://img.shields.io/npm/dt/versioned-file-downloader.svg)](https://www.npmjs.com/package/versioned-file-downloader)
[![npm](https://img.shields.io/npm/l/versioned-file-downloader.svg)](https://github.com/react-native-component/versioned-file-downloader/blob/master/LICENSE)


## Usage
~~~
npm install --save versioned-file-downloader
~~~
or
~~~
yarn add versioned-file-downloader
~~~

And import like this
~~~
import versionedFileDownloader from 'versioned-file-downloader';
~~~

~~~
let downloadStatus = await versionedFileDownloader(
    this.webViewDownloadStatusCallBack,
    {
    name: config.PACKAGE_NAME,
    version: config.PACKAGE_VERSION,
    files: FILES_TO_DOWNLOAD,
    }
);
~~~