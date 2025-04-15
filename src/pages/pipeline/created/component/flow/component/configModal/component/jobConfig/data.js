export const customConfig = [
  // [
  //   {
  //     formItemConfig: {
  //       name: 'name',
  //       label: 'Job名称',
  //       required: true,
  //       message: '请输入名称',
  //       initialValue: null,
  //     },
  //     componentConfig: {
  //       type: 'input',
  //       maxLength: 50,
  //       placeholder: '长度为50个字符'
  //     },
  //   },
  // ],
  // [
  //   {
  //     formItemConfig: {
  //       name: 'cloned',
  //       label: '',
  //       required: false,
  //       message: '',
  //       initialValue: false,
  //       valuePropName: 'checked'
  //     },
  //     componentConfig: {
  //       type: 'checkbox',
  //       checkboxText: '动态创建'
  //     },
  //   },
  // ],
  // [
  //   {
  //     dependencyKey: 'cloned',
  //     dependencyValue: true,
  //     shouldUpdate: true,
  //     parentFormItemConfig: {
  //       noStyle: true,
  //       // style: {
  //       //   width: '100%',
  //       //   marginBottom: '0'
  //       // },
  //     },
  //     formItemConfig: {
  //       name: 'auto_calculate_cloned_count',
  //       label: '创建类型',
  //       required: false,
  //       message: '',
  //       initialValue: true,
  //     },
  //     componentConfig: {
  //       type: 'radio',
  //       radioList: [
  //         {
  //           value: true,
  //           label: '自动计算'
  //         },
  //         {
  //           value: false,
  //           label: '自定义'
  //         },
  //       ]
  //     },
  //   },
  //   {
  //     dependencyKey: 'auto_calculate_cloned_count',
  //     dependencyValue: false,
  //     shouldUpdate: true,
  //     parentFormItemConfig: {
  //       noStyle: true,
  //       style: {
  //         width: '100%',
  //       },
  //     },
  //     formItemConfig: {
  //       name: 'cloned_count',
  //       label: ' ',
  //       required: false,
  //       message: '请输入',
  //       initialValue: '10',
  //       style: {
  //         width: '60%'
  //       }
  //     },
  //     componentConfig: {
  //       type: 'input',
  //       inputType: 'number',
  //       min: 4,
  //       max: 10,
  //     },
  //   },
  // ],
  // [
  //   {
  //     formItemConfig: {
  //       name: 'agent_type',
  //       label: '构建资源类型',
  //       required: true,
  //       message: '请选择构建资源类型',
  //       initialValue: 'container',
  //     },
  //     componentConfig: {
  //       type: 'select',
  //       disabled: true,
  //       options: [
  //         {
  //           value: 'container',
  //           label: '容器',
  //         },
  //       ]
  //     },
  //   },
  // ],
  // [
  //   {
  //     formItemConfig: {
  //       name: 'trigger_type',
  //       label: '触发方式',
  //       initialValue: 'AUTO'
  //     },
  //     componentConfig: {
  //       type: 'radio',
  //       radioList: [
  //         {
  //           label: '自动',
  //           value: 'AUTO',
  //         },
  //         {
  //           label: '手动',
  //           value: 'MANUAL',
  //         },
  //       ]
  //     },
  //   },
  // ],
  // [
  //   {
  //     formItemConfig: {
  //       name: 'image',
  //       label: '镜像',
  //       required: true,
  //       message: '请选择镜像',
  //       initialValue: 'mobile'
  //     },
  //     componentConfig: {
  //       type: 'radio',
  //       radioList: [
  //         {
  //           label: '从列表选择',
  //           value: 'list',
  //           disabled: true
  //         },
  //         {
  //           label: '手动输入',
  //           value: 'mobile',
  //         },
  //       ]
  //     },
  //   },
  // ],
  // [
  //   {
  //     formItemConfig: {
  //       name: 'image_info',
  //       label: '路径',
  //       required: true,
  //       message: '请输入镜像路径',
  //       initialValue: 'artifact.enflame.cn/enflame_docker_images/ubuntu/qic_ubuntu_1804_gcc7:latest'
  //     },
  //     componentConfig: {
  //       type: 'input',
  //       placeholder: '请输入完整镜像路径，如 docker.io/bkci/ci'
  //     },
  //   },
  // ],
  // [
  //   {
  //     dependencyKey: 'has_variable_in_tag',
  //     dependencyValue: false,
  //     shouldUpdate: true,
  //     flexibleParams: 'agent_type',
  //     parentFormItemConfig: {
  //       noStyle: true,
  //       style: {
  //         width: '70%',
  //         marginBottom: '0'
  //       },
  //     },
  //     formItemConfig: {
  //       required: false,
  //       message: '',
  //       style: {
  //         width: '100%',
  //       },
  //       validator: '',
  //       name: 'tag',
  //       label: 'Tag',
  //       initialValue: null,
  //     },
  //     componentConfig: {
  //       type: 'remoteSelect',
  //       placeholder: '请选择',
  //       api: {
  //         method: 'get',
  //         path: '/api/pipeline/runner/tags',
  //         params: { size: 1000, page_num: 1 }
  //       }
  //     },
  //   },
  //   {
  //     dependencyKey: 'has_variable_in_tag',
  //     dependencyValue: true,
  //     shouldUpdate: true,
  //     parentFormItemConfig: {
  //       noStyle: true,
  //       style: {
  //         width: '70%',
  //         marginBottom: '0'
  //       },
  //     },
  //     formItemConfig: {
  //       required: false,
  //       message: '',
  //       style: {
  //         width: '100%',
  //       },
  //       validator: '',
  //       name: 'tag',
  //       label: 'Tag',
  //       initialValue: null,
  //     },
  //     componentConfig: {
  //       type: 'input',
  //       placeholder: '自定义',
  //       style: {
  //         height: '32px'
  //       }
  //     },
  //   },
  //   {
  //     formItemConfig: {
  //       required: false,
  //       name: 'has_variable_in_tag',
  //       label: ' ',
  //       valuePropName: 'checked',
  //       style: {
  //         width: '90px',
  //         marginLeft: '10px'
  //       },
  //       initialValue: false,
  //     },
  //     componentConfig: {
  //       type: 'checkbox',
  //       checkboxText: '自定义',
  //       onChange: (config, form) => {
  //         config.tag = undefined
  //         form.setFieldValue('tag', undefined)
  //       }
  //     },
  //   },
  // ],
  // [
  //   {
  //     fieldLevel: 'variables.depth',
  //     formItemConfig: {
  //       name: 'depth',
  //       label: '克隆深度',
  //       required: true,
  //       message: '',
  //       validator: 'depth',
  //       initialValue: 20,
  //     },
  //     componentConfig: {
  //       type: 'input',
  //       inputType: 'number',
  //       min: 1,
  //     },
  //   },
  // ],
  [
    {
      fieldLevel: 'variables.KUBERNETES_CPU_REQUEST',
      formItemConfig: {
        name: 'KUBERNETES_CPU_REQUEST',
        label: 'CPU 需求（核）',
        required: true,
        message: '',
        initialValue: 32,
        style: {
          width: '48%'
        },
        validator: 'limitNumber',
      },
      componentConfig: {
        type: 'input',
        placeholder: '请输入',
        inputType: 'number',
        min: 1,
        max: 2048
      },
    },
    {
      fieldLevel: 'variables.KUBERNETES_CPU_LIMIT',
      formItemConfig: {
        name: 'KUBERNETES_CPU_LIMIT',
        label: 'CPU 限制（核）',
        required: false,
        message: '',
        initialValue: 2048,
        style: {
          width: '48%'
        },
        validator: 'limitNumber',
      },
      componentConfig: {
        type: 'input',
        placeholder: '请输入',
        inputType: 'number',
        min: 1,
        max: 2048
      },
    },
  ],
  [
    {
      fieldLevel: 'variables.KUBERNETES_MEMORY_REQUEST',
      formItemConfig: {
        name: 'KUBERNETES_MEMORY_REQUEST',
        label: '内存需求（Gi）',
        required: true,
        message: '',
        initialValue: 32,
        style: {
          width: '48%'
        },
        validator: 'limitNumber',
      },
      componentConfig: {
        type: 'input',
        placeholder: '请输入',
        inputType: 'number',
        min: 1,
        max: 1048576
      },
    },
    {
      fieldLevel: 'variables.KUBERNETES_MEMORY_LIMIT',
      formItemConfig: {
        name: 'KUBERNETES_MEMORY_LIMIT',
        label: '内存限制（Gi）',
        required: false,
        message: '',
        initialValue: 128,
        style: {
          width: '48%'
        },
        validator: 'limitNumber',
      },
      componentConfig: {
        type: 'input',
        placeholder: '请输入',
        inputType: 'number',
        min: 1,
        max: 1048576
      },
    },
  ],
]

export const priority_class_name = [
  { label: 'middle-priority', value: 'middle-priority' },
  { label: 'daily-high-priority', value: 'daily-high-priority' },
  { label: 'daily-middle-priority', value: 'daily-middle-priority' },
  { label: 'daily-low-priority', value: 'daily-low-priority' },
  { label: 'ci-high-priority', value: 'ci-high-priority' },
]