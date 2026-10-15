/**
 * 滤芯栏目 SEO 助手：中英文互指（hreflang）。
 *
 * 为什么单独一个文件：hreflang 要求两种语言互相声明，并且给出 x-default；
 * 各页面只需要把「自己这条 canonical」传进来，另一条自动推导，避免 12 个页面手写两遍路径时写错。
 */
import type { Metadata } from "next";
import type { FcLocale } from "@/data/fcText";

/**
 * 由「本页自己的 canonical」推导出双语 alternates。
 *
 * @param locale 本页语言
 * @param ownCanonical 本页现有 canonical（英文在根路径，中文带 /zh）
 */
export function fcAlternates(
  locale: FcLocale,
  ownCanonical: string,
): Metadata["alternates"] {
  const isZh = locale === "zh";
  const en = isZh ? ownCanonical.replace(/^\/zh/, "") || "/" : ownCanonical;
  const zh = isZh ? ownCanonical : ownCanonical === "/" ? "/zh" : `/zh${ownCanonical}`;

  return {
    canonical: locale === "zh" ? zh : en,
    languages: {
      "zh-Hans": zh,
      en,
      // x-default 指向英文站：英文站现在是默认入口（根路径）
      "x-default": en,
    },
  };
}
