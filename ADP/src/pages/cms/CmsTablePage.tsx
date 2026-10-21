/**
 * CMS 通用管理页：由域配置驱动的 ProTable + 抽屉表单。
 *
 * - 列表：GET /api/v1/admin/{domain}（page/size/keyword/locale/status）
 * - 新增/编辑：抽屉表单，字段由 config.fields 驱动（snake_case 键直传后端，
 *   后端 AdminContentService 按白名单过滤并做 camelCase 兼容）
 * - 批量上下线：PUT /{domain}/batch-status
 * - 删除：单行 Popconfirm 物理删除
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionType,
  PageContainer,
  ProTable,
  ProColumns,
} from '@ant-design/pro-components';
import {
  App,
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Row,
  Segmented,
  Select,
  Switch,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { cmsApi, CmsRow } from '@/services/cms';
import {
  assetUrl,
  FileUpload,
  ImageListUpload,
  ImageUpload,
  ObjectListEditor,
  RichEditor,
} from './components';
import type { ObjectFieldDef } from './components';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'switch'
  | 'select'
  | 'segmented'
  | 'radio'
  | 'date'
  | 'richtext'
  | 'image'
  | 'imageList'
  | 'file'
  | 'tags'
  | 'pipeList'
  | 'objectList';

/** 存的库列是 JSON 文本、界面上要当数组处理的字段类型。 */
const JSON_ARRAY_TYPES: ReadonlySet<FieldType> = new Set<FieldType>([
  'tags',
  'imageList',
  'objectList',
]);

/** 表单里独占整行（24 栅格）的字段类型。 */
const FULL_WIDTH_TYPES: readonly FieldType[] = [
  'richtext',
  'textarea',
  'image',
  'imageList',
  'file',
  'objectList',
  'tags',
  'pipeList',
];

/** 库列是「竖线分隔的串」（如 facets_zh），界面上当标签处理。 */
const PIPE_SEPARATOR = '|';

const splitPipe = (raw: unknown): string[] =>
  typeof raw === 'string'
    ? raw
        .split(PIPE_SEPARATOR)
        .map((s) => s.trim())
        .filter(Boolean)
    : Array.isArray(raw)
      ? raw.map((s) => String(s).trim()).filter(Boolean)
      : [];

/**
 * 把库里的 JSON 文本安全解析成数组。
 * 后端 JDBC 可能直接给字符串，也可能已被驱动解析成 List，两种都要吃得下；
 * 脏数据（不是数组）一律按空数组处理，不让一条坏记录卡死表单。
 */
export function parseJsonArray(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * 把后端返回的时间显示成「YYYY-MM-DD HH:mm」。
 *
 * 后端 Jackson 直接序列化 datetime(3)，出来是 2026-10-21T23:43:08.489，
 * 列表里那个 T 和小数点后面三位毫秒对运营没有意义，还占宽度。
 * 不用 dayjs 转：值本身不带时区偏移（就是服务器本地时间），
 * 交给 dayjs 反而可能按浏览器时区再挪一次，字符串裁切最稳。
 */
export function fmtDateTime(raw: unknown): string {
  const s = String(raw ?? '').trim();
  if (!s) return '-';
  return s.replace('T', ' ').slice(0, 16);
}

export interface FieldDef {
  /** 库列名（snake_case），同时是提交字段名与表格 dataIndex。 */
  key: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: any }[];
  /** 下拉选项来自另一管理域（默认 value 取行 id）。 */
  optionsDomain?: string;
  optionsLabelKey?: string;
  /** 跨域选项的取值字段（如 fc-series 存 slug 而非 id）。 */
  optionsValueKey?: string;
  /** 跨域选项走远程搜索（数据量大时用，如 495 条型号）。 */
  optionsRemote?: boolean;
  /** objectList 的子字段定义。 */
  itemFields?: ObjectFieldDef[];
  /** objectList 新增时的空模板。 */
  itemBlank?: Record<string, any>;
  /** objectList 卡片标题取值键。 */
  itemTitleKey?: string;
  /** objectList 空态提示。 */
  itemEmptyHint?: string;
  /** objectList 添加按钮文案。 */
  itemAddLabel?: string;
  /** 仅 file 类型有效：上传成功后自动把字节数写进同表单的该字段。 */
  sizeKey?: string;
  /** 强制独占整行（选项多的分段控制器需要足够宽度）。 */
  fullRow?: boolean;
  required?: boolean;
  hideInTable?: boolean;
  hideInForm?: boolean;
  /**
   * 表格里把原始值翻译成中文。如询盘的 request_type 库里存 quote / sample，
   * 直接显示英文，运营每次都要在脑子里翻译一遍。
   */
  textMap?: Record<string, string>;
  /**
   * 表格里把后端返回的 ISO 时间（2026-10-21T23:43:08.489）显示成
   * 「2026-10-21 23:43」。后端没有统一改序列化格式，因为那会影响所有表，
   * 只在这类确实要给人看的时间列上做显示层处理，范围可控。
   */
  dateTime?: boolean;
  /** 表单里只读：能看到但不能改（如提交时间，改了没有意义还会误导）。 */
  readOnly?: boolean;
  /** 表格列宽 */
  width?: number;
  placeholder?: string;
  /** 新增时的预填默认值 */
  defaultValue?: any;
}

/** 下拉 / 分段控制器 / 按钮组都可以从别的管理域取选项。 */
const usesDomainOptions = (f: FieldDef): boolean =>
  Boolean(f.optionsDomain) &&
  (f.type === 'select' || f.type === 'segmented' || f.type === 'radio');

/** 跨域选项的缓存键：同一个域取不同字段（id 或 slug）要分开存。 */
const optionsCacheKey = (f: FieldDef): string =>
  `${f.optionsDomain ?? ''}:${f.optionsValueKey ?? 'id'}`;

export interface CmsPageConfig {
  domain: string;
  title: string;
  fields: FieldDef[];
  /** 只读列表（媒体库）：隐藏增删改。 */
  readOnly?: boolean;
  /** 表格上方额外工具（如媒体上传按钮）。 */
  extraToolbar?: React.ReactNode;
}

const LOCALE_OPTIONS = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
];

const STATUS_OPTIONS = [
  { label: '已发布', value: 'PUBLISHED' },
  { label: '草稿', value: 'DRAFT' },
  { label: '下线', value: 'OFFLINE' },
];

const STATUS_COLOR: Record<string, string> = {
  PUBLISHED: 'green',
  DRAFT: 'orange',
  OFFLINE: 'red',
};

const stripHtml = (html?: string) =>
  (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/** 判断域是否含 status 字段（决定批量上下线与状态筛选是否可用）。 */
const hasStatus = (fields: FieldDef[]) =>
  fields.some((f) => f.key === 'status');

export const CmsTablePage: React.FC<{ config: CmsPageConfig }> = ({
  config,
}) => {
  const { domain, title, fields, readOnly, extraToolbar } = config;
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const [keyword, setKeyword] = useState<string>('');
  const [locale, setLocale] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  /** 所属系列筛选（只有带 series_slug 字段的域才有这个筛选条）。 */
  const [series, setSeries] = useState<string | undefined>();
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CmsRow | null>(null);
  const [saving, setSaving] = useState(false);

  const tableFields = useMemo(
    () => fields.filter((f) => !f.hideInTable),
    [fields],
  );
  const formFields = useMemo(
    () => fields.filter((f) => !f.hideInForm),
    [fields],
  );
  const statusEnabled = useMemo(() => hasStatus(fields), [fields]);

  /** 「所属系列」筛选条：只在当前域确实有 series_slug 且选项来自别处时才出现。 */
  const seriesField = useMemo(
    () => fields.find((f) => f.key === 'series_slug' && usesDomainOptions(f)),
    [fields],
  );

  /** 下拉域选项缓存：optionsDomain → options。 */
  const [domainOptions, setDomainOptions] = useState<
    Record<string, { label: string; value: any }[]>
  >({});

  /**
   * 拉取跨域选项。
   * 后端列表接口 size 上限 100，因此：
   * - optionsRemote（如 495 条型号）：只在搜索时拉前 50 条，不预载全量；
   * - 其余（分类、系列等小表）：一次拉 100 条足够。
   */
  const loadDomainOptions = async (
    optDomain: string,
    labelKey: string,
    valueKey?: string,
    keyword?: string,
  ) => {
    const cacheKey = `${optDomain}:${valueKey ?? 'id'}`;
    if (!keyword && domainOptions[cacheKey]) return domainOptions[cacheKey];
    const res = await cmsApi.list(optDomain, {
      page: 1,
      size: keyword ? 50 : 100,
      keyword: keyword || undefined,
    });
    const options = res.items.map((it: CmsRow) => ({
      label: String(it[labelKey] ?? it[valueKey ?? 'id'] ?? it.id),
      value: valueKey ? it[valueKey] : it.id,
    }));
    if (!keyword) {
      setDomainOptions((prev) => ({ ...prev, [cacheKey]: options }));
    }
    return options;
  };

  /** 远程搜索的选项单独存放，避免覆盖已缓存的初始列表。 */
  const [remoteOptions, setRemoteOptions] = useState<
    Record<string, { label: string; value: any }[]>
  >({});

  /** 顶部「所属系列」分段控制器的选项：直接复用该字段的下拉选项。 */
  const seriesOptions = useMemo(
    () =>
      seriesField ? domainOptions[optionsCacheKey(seriesField)] ?? [] : [],
    [seriesField, domainOptions],
  );

  // 抽屉一打开就把小表的下拉选项备好，否则已有值会先显示成裸 slug/id
  useEffect(() => {
    if (!drawerOpen) return;
    for (const f of formFields) {
      if (usesDomainOptions(f) && !f.optionsRemote) {
        void loadDomainOptions(
          f.optionsDomain!,
          f.optionsLabelKey ?? 'name',
          f.optionsValueKey,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  // 首屏也备一次：列表里的 select 列要靠它把 slug/id 翻成中文名
  useEffect(() => {
    for (const f of fields) {
      if (usesDomainOptions(f) && !f.optionsRemote && !f.options) {
        void loadDomainOptions(
          f.optionsDomain!,
          f.optionsLabelKey ?? 'name',
          f.optionsValueKey,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const defaults = Object.fromEntries(
      formFields
        .filter((f) => f.defaultValue !== undefined)
        .map((f) => [f.key, f.defaultValue]),
    );
    form.setFieldsValue(defaults);
    setDrawerOpen(true);
  };

  const openEdit = async (row: CmsRow) => {
    try {
      // 详情接口拿全量字段（列表可能截断富文本）
      const detail = await cmsApi.detail(domain, row.id);
      setEditing(detail);
      const values: Record<string, any> = { ...detail };
      for (const f of formFields) {
        if (f.type === 'date' && values[f.key]) {
          values[f.key] = dayjs(values[f.key]);
        }
        if (JSON_ARRAY_TYPES.has(f.type)) {
          values[f.key] = parseJsonArray(values[f.key]);
        }
        if (f.type === 'pipeList') {
          values[f.key] = splitPipe(values[f.key]);
        }
      }
      form.resetFields();
      form.setFieldsValue(values);
      setDrawerOpen(true);
    } catch (e: any) {
      message.error(e?.message || '加载详情失败');
    }
  };

  const submit = async () => {
    const values = await form.validateFields();
    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v === undefined) continue;
      const field = formFields.find((f) => f.key === k);
      // 数组类字段（图集 / 标签 / 对象数组）：控件给数组，库列要 JSON 文本
      if (field && JSON_ARRAY_TYPES.has(field.type)) {
        const arr = Array.isArray(v) ? v : [];
        payload[k] =
          arr.length === 0
            ? null
            : JSON.stringify(
                field.type === 'tags'
                  ? arr.map((x) => String(x).trim()).filter(Boolean)
                  : arr,
              );
        continue;
      }
      // 竖线分隔的串：界面上是标签，回到库里仍是 "a|b|c"
      if (field && field.type === 'pipeList') {
        const arr = (Array.isArray(v) ? v : [])
          .map((x) => String(x).trim())
          .filter(Boolean);
        payload[k] = arr.length === 0 ? null : arr.join(PIPE_SEPARATOR);
        continue;
      }
      if (v && typeof v === 'object' && typeof (v as any).format === 'function') {
        payload[k] = (v as dayjs.Dayjs).format('YYYY-MM-DD HH:mm:ss');
      } else {
        payload[k] = v;
      }
    }
    setSaving(true);
    try {
      if (editing) {
        await cmsApi.update(domain, editing.id, payload);
        message.success('已保存');
      } else {
        await cmsApi.create(domain, payload);
        message.success('已新增');
      }
      setDrawerOpen(false);
      actionRef.current?.reload();
    } catch (e: any) {
      message.error(e?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async (id: number) => {
    try {
      await cmsApi.remove(domain, id);
      message.success('已删除');
      actionRef.current?.reload();
    } catch (e: any) {
      message.error(e?.message || '删除失败');
    }
  };

  const doBatchStatus = async (nextStatus: string) => {
    try {
      await cmsApi.batchStatus(
        domain,
        selectedKeys.map(Number),
        nextStatus,
      );
      message.success('批量操作成功');
      setSelectedKeys([]);
      actionRef.current?.reload();
    } catch (e: any) {
      message.error(e?.message || '批量操作失败');
    }
  };

  const renderField = (f: FieldDef) => {
    switch (f.type) {
      case 'textarea':
        return (
          <Input.TextArea rows={3} placeholder={f.placeholder} disabled={f.readOnly} />
        );
      case 'number':
        return <InputNumber style={{ width: '100%' }} />;
      case 'switch':
        return (
          <Switch
            checkedChildren="是"
            unCheckedChildren="否"
            defaultChecked={false}
          />
        );
      case 'segmented': {
        // 选项可以写死，也可以来自别的管理域（如「所属系列」= fc-series 的 slug）
        const opts = f.options
          ? f.options
          : usesDomainOptions(f)
            ? domainOptions[optionsCacheKey(f)] ?? []
            : [];
        return (
          <Segmented
            block
            options={opts}
            style={{ width: '100%', overflowX: 'auto' }}
          />
        );
      }
      case 'radio': {
        const opts = f.options
          ? f.options
          : usesDomainOptions(f)
            ? domainOptions[optionsCacheKey(f)] ?? []
            : [];
        return (
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            options={opts}
          />
        );
      }
      case 'select': {
        if (f.optionsDomain) {
          const cacheKey = `${f.optionsDomain}:${f.optionsValueKey ?? 'id'}`;
          const list = f.optionsRemote
            ? remoteOptions[cacheKey] ?? []
            : domainOptions[cacheKey] ?? [];
          return (
            <Select
              options={f.options ?? list}
              placeholder="请选择"
              allowClear
              showSearch
              filterOption={
                f.optionsRemote
                  ? false
                  : (input, option) =>
                      String(option?.label ?? '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
              }
              onFocus={() => {
                void loadDomainOptions(
                  f.optionsDomain!,
                  f.optionsLabelKey ?? 'name',
                  f.optionsValueKey,
                );
              }}
              onSearch={
                f.optionsRemote
                  ? (kw) => {
                      void loadDomainOptions(
                        f.optionsDomain!,
                        f.optionsLabelKey ?? 'name',
                        f.optionsValueKey,
                        kw,
                      ).then((opts) =>
                        setRemoteOptions((prev) => ({
                          ...prev,
                          [cacheKey]: opts,
                        })),
                      );
                    }
                  : undefined
              }
            />
          );
        }
        return (
          <Select
            options={f.options ?? []}
            placeholder="请选择"
            allowClear
            disabled={f.readOnly}
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        );
      }
      case 'tags':
        return (
          <Select
            mode="tags"
            style={{ width: '100%' }}
            tokenSeparators={[',', '，', '、']}
            placeholder={f.placeholder ?? '输入后按回车新增，支持逗号分隔批量粘贴'}
            options={f.options}
          />
        );
      case 'pipeList':
        return (
          <Select
            mode="tags"
            style={{ width: '100%' }}
            tokenSeparators={['|', '，', ',', '、']}
            placeholder={f.placeholder ?? '输入一项后按回车，一项一个标签'}
            options={f.options}
          />
        );
      case 'date':
        return <DatePicker showTime style={{ width: '100%' }} />;
      case 'richtext':
        return <RichEditor />;
      case 'image':
        return <ImageUpload />;
      case 'imageList':
        return <ImageListUpload />;
      case 'file':
        return (
          <FileUpload
            accept={f.placeholder}
            hint="上传后自动写入文件路径与大小"
            onUploaded={(res) => {
              // 下载中心的 file_size_bytes 常被漏填，上传即回写
              if (f.sizeKey) {
                form.setFieldValue(f.sizeKey, res.size);
              }
            }}
          />
        );
      case 'objectList':
        return (
          <ObjectListEditor
            itemFields={f.itemFields ?? []}
            blank={f.itemBlank}
            titleKey={f.itemTitleKey}
            addLabel={f.itemAddLabel}
            emptyHint={f.itemEmptyHint}
          />
        );
      default:
        return <Input placeholder={f.placeholder} disabled={f.readOnly} />;
    }
  };

  const columns: ProColumns<CmsRow>[] = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    ...tableFields.map((f): ProColumns<CmsRow> => {
      const base: ProColumns<CmsRow> = {
        title: f.label,
        dataIndex: f.key,
        width: f.width,
        ellipsis: f.type === 'richtext' || f.type === 'textarea',
      };
      if (f.type === 'richtext') {
        base.renderText = (v) => stripHtml(String(v ?? ''));
      }
      if (f.textMap) {
        const map = f.textMap;
        base.renderText = (v) => map[String(v ?? '')] ?? String(v ?? '');
      }
      if (f.dateTime) {
        // 放在 textMap 之后：两个都配时以时间格式化为准（时间列不会配翻译表）
        base.renderText = (v) => fmtDateTime(v);
      }
      if (f.type === 'switch') {
        base.render = (_, row) =>
          row[f.key] ? <Tag color="blue">是</Tag> : <Tag>否</Tag>;
      }
      if (f.type === 'image') {
        base.width = f.width ?? 110;
        base.render = (_, row) =>
          row[f.key] ? (
            <img
              src={assetUrl(row[f.key])}
              alt=""
              style={{ maxWidth: 90, maxHeight: 48, borderRadius: 4 }}
            />
          ) : (
            '-'
          );
      }
      if (f.type === 'imageList') {
        base.width = f.width ?? 110;
        base.render = (_, row) => {
          const arr = parseJsonArray(row[f.key]);
          if (!arr.length) return '-';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <img
                src={assetUrl(String(arr[0]))}
                alt=""
                style={{
                  maxWidth: 56,
                  maxHeight: 40,
                  borderRadius: 4,
                  objectFit: 'cover',
                }}
              />
              {arr.length > 1 && (
                <span style={{ fontSize: 12, color: '#999' }}>
                  +{arr.length - 1}
                </span>
              )}
            </div>
          );
        };
      }
      if (f.type === 'tags' || f.type === 'pipeList') {
        base.render = (_, row) => {
          const arr =
            f.type === 'pipeList'
              ? splitPipe(row[f.key])
              : parseJsonArray(row[f.key]);
          return arr.length
            ? arr.map((t) => <Tag key={String(t)}>{String(t)}</Tag>)
            : '-';
        };
      }
      if (f.type === 'objectList') {
        base.render = (_, row) => {
          const arr = parseJsonArray(row[f.key]);
          return arr.length ? (
            <Tag color="blue">{arr.length} 条</Tag>
          ) : (
            '-'
          );
        };
      }
      if (
        (f.type === 'select' ||
          f.type === 'segmented' ||
          f.type === 'radio') &&
        f.options
      ) {
        const map = new Map(f.options.map((o) => [o.value, o.label]));
        base.render = (_, row) => map.get(row[f.key]) ?? row[f.key] ?? '-';
      }
      // 跨域选项（下拉 / 分段）：列里存的是 slug/id，靠已缓存的选项翻成中文名
      if (usesDomainOptions(f) && !f.options) {
        const map = new Map(
          (domainOptions[optionsCacheKey(f)] ?? []).map((o) => [
            o.value,
            o.label,
          ]),
        );
        base.render = (_, row) => map.get(row[f.key]) ?? row[f.key] ?? '-';
      }
      return base;
    }),
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      hideInTable: readOnly,
      render: (_, row) => [
        <a key="edit" onClick={() => openEdit(row)}>
          编辑
        </a>,
        <Popconfirm
          key="del"
          title="确认删除该条数据？"
          description="删除后不可恢复"
          onConfirm={() => doDelete(row.id)}
        >
          <a style={{ color: '#ff4d4f' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer title={title}>
      <ProTable<CmsRow>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={false}
        // params 变化会自动触发重新请求（比闭包状态 + 手动 reload 可靠）
        params={{ keyword, locale, status, series }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        rowSelection={
          !readOnly && statusEnabled
            ? {
                selectedRowKeys: selectedKeys,
                onChange: (keys) => setSelectedKeys(keys),
              }
            : undefined
        }
        tableAlertOptionRender={
          statusEnabled
            ? () => (
                <>
                  <a onClick={() => doBatchStatus('PUBLISHED')}>批量上线</a>
                  <a onClick={() => doBatchStatus('OFFLINE')}>批量下线</a>
                </>
              )
            : undefined
        }
        request={async ({ current, pageSize, keyword: kw, locale: lc, status: st, series: sr }: any) => {
          try {
            const res = await cmsApi.list(domain, {
              page: current,
              size: pageSize,
              keyword: kw || undefined,
              locale: lc,
              status: st,
              series: sr,
            });
            return {
              data: res.items,
              total: res.total,
              success: true,
            };
          } catch (e: any) {
            message.error(e?.message || '加载列表失败');
            return { data: [], total: 0, success: false };
          }
        }}
        headerTitle={
          // 筛选条会随屏宽换行，避免小屏时把搜索框和新增按钮挤出去
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Input.Search
              allowClear
              placeholder="关键词搜索"
              style={{ width: 220 }}
              onSearch={(v) => {
                setKeyword(v);
                actionRef.current?.reload();
              }}
            />
            {formFields.some((f) => f.key === 'locale') && (
              <Segmented
                value={locale ?? 'ALL'}
                options={[
                  { label: '全部语言', value: 'ALL' },
                  ...LOCALE_OPTIONS,
                ]}
                onChange={(v) => {
                  setLocale(v === 'ALL' ? undefined : String(v));
                  actionRef.current?.reload();
                }}
              />
            )}
            {statusEnabled && (
              <Segmented
                value={status ?? 'ALL'}
                options={[
                  { label: '全部状态', value: 'ALL' },
                  ...STATUS_OPTIONS,
                ]}
                onChange={(v) => {
                  setStatus(v === 'ALL' ? undefined : String(v));
                  actionRef.current?.reload();
                }}
              />
            )}
            {seriesField && seriesOptions.length > 0 && (
              <Segmented
                value={series ?? 'ALL'}
                options={[
                  { label: '全部系列', value: 'ALL' },
                  ...seriesOptions,
                ]}
                onChange={(v) => {
                  setSeries(v === 'ALL' ? undefined : String(v));
                  actionRef.current?.reload();
                }}
              />
            )}
          </div>
        }
        toolBarRender={() => [
          ...(extraToolbar ? [extraToolbar] : []),
          ...(!readOnly
            ? [
                <Button
                  key="create"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreate}
                >
                  新增
                </Button>,
              ]
            : []),
        ]}
      />

      {!readOnly && (
        <Drawer
          title={editing ? `编辑 · ${title}` : `新增 · ${title}`}
          width={960}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          destroyOnClose
          extra={
            <Button type="primary" loading={saving} onClick={submit}>
              保存
            </Button>
          }
        >
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              {formFields.map((f) => (
                <Col
                  key={f.key}
                  span={
                    FULL_WIDTH_TYPES.includes(f.type) || f.fullRow ? 24 : 12
                  }
                >
                  <Form.Item
                    name={f.key}
                    label={f.label}
                    valuePropName={
                      f.type === 'switch' ? 'checked' : 'value'
                    }
                    rules={
                      f.required
                        ? [
                            {
                              required: true,
                              message: `请填写${f.label}`,
                            },
                          ]
                        : undefined
                    }
                  >
                    {renderField(f)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        </Drawer>
      )}
    </PageContainer>
  );
};
