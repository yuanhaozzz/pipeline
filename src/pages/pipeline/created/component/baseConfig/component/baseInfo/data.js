
export const formItem = [
  [
    {
      name: 'credential',
      label: '访问凭据',
      required: false,
      message: '',
      validator: '',
      colon: true,
      width: '100%',
      hidden: false,
      noStyle: false,
      tooltip: '',
      initialValue: null,
      component: {
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
      name: '',
      label: ' ',
      required: false,
      message: '',
      validator: '',
      colon: true,
      width: '10%',
      hidden: false,
      noStyle: false,
      tooltip: '',
      initialValue: null,
      component: {
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
  ]
]
