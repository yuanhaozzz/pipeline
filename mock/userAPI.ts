const users = [
  { id: 0, name: 'Umi', nickName: 'U', gender: 'MALE' },
  { id: 1, name: 'Fish', nickName: 'B', gender: 'FEMALE' },
];

export default {
  'GET /api/pipeline/config/list': (req: any, res: any) => {
    res.json({
      success: true,
      data: [
        {
          changeTime: '2023-05-06 15:30:20', timeConsuming: 4, newExecTime: '2023-05-06', username: '袁浩', triggerType: 1, triggerCount: 10,last_run_at: '2025/04/14 20:00',last_run_duration: 31239,total_run_count: 20, last_run_status: 'running', "id": 1, "name": "第一条流水线", "templateId": 1, "templateName": "base1", "template": [
            {
              id: 1,
              name: 'stage',
              type: 1,
              showAddButton: false,
              jobs: [
                {
                  id: 1,
                  name: 'job',
                  type: 2,
                  steps: [
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                  ]
                }
              ]
            },
            {
              id: 1,
              name: 'stage',
              type: 1,
              showAddButton: false,
              jobs: [
                {
                  id: 1,
                  name: 'job',
                  type: 2,
                  steps: [
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    }
                  ]
                },
                {
                  id: 1,
                  name: 'job',
                  type: 2,
                  steps: [
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                  ]
                },
              ],
              jobs: [
                {
                  id: 1,
                  name: 'job',
                  type: 2,
                  steps: [
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                  ]
                },
                {
                  id: 1,
                  name: 'job',
                  type: 2,
                  steps: [
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                  ]
                },
              ]
            },
          ], "create_time": "2023-04-21 14:25:01"
        },
        {
          changeTime: '2023-05-06 15:30:20', timeConsuming: 4, newExecTime: '2023-05-06', username: '袁浩', triggerType: 2, triggerCount: 10, status: 0, "id": 2, "name": "第二条流水线", "templateId": 2, "templateName": "error", "template": [
            {
              id: 1,
              name: 'stage',
              type: 1,
              showAddButton: false,
              jobs: [
                {
                  id: 1,
                  name: 'job',
                  type: 2,
                  steps: [
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                  ]
                }
              ]
            },
            {
              id: 1,
              name: 'stage',
              type: 1,
              showAddButton: false,
              jobs: [
                {
                  id: 1,
                  name: 'job',
                  type: 2,
                  steps: [
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    }
                  ]
                },
                {
                  id: 1,
                  name: 'job',
                  type: 2,
                  steps: [
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                  ]
                },
              ],
              jobs: [
                {
                  id: 1,
                  name: 'job',
                  type: 2,
                  steps: [
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                  ]
                },
                {
                  id: 1,
                  name: 'job',
                  type: 2,
                  steps: [
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                    {
                      id: 1,
                      name: 'step',
                      plugin: 'plugin',
                      type: 3,
                    },
                  ]
                },
              ]
            },
          ], "create_time": "2023-04-21 14:25:01"
        },
      ],
      errorCode: 0,
    });
  },
  'GET /api/pipeline/atom/list': (req: any, res: any) => {
    res.json({
      success: true,
      data: {
        atom_type: [],
        atom_info:[ 
          {
          logo_url: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.szaR46mm-M0qwWW-h7e4IAHaG1?w=162&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7',
          name: 'Gitlab',
          description: '拉代码插件',
          pipeline_cnt: 1,
          creator_display_name: '袁浩',
          created_at: '2025/04/15 10:00'
        },
          {
          logo_url: 'https://ts2.tc.mm.bing.net/th/id/OIP-C.AqhjHtM4bpXLFYW9bhDgcQAAAA?w=158&h=158&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
          name: 'Gerrit',
          description: '拉代码插件',
          pipeline_cnt: 1,
          creator_display_name: '袁浩',
          created_at: '2025/04/15 10:00'
        },
          {
          logo_url: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.6YAsOKfA_Rya25CDguTAPQHaHa?w=185&h=186&c=7&r=0&o=5&dpr=1.5&pid=1.7',
          name: '人工任务',
          description: '人工任务',
          pipeline_cnt: 1,
          creator_display_name: '袁浩',
          created_at: '2025/04/15 10:00'
        },
      ] 
      },
      errorCode: 0,
    });
  },
};
