/**
 * 苏瑞膜内容管理后台路由。
 * 内容管理域对应后端 /api/v1/admin/{domain}，页面为 CmsTablePage 薄壳。
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
    ],
  },
  {
    path: '/cms',
    name: '内容管理',
    icon: 'table',
    routes: [
      {
        path: '/cms',
        redirect: '/cms/articles',
      },
      {
        path: '/cms/articles',
        name: '新闻资讯',
        icon: 'read',
        component: './cms/articles',
      },
      {
        path: '/cms/products',
        name: '产品中心',
        icon: 'appstore',
        component: './cms/products',
      },
      {
        path: '/cms/product-categories',
        name: '产品分类',
        icon: 'partition',
        component: './cms/product-categories',
      },
      {
        path: '/cms/fc-series',
        name: '滤芯系列',
        icon: 'filter',
        component: './cms/fc-series',
      },
      {
        path: '/cms/fc-products',
        name: '滤芯型号',
        icon: 'database',
        component: './cms/fc-products',
      },
      {
        path: '/cms/cross-reference',
        name: '型号对照',
        icon: 'swap',
        component: './cms/cross-reference',
      },
      {
        path: '/cms/rfq',
        name: '询价管理',
        icon: 'form',
        component: './cms/rfq',
      },
      {
        path: '/cms/projects',
        name: '工程实例',
        icon: 'project',
        component: './cms/projects',
      },
      {
        path: '/cms/downloads',
        name: '下载中心 · 产品手册',
        icon: 'fileText',
        component: './cms/downloads',
      },
      {
        path: '/cms/pages',
        name: '单页管理',
        icon: 'file',
        component: './cms/pages',
      },
      {
        path: '/cms/home',
        name: '首页区块',
        icon: 'home',
        routes: [
          {
            path: '/cms/home',
            redirect: '/cms/home/slides',
          },
          {
            path: '/cms/home/slides',
            name: '轮播图',
            component: './cms/home-slides',
          },
          {
            path: '/cms/home/about-cards',
            name: '关于卡片',
            component: './cms/home-about-cards',
          },
          {
            path: '/cms/home/video',
            name: '视频区块',
            component: './cms/home-video',
          },
          {
            path: '/cms/home/sections',
            name: '区块开关',
            component: './cms/home-sections',
          },
          {
            path: '/cms/home/tiles',
            name: '产品瓷砖',
            component: './cms/home-tiles',
          },
        ],
      },
      {
        path: '/cms/media',
        name: '媒体库',
        icon: 'picture',
        component: './cms/media',
      },
    ],
  },
  {
    path: '/',
    redirect: '/cms/articles',
  },
  {
    component: './exception/404',
    path: '/*',
  },
];
