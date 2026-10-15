import type { FcProduct } from "@/data/filterCartridges";
import { fcText, isPending, type FcLocale } from "@/data/fcText";
import { fcBlocks } from "@/data/fcBlocks";
import { dualRange, dualValue } from "@/lib/fcDetail";

function Cell({ value, pending }: { value: string; pending: string }) {
  if (isPending(value)) return <span className="fc-pending">{pending}</span>;
  return <>{value}</>;
}

function Row({ label, value, pending }: { label: string; value: string; pending: string }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>
        <Cell value={value} pending={pending} />
      </td>
    </tr>
  );
}

function join(values: string[], pending: string): string {
  const real = values.filter((v) => !isPending(v));
  return real.length ? real.join(" · ") : pending;
}

/**
 * 产品详情页规格表（中英文共用）。
 *
 * 尺寸与流量、温度、压差**同屏给双单位**（英文站英制在前，中文站公制在前）：
 * 换算方向由数据自带的单位字段决定，客户参数到位后不需要再改组件。
 */
export default function SpecTable({
  product,
  locale = "en",
}: {
  product: FcProduct;
  locale?: FcLocale;
}) {
  const t = fcText(locale);
  const s = t.spec;
  const b = fcBlocks(locale);

  const length = dualValue(
    product.overallLength,
    product.overallLengthUnit,
    t.pending,
    locale,
    "length",
  );
  const od = dualValue(
    product.outsideDiameter,
    product.outsideDiameterUnit,
    t.pending,
    locale,
    "length",
  );
  const idv = dualValue(
    product.innerDiameter,
    product.outsideDiameterUnit,
    t.pending,
    locale,
    "length",
  );
  const flow = dualRange(
    product.flowRateMin,
    product.flowRateMax,
    product.flowRateUnit,
    t.pending,
    locale,
  );
  const temp = dualValue(
    product.maxTemperatureC,
    "°C",
    t.pending,
    locale,
    "temperature",
  );
  const deltaP = dualValue(
    product.maxPressureDropPsid,
    "PSID",
    t.pending,
    locale,
    "pressure",
  );

  return (
    <table className="fc-spec">
      <caption className="sr-only">{s.caption}</caption>
      <tbody>
        <Row label={s.model} value={product.model} pending={t.pending} />
        <Row label={s.series} value={product.seriesSlug} pending={t.pending} />
        <Row label={s.micronAbs} value={product.micronAbsolute} pending={t.pending} />
        <Row label={s.micronNom} value={product.micronNominal} pending={t.pending} />
        <Row
          label={s.media}
          value={join(product.mediaMaterial, t.pending)}
          pending={t.pending}
        />
        <Row label={s.overallLength} value={length} pending={t.pending} />
        <Row label={s.od} value={od} pending={t.pending} />
        <Row label={s.id} value={idv} pending={t.pending} />
        <Row label={s.endCap} value={product.endCap} pending={t.pending} />
        <Row label={s.connection} value={product.connection} pending={t.pending} />
        <Row label={s.flow} value={flow} pending={t.pending} />
        <Row label={s.maxTemp} value={temp} pending={t.pending} />
        <Row label={s.deltaP} value={deltaP} pending={t.pending} />
        <Row
          label={s.industries}
          value={join(product.applicationIndustries, t.pending)}
          pending={t.pending}
        />
        <Row
          label={s.certs}
          value={
            product.certifications.length ? product.certifications.join(" · ") : s.certsNone
          }
          pending={t.pending}
        />
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" className="fc-spec-note-label">
            {b.spec.unitNote}
          </th>
          <td className="fc-spec-note">
            {locale === "zh"
              ? "尺寸与流量同时给出公制与英制；换算值保留整数（英寸保留两位小数）。"
              : "Dimensions and flow are given in both unit systems; converted values are rounded (inches to two decimals)."}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
