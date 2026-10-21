/**
 * 各管理域的字段配置（与后端 AdminContentService.FIELDS 白名单一一对应）。
 * key 使用库列 snake_case，后端 snake() 转换恒等，白名单可命中。
 *
 * 控件选型原则（面向不懂技术的运营，不是面向程序员）：
 * - 能枚举的绝不让手打：状态、语言、单位、对应关系一律 Segmented / Radio / Select；
 * - 库列是 JSON 数组的，一律用专用控件（多图上传、标签输入、对象卡片列表），
 *   界面上看不到 `["..."]` 或 `[{...}]` 这种方括号；
 * - 文件/图片一律走 antd Upload，上传即得 /media/… 相对路径，字段只存路径。
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

/** 长度单位（尺寸列本身存展示串，单位列留空即不显示）。 */
export const UNIT_LENGTH_OPTIONS = [
  { label: '英寸 in', value: 'in' },
  { label: '毫米 mm', value: 'mm' },
];

/** 流量单位。 */
export const UNIT_FLOW_OPTIONS = [
  { label: 'GPM', value: 'GPM' },
  { label: 'L/min', value: 'L/min' },
  { label: 'm³/h', value: 'm3/h' },
];

/** 商品数据完备度：区分「原厂资料已录」和「等客户补」的两批数据。 */
export const DATA_STATUS_OPTIONS = [
  { label: '待客户提供', value: 'awaiting-client-data' },
  { label: '资料已齐', value: 'provided' },
];

/** 原厂型号对应关系。 */
export const RELATION_OPTIONS = [
  { label: '直接替代', value: 'direct replacement' },
  { label: '兼容', value: 'compatible' },
  { label: '规格相近', value: 'similar spec' },
];

/** 技术文档类型。 */
export const DOC_TYPE_OPTIONS = [
  { label: '数据表', value: 'datasheet' },
  { label: '安装手册', value: 'manual' },
  { label: '认证证书', value: 'certificate' },
  { label: '图纸', value: 'drawing' },
  { label: '其他', value: 'other' },
];

/** 文档语言。 */
export const DOC_LANG_OPTIONS = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
  { label: '中英双语', value: 'bilingual' },
];

/** 建议选项：只做下拉提示，仍允许自由输入新值。 */
export const INDUSTRY_SUGGESTIONS = [
  '电力',
  '钢铁',
  '化工',
  '造纸',
  '食品饮料',
  '医药',
  '汽车',
  '矿山',
  '水处理',
  '暖通空调',
  '船舶',
  '电子',
];

export const MATERIAL_SUGGESTIONS = [
  'PP',
  'PES',
  'PTFE',
  '尼龙',
  '玻璃纤维',
  '不锈钢',
  '活性炭',
  '纤维素',
];

export const CERT_SUGGESTIONS = [
  'ISO 9001',
  'ISO 14001',
  'FDA',
  'NSF 42',
  'NSF 53',
  'CE',
  'RoHS',
  'REACH',
  'WRAS',
];

/**
 * 子分类取值（微孔折叠 / 大流量 / 多折 三个品类）。
 *
 * 存的是 key 而不是显示名，因为同名的子分类在不同系列下显示文案可能不同
 * （例如 key=dl 在「多折」里叫「DL系列多折滤芯」）。显示名由「滤芯系列」表的
 * subcats_json 字典统一维护，这里只做输入提示，允许自由追加新 key。
 */
export const SUBCAT_SUGGESTIONS = [
  'pp',
  'pes',
  'ptfe',
  'nylon',
  'gf',
  'pfa',
  'pvdf',
  'hiflow',
  'bag',
  'oil',
  'dl',
  'hc',
];

const toOptions = (list: string[]) =>
  list.map((v) => ({ label: v, value: v }));

const localeField = (): FieldDef => ({
  key: 'locale',
  label: '语言',
  type: 'segmented',
  options: LOCALE_OPTIONS,
  required: true,
  defaultValue: 'zh-CN',
  width: 110,
});

const statusField = (): FieldDef => ({
  key: 'status',
  label: '状态',
  type: 'segmented',
  options: STATUS_OPTIONS,
  defaultValue: 'PUBLISHED',
  width: 150,
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

/** 引用滤芯系列的下拉（存 slug，不存 id）。 */
const seriesSlugField = (
  key = 'series_slug',
  label = '所属系列',
  extra: Partial<FieldDef> = {},
): FieldDef => ({
  key,
  label,
  type: 'select',
  optionsDomain: 'fc-series',
  optionsLabelKey: 'name_zh',
  optionsValueKey: 'slug',
  required: true,
  width: 130,
  ...extra,
});

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
      placeholder: '.pdf,.doc,.docx,.xls,.xlsx',
      sizeKey: 'file_size_bytes',
      hideInTable: true,
    },
    {
      key: 'file_size_bytes',
      label: '文件大小（字节，上传后自动填）',
      type: 'number',
      width: 130,
    },
    sortOrderField(),
    statusField(),
  ],
};

const PAGE_CODE_OPTIONS = [
  { label: '关于我们 / about', value: 'about' },
  { label: '加入我们 / join', value: 'join' },
  { label: '联系我们 / contact', value: 'contact' },
];

export const pagesConfig: CmsPageConfig = {
  domain: 'pages',
  title: '单页管理（关于我们 / 加入我们）',
  fields: [
    localeField(),
    {
      key: 'code',
      label: '页面标识',
      type: 'select',
      options: PAGE_CODE_OPTIONS,
      required: true,
      width: 150,
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

const SECTION_CODE_OPTIONS = [
  { label: '新闻资讯 / news', value: 'news' },
  { label: '产品中心 / products', value: 'products' },
  { label: '工程实例 / projects', value: 'projects' },
  { label: '关于我们 / about', value: 'about' },
  { label: '视频区块 / video', value: 'video' },
];

export const homeSectionsConfig: CmsPageConfig = {
  domain: 'home-sections',
  title: '首页区块开关',
  fields: [
    localeField(),
    {
      key: 'code',
      label: '区块标识',
      type: 'select',
      options: SECTION_CODE_OPTIONS,
      required: true,
      width: 160,
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
    {
      key: 'slug',
      label: '标识',
      type: 'text',
      required: true,
      placeholder: '如 pp-melt-blown',
    },
    { key: 'name_zh', label: '中文名', type: 'text', required: true },
    { key: 'name_en', label: '英文名', type: 'text' },
    { key: 'icon_url', label: '分类图标', type: 'image', width: 110 },
    { key: 'tagline_zh', label: '中文标语', type: 'text' },
    { key: 'tagline_en', label: '英文标语', type: 'text' },
    {
      key: 'facets_zh',
      label: '中文切面（筛选维度的中文名）',
      type: 'pipeList',
      hideInTable: true,
      placeholder: '如 过滤精度、总长、外径、端盖、滤材，一项一个标签',
    },
    {
      key: 'facets_en',
      label: '英文切面',
      type: 'pipeList',
      hideInTable: true,
      placeholder: '如 Micron rating、Overall length，一项一个标签',
    },

    // ── 系列级模板文案（V11 入库）──────────────────────────────
    // 报价清单和核实声明在整个系列内是同一份，所以挂在系列上而不是每个型号上：
    // 改一次，该系列下所有型号的详情页一起变。
    {
      key: 'checklist_zh',
      label: '中文报价清单（详情页右侧清单）',
      type: 'pipeList',
      hideInTable: true,
      placeholder: '如 规格确认、包装与标识确认，一项一条',
    },
    {
      key: 'checklist_en',
      label: '英文报价清单',
      type: 'pipeList',
      hideInTable: true,
    },
    {
      key: 'verification_zh',
      label: '中文核实声明',
      type: 'textarea',
      hideInTable: true,
      placeholder: '详情页「核实状态」一节显示的那段话',
    },
    {
      key: 'verification_en',
      label: '英文核实声明',
      type: 'textarea',
      hideInTable: true,
    },

    // ── 子分类字典（V12 入库）──────────────────────────────────
    // 品类页「选择类别」那一排药丸的名字与顺序。存 JSON 数组，
    // 每项 { key, labelZh, labelEn }：key 与型号上的 subcats_json 对应。
    // 只有微孔折叠 / 大流量 / 多折这三个复制自原站的品类用得到，其余系列留空。
    {
      key: 'subcats_json',
      label: '子分类字典（JSON）',
      type: 'textarea',
      hideInTable: true,
      placeholder: '[{"key":"pp","labelZh":"PP","labelEn":"PP"}]',
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
      type: 'radio',
      options: BOARD_OPTIONS,
      required: true,
      width: 140,
    },
    { key: 'name_zh', label: '中文名', type: 'text', required: true },
    { key: 'name_en', label: '英文名', type: 'text' },
    { key: 'image_url', label: '配图', type: 'image', width: 110 },
    {
      key: 'link_url',
      label: '跳转链接',
      type: 'text',
      placeholder: '如 /products/filter-cartridges/high-flow',
    },
    sortOrderField(),
    statusField(),
  ],
};

const RFQ_STATUS_OPTIONS = [
  { label: '新进', value: 'NEW' },
  { label: '处理中', value: 'PROCESSING' },
  { label: '已关闭', value: 'CLOSED' },
];

/* ------------------------------------------------------------------ */
/* 滤芯型号：JSON 列全部换成专用控件                                    */
/* ------------------------------------------------------------------ */

const compatibleModelField: FieldDef = {
  key: 'compatible_models_json',
  label: '可替代原厂型号',
  type: 'objectList',
  hideInTable: true,
  itemTitleKey: 'oemModel',
  itemAddLabel: '添加一条兼容型号',
  itemEmptyHint: '暂无登记。添加后，前台详情页会显示「可替换的原厂型号」清单。',
  itemBlank: {
    brand: '',
    oemModel: '',
    relation: 'compatible',
    note: '',
    noteZh: '',
  },
  itemFields: [
    { key: 'brand', label: '品牌', type: 'text', span: 8, placeholder: '如 Pall' },
    {
      key: 'oemModel',
      label: '原厂型号',
      type: 'text',
      span: 8,
      placeholder: '如 HC9601',
    },
    {
      key: 'relation',
      label: '对应关系',
      type: 'select',
      span: 8,
      options: RELATION_OPTIONS,
    },
    { key: 'note', label: '备注（英）', type: 'text', span: 12 },
    { key: 'noteZh', label: '备注（中）', type: 'text', span: 12 },
  ],
};

const documentField: FieldDef = {
  key: 'documents_json',
  label: '技术文档',
  type: 'objectList',
  hideInTable: true,
  itemTitleKey: 'title',
  itemAddLabel: '添加一份文档',
  itemEmptyHint:
    '暂无文档。上传 PDF / Word 后，前台详情页会出现下载入口，文件大小自动记录。',
  itemBlank: {
    docType: 'datasheet',
    title: '',
    titleZh: '',
    fileUrl: null,
    fileSizeBytes: null,
    lang: 'zh',
    revision: 'A',
  },
  itemFields: [
    {
      key: 'docType',
      label: '文档类型',
      type: 'select',
      span: 8,
      options: DOC_TYPE_OPTIONS,
    },
    { key: 'title', label: '标题（英）', type: 'text', span: 8 },
    { key: 'titleZh', label: '标题（中）', type: 'text', span: 8 },
    {
      key: 'fileUrl',
      label: '文件',
      type: 'file',
      span: 24,
      accept: '.pdf,.doc,.docx,.xls,.xlsx',
      fileSizeKey: 'fileSizeBytes',
    },
    {
      key: 'lang',
      label: '语言',
      type: 'select',
      span: 12,
      options: DOC_LANG_OPTIONS,
    },
    {
      key: 'revision',
      label: '版本号',
      type: 'text',
      span: 12,
      placeholder: '如 A / V2',
    },
  ],
};

export const fcProductsConfig: CmsPageConfig = {
  domain: 'fc-products',
  title: '滤芯型号',
  fields: [
    // 所属系列：一共 7 个系列，点一下即切换，比下拉找一次更快。
    // 选项来自「滤芯系列」表，后台新增系列后这里会自动多一项，无需改代码。
    {
      key: 'series_slug',
      label: '所属系列',
      type: 'segmented',
      optionsDomain: 'fc-series',
      optionsLabelKey: 'name_zh',
      optionsValueKey: 'slug',
      required: true,
      fullRow: true,
      width: 110,
    },
    { key: 'model', label: '型号', type: 'text', required: true, width: 110 },
    { key: 'slug', label: '标识', type: 'text', width: 110 },
    { key: 'title', label: '英文标题', type: 'text' },
    { key: 'title_zh', label: '中文标题', type: 'text' },
    { key: 'subtitle', label: '英文副题', type: 'text', hideInTable: true },
    { key: 'subtitle_zh', label: '中文副题', type: 'text', hideInTable: true },

    // ── 详情页文案（V11 入库）────────────────────────────────
    // 这五项是前台型号详情页直接渲染的文字，之前只存在于前端源码常量里，
    // 后台改不到。现在落进 fc_product 的成对列。
    // 一律只在表单里出现（hideInTable）：列表已有 18 列，再挤就看不见型号了。
    {
      key: 'category_zh',
      label: '分类（中）',
      type: 'text',
      hideInTable: true,
      placeholder: '如 大流量',
    },
    { key: 'category_en', label: '分类（英）', type: 'text', hideInTable: true },
    {
      key: 'spec_zh',
      label: '规格摘要（中）',
      type: 'text',
      hideInTable: true,
      placeholder: '如 PP 滤材；外径 163.5 mm；长度 20/40/60 in',
    },
    { key: 'spec_en', label: '规格摘要（英）', type: 'text', hideInTable: true },
    {
      key: 'summary_zh',
      label: '首屏简介（中）',
      type: 'textarea',
      hideInTable: true,
      placeholder: '详情页大标题下的一段话',
    },
    { key: 'summary_en', label: '首屏简介（英）', type: 'textarea', hideInTable: true },
    {
      key: 'application_note_zh',
      label: '应用领域说明（中）',
      type: 'textarea',
      hideInTable: true,
      placeholder: '详情页「应用领域」一节的内容',
    },
    { key: 'application_note_en', label: '应用领域说明（英）', type: 'textarea', hideInTable: true },
    {
      key: 'technical_note_zh',
      label: '复核说明（中）',
      type: 'textarea',
      hideInTable: true,
      placeholder: '提示客户下单前要核对哪些参数',
    },
    { key: 'technical_note_en', label: '复核说明（英）', type: 'textarea', hideInTable: true },

    // ── 原站复制的详情正文（V12 入库）──────────────────────────
    // 微孔折叠 / 大流量 / 多折 三个品类是逐字复制原站得到的，带一份完整的
    // 古腾堡富文本正文（含内联样式的参数表、图集、锚点标题）。之前只存在于
    // 前端源码里，改一个字要重新构建部署；现在落进 fc_product 的两个长文本列。
    {
      key: 'subcats_json',
      label: '所属子分类',
      type: 'tags',
      options: toOptions(SUBCAT_SUGGESTIONS),
      placeholder: '如 PES / Nylon / GF，可多选（原站一个型号可属多个子分类）',
      hideInTable: true,
    },
    {
      key: 'detail_html_zh',
      label: '详情正文（中）',
      type: 'richtext',
      hideInTable: true,
    },
    {
      key: 'detail_html_en',
      label: '详情正文（英）',
      type: 'richtext',
      hideInTable: true,
    },

    // 图集：多图上传，第一张即封面。列表列已经很多，图集只在表单里看，不占表格宽度。
    {
      key: 'gallery_json',
      label: '商品图集',
      type: 'imageList',
      hideInTable: true,
    },

    // 尺寸：展示串（含英寸+毫米）+ 单位分栏
    { key: 'overall_length', label: '总长', type: 'text', width: 100 },
    {
      key: 'overall_length_unit',
      label: '总长单位',
      type: 'select',
      options: UNIT_LENGTH_OPTIONS,
      hideInTable: true,
    },
    {
      key: 'overall_length_unit_zh',
      label: '总长单位（中）',
      type: 'select',
      options: UNIT_LENGTH_OPTIONS,
      hideInTable: true,
    },
    { key: 'outside_diameter', label: '外径', type: 'text', width: 100 },
    {
      key: 'outside_diameter_unit',
      label: '外径单位',
      type: 'select',
      options: UNIT_LENGTH_OPTIONS,
      hideInTable: true,
    },
    {
      key: 'outside_diameter_unit_zh',
      label: '外径单位（中）',
      type: 'select',
      options: UNIT_LENGTH_OPTIONS,
      hideInTable: true,
    },
    // 泳池类专有：过滤面积（sq.ft.）。工业滤芯留空，按面积分档的筛选就靠这一列。
    { key: 'sqft', label: '面积(sq.ft.)', type: 'number', width: 100 },
    { key: 'inner_diameter', label: '内径', type: 'text', hideInTable: true },
    { key: 'micron_absolute', label: '绝对精度', type: 'text', width: 90 },
    { key: 'micron_nominal', label: '公称精度', type: 'text', width: 90 },

    // 滤材：标签输入，常见材质给下拉建议，也能自己敲新的
    {
      key: 'media_material_json',
      label: '滤材',
      type: 'tags',
      options: toOptions(MATERIAL_SUGGESTIONS),
      placeholder: '如 PP / PES / PTFE，输入后回车',
      hideInTable: true,
    },

    { key: 'end_cap', label: '端盖', type: 'text', hideInTable: true },
    // 泳池类是「上开/下开」成对的端盖形式（如 3/8" Open / 6" Open），
    // 与工业滤芯的单一 end_cap 不是一回事，单列两栏。
    {
      key: 'end_cap_top',
      label: '上端盖',
      type: 'text',
      width: 120,
      placeholder: '如 3/8" Open',
    },
    {
      key: 'end_cap_bottom',
      label: '下端盖',
      type: 'text',
      width: 120,
      placeholder: '如 6" Open',
    },
    { key: 'oem_machine', label: '原厂机型', type: 'text', hideInTable: true },
    { key: 'connection', label: '接口', type: 'text', hideInTable: true },
    { key: 'flow_rate_min', label: '最小流量', type: 'text', hideInTable: true },
    { key: 'flow_rate_max', label: '最大流量', type: 'text', hideInTable: true },
    {
      key: 'flow_rate_unit',
      label: '流量单位',
      type: 'select',
      options: UNIT_FLOW_OPTIONS,
      hideInTable: true,
    },
    {
      key: 'flow_rate_unit_zh',
      label: '流量单位（中）',
      type: 'select',
      options: UNIT_FLOW_OPTIONS,
      hideInTable: true,
    },
    {
      key: 'max_temperature_c',
      label: '最高温度 ℃',
      type: 'text',
      hideInTable: true,
    },
    {
      key: 'max_pressure_drop_psid',
      label: '最大压降 psid',
      type: 'text',
      hideInTable: true,
    },

    // 应用行业：标签输入
    {
      key: 'application_industries_json',
      label: '应用行业',
      type: 'tags',
      options: toOptions(INDUSTRY_SUGGESTIONS),
      placeholder: '如 电力 / 钢铁 / 化工，输入后回车',
      hideInTable: true,
    },

    // 兼容型号 / 技术文档：卡片列表，不再让人读 JSON
    compatibleModelField,
    documentField,

    // 认证：标签输入
    {
      key: 'certifications_json',
      label: '认证',
      type: 'tags',
      options: toOptions(CERT_SUGGESTIONS),
      placeholder: '如 ISO 9001 / NSF 42，输入后回车',
      hideInTable: true,
    },

    { key: 'seo_title', label: 'SEO 标题', type: 'text', hideInTable: true },
    { key: 'seo_title_zh', label: 'SEO 标题（中）', type: 'text', hideInTable: true },
    {
      key: 'seo_description',
      label: 'SEO 描述',
      type: 'textarea',
      hideInTable: true,
    },
    {
      key: 'seo_description_zh',
      label: 'SEO 描述（中）',
      type: 'textarea',
      hideInTable: true,
    },
    {
      key: 'data_status',
      label: '资料状态',
      type: 'segmented',
      options: DATA_STATUS_OPTIONS,
      width: 150,
    },
    {
      key: 'source_url',
      label: '数据来源页',
      type: 'text',
      hideInTable: true,
      placeholder: '原厂页面链接，便于追溯',
    },
    sortOrderField(),
    statusField(),
  ],
};

export const crossReferenceConfig: CmsPageConfig = {
  domain: 'cross-reference',
  title: '型号对照',
  fields: [
    { key: 'brand', label: '品牌', type: 'text', required: true, width: 110 },
    { key: 'oem_model', label: '对型号号', type: 'text', required: true, width: 120 },
    {
      key: 'relation',
      label: '对应关系',
      type: 'radio',
      options: RELATION_OPTIONS,
      defaultValue: 'compatible',
      required: true,
      width: 130,
    },
    { key: 'surmem_model', label: 'SURMEM 型号', type: 'text', required: true, width: 130 },
    seriesSlugField('series_slug', '所属系列', { required: false }),
    {
      key: 'product_slug',
      label: '型号标识',
      type: 'select',
      optionsDomain: 'fc-products',
      optionsLabelKey: 'model',
      optionsValueKey: 'slug',
      optionsRemote: true,
      width: 130,
    },
    { key: 'note', label: '备注(英)', type: 'text', hideInTable: true },
    { key: 'note_zh', label: '备注(中)', type: 'text', hideInTable: true },
    sortOrderField(),
    statusField(),
  ],
};

export const rfqConfig: CmsPageConfig = {
  domain: 'rfq',
  title: '询价管理',
  // 除「处理状态」外全部只读，这不是懒，是跟后端白名单对齐：
  // AdminContentService 里 rfq 域只允许写 status 一列，界面上却把
  // 姓名、公司、留言都渲染成可编辑的输入框，运营改完点保存会看到
  // 「保存成功」而数据一个字都没变——这种静默丢弃比直接禁止编辑更伤人。
  // 另外，客户提交的内容属于原始证据，本来也不该让后台改。
  fields: [
    // 库里存 quote / sample，表格与抽屉都显示中文，运营不用每次在脑子里翻译
    {
      key: 'request_type',
      label: '类型',
      type: 'select',
      options: [
        { label: '询价', value: 'quote' },
        { label: '样品申请', value: 'sample' },
      ],
      textMap: { quote: '询价', sample: '样品申请' },
      readOnly: true,
      width: 100,
    },
    { key: 'full_name', label: '姓名', type: 'text', readOnly: true },
    { key: 'company', label: '公司', type: 'text', readOnly: true },
    { key: 'work_email', label: '邮箱', type: 'text', readOnly: true },
    { key: 'phone', label: '电话', type: 'text', readOnly: true, width: 130 },
    { key: 'country', label: '国家/地区', type: 'text', readOnly: true, width: 110 },
    { key: 'part_number', label: '询价型号', type: 'text', readOnly: true, width: 130 },
    { key: 'quantity', label: '数量', type: 'text', readOnly: true, width: 80 },
    { key: 'message', label: '留言', type: 'textarea', readOnly: true, hideInTable: true },
    { key: 'application', label: '应用场景', type: 'text', readOnly: true, hideInTable: true },
    { key: 'source_path', label: '来源页', type: 'text', readOnly: true, hideInTable: true },
    { key: 'source_series', label: '来源系列', type: 'text', readOnly: true, hideInTable: true },
    { key: 'source_model', label: '来源型号', type: 'text', readOnly: true, hideInTable: true },
    {
      key: 'status',
      label: '处理状态',
      type: 'segmented',
      options: RFQ_STATUS_OPTIONS,
      defaultValue: 'NEW',
      width: 150,
    },
    // 提交时间由数据库生成，只给人看，不给改
    {
      key: 'create_time',
      label: '提交时间',
      type: 'text',
      dateTime: true,
      readOnly: true,
      width: 150,
    },
  ],
};
