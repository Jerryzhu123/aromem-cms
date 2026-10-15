/**
 * CMS 管理页通用控件：TinyMCE 富文本、图片上传、文件上传。
 * 三个控件都是受控组件（value/onChange），可直接放进 antd Form.Item。
 */
import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { Spin, Upload } from 'antd';
import { uploadMedia } from '@/services/cms';

const MEDIA_BASE = ''; // relativeUrl 已是 /media/... 相对路径，dev 走代理

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
          src={`${MEDIA_BASE}${value}`}
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
}> = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Upload.Dragger
        style={{ maxWidth: 480 }}
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
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {loading ? '上传中…' : '点击或拖拽文件上传'}
        </p>
        <p className="ant-upload-hint">
          上传后以相对路径（/media/…）保存到对应字段
        </p>
      </Upload.Dragger>
      {value && (
        <div style={{ marginTop: 8 }}>
          已选文件：
          <a href={`${MEDIA_BASE}${value}`} target="_blank" rel="noreferrer">
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
