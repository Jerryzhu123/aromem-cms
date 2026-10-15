import type { Metadata } from "next";
import ZhLang from "./ZhLang";

/** 中文站默认 meta（根布局是英文站的，这里覆盖回来）。 */
export const metadata: Metadata = {
  title: "苏州苏瑞膜纳米科技集团有限公司-官网",
  description:
    "苏州苏瑞膜纳米科技集团有限公司主要从事属于国家战略新兴产业的水分离核心材料‘复合反渗透与纳滤膜’的研发、生产、销售与服务。公司秉持着‘将一片复合反渗透膜做到极致’的精神，立志打破国际品牌垄断，实现反渗透膜国产化。",
  keywords: "苏瑞膜/苏瑞膜官网/苏瑞膜纳米科技/苏州苏瑞膜纳米科技/苏州苏瑞膜",
};

/** 中文子站布局：只负责语言标记与 meta，其余继承根布局。 */
export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ZhLang />
      {children}
    </>
  );
}
