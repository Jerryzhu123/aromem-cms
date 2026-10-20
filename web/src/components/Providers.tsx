"use client";

/**
 * antd 全局配置（客户端组件）：
 * - AntdRegistry：把 antd 的样式在服务端渲染阶段抽出来注入 HTML，
 *   静态导出的页面首屏就带完整样式，不闪烁；
 * - ConfigProvider：主题令牌与 src/styles/site.css 的设计令牌保持一致。
 */
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntdApp, ConfigProvider } from "antd";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#126c9c",
            colorInfo: "#126c9c",
            colorLink: "#126c9c",
            borderRadius: 4,
            fontFamily:
              'Arial, Helvetica, "Segoe UI", -apple-system, sans-serif',
          },
        }}
      >
        {/* AntdApp：提供 message / notification 的上下文版 API（QuoteForm 用） */}
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
