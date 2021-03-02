type FileTypes = 'video' | 'audio' | 'image' | 'other';

type FileWithMetadata = {
  file: string; // Replaced file with string to make it easier
  customType: FileTypes;
  // ... Extra stuff
};

type InputFilesType = {
  video?: FileWithMetadata[];
  audio?: FileWithMetadata[];
  image?: FileWithMetadata[];
  other?: FileWithMetadata[];
};

type FileTransformType = {
  state: 'Move' | 'Insert' | 'Delete';
  position?: number; // Position A
  fileObj?: FileWithMetadata;
  type: FileTypes;
  secondPosition?: number; // Position B
};

function isValid(
  stale: InputFilesType,
  latest: InputFilesType,
  transform: FileTransformType[]
) {
  let reason = '';
  let length = transform.length;
  for (let i = 0; i < length; i++) {
    let currentTransform = transform[i];
    // console.log(currentTransform);

    //MOVE OPERATION
    if (currentTransform.state === 'Move') {
      let type = currentTransform.type;
      let position = currentTransform.position!;
      let secondPosition = currentTransform.secondPosition!;
      let allFiles = stale[type]!;
      if (
        allFiles != undefined &&
        position >= 0 &&
        position <= allFiles.length &&
        secondPosition >= 0 &&
        secondPosition <= allFiles.length
      ) {
        let fileOne = allFiles[position].file;
        let fileTwo = allFiles[secondPosition].file;
        allFiles[position].file = fileTwo;
        allFiles[secondPosition].file = fileOne;
      } else {
        reason = `Cannot move at transformation ${i}`;
      }
    }

    //INSERT OPERATION
    else if (currentTransform.state === 'Insert') {
      // console.log('inside insert for: ', i);

      let type = currentTransform.type;
      // let allFiles = stale[type]!;
      let fileObj = currentTransform.fileObj!;
      if (stale[type] != undefined) {
        stale[type]!.push(fileObj);
        // console.log(stale[type]);
      } else {
        // console.log(fileObj);
        stale[type] = [fileObj];
        // console.log(stale[type]);
      }
    }

    //DELETE OPERATION
    else {
      // console.log('inside delete for: ', i);
      let type = currentTransform.type;
      let position = currentTransform.position!;
      if (stale[type]!.length > 0 && position < stale[type]!.length) {
        stale[type]!.splice(position, 1);
      } else {
        reason = `Cannot delete at transformation ${i}`;
      }
    }
  }
  if (JSON.stringify(stale) === JSON.stringify(latest)) {
    console.log('True');
    // console.log(stale, 'From final true');
  } else {
    console.log('False: ', reason);
    // console.log(stale);
    // console.log(stale, 'From final false');
  }
}

isValid(
  {
    video: [
      { file: '1.mp4', customType: 'video' },
      { file: '2.mp4', customType: 'video' },
      { file: '3.mp4', customType: 'video' },
    ],
  },
  {
    video: [
      { file: '2.mp4', customType: 'video' },
      { file: '1.mp4', customType: 'video' },
    ],
    image: [{ file: '1.png', customType: 'image' }],
  },
  [
    { state: 'Move', position: 0, secondPosition: 2, type: 'video' },
    {
      state: 'Insert',
      fileObj: { file: '1.png', customType: 'image' },
      type: 'image',
    },
    {
      state: 'Delete',
      position: 0,
      type: 'video',
    },
  ]
); // true

isValid(
  {},
  {
    video: [
      { file: '1.mov', customType: 'video' },
      { file: '2.mov', customType: 'video' },
    ],
    image: [
      { file: '1.png', customType: 'image' },
      { file: '2.png', customType: 'image' },
      { file: '3.png', customType: 'image' },
    ],
  },
  [
    {
      state: 'Insert',
      fileObj: { file: '1.png', customType: 'image' },
      type: 'image',
    },
    {
      state: 'Insert',
      fileObj: { file: '1.mp3', customType: 'audio' },
      type: 'audio',
    },
    {
      state: 'Insert',
      fileObj: { file: '1.mov', customType: 'video' },
      type: 'video',
    },
    {
      state: 'Delete',
      position: 0,
      type: 'video',
    },
    {
      state: 'Insert',
      fileObj: { file: '2.png', customType: 'image' },
      type: 'image',
    },
    {
      state: 'Insert',
      fileObj: { file: '3.png', customType: 'image' },
      type: 'image',
    },
    {
      state: 'Insert',
      fileObj: { file: '2.mov', customType: 'video' },
      type: 'video',
    },
    {
      state: 'Move',
      position: 2,
      secondPosition: 1,
      type: 'video',
    },
  ]
); // false
/***
 * Three reasons why
 * Audio not there
 * Video not deleted
 * Images not moved
 */

isValid(
  {
    video: [
      { file: '1.mp4', customType: 'video' },
      { file: '2.mp4', customType: 'video' },
      { file: '3.mp4', customType: 'video' },
    ],
    image: [{ file: '1.png', customType: 'image' }],
  },
  {
    video: [
      { file: '3.mp4', customType: 'video' },
      { file: '1.mp4', customType: 'video' },
    ],
    image: [
      { file: '1.png', customType: 'image' },
      { file: '2.png', customType: 'image' },
    ],
  },
  [
    { state: 'Move', position: 0, secondPosition: 2, type: 'video' },
    {
      state: 'Insert',
      fileObj: { file: '2.png', customType: 'image' },
      type: 'image',
    },
    {
      state: 'Delete',
      position: 1,
      type: 'video',
    },
    {
      state: 'Insert',
      fileObj: { file: '3.png', customType: 'image' },
      type: 'image',
    },
    {
      state: 'Delete',
      position: 1,
      type: 'image',
    },
  ]
); // false, wrong image deletion
