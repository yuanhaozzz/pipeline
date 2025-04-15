import { defineConfig } from '@umijs/max';

export default defineConfig({
  title: '浩哥的流水线',
  antd: {},
  access: {},
  model: {},
  styles: ['//at.alicdn.com/t/c/font_4025906_pcu5afsldjc.css', '//at.alicdn.com/t/c/font_569659_khadwt9omj.css', '//at.alicdn.com/t/c/font_4376956_qikusykzz8i.css'],
  initialState: {},
  request: {},
  dva: {},
  locale: {
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  layout: {
    title: '浩哥的流水线',
  },
  routes: [
    {
      name: ' 流水线',
      path: '/pipeline',
      routes: [
        {
          name: ' 流水线',
          path: '/pipeline/created',
          component: '@/pages/pipeline/created',
        },
        {
          name: ' 插件市场',
          path: '/pipeline/plugin-market',
          component: '@/pages/pipeline/plugin-market',
        },
        {
          name: ' 流水线编辑',
          path: '/pipeline/created/modify',
          component: '@/pages/pipeline/created/component/modify',
          menu: false
        },
        {
          name: ' 流水线预览',
          path: '/pipeline/created/preview',
          component: '@/pages/pipeline/created/component/preview',
          menu: false
        },
        {
          name: ' 流水线详情',
          path: '/pipeline/created/detail',
          component: '@/pages/pipeline/created/component/detail',
          menu: false
        },
      ]
    },
  ],
  npmClient: 'npm',
});

