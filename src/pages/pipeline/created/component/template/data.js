
export const templateList = [
  {
    id: 1,
    icon: 'icon-placeholder_1',
    name: 'base1',
    setting: {
      trigger_type: 'HOOK',
      git_info: {},
      enabled: true,
      run_lock_type: true,
      notification: {
        success: {},
        failed: {},
        canceled: {}
      }
    },
    template: [
      {
        id: '1',
        name: 'stage',
        type: 1,
        active: true,
        jobs: [
          {
            id: '1-1',
            name: 'job',
            type: 2,
            active: true,
            allow_failure: false,
            tasks: [
              {
                id: '1-1-1',
                name: 'task',
                atom_id: '',
                type: 3,
                vaildFormError: true,
                active: true,
                allow_failure: false,
                run_condition: 'pre_task_success'

              },
              {
                id: '1-1-2',
                name: 'task',
                atom_id: '',
                type: 3,
                vaildFormError: true,
                active: true,
                allow_failure: false,
                run_condition: 'pre_task_success'
              },
            ]
          }
        ]
      }
    ]
  },
]
