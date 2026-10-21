/**
 * CMS 管理页通用控件：TinyMCE 富文本、单图/多图上传、文件上传、对象列表编辑器。
 * 全部是受控组件（value/onChange），可直接放进 antd Form.Item。
 */
import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  DeleteOutlined,
  InboxOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Col,
  Input,
  InputNumber,
  Radio,
  Row,
  Segmented,
  Select,
  Spin,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd';
import { uploadMedia } from '@/services/cms';
import type { MediaUploadResult } from '@/services/cms';

const MEDIA_BASE = ''; // relativeUrl 已是 /media/... 相对路径，dev 走代理

/** 官网域名，由 config/config.ts 的 define 注入，可用环境变量 PUBLIC_SITE 覆盖。 */
declare const __PUBLIC_SITE__: string;
const PUBLIC_SITE = (
  typeof __PUBLIC_SITE__ === 'string' ? __PUBLIC_SITE__ : ''
).replace(/\/$/, '');

/**
 * 把库里的资源路径变成浏览器真能打开的 URL。
 *
 * - `/media/…`：后端静态路由，后台域名下直接能取，保持相对路径；
 * - `/products/pool/…` 等存量路径：只存在于官网域名，后台域名会命中 SPA 兜底页
 *   （返回 200 但内容是 HTML），必须补官网 origin 才能显示；
 * - 已经是 http(s) 绝对地址的原样返回。
 */
export const assetUrl = (path?: string): string => {
  if (!path) return '';
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  if (path.startsWith('/media/')) return `${MEDIA_BASE}${path}`;
  return PUBLIC_SITE ? `${PUBLIC_SITE}${path}` : path;
};

/** TinyMCE 自托管脚本地址（public/tinymce，来自 node_modules 拷贝）。 */
const TINYMCE_SRC = '/tinymce/tinymce.min.js';

/** 富文本编辑器：图片粘贴/选择自动上传到 /api/upload/media。 */
export const RichEditor: React.FC<{
  value?: string;
  onChange?: (v: string) => void;
  height?: number;
}> = ({ value, onChange, height = 420 }) => {
  const editorRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  return (
    <div style={{ lineHeight: 1.4 }}>
      {!ready && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Spin tip="富文本编辑器加载中…" />
        </div>
      )}
      <Editor
        tinymceScriptSrc={TINYMCE_SRC}
        onInit={(_evt, editor) => {
          editorRef.current = editor;
          setReady(true);
        }}
        value={value}
        onEditorChange={(content) => onChange?.(content)}
        init={{
          height,
          menubar: false,
          branding: false,
          promotion: false,
          verify_html: false, // 契约：HTML 原样存取，不做净化
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'help',
            'wordcount',
          ],
          toolbar:
            'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image media table link code fullscreen | help',
          // 富文本内图片：选择/粘贴后自动上传，插入 relativeUrl
          images_upload_handler: async (blobInfo: any) => {
            const blob = blobInfo.blob() as Blob;
            const file = new File([blob], blobInfo.filename() || 'image.png', {
              type: blob.type,
            });
            const res = await uploadMedia(file);
            return res.relativeUrl;
          },
          automatic_uploads: true,
          file_picker_types: 'image',
          relative_urls: false,
          convert_urls: false,
        }}
      />
    </div>
  );
};

/** 图片上传（单图）：value 为 relativeUrl 字符串。 */
export const ImageUpload: React.FC<{
  value?: string;
  onChange?: (v: string | undefined) => void;
}> = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {value && (
        <img
          src={assetUrl(value)}
          alt="预览"
          style={{
            maxWidth: 240,
            maxHeight: 140,
            display: 'block',
            marginBottom: 8,
            border: '1px solid #eee',
            borderRadius: 4,
          }}
        />
      )}
      <Upload
        accept="image/*"
        showUploadList={false}
        customRequest={async ({ file, onSuccess, onError }) => {
          setLoading(true);
          try {
            const res = await uploadMedia(file as File);
            onChange?.(res.relativeUrl);
            onSuccess?.(res);
          } catch (e: any) {
            onError?.(e);
            throw e;
          } finally {
            setLoading(false);
          }
        }}
      >
        <button
          type="button"
          style={{
            border: '1px dashed #d9d9d9',
            background: '#fafafa',
            borderRadius: 4,
            padding: '16px 24px',
            cursor: 'pointer',
          }}
        >
          {loading ? '上传中…' : <PlusOutlined />} {loading ? '' : '上传图片'}
        </button>
      </Upload>
      {value && (
        <a
          style={{ marginLeft: 8, fontSize: 12 }}
          onClick={() => onChange?.(undefined)}
        >
          移除
        </a>
      )}
    </div>
  );
};

/** 文件上传（下载中心等）：value 为 relativeUrl 字符串。 */
export const FileUpload: React.FC<{
  value?: string;
  onChange?: (v: string | undefined) => void;
  /** 上传成功回调，用于把文件大小等元数据一并写回同一条记录。 */
  onUploaded?: (res: MediaUploadResult) => void;
  accept?: string;
  hint?: string;
}> = ({ value, onChange, onUploaded, accept, hint }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Upload.Dragger
        style={{ maxWidth: 480 }}
        accept={accept}
        showUploadList={false}
        customRequest={async ({ file, onSuccess, onError }) => {
          setLoading(true);
          try {
            const res = await uploadMedia(file as File);
            onChange?.(res.relativeUrl);
            onUploaded?.(res);
            onSuccess?.(res);
          } catch (e: any) {
            onError?.(e);
            throw e;
          } finally {
            setLoading(false);
          }
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {loading ? '上传中…' : '点击或拖拽文件上传'}
        </p>
        <p className="ant-upload-hint">
          {hint ?? '上传后以相对路径（/media/…）保存到对应字段'}
        </p>
      </Upload.Dragger>
      {value && (
        <div style={{ marginTop: 8 }}>
          已选文件：
          <a href={assetUrl(value)} target="_blank" rel="noreferrer">
            {value}
          </a>
          <a
            style={{ marginLeft: 8, color: '#999' }}
            onClick={() => onChange?.(undefined)}
          >
            移除
          </a>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 多图上传（商品图集）                                                 */
/* ------------------------------------------------------------------ */

/**
 * 多图上传：value 为 relativeUrl 数组，第一张即封面。
 * 用 antd Upload 的 picture-card 形态——缩略图直接铺开，可单张删除。
 */
export const ImageListUpload: React.FC<{
  value?: string[];
  onChange?: (v: string[]) => void;
  max?: number;
}> = ({ value, onChange, max = 20 }) => {
  const list = Array.isArray(value) ? value : [];
  const [pending, setPending] = useState(0);
  const { message } = App.useApp();

  // 连续多选上传时 onChange 的闭包会拿到旧 list，用 ref 取最新值
  const latest = useRef<string[]>(list);
  useEffect(() => {
    latest.current = list;
  }, [value]);

  const fileList: NonNullable<UploadProps['fileList']> = list.map((url, i) => ({
    uid: `saved-${i}-${url}`,
    name: url.split('/').pop() || `图片 ${i + 1}`,
    status: 'done' as const,
    url: assetUrl(url),
    thumbUrl: assetUrl(url),
  }));

  const doUpload = async (file: File) => {
    setPending((n) => n + 1);
    try {
      const res = await uploadMedia(file);
      // 先同步写 ref 再回调，否则多张并发上传会互相覆盖
      const next = [...latest.current, res.relativeUrl];
      latest.current = next;
      onChange?.(next);
    } catch (e: any) {
      message.error(e?.message || '图片上传失败');
    } finally {
      setPending((n) => n - 1);
    }
  };

  const reachMax = list.length + pending >= max;

  return (
    <div>
      <Upload
        accept="image/*"
        multiple
        listType="picture-card"
        fileList={fileList}
        showUploadList={{ showPreviewIcon: false }}
        beforeUpload={(file) => {
          void doUpload(file as File);
          return false; // 阻止 antd 自身请求，改由 uploadMedia 直传
        }}
        onRemove={(file) => {
          const idx = fileList.findIndex((f) => f.uid === file.uid);
          if (idx >= 0) {
            onChange?.(list.filter((_, i) => i !== idx));
          }
          return true;
        }}
      >
        {!reachMax && (
          <div>
            {pending > 0 ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 6, fontSize: 12 }}>
              {pending > 0 ? '上传中' : '上传图片'}
            </div>
          </div>
        )}
      </Upload>
      <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
        第一张作为封面图，最多 {max} 张；支持 jpg / png / webp / svg。
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 对象数组编辑器（兼容型号、技术文档）                                 */
/* ------------------------------------------------------------------ */

export interface ObjectFieldDef {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'segmented'
    | 'radio'
    | 'file'
    | 'tags';
  options?: { label: string; value: any }[];
  placeholder?: string;
  /** 24 栅格宽度，缺省 12 */
  span?: number;
  /** 仅 file 类型有效：上传成功后把文件字节数自动写入该键 */
  fileSizeKey?: string;
  /** 仅 file 类型有效：允许的扩展名，如 '.pdf,.doc' */
  accept?: string;
}

/**
 * 对象数组编辑器：把 `[{...}, {...}]` 这种后端 JSON 列变成
 * 「一张卡片一条记录 + 逐项填表 + 增删」的界面，客户不用接触 JSON。
 */
export const ObjectListEditor: React.FC<{
  value?: Record<string, any>[];
  onChange?: (v: Record<string, any>[]) => void;
  itemFields: ObjectFieldDef[];
  /** 新增时的空模板 */
  blank?: Record<string, any>;
  addLabel?: string;
  /** 卡片标题取哪个键；缺省显示「第 N 条」 */
  titleKey?: string;
  emptyHint?: string;
}> = ({ value, onChange, itemFields, blank, addLabel, titleKey, emptyHint }) => {
  const list = Array.isArray(value) ? value : [];

  // 同一 tick 内可能连打两次 patch（上传成功后先写 fileUrl 再写 fileSizeBytes），
  // 若每次都基于 props 里的 list 计算，后一次会把前一次覆盖回去，故用 ref 串行累加。
  const latest = useRef<Record<string, any>[]>(list);
  useEffect(() => {
    latest.current = list;
  }, [value]);

  const apply = (next: Record<string, any>[]) => {
    latest.current = next;
    onChange?.(next);
  };

  const patchAt = (index: number, patch: Record<string, any>) => {
    apply(
      latest.current.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const renderItemField = (
    f: ObjectFieldDef,
    item: Record<string, any>,
    index: number,
  ) => {
    const v = item?.[f.key];
    switch (f.type) {
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            value={typeof v === 'number' ? v : undefined}
            placeholder={f.placeholder}
            onChange={(n) => patchAt(index, { [f.key]: n ?? null })}
          />
        );
      case 'select':
        return (
          <Select
            style={{ width: '100%' }}
            allowClear
            options={f.options}
            value={v || undefined}
            placeholder={f.placeholder ?? '请选择'}
            onChange={(nv) => patchAt(index, { [f.key]: nv ?? null })}
          />
        );
      case 'segmented':
        return (
          <Segmented
            block
            size="small"
            options={f.options ?? []}
            value={v || undefined}
            onChange={(nv) => patchAt(index, { [f.key]: nv })}
          />
        );
      case 'radio':
        return (
          <Radio.Group
            optionType="button"
            size="small"
            options={f.options ?? []}
            value={v || undefined}
            onChange={(e) => patchAt(index, { [f.key]: e.target.value })}
          />
        );
      case 'tags':
        return (
          <Select
            mode="tags"
            style={{ width: '100%' }}
            tokenSeparators={[',', '，']}
            value={Array.isArray(v) ? v : []}
            placeholder={f.placeholder ?? '输入后回车'}
            onChange={(nv) => patchAt(index, { [f.key]: nv })}
          />
        );
      case 'file':
        return (
          <FileUpload
            value={v || undefined}
            accept={f.accept}
            hint="点这里上传文件，大小会自动记录"
            onChange={(url) =>
              patchAt(index, {
                [f.key]: url ?? null,
                ...(f.fileSizeKey && !url ? { [f.fileSizeKey]: null } : {}),
              })
            }
            onUploaded={(res: MediaUploadResult) => {
              if (f.fileSizeKey) {
                patchAt(index, { [f.fileSizeKey]: res.size });
              }
            }}
          />
        );
      default:
        return (
          <Input
            value={v ?? ''}
            placeholder={f.placeholder}
            onChange={(e) => patchAt(index, { [f.key]: e.target.value })}
          />
        );
    }
  };

  return (
    <div>
      {list.length === 0 && (
        <div style={{ padding: '12px 0', color: '#999', fontSize: 13 }}>
          {emptyHint ?? '暂无记录，点击下方按钮添加'}
        </div>
      )}
      {list.map((item, index) => (
        <Card
          key={index}
          size="small"
          style={{ marginBottom: 10, background: '#fafafa' }}
          title={
            <span style={{ fontSize: 13 }}>
              {titleKey && item[titleKey]
                ? String(item[titleKey])
                : `第 ${index + 1} 条`}
            </span>
          }
          extra={
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => apply(latest.current.filter((_, i) => i !== index))}
            >
              删除
            </Button>
          }
        >
          <Row gutter={12}>
            {itemFields.map((f) => (
              <Col key={f.key} span={f.span ?? 12} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                  {f.label}
                </div>
                {renderItemField(f, item, index)}
              </Col>
            ))}
          </Row>
        </Card>
      ))}
      <Button
        block
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => apply([...latest.current, { ...(blank ?? {}) }])}
      >
        {addLabel ?? '添加一条'}
      </Button>
    </div>
  );
};
