/**
 * 各管理域的字段配置（与后端 AdminContentService.FIELDS 白名单一一对应）。
 * key 使用库列 snake_case，后端 snake() 转换恒等，白名单可命中。
 */
import { CmsPageConfig, FieldDef } from './CmsTablePage';

export const LOCALE_OPTIONS = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
];

export const STATUS_OPTIONS = [
  { label: '已发布', value: 'PUBLISHED' },
  { label: '草稿', value: 'DRAFT' },
  { label: '下线', value: 'OFFLINE' },
];

const localeField = (): FieldDef => ({
  key: 'locale',
  label: '语言',
  type: 'select',
  options: LOCALE_OPTIONS,
  required: true,
  defaultValue: 'zh-CN',
  width: 90,
});

const statusField = (): FieldDef => ({
  key: 'status',
  label: '状态',
  type: 'select',
  options: STATUS_OPTIONS,
  defaultValue: 'PUBLISHED',
  width: 90,
});

const sortOrderField = (): FieldDef => ({
  key: 'sort_order',
  label: '排序值',
  type: 'number',
  width: 90,
});

const seoFields = (): FieldDef[] => [
  { key: 'seo_title', label: 'SEO 标题', type: 'text', hideInTable: true },
  { key: 'seo_keywords', label: 'SEO 关键词', type: 'text', hideInTable: true },
  {
    key: 'seo_description',
    label: 'SEO 描述',
    type: 'textarea',
    hideInTable: true,
  },
];

export const articlesConfig: CmsPageConfig = {
  domain: 'articles',
  title: '新闻资讯',
  fields: [
    localeField(),
    { key: 'title', label: '标题', type: 'text', required: true },
    { key: 'author', label: '作者', type: 'text' },
    { key: 'source', label: '来源', type: 'text' },
    { key: 'published_at', label: '发布时间', type: 'date', width: 160 },
    { key: 'cover_url', label: '封面图', type: 'image', width: 110 },
    { key: 'summary', label: '摘要', type: 'textarea' },
    { key: 'is_top', label: '置顶', type: 'switch', width: 80 },
    sortOrderField(),
    statusField(),
    {
      key: 'content_html',
      label: '正文（富文本）',
      type: 'richtext',
      hideInTable: true,
    },
    ...seoFields(),
  ],
};

export const productsConfig: CmsPageConfig = {
  domain: 'products',
  title: '产品中心',
  fields: [
    localeField(),
    {
      key: 'category_id',
      label: '产品分类',
      type: 'select',
      optionsDomain: 'product-categories',
      optionsLabelKey: 'name',
      width: 120,
    },
    { key: 'title', label: '产品名称', type: 'text', required: true },
    { key: 'subtitle', label: '副标题', type: 'text' },
    { key: 'summary', label: '摘要', type: 'textarea' },
    { key: 'cover_url', label: '封面图', type: 'image', width: 110 },
    {
      key: 'content_html',
      label: '详情（富文本）',
      type: 'richtext',
      hideInTable: true,
    },
    sortOrderField(),
    statusField(),
    ...seoFields(),
  ],
};

export const productCategoriesConfig: CmsPageConfig = {
  domain: 'product-categories',
  title: '产品分类',
  fields: [
    localeField(),
    {
      key: 'parent_id',
      label: '上级分类',
      type: 'select',
      optionsDomain: 'product-categories',
      optionsLabelKey: 'name',
    },
    { key: 'name', label: '分类名称', type: 'text', required: true },
    { key: 'slug', label: '别名（URL 段）', type: 'text' },
    sortOrderField(),
    { key: 'visible', label: '是否可见', type: 'switch', defaultValue: true },
  ],
};

export const projectsConfig: CmsPageConfig = {
  domain: 'projects',
  title: '工程实例',
  fields: [
    localeField(),
    { key: 'title', label: '标题', type: 'text', required: true },
    { key: 'subtitle', label: '副标题', type: 'text' },
    { key: 'cover_url', label: '封面图', type: 'image', width: 110 },
    {
      key: 'content_html',
      label: '详情（富文本）',
      type: 'richtext',
      hideInTable: true,
    },
    sortOrderField(),
    statusField(),
    ...seoFields(),
  ],
};

export const downloadsConfig: CmsPageConfig = {
  domain: 'downloads',
  title: '下载中心 · 产品手册',
  fields: [
    localeField(),
    { key: 'title', label: '名称', type: 'text', required: true },
    { key: 'category', label: '分类', type: 'text' },
    {
      key: 'file_url',
      label: '文件',
      type: 'file',
      hideInTable: true,
    },
    {
      key: 'file_size_bytes',
      label: '文件大小（字节）',
      type: 'number',
      width: 130,
    },
    sortOrderField(),
    statusField(),
  ],
};

export const pagesConfig: CmsPageConfig = {
  domain: 'pages',
  title: '单页管理（关于我们 / 加入我们）',
  fields: [
    localeField(),
    {
      key: 'code',
      label: '页面标识',
      type: 'text',
      required: true,
      placeholder: '如 about / join',
    },
    { key: 'title', label: '标题', type: 'text', required: true },
    { key: 'subtitle', label: '副标题', type: 'text' },
    { key: 'banner_key', label: '横幅标识', type: 'text' },
    {
      key: 'content_html',
      label: '页面内容（富文本）',
      type: 'richtext',
      hideInTable: true,
    },
    sortOrderField(),
    statusField(),
    ...seoFields(),
  ],
};

export const homeSlidesConfig: CmsPageConfig = {
  domain: 'home-slides',
  title: '首页轮播图',
  fields: [
    localeField(),
    { key: 'image_url', label: '轮播图', type: 'image', width: 130 },
    { key: 'alt', label: '替代文本', type: 'text' },
    { key: 'link_url', label: '跳转链接', type: 'text' },
    sortOrderField(),
    statusField(),
  ],
};

export const homeAboutCardsConfig: CmsPageConfig = {
  domain: 'home-about-cards',
  title: '首页关于卡片',
  fields: [
    localeField(),
    { key: 'image_url', label: '配图', type: 'image', width: 110 },
    { key: 'title', label: '标题', type: 'text' },
    {
      key: 'body_html',
      label: '内容（富文本）',
      type: 'richtext',
      hideInTable: true,
    },
    { key: 'link_url', label: '跳转链接', type: 'text' },
    { key: 'read_more_label', label: '按钮文案', type: 'text' },
    sortOrderField(),
  ],
};

export const homeVideoConfig: CmsPageConfig = {
  domain: 'home-video',
  title: '首页视频区块',
  fields: [
    localeField(),
    { key: 'heading', label: '标题', type: 'text' },
    {
      key: 'body_html',
      label: '内容（富文本）',
      type: 'richtext',
      hideInTable: true,
    },
    { key: 'video_url', label: '视频地址', type: 'text' },
  ],
};

export const homeSectionsConfig: CmsPageConfig = {
  domain: 'home-sections',
  title: '首页区块开关',
  fields: [
    localeField(),
    {
      key: 'code',
      label: '区块标识',
      type: 'text',
      required: true,
      placeholder: '如 news / products / projects',
    },
    { key: 'title', label: '标题', type: 'text' },
    { key: 'subtitle', label: '副标题', type: 'text' },
    sortOrderField(),
    { key: 'enabled', label: '是否启用', type: 'switch', defaultValue: true },
  ],
};

export const fcSeriesConfig: CmsPageConfig = {
  domain: 'fc-series',
  title: '滤芯系列',
  fields: [
    { key: 'slug', label: '标识', type: 'text', required: true, placeholder: '如 pp-melt-blown' },
    { key: 'name_zh', label: '中文名', type: 'text', required: true },
    { key: 'name_en', label: '英文名', type: 'text' },
    { key: 'icon_url', label: '分类图标', type: 'image', width: 110 },
    { key: 'tagline_zh', label: '中文标语', type: 'text' },
    { key: 'tagline_en', label: '英文标语', type: 'text' },
    {
      key: 'facets_zh',
      label: '中文切面（|分隔）',
      type: 'text',
      hideInTable: true,
      placeholder: '过滤精度|总长|外径|端盖|滤材',
    },
    {
      key: 'facets_en',
      label: '英文切面（|分隔）',
      type: 'text',
      hideInTable: true,
      placeholder: 'Micron rating|Overall length',
    },
    sortOrderField(),
    { key: 'coming_soon', label: '暂未上架', type: 'switch', width: 90 },
    statusField(),
  ],
};

const BOARD_OPTIONS = [
  { label: '滤芯与滤芯壳体', value: 'cartridges' },
  { label: 'RO 膜与组件', value: 'ro' },
  { label: '通用配件（暂不上线）', value: 'accessories' },
];

export const homeTilesConfig: CmsPageConfig = {
  domain: 'home-tiles',
  title: '首页产品瓷砖',
  fields: [
    {
      key: 'board',
      label: '所属分区',
      type: 'select',
      options: BOARD_OPTIONS,
      required: true,
      width: 140,
    },
    { key: 'name_zh', label: '中文名', type: 'text', required: true },
    { key: 'name_en', label: '英文名', type: 'text' },
    { key: 'image_url', label: '配图', type: 'image', width: 110 },
    { key: 'link_url', label: '跳转链接', type: 'text', placeholder: '如 /products/filter-cartridges/high-flow' },
    sortOrderField(),
    statusField(),
  ],
};

const RFQ_STATUS_OPTIONS = [
  { label: '新进', value: 'NEW' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已关闭', value: 'CLOSED' },
];

const jsonAreaField = (key: string, label: string, placeholder: string): FieldDef => ({
  key,
  label,
  type: 'textarea',
  hideInTable: true,
  placeholder,
});

export const fcProductsConfig: CmsPageConfig = {
  domain: 'fc-products',
  title: '滤芯型号',
  fields: [
    { key: 'series_slug', label: '所属系列', type: 'text', required: true, placeholder: '如 high-flow' },
    { key: 'model', label: '型号', type: 'text', required: true },
    { key: 'slug', label: '标识', type: 'text', required: true },
    { key: 'title', label: '英文标题', type: 'text' },
    { key: 'title_zh', label: '中文标题', type: 'text' },
    { key: 'subtitle', label: '英文副题', type: 'text', hideInTable: true },
    { key: 'subtitle_zh', label: '中文副题', type: 'text', hideInTable: true },
    jsonAreaField('gallery_json', '图集（URL 数组 JSON）', '["/uploads/images/xx.jpg"]'),
    { key: 'overall_length', label: '总长', type: 'text', width: 80 },
    { key: 'overall_length_unit', label: '总长单位', type: 'text', hideInTable: true },
    { key: 'overall_length_unit_zh', label: '总长单位(中)', type: 'text', hideInTable: true },
    { key: 'outside_diameter', label: '外径', type: 'text', width: 80 },
    { key: 'outside_diameter_unit', label: '外径单位', type: 'text', hideInTable: true },
    { key: 'outside_diameter_unit_zh', label: '外径单位(中)', type: 'text', hideInTable: true },
    { key: 'inner_diameter', label: '内径', type: 'text', hideInTable: true },
    { key: 'micron_absolute', label: '绝对精度', type: 'text', width: 90 },
    { key: 'micron_nominal', label: '公称精度', type: 'text', width: 90 },
    jsonAreaField('media_material_json', '滤材（数组 JSON）', '["PP"]'),
    { key: 'end_cap', label: '端盖', type: 'text', hideInTable: true },
    { key: 'connection', label: '接口', type: 'text', hideInTable: true },
    { key: 'flow_rate_min', label: '最小流量', type: 'text', hideInTable: true },
    { key: 'flow_rate_max', label: '最大流量', type: 'text', hideInTable: true },
    { key: 'flow_rate_unit', label: '流量单位', type: 'text', hideInTable: true },
    { key: 'flow_rate_unit_zh', label: '流量单位(中)', type: 'text', hideInTable: true },
    { key: 'max_temperature_c', label: '最高温度℃', type: 'text', hideInTable: true },
    { key: 'max_pressure_drop_psid', label: '最大压降psid', type: 'text', hideInTable: true },
    jsonAreaField('application_industries_json', '应用行业（数组 JSON）', '["电力","钢铁"]'),
    jsonAreaField('compatible_models_json', '兼容型号（对象数组 JSON）',
      '[{"brand":"Pall","oemModel":"HC9601","relation":"compatible","note":"","noteZh":""}]'),
    jsonAreaField('documents_json', '文档（对象数组 JSON）',
      '[{"docType":"datasheet","title":"","titleZh":"","fileUrl":null,"fileSizeBytes":null,"lang":"zh","revision":"A"}]'),
    jsonAreaField('certifications_json', '认证（数组 JSON）', '["ISO 9001"]'),
    { key: 'seo_title', label: 'SEO标题', type: 'text', hideInTable: true },
    { key: 'seo_title_zh', label: 'SEO标题(中)', type: 'text', hideInTable: true },
    { key: 'seo_description', label: 'SEO描述', type: 'textarea', hideInTable: true },
    { key: 'seo_description_zh', label: 'SEO描述(中)', type: 'textarea', hideInTable: true },
    { key: 'data_status', label: '数据状态', type: 'text', width: 130, placeholder: 'awaiting-client-data / provided' },
    sortOrderField(),
    statusField(),
  ],
};

export const crossReferenceConfig: CmsPageConfig = {
  domain: 'cross-reference',
  title: '型号对照',
  fields: [
    { key: 'brand', label: '品牌', type: 'text', required: true },
    { key: 'oem_model', label: '对型号号', type: 'text', required: true },
    {
      key: 'relation',
      label: '对应关系',
      type: 'select',
      options: [
        { label: '直接替代', value: 'direct replacement' },
        { label: '兼容', value: 'compatible' },
        { label: '规格相近', value: 'similar spec' },
      ],
      defaultValue: 'compatible',
      width: 100,
    },
    { key: 'surmem_model', label: 'SURMEM 型号', type: 'text', required: true },
    { key: 'series_slug', label: '所属系列', type: 'text', width: 130 },
    { key: 'product_slug', label: '型号标识', type: 'text', width: 130 },
    { key: 'note', label: '备注(英)', type: 'text', hideInTable: true },
    { key: 'note_zh', label: '备注(中)', type: 'text', hideInTable: true },
    sortOrderField(),
    statusField(),
  ],
};

export const rfqConfig: CmsPageConfig = {
  domain: 'rfq',
  title: '询价管理',
  fields: [
    { key: 'request_type', label: '类型', type: 'text', width: 80 },
    { key: 'full_name', label: '姓名', type: 'text' },
    { key: 'company', label: '公司', type: 'text' },
    { key: 'work_email', label: '邮箱', type: 'text' },
    { key: 'phone', label: '电话', type: 'text', width: 130 },
    { key: 'country', label: '国家/地区', type: 'text', width: 110 },
    { key: 'part_number', label: '询价型号', type: 'text', width: 130 },
    { key: 'quantity', label: '数量', type: 'text', width: 80 },
    { key: 'message', label: '留言', type: 'textarea', hideInTable: true },
    { key: 'application', label: '应用场景', type: 'text', hideInTable: true },
    { key: 'source_path', label: '来源页', type: 'text', hideInTable: true },
    { key: 'source_series', label: '来源系列', type: 'text', hideInTable: true },
    { key: 'source_model', label: '来源型号', type: 'text', hideInTable: true },
    {
      key: 'status',
      label: '处理状态',
      type: 'select',
      options: RFQ_STATUS_OPTIONS,
      defaultValue: 'NEW',
      width: 90,
    },
    { key: 'create_time', label: '提交时间', type: 'text', width: 160 },
  ],
};
