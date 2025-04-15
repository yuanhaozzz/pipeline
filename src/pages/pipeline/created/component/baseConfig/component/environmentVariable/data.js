
export const typeOptions = [
  {
    label: '字符串',
    value: 'string'
  },
  {
    label: '布尔值',
    value: 'bool'
  },
  {
    label: '单选框',
    value: 'choose'
  },
  {
    label: '多选框',
    value: 'multiple'
  },
  {
    label: '时间点',
    value: 'date'
  },
  // {
  //   label: '仓库',
  //   value: 'repo'
  // },
  // {
  //   label: 'Gerrit分支',
  //   value: 'gerrit_ref'
  // },
  // {
  //   label: 'Gitlab-EE分支',
  //   value: 'gitlabee_ref'
  // },
  // {
  //   label: 'Gitlab-CE分支',
  //   value: 'gitlab_ref'
  // },
  // {
  //   label: '代码库',
  //   value: 'git_url'
  // },
  // {
  //   label: 'Commit Id',
  //   value: 'sha'
  // },
]

export const keywords = [
  'CI_TRIGGER_REF', 'ref',
  'CI_TRIGGER_SHA', 'sha',
  'CI_TRIGGER_REPO_URL', 'git_url',
  'CI_TRIGGER_PATCHSET', 'patchset',
  'CI_TRIGGER_TAG', 'tag',
  'SOURCE_BRANCH', 'source_branch',
  'SOURCE_COMMIT_ID', 'source_commit_id',
  'TARGET_BRANCH', 'target_branch',
  'TARGET_COMMIT_ID', 'target_commit_id',
]