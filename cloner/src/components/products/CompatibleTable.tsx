import { compatibleNote, type FcCompatibleModel } from "@/data/filterCartridges";
import { fcText, type FcLocale } from "@/data/fcText";

/** 兼容性免责声明（英文，兼容旧引用）。 */
export const COMPAT_DISCLAIMER = fcText("en").compat.disclaimer;

/**
 * 可替代 / 兼容型号表（客户点名要求的区块，中英文共用）。
 *
 * 数据来源：产品数据里的 compatibleModels（未来由 CMS 的 product_compatible_model 子表提供）。
 * 当前为合成占位行，页面上有明确标注，避免被误认为真实对照关系。
 */
export default function CompatibleTable({
  rows,
  locale = "en",
}: {
  rows: FcCompatibleModel[];
  locale?: FcLocale;
}) {
  const t = fcText(locale).compat;

  if (!rows.length) {
    return <div className="fc-empty">{t.empty}</div>;
  }

  return (
    <>
      <table className="fc-table">
        <thead>
          <tr>
            <th>{t.brand}</th>
            <th>{t.oem}</th>
            <th>{t.relation}</th>
            <th>{t.note}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.brand}-${row.oemModel}-${index}`}>
              <td>{row.brand}</td>
              <td>{row.oemModel}</td>
              <td>{t.relationLabels[row.relation] ?? row.relation}</td>
              <td>{compatibleNote(row, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="fc-compat-note">{t.disclaimer}</p>
    </>
  );
}
