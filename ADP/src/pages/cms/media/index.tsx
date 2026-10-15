/**
 * 媒体库：只读列表 + 上传（media_meta 表无管理写接口，
 * 写入只能走 POST /api/upload/media，符合「文件不入库」硬约束）。
 */
import React, { useRef } from 'react';
import { ActionType, PageContainer, ProTable } from '@ant-design/pro-components';
import { App, Button, Tag, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { cmsApi, CmsRow, uploadMedia } from '@/services/cms';

const formatSize = (bytes?: number | null) => {
  if (!bytes && bytes !== 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export default () => {
  const actionRef = useRef<ActionType>(null);
  const { message } = App.useApp();

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '文件标识', dataIndex: 'file_id', width: 160 },
    { title: '文件名', dataIndex: 'file_name', ellipsis: true },
    {
      title: '预览',
      dataIndex: 'relative_url',
      width: 90,
      render: (_: any, row: CmsRow) =>
        String(row.mime_type || '').startsWith('image/') ? (
          <img
            src={row.relative_url}
            alt=""
            style={{ maxWidth: 80, maxHeight: 44, borderRadius: 4 }}
          />
        ) : (
          '-'
        ),
    },
    {
      title: '访问路径',
      dataIndex: 'relative_url',
      ellipsis: true,
      render: (_: any, row: CmsRow) => (
        <a href={row.relative_url} target="_blank" rel="noreferrer">
          {row.relative_url}
        </a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'mime_type',
      width: 130,
      ellipsis: true,
    },
    {
      title: '大小',
      dataIndex: 'file_size',
      width: 100,
      render: (_: any, row: CmsRow) => formatSize(row.file_size),
    },
    {
      title: 'md5',
      dataIndex: 'md5',
      width: 130,
      ellipsis: true,
      render: (v: string) => <Tag>{v ? `${v.slice(0, 8)}…` : '-'}</Tag>,
    },
    { title: '上传时间', dataIndex: 'create_time', width: 160 },
  ];

  return (
    <PageContainer title="媒体库">
      <ProTable<CmsRow>
        rowKey="id"
        actionRef={actionRef}
        columns={columns as any}
        search={false}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        request={async ({ current, pageSize }) => {
          try {
            const res = await cmsApi.list('media', {
              page: current,
              size: pageSize,
            });
            return { data: res.items, total: res.total, success: true };
          } catch (e: any) {
            message.error(e?.message || '加载列表失败');
            return { data: [], total: 0, success: false };
          }
        }}
        toolBarRender={() => [
          <Upload
            key="upload"
            showUploadList={false}
            customRequest={async ({ file, onSuccess, onError }: any) => {
              try {
                await uploadMedia(file as File);
                message.success('上传成功');
                onSuccess?.(file);
                actionRef.current?.reload();
              } catch (e: any) {
                message.error(e?.message || '上传失败');
                onError?.(e);
              }
            }}
          >
            <Button type="primary" icon={<UploadOutlined />}>
              上传文件
            </Button>
          </Upload>,
        ]}
      />
    </PageContainer>
  );
};
