export const list = [
  [
    {
      name: 'git_type',
      label: '源代码方式',
      required: true,
      message: '请选择源代码方式',
      validator: '',
      colon: true,
      width: null,
      hidden: false,
      noStyle: false,
      initialValue: 'ssh',
      tooltip: '',
      component: {
        type: 'radio',
        radioList: [
          {
            label: 'SSH',
            value: 'ssh',
            disabled: false
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
      shouldUpdate: true,

      name: 'git_url',
      label: '代码仓库',
      required: false,
      message: '',
      validator: 'triggerHook',
      colon: true,
      width: '70%',
      hidden: false,
      noStyle: false,
      tooltip: '若选择 Hook 触发（基础配置-触发方式）则自动获取，无需填写，填写会覆盖',
      dependencies: ['ref'],
      initialValue: null,
      component: {
        type: 'input',
        placeholder: '请输入代码仓库'
      },
    },
  ]
]

// export const list = [
//   [
//     {
//       name: 'git_type',
//       label: '源代码方式',
//       required: true,
//       message: '请选择源代码方式',
//       validator: '',
//       colon: true,
//       width: null,
//       hidden: false,
//       noStyle: false,
//       initialValue: 'ssh',
//       tooltip: '',
//       component: {
//         type: 'radio',
//         radioList: [
//           {
//             label: 'SSH',
//             value: 'ssh',
//             disabled: false
//           },
//           {
//             label: 'HTTP',
//             value: 'http',
//             disabled: false
//           },
//         ]
//       },
//     },
//     {
//       name: 'git_url',
//       label: '代码仓库',
//       required: false,
//       message: '',
//       validator: 'triggerHook',
//       colon: true,
//       width: '70%',
//       hidden: false,
//       noStyle: false,
//       tooltip: '若选择hook触发（基础配置-触发方式）则自动获取，无需填写，填写会覆盖',
//       dependencies: ['ref'],
//       initialValue: null,
//       component: {
//         type: 'input',
//         placeholder: '请输入代码仓库'
//       },
//     },
//   ],
//   [
//     {
//       name: 'ref_type',
//       label: '指定拉取方式',
//       required: true,
//       message: '请选择拉取方式',
//       validator: '',
//       colon: true,
//       width: null,
//       hidden: false,
//       noStyle: false,
//       initialValue: 'branch',
//       tooltip: '',
//       component: {
//         type: 'radio',
//         radioList: [
//           {
//             label: '按分支',
//             value: 'branch',
//             disabled: false
//           },
//           {
//             label: '按TAG',
//             value: 'tag',
//             disabled: true
//           },
//           {
//             label: '按commitId',
//             value: 'commit_id',
//             disabled: true
//           },
//         ]
//       },
//     },
//     {
//       name: 'ref',
//       label: '分支名称',
//       required: false,
//       message: '',
//       validator: 'triggerHook',
//       colon: true,
//       width: '48%',
//       hidden: false,
//       noStyle: false,
//       tooltip: '若选择hook触发（基础配置-触发方式）则自动获取，无需填写，填写会覆盖',
//       initialValue: 'master',
//       dependencies: ['git_url'],
//       component: {
//         type: 'input',
//         placeholder: '请输入分支名称'
//       },
//     },
//   ],
//   [
//     {
//       name: 'depth',
//       label: '克隆深度',
//       required: true,
//       message: '',
//       validator: 'depth',
//       colon: true,
//       width: '',
//       hidden: false,
//       noStyle: false,
//       tooltip: '指定一个相对于当前工作空间的目录路径放下拉的代码',
//       initialValue: null,
//       component: {
//         type: 'input',
//         placeholder: '请填写工作空间相对目录，不填则默认为工作空间根目录',
//         inputType: 'number',
//         min: 1,
//         max: null
//       },
//     },
//   ],
//   [
//     {
//       name: 'repo_path',
//       label: '代码保存路径',
//       required: false,
//       message: '',
//       validator: '',
//       colon: true,
//       width: '',
//       hidden: false,
//       noStyle: false,
//       tooltip: '指定一个相对于当前工作空间的目录路径放下拉的代码',
//       initialValue: null,
//       component: {
//         type: 'input',
//         placeholder: '请填写工作空间相对目录，不填则默认为工作空间根目录'
//       },
//     },
//   ],
//   [
//     {
//       name: 'credential',
//       label: '访问凭据',
//       required: false,
//       message: '',
//       validator: '',
//       colon: true,
//       width: '100%',
//       hidden: false,
//       noStyle: false,
//       tooltip: '',
//       initialValue: null,
//       component: {
//         type: 'remoteSelect',
//         placeholder: '请选择相应的凭证',
//         api: {
//           method: 'get',
//           path: '/api/pipeline/credential/list',
//           params: { size: 1000, page_num: 1 }
//         }
//       },
//     },
//   ]
// ]