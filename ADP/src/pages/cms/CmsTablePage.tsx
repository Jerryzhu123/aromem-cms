/**
 * CMS 通用管理页：由域配置驱动的 ProTable + 抽屉表单。
 *
 * - 列表：GET /api/v1/admin/{domain}（page/size/keyword/locale/status）
 * - 新增/编辑：抽屉表单，字段由 config.fields 驱动（snake_case 键直传后端，
 *   后端 AdminContentService 按白名单过滤并做 camelCase 兼容）
 * - 批量上下线：PUT /{domain}/batch-status
 * - 删除：单行 Popconfirm 物理删除
 */
import React, { useMemo, useRef, useState } from 'react';
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
  Row,
  Select,
  Switch,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { cmsApi, CmsRow } from '@/services/cms';
import { FileUpload, ImageUpload, RichEditor } from './components';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'switch'
  | 'select'
  | 'date'
  | 'richtext'
  | 'image'
  | 'file';

export interface FieldDef {
  /** 库列名（snake_case），同时是提交字段名与表格 dataIndex。 */
  key: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: any }[];
  /** 下拉选项来自另一管理域（value 取行 id）。 */
  optionsDomain?: string;
  optionsLabelKey?: string;
  required?: boolean;
  hideInTable?: boolean;
  hideInForm?: boolean;
  /** 表格列宽 */
  width?: number;
  placeholder?: string;
  /** 新增时的预填默认值 */
  defaultValue?: any;
}

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

  /** 下拉域选项缓存：optionsDomain → options。 */
  const [domainOptions, setDomainOptions] = useState<
    Record<string, { label: string; value: number }[]>
  >({});
  const loadDomainOptions = async (optDomain: string, labelKey: string) => {
    if (domainOptions[optDomain]) return domainOptions[optDomain];
    const res = await cmsApi.list(optDomain, { page: 1, size: 100 });
    const options = res.items.map((it: CmsRow) => ({
      label: String(it[labelKey] ?? it.id),
      value: it.id,
    }));
    setDomainOptions((prev) => ({ ...prev, [optDomain]: options }));
    return options;
  };

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
          <Input.TextArea rows={3} placeholder={f.placeholder} />
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
      case 'select':
        return (
          <Select
            options={f.options ?? domainOptions[f.optionsDomain ?? ''] ?? []}
            placeholder="请选择"
            allowClear
            onFocus={() => {
              if (f.optionsDomain) {
                loadDomainOptions(
                  f.optionsDomain,
                  f.optionsLabelKey ?? 'name',
                );
              }
            }}
          />
        );
      case 'date':
        return <DatePicker showTime style={{ width: '100%' }} />;
      case 'richtext':
        return <RichEditor />;
      case 'image':
        return <ImageUpload />;
      case 'file':
        return <FileUpload />;
      default:
        return <Input placeholder={f.placeholder} />;
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
      if (f.type === 'switch') {
        base.render = (_, row) =>
          row[f.key] ? <Tag color="blue">是</Tag> : <Tag>否</Tag>;
      }
      if (f.type === 'image') {
        base.width = f.width ?? 110;
        base.render = (_, row) =>
          row[f.key] ? (
            <img
              src={row[f.key]}
              alt=""
              style={{ maxWidth: 90, maxHeight: 48, borderRadius: 4 }}
            />
          ) : (
            '-'
          );
      }
      if (f.type === 'select' && f.options) {
        const map = new Map(f.options.map((o) => [o.value, o.label]));
        base.render = (_, row) => map.get(row[f.key]) ?? row[f.key];
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
        params={{ keyword, locale, status }}
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
        request={async ({ current, pageSize, keyword: kw, locale: lc, status: st }: any) => {
          try {
            const res = await cmsApi.list(domain, {
              page: current,
              size: pageSize,
              keyword: kw || undefined,
              locale: lc,
              status: st,
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
          <>
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
              <Select
                allowClear
                placeholder="语言"
                style={{ width: 110 }}
                options={LOCALE_OPTIONS}
                value={locale}
                onChange={(v) => {
                  setLocale(v);
                  actionRef.current?.reload();
                }}
              />
            )}
            {statusEnabled && (
              <Select
                allowClear
                placeholder="状态"
                style={{ width: 110 }}
                options={STATUS_OPTIONS}
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  actionRef.current?.reload();
                }}
              />
            )}
          </>
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
          width={860}
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
                    f.type === 'richtext' ||
                    f.type === 'textarea' ||
                    f.type === 'image' ||
                    f.type === 'file'
                      ? 24
                      : 12
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
