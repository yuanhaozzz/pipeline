

// const test = [
//   {
//     fieldLevel: '',
//     formItemConfig: {
//       name: 'git_type',
//       label: '源代码方式',
//       required: true,
//       message: '请选择源代码方式',
//       validator: '',
//       colon: true,
//       hidden: false,
//       noStyle: false,
//       initialValue: 'ssh',
//       tooltip: '',
//     },
//     componentConfig: {
//       type: 'radio',
//       radioList: [
//         {
//           label: 'SSH',
//           value: 'ssh',
//           disabled: false
//         },
//         {
//           label: 'HTTP',
//           value: 'http',
//           // disabled: true
//         },
//       ]
//     },
//   },
//   {
//     fieldLevel: 'variables.repoId',
//     dependencyKey: 'git_type',
//     dependencyValue: 'ssh',
//     shouldUpdate: true,
//     parentFormItemConfig: {
//       noStyle: false,
//       style: {
//         width: '70%',
//         marginBottom: '0'
//       },
//     },
//     formItemConfig: {
//       name: 'repoId',
//       label: '代码仓库',
//       required: false,
//       message: '',
//       validator: 'triggerHook',
//       colon: true,
//       style: {
//         width: '70%',
//       },
//       hidden: false,
//       tooltip: '若选择Hook触发（基础配置-触发方式）则自动获取，无需填写，填写会覆盖',
//       dependencies: ['ref'],
//       initialValue: '2',
//     },
//     componentConfig: {
//       type: 'input',
//       placeholder: '请输入代码仓库'
//     },
//   },
// ]

export let formItemMap = {
  'Checkout GitLab': [
    // test,
    [
      {
        formItemConfig: {
          required: false,
          message: '',
          style: {
            width: '100%',
          },
          validator: '',
          name: 'credential',
          label: '访问凭据',
          initialValue: null,
        },
        componentConfig: {
          type: 'remoteSelect',
          placeholder: '请选择相应的凭证',
          api: {
            method: 'get',
            path: '/api/pipeline/credential/list',
            params: { size: 1000, page_num: 1 }
          }
        },
      },
      {
        formItemConfig: {
          required: false,
          name: '',
          label: ' ',
          style: {
            width: '10%',
          },
          initialValue: null,
        },
        componentConfig: {
          type: 'button',
          label: '新增',
          buttonType: 'link',
          event: {
            eventType: 'click',
            use: 'link',
            href: '/FlowLine/userCredentials?from=config',
            mode: 'new'
          }
        },
      },
    ],
    [
      {
        fieldLevel: 'variables.follow_hook',
        formItemConfig: {
          name: 'follow_hook',
          label: '仓库信息是否跟随环境变量',
          required: true,
          message: '',
          initialValue: '1',
        },
        componentConfig: {
          type: 'radio',
          radioList: [
            {
              label: '是',
              value: '1',
            },
            {
              label: '否',
              value: '2',
            },
          ]
        },
      },
    ],
    [
      {
        dependencyKey: 'follow_hook',
        dependencyValue: '2',
        shouldUpdate: true,
        parentFormItemConfig: {
          noStyle: true,
          style: {
            width: '70%',
            marginBottom: '0'
          },
        },
        formItemConfig: {
          name: 'git_type',
          label: '源代码方式',
          required: true,
          message: '请选择源代码方式',
          initialValue: 'http',
        },
        componentConfig: {
          type: 'radio',
          radioList: [
            {
              label: 'SSH',
              value: 'ssh',
              disabled: true
            },
            {
              label: 'HTTP',
              value: 'http',
              disabled: false
            },
          ]
        },
      },
      {
        dependencyKey: 'follow_hook',
        dependencyValue: '2',
        shouldUpdate: true,
        fieldLevel: 'variables.repoId',
        clearBranchField: 'variables.ref',
        repoType: 'gitlabee',
        parentFormItemConfig: {
          noStyle: true,
          style: {
            width: '70%',
            marginBottom: '0'
          },
        },
        formItemConfig: {
          name: 'repoId',
          label: '代码仓库',
          required: true,
          message: '请选择代码仓库',
          // validator: 'triggerHook',
          style: {
            width: '70%',
          },
          tooltip: '若选择 Hook 触发（基础配置-触发方式）则自动获取，无需填写，填写会覆盖',
          dependencies: ['ref'],
          initialValue: null,
        },
        componentConfig: {
          type: 'repo',
          placeholder: '请输入代码仓库'
        },
      },
    ],
    [
      {
        parentFormItemConfig: {
          noStyle: true,
          style: {
            width: '70%',
            marginBottom: '0'
          },
        },
        dependencyKey: 'follow_hook',
        dependencyValue: '2',
        shouldUpdate: true,
        fieldLevel: 'variables.ref_type',
        formItemConfig: {
          name: 'ref_type',
          label: '指定拉取方式',
          required: true,
          message: '请选择拉取方式',
          initialValue: 'branch',
        },
        componentConfig: {
          type: 'radio',
          radioList: [
            {
              label: '按分支',
              value: 'branch',
              disabled: false
            },
            {
              label: '按 TAG',
              value: 'tag',
              disabled: true
            },
            {
              label: '按 commitId',
              value: 'commit_id',
              disabled: true
            },
          ]
        },
      },
      {
        parentFormItemConfig: {
          noStyle: true,
          style: {
            width: '70%',
            marginBottom: '0'
          },
        },
        dependencyKey: 'follow_hook',
        dependencyValue: '2',
        shouldUpdate: true,
        fieldLevel: 'variables.ref',
        repoIdField: 'repoId',
        repoType: 'gitlabee',
        formItemConfig: {
          name: 'ref',
          label: '分支名称',
          required: true,
          message: '请选择',
          // validator: 'triggerHook',
          style: {
            width: '48%',
          },
          tooltip: '若选择 Hook 触发（基础配置-触发方式）则自动获取，无需填写，填写会覆盖',
          initialValue: 'master',
          dependencies: ['repoId'],
        },
        componentConfig: {
          type: 'branch',
          placeholder: '请输入分支名称'
        },
      },
    ],
    [
      {
        fieldLevel: 'variables.depth',
        formItemConfig: {
          name: 'depth',
          label: '克隆深度',
          required: false,
          message: '',
          validator: 'depth',
          initialValue: undefined,
        },
        componentConfig: {
          type: 'input',
          inputType: 'number',
          min: 1,
          placeholder: '默认拉取全部'
        },
      },
    ],
    [
      {
        fieldLevel: 'variables.repo_path',
        formItemConfig: {
          name: 'repo_path',
          label: '代码保存路径',
          tooltip: '指定一个相对于当前工作空间的目录路径放下拉的代码',
          initialValue: null,
        },
        componentConfig: {
          type: 'input',
          placeholder: '请填写工作空间相对目录，不填则默认为工作空间根目录'
        },
      },
    ]
  ],
  'Gerrit': [
    // test,
    [
      {
        formItemConfig: {
          required: false,
          message: '',
          style: {
            width: '100%',
          },
          validator: '',
          name: 'credential',
          label: '访问凭据',
          initialValue: null,
        },
        componentConfig: {
          type: 'remoteSelect',
          placeholder: '请选择相应的凭证',
          api: {
            method: 'get',
            path: '/api/pipeline/credential/list',
            params: { size: 1000, page_num: 1 }
          }
        },
      },
      {
        formItemConfig: {
          required: false,
          name: '',
          label: ' ',
          style: {
            width: '10%',
          },
          initialValue: null,
        },
        componentConfig: {
          type: 'button',
          label: '新增',
          buttonType: 'link',
          event: {
            eventType: 'click',
            use: 'link',
            href: '/FlowLine/userCredentials?from=config',
            mode: 'new'
          }
        },
      },
    ],
    [
      {
        fieldLevel: 'variables.follow_hook',
        formItemConfig: {
          name: 'follow_hook',
          label: '仓库信息是否跟随环境变量',
          required: true,
          message: '',
          initialValue: '1',
        },
        componentConfig: {
          type: 'radio',
          radioList: [
            {
              label: '是',
              value: '1',
            },
            {
              label: '否',
              value: '2',
            },
          ]
        },
      },
    ],
    [
      {
        dependencyKey: 'follow_hook',
        dependencyValue: '2',
        shouldUpdate: true,
        parentFormItemConfig: {
          noStyle: true,
          style: {
            width: '70%',
            marginBottom: '0'
          },
        },
        formItemConfig: {
          name: 'git_type',
          label: '源代码方式',
          required: true,
          message: '请选择源代码方式',
          initialValue: 'http',
        },
        componentConfig: {
          type: 'radio',
          radioList: [
            {
              label: 'SSH',
              value: 'ssh',
              disabled: true
            },
            {
              label: 'HTTP',
              value: 'http',
              disabled: false
            },
          ]
        },
      },
      {
        dependencyKey: 'follow_hook',
        dependencyValue: '2',
        shouldUpdate: true,
        fieldLevel: 'variables.repoId',
        parentFormItemConfig: {
          noStyle: true,
          style: {
            width: '70%',
            marginBottom: '0'
          },
        },
        formItemConfig: {
          name: 'repoId',
          label: '代码仓库',
          required: true,
          message: '',
          validator: 'triggerHook',
          style: {
            width: '70%',
          },
          tooltip: '若选择 Hook 触发（基础配置-触发方式）则自动获取，无需填写，填写会覆盖',
          dependencies: ['ref'],
          initialValue: null,
        },
        componentConfig: {
          type: 'input',
          placeholder: '请输入代码仓库'
        },
      },
    ],
    [
      {
        parentFormItemConfig: {
          noStyle: true,
          style: {
            width: '70%',
            marginBottom: '0'
          },
        },
        dependencyKey: 'follow_hook',
        dependencyValue: '2',
        shouldUpdate: true,
        fieldLevel: 'variables.ref_type',
        formItemConfig: {
          name: 'ref_type',
          label: '指定拉取方式',
          required: true,
          message: '请选择拉取方式',
          initialValue: 'branch',
        },
        componentConfig: {
          type: 'radio',
          radioList: [
            {
              label: '按分支',
              value: 'branch',
              disabled: false
            },
            {
              label: '按 TAG',
              value: 'tag',
              disabled: true
            },
            {
              label: '按 commitId',
              value: 'commit_id',
              disabled: true
            },
          ]
        },
      },
      {
        parentFormItemConfig: {
          noStyle: true,
          style: {
            width: '70%',
            marginBottom: '0'
          },
        },
        dependencyKey: 'follow_hook',
        dependencyValue: '2',
        shouldUpdate: true,
        fieldLevel: 'variables.ref',
        formItemConfig: {
          name: 'ref',
          label: '分支名称',
          required: true,
          message: '',
          validator: 'triggerHook',
          style: {
            width: '48%',
          },
          tooltip: '若选择 Hook 触发（基础配置-触发方式）则自动获取，无需填写，填写会覆盖',
          initialValue: 'master',
          dependencies: ['repoId'],
        },
        componentConfig: {
          type: 'input',
          placeholder: '请输入分支名称'
        },
      },
    ],
    [
      {
        fieldLevel: 'variables.depth',
        formItemConfig: {
          name: 'depth',
          label: '克隆深度',
          required: false,
          message: '',
          validator: 'depth',
          initialValue: undefined,
        },
        componentConfig: {
          type: 'input',
          inputType: 'number',
          min: 1,
          placeholder: '默认拉取全部'
        },
      },
    ],
    [
      {
        fieldLevel: 'variables.repo_path',
        formItemConfig: {
          name: 'repo_path',
          label: '代码保存路径',
          tooltip: '指定一个相对于当前工作空间的目录路径放下拉的代码',
          initialValue: null,
        },
        componentConfig: {
          type: 'input',
          placeholder: '请填写工作空间相对目录，不填则默认为工作空间根目录'
        },
      },
    ]
  ],
  'Shell Script': [
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
          initialValue: '#!/usr/bin/env bash\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',

        },
        componentConfig: {
          type: 'codeMirror',
        },
      },
    ]
  ],
  'GCC_5 Build': [
    [
      {
        fieldLevel: 'variables.sccache_enabled',
        formItemConfig: {
          valuePropName: 'checked',
          name: 'sccache_enabled',
          style: {
            width: '100%',
          },
          initialValue: false,
        },
        componentConfig: {
          type: 'checkbox',
          checkboxText: '开启加速'
        },
      },
    ],
    [
      {
        isDropDown: true,
        isArrowExpand: true,
        formItemConfig: {
          name: 'script',
          label: 'shell',
          message: '请输入',
          style: {
            width: '100%',
          },
          initialValue: '#!/usr/bin/env bash\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',
        },
        componentConfig: {
          type: 'codeMirror',
          readOnly: true
        },
      },
    ]
  ],
  'Clang9 Build': [
    [
      {
        fieldLevel: 'variables.sccache_enabled',
        formItemConfig: {
          valuePropName: 'checked',
          name: 'sccache_enabled',
          style: {
            width: '100%',
          },
          initialValue: false,
        },
        componentConfig: {
          type: 'checkbox',
          checkboxText: '开启加速'
        },
      },
    ],
    [
      {
        isDropDown: true,
        isArrowExpand: true,
        formItemConfig: {
          name: 'script',
          label: 'shell',
          // required: true,
          message: '请输入',
          style: {
            width: '100%',
          },
          initialValue: '#!/usr/bin/env bash\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',
        },
        componentConfig: {
          type: 'codeMirror',
          readOnly: true
        },
      },
    ]
  ],
  'Daily_GCC_7 Build': [
    [
      {
        fieldLevel: 'variables.sccache_enabled',
        formItemConfig: {
          valuePropName: 'checked',
          name: 'sccache_enabled',
          style: {
            width: '100%',
          },
          initialValue: false,
        },
        componentConfig: {
          type: 'checkbox',
          checkboxText: '开启加速'
        },
      },
    ],
    [
      {
        isDropDown: true,
        isArrowExpand: true,
        formItemConfig: {
          name: 'script',
          label: 'shell',
          // required: true,
          message: '请输入',
          style: {
            width: '100%',
          },
          initialValue: '#!/usr/bin/env bash\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',
        },
        componentConfig: {
          type: 'codeMirror',
          readOnly: true
        },
      },
    ]
  ],
  'Aarch64 Cross Build': [
    [
      {
        fieldLevel: 'variables.sccache_enabled',
        formItemConfig: {
          valuePropName: 'checked',
          name: 'sccache_enabled',
          style: {
            width: '100%',
          },
          initialValue: false,
        },
        componentConfig: {
          type: 'checkbox',
          checkboxText: '开启加速'
        },
      },
    ],
    [
      {
        isDropDown: true,
        isArrowExpand: true,
        formItemConfig: {
          name: 'script',
          label: 'shell',
          // required: true,
          message: '请输入',
          style: {
            width: '100%',
          },
          initialValue: '#!/usr/bin/env bash\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',
        },
        componentConfig: {
          type: 'codeMirror',
          readOnly: true
        },
      },
    ]
  ],
  'Daily GCC_5 Official': [
    [
      {
        fieldLevel: 'variables.sccache_enabled',
        formItemConfig: {
          valuePropName: 'checked',
          name: 'sccache_enabled',
          style: {
            width: '100%',
          },
          initialValue: false,
        },
        componentConfig: {
          type: 'checkbox',
          checkboxText: '开启加速'
        },
      },
    ],
    [
      {
        isDropDown: true,
        isArrowExpand: true,
        formItemConfig: {
          name: 'script',
          label: 'shell',
          // required: true,
          message: '请输入',
          style: {
            width: '100%',
          },
          initialValue: '#!/usr/bin/env bash\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',
        },
        componentConfig: {
          type: 'codeMirror',
          readOnly: true
        },
      },
    ]
  ],
  '上传包到 xnas': [
    [
      {
        fieldLevel: 'variables.file_path',
        formItemConfig: {
          name: 'file_path',
          label: '源路径',
          // tooltip: '上传前的文件路径',
          // required: true,
          style: {
            width: '48%',
          },
          initialValue: '$LOCAL_PACKAGE_PATH',
        },
        componentConfig: {
          type: 'input',
          disabled: true
        },
      },
      {
        fieldLevel: 'variables.upload_path',
        formItemConfig: {
          name: 'upload_path',
          label: '目标路径',
          // tooltip: '上传后的文件路径',
          // required: true,
          style: {
            width: '48%',
          },
          initialValue: 'checkin/dolphin',
        },
        componentConfig: {
          type: 'input',
          disabled: true
        },
      },
    ],
  ],
  // 'GCC_5 Build': [
  //   [
  //     {
  //       formItemConfig: {
  //         valuePropName: 'checked',
  //         name: 'accelerate',
  //         style: {
  //           width: '100%',
  //         },
  //         initialValue: false,
  //       },
  //       componentConfig: {
  //         type: 'checkbox',
  //         checkboxText: '开启加速'
  //       },
  //     },
  //   ]
  //   // ],
  //   // [
  //   //   {
  //   //     fieldLevel: 'variables.depth',
  //   //     formItemConfig: {
  //   //       name: 'depth',
  //   //       label: '克隆深度',
  //   //       required: true,
  //   //       message: '',
  //   //       validator: 'depth',
  //   //       initialValue: 20,
  //   //     },
  //   //     componentConfig: {
  //   //       type: 'input',
  //   //       inputType: 'number',
  //   //       min: 1,
  //   //     },
  //   //   },
  //   // ]
  // ]
}