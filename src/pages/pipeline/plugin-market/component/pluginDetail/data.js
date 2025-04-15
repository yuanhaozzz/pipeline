export const shellTemplate = `#!/usr/bin/env bash\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`
export const formTemplate = `[
  [
    {
      isDropDown: true,
      isArrowExpand: true,
      formItemConfig: {
        name: 'script',
        label: 'shell',
        required: true,
        message: '请输入',
        style: {
          width: '100%',
        },
        initialValue: '',
      },
      componentConfig: {
        type: 'codeMirror',
        readOnly: true
      },
    },
  ]
]`