import { FileSystem } from 'expo';

let statusCallback = null;

export default (versionedFileDownloader = async (
  downloadStatusCallback,
  fileInfo
) => {
  statusCallback = downloadStatusCallback;
  let downloadStatus = await getFiles(
    fileInfo.name,
    fileInfo.version,
    fileInfo.files
  );
  return downloadStatus;
});

const getFiles = async (directory, version, files) => {
  // directory name of the form:
  //    react-native-webview-leaflet/24
  const CURRENT_VERSION_DIRECTORY_NAME =
    FileSystem.documentDirectory + directory + '/' + version;
  const PARENT_DIRECTORY = FileSystem.documentDirectory + directory;
  const GOOD_DOWNLOAD_FILE_NAME = 'downloads_completed';

  try {
    // get list of versions currently in the directory so that they can be deleted if needed
    statusCallback({msg: 'reading parent directory'});
    let parentDirectoryContents = await getParentDirectoryContents(
      PARENT_DIRECTORY
    );
    statusCallback({msg:`roo directory contents`, payload: parentDirectoryContents});

    // check to see if this version's download directory already exists
    let checkIfExists = await FileSystem.getInfoAsync(
      CURRENT_VERSION_DIRECTORY_NAME
    );
    if (checkIfExists.exists) {
      statusCallback({msg:'directory found'});
      statusCallback({msg:'checking for good downloads'});
      let checkForGoodDownloads = await FileSystem.getInfoAsync(
        CURRENT_VERSION_DIRECTORY_NAME + '/' + GOOD_DOWNLOAD_FILE_NAME
      );
      statusCallback({msg:`found good downloads`});
      if (checkForGoodDownloads.exists) {
        statusCallback({msg:'found good downloads'});
        return {
          success: true,
          msg: 'found good downloads',
          path: CURRENT_VERSION_DIRECTORY_NAME
        };
      } else {
        statusCallback({msg:'downloads bad, deleting directory'});
        await FileSystem.deleteAsync(CURRENT_VERSION_DIRECTORY_NAME);
        statusCallback({msg:'directory deleted'});
        statusCallback({msg:'downloading files'});
        let downloadResults = await downloadFiles(
          files,
          CURRENT_VERSION_DIRECTORY_NAME
        );
        statusCallback({msg:downloadResults});
      }
    } else {
      // directory doesn't exist so create it
      statusCallback({msg:'creating directory'});
      await FileSystem.makeDirectoryAsync(CURRENT_VERSION_DIRECTORY_NAME, {
        intermediates: true
      });
      statusCallback({msg:'directory created'});
      statusCallback({msg:'downloading files'});
      // download the files into the newly created directory
      let downloadResults = await downloadFiles(
        files,
        CURRENT_VERSION_DIRECTORY_NAME
      );
      if (downloadResults.downloadFailures.length > 0) {
        statusCallback({msg:'some files failed to download'});
      } else {
        // successfully downloaded all the files so write the file denoting
        // a good download
        statusCallback({msg:'all files downloaded'});
        await FileSystem.writeAsStringAsync(
          CURRENT_VERSION_DIRECTORY_NAME + '/' + GOOD_DOWNLOAD_FILE_NAME,
          version
        );
        statusCallback({msg:'completion file written'});
      }
    }

    // delete previous versions
    parentDirectoryContents.forEach(directoryName => {
      statusCallback({msg:`deleting version`, payload: directoryName});
      FileSystem.deleteAsync(PARENT_DIRECTORY + '/' + directoryName);
    });

    // read and return a list of all files in the directory
    statusCallback({msg:'reading directory'});
    let directoryReadResults = await FileSystem.readDirectoryAsync(
      CURRENT_VERSION_DIRECTORY_NAME
    );
    statusCallback({msg: 'directory read', payload: directoryReadResults});
    return {
      success: true,
      files: directoryReadResults,
      path: CURRENT_VERSION_DIRECTORY_NAME
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error
    };
  }
};

const getParentDirectoryContents = async PARENT_DIRECTORY => {
  let parentDirectoryInfoResults = await FileSystem.getInfoAsync(
    PARENT_DIRECTORY
  );
  if (parentDirectoryInfoResults.exists) {
    let parentDirectoryContents = await FileSystem.readDirectoryAsync(
      PARENT_DIRECTORY
    );
    return parentDirectoryContents;
  }
  return [];
};

const downloadFiles = async (files, CURRENT_VERSION_DIRECTORY_NAME) => {
  let downloadPromises = files.map(async file => {
    return await FileSystem.downloadAsync(
      file,
      CURRENT_VERSION_DIRECTORY_NAME +
        '/' +
        file.substring(file.lastIndexOf('/') + 1)
    );
  });

  let downloadSuccess = [];
  let downloadFailures = [];
  let downloadResults = await Promise.all(downloadPromises);
  downloadResults.forEach(downloadResult => {
    if (downloadResult.status === 200) {
      downloadSuccess.push(downloadResult.uri);
    } else {
      downloadFailures.push(downloadResult.uri);
    }
  });

  return {
    downloadFailures
  };
};
