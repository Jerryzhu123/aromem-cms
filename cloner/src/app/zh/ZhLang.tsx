"use client";

import { useEffect } from "react";

/**
 * 中文子站的 <html lang>：根布局是全站共用的（现在声明 en，因为英文站占根路径），
 * 嵌套布局不能改 <html> 属性，所以这里在客户端把中文站的语言标成 zh-CN。
 * 副作用：中文页首屏 HTML 上仍是 lang="en"，水合后才变 —— 要求 SSR 就正确的话，
 * 需要把根布局拆成两个根布局（英文组 / 中文组），属另一件事。
 */
export default function ZhLang() {
  useEffect(() => {
    document.documentElement.lang = "zh-CN";
  }, []);
  return null;
}
