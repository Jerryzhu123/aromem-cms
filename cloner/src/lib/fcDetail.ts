/**
 * 详情页助手：同屏双单位 + 规格书定位。
 *
 * 双单位：数据层每个尺寸/流量字段都带自己的单位字段（overallLengthUnit 等），
 * 所以换算方向由数据决定，不靠猜测。英文站英制在前，中文站公制在前。
 * 规格书：详情页 CTA 条与卡片上的「下载规格书」都走这里，文件未上传时返回 pending 态，
 * 绝不生成死链。
 */
import { documentTitle, type FcDocument } from "@/data/filterCartridges";
import { isPending, type FcLocale } from "@/data/fcText";

const IN_TO_MM = 25.4;
const GPM_TO_M3H = 0.227125;
const PSID_TO_KPA = 6.89476;

function toNumber(value: string): number | null {
  if (!value || isPending(value)) return null;
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function fmt(n: number, digits = 0): string {
  const factor = 10 ** digits;
  return String(Math.round(n * factor) / factor);
}

function metricFirst(locale: FcLocale): boolean {
  return locale === "zh";
}

/**
 * 同屏双单位。
 *
 * 例：英文站 `40 in · 1016 mm`；中文站 `1016 mm · 40 in`。
 * 数据未到位时返回 pending 文案；非数值文本原样返回（若客户填的是区间文字）。
 */
export function dualValue(
  value: string,
  unit: string,
  pending: string,
  locale: FcLocale,
  kind: "length" | "flow" | "temperature" | "pressure",
): string {
  const n = toNumber(value);
  if (n === null) {
    if (!value || isPending(value)) return pending;
    return unit ? `${value} ${unit}` : value;
  }
  const u = (unit || "").toLowerCase();
  let imperial: string;
  let metric: string;

  if (kind === "length") {
    if (u.startsWith("in")) {
      imperial = `${fmt(n)} in`;
      metric = `${fmt(n * IN_TO_MM)} mm`;
    } else {
      metric = `${fmt(n)} mm`;
      imperial = `${fmt(n / IN_TO_MM, 2)} in`;
    }
  } else if (kind === "flow") {
    if (u.includes("gpm")) {
      imperial = `${fmt(n)} GPM`;
      metric = `${fmt(n * GPM_TO_M3H, 1)} m³/h`;
    } else {
      metric = `${fmt(n, 1)} m³/h`;
      imperial = `${fmt(n / GPM_TO_M3H, 1)} GPM`;
    }
  } else if (kind === "temperature") {
    if (u.includes("f")) {
      imperial = `${fmt(n)} °F`;
      metric = `${fmt(((n - 32) * 5) / 9)} °C`;
    } else {
      metric = `${fmt(n)} °C`;
      imperial = `${fmt((n * 9) / 5 + 32)} °F`;
    }
  } else {
    if (u.includes("bar")) {
      metric = `${fmt(n, 2)} bar`;
      imperial = `${fmt((n * 100) / PSID_TO_KPA, 1)} PSID`;
    } else if (u.includes("kpa")) {
      metric = `${fmt(n)} kPa`;
      imperial = `${fmt(n / PSID_TO_KPA, 1)} PSID`;
    } else {
      imperial = `${fmt(n, 1)} PSID`;
      metric = `${fmt(n * PSID_TO_KPA)} kPa`;
    }
  }

  return metricFirst(locale) ? `${metric} · ${imperial}` : `${imperial} · ${metric}`;
}

/** 流量区间的双单位（两段各自换算）。 */
export function dualRange(
  min: string,
  max: string,
  unit: string,
  pending: string,
  locale: FcLocale,
): string {
  const a = toNumber(min);
  const b = toNumber(max);
  if (a === null || b === null) return pending;
  const u = (unit || "").toLowerCase();
  const conv = (n: number) =>
    u.includes("gpm")
      ? {
          first: `${fmt(n)} GPM`,
          second: `${fmt(n * GPM_TO_M3H, 1)} m³/h`,
        }
      : {
          first: `${fmt(n, 1)} m³/h`,
          second: `${fmt(n / GPM_TO_M3H, 1)} GPM`,
        };
  const lo = conv(a);
  const hi = conv(b);
  const zip = (k: "first" | "second") => `${lo[k]}–${hi[k]}`;
  return metricFirst(locale) ? `${zip("first")} · ${zip("second")}` : `${zip("second")} · ${zip("first")}`;
}

export interface DatasheetRef {
  title: string;
  fileUrl: string | null;
  lang: string | null;
  revision: string | null;
}

/** 找出该型号的规格书；没有规格书条目或文件未上传时，由调用方渲染 pending 态。 */
export function pickDatasheet(
  documents: FcDocument[],
  locale: FcLocale,
): DatasheetRef | null {
  const doc = documents.find((item) => item.docType === "datasheet");
  if (!doc) return null;
  return {
    title: documentTitle(doc, locale),
    fileUrl: doc.fileUrl && !isPending(doc.fileUrl) ? doc.fileUrl : null,
    lang: doc.lang,
    revision: doc.revision,
  };
}
