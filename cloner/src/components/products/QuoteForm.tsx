"use client";

import { useEffect, useState } from "react";
import { countryOptions, fcBlocks } from "@/data/fcBlocks";
import { fcText, type FcLocale } from "@/data/fcText";
import { quoteHref } from "@/lib/fcLinks";
import { submitRfq, type RfqPayload } from "@/services/cms/filterCartridges";

const EMPTY = {
  fullName: "",
  company: "",
  workEmail: "",
  phone: "",
  country: "",
  accountType: "" as RfqPayload["accountType"],
  monthlyVolume: "",
  industry: "",
  partNumber: "",
  quantity: "",
  application: "",
  targetMicron: "",
  requiredLeadTime: "",
  message: "",
  // 蜜罐字段：机器人会填，人看不到（不进入 payload）。
  website: "",
};

/**
 * 询价 / 样品申请表单（中英文共用）。
 *
 * 两种形态：
 *  - variant="full"：询价页 / 样品页的完整表单（14 字段 + 附件位 + 蜜罐）；
 *  - variant="compact"：落地页与详情页底部内嵌的 5 字段快表单（含国家/地区），
 *    其余字段给一个链接回完整表单，不把长表单塞进内容页。
 *
 * accountType 提交值固定用英文枚举（Distributor / End user），country 提交 ISO 代码，
 * 后端字段约定不因语言变化。后端 /api/v1/rfq 未就绪时不假装成功，而是给邮件兑底。
 */
export default function QuoteForm({
  requestType,
  locale = "en",
  variant = "full",
}: {
  requestType: "quote" | "sample";
  locale?: FcLocale;
  variant?: "full" | "compact";
}) {
  const dict = fcText(locale);
  const t = dict.form;
  const b = fcBlocks(locale);
  const countries = countryOptions(locale);
  const compact = variant === "compact";

  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  /** 从 URL 读预填上下文：产品页和型号对照工具都往这几个参数里写。 */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setForm((prev) => ({ ...prev, partNumber: params.get("part") ?? prev.partNumber }));
  }, []);

  function update<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const mailtoBody = encodeURIComponent(
    `Request type: ${requestType}\nPart number: ${form.partNumber}\nQuantity: ${form.quantity}\nCompany: ${form.company}\nCountry: ${form.country}\nName: ${form.fullName}`,
  );
  const mailto = `mailto:sales@aromem.com?subject=${encodeURIComponent(
    requestType === "quote" ? t.mailtoSubjectQuote : t.mailtoSubjectSample,
  )}&body=${mailtoBody}`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.website) return; // 蜜罐命中：静默丢弃
    setState("sending");
    setMessage("");

    const search = new URLSearchParams(window.location.search);
    const payload: RfqPayload = {
      requestType,
      fullName: form.fullName,
      company: form.company,
      workEmail: form.workEmail,
      phone: form.phone,
      country: form.country,
      accountType: form.accountType,
      monthlyVolume: form.monthlyVolume,
      industry: form.industry,
      partNumber: form.partNumber,
      quantity: form.quantity,
      application: form.application,
      targetMicron: form.targetMicron,
      requiredLeadTime: form.requiredLeadTime,
      message: form.message,
      sourcePath: window.location.pathname,
      sourceSeries: search.get("series") ?? "",
      sourceModel: search.get("model") ?? "",
    };

    const result = await submitRfq(payload);
    if (result.ok) {
      setState("done");
      setMessage(t.done);
      setForm(EMPTY);
    } else {
      setState("error");
      setMessage(result.message);
    }
  }

  return (
    <form className={compact ? "fc-form fc-form-compact" : "fc-form"} onSubmit={onSubmit}>
      <div className="fc-form-grid">
        <label className="fc-field">
          <span className="fc-label">
            {t.fullName}
            <span className="fc-req">*</span>
          </span>
          <input
            className="fc-input"
            name="fullName"
            required
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
        </label>

        <label className="fc-field">
          <span className="fc-label">
            {t.company}
            <span className="fc-req">*</span>
          </span>
          <input
            className="fc-input"
            name="company"
            required
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </label>

        <label className="fc-field">
          <span className="fc-label">
            {t.workEmail}
            <span className="fc-req">*</span>
          </span>
          <input
            className="fc-input"
            name="workEmail"
            type="email"
            required
            value={form.workEmail}
            onChange={(e) => update("workEmail", e.target.value)}
          />
        </label>

        <label className="fc-field">
          <span className="fc-label">
            {b.country.label}
            <span className="fc-req">*</span>
          </span>
          <select
            className="fc-select"
            name="country"
            required
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
          >
            <option value="">{b.country.placeholder}</option>
            {countries.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="fc-field">
          <span className="fc-label">
            {t.partNumber}
            <span className="fc-req">*</span>
          </span>
          <input
            className="fc-input"
            name="partNumber"
            required
            placeholder={t.partNumberPh}
            value={form.partNumber}
            onChange={(e) => update("partNumber", e.target.value)}
          />
        </label>

        {compact ? null : (
          <>
            <label className="fc-field">
              <span className="fc-label">{t.phone}</span>
              <input
                className="fc-input"
                name="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </label>

            <label className="fc-field">
              <span className="fc-label">{t.accountType}</span>
              <select
                className="fc-select"
                name="accountType"
                value={form.accountType}
                onChange={(e) => update("accountType", e.target.value)}
              >
                <option value="">{t.select}</option>
                <option value="Distributor">{t.distributor}</option>
                <option value="End user">{t.endUser}</option>
              </select>
            </label>

            <label className="fc-field">
              <span className="fc-label">{t.monthlyVolume}</span>
              <input
                className="fc-input"
                name="monthlyVolume"
                placeholder={t.monthlyVolumePh}
                value={form.monthlyVolume}
                onChange={(e) => update("monthlyVolume", e.target.value)}
              />
            </label>

            <label className="fc-field">
              <span className="fc-label">{t.industry}</span>
              <select
                className="fc-select"
                name="industry"
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
              >
                <option value="">{t.select}</option>
                {t.industries.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="fc-field">
              <span className="fc-label">{t.quantity}</span>
              <input
                className="fc-input"
                name="quantity"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
              />
            </label>

            <label className="fc-field">
              <span className="fc-label">{t.targetMicron}</span>
              <input
                className="fc-input"
                name="targetMicron"
                placeholder={t.targetMicronPh}
                value={form.targetMicron}
                onChange={(e) => update("targetMicron", e.target.value)}
              />
            </label>

            <label className="fc-field">
              <span className="fc-label">{t.leadTime}</span>
              <select
                className="fc-select"
                name="requiredLeadTime"
                value={form.requiredLeadTime}
                onChange={(e) => update("requiredLeadTime", e.target.value)}
              >
                {t.leadTimeOptions.map((item, index) => (
                  <option key={item} value={index === 0 ? "" : item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="fc-field">
              <span className="fc-label">{t.application}</span>
              <input
                className="fc-input"
                name="application"
                placeholder={t.applicationPh}
                value={form.application}
                onChange={(e) => update("application", e.target.value)}
              />
            </label>

            <label className="fc-field fc-field-full">
              <span className="fc-label">{t.message}</span>
              <textarea
                className="fc-textarea"
                name="message"
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
              />
            </label>

            <div className="fc-field fc-field-full">
              <span className="fc-label">{t.attachment}</span>
              <input className="fc-input" type="file" name="attachment" disabled />
              <p className="fc-hint">{t.attachmentHint}</p>
            </div>
          </>
        )}

        {/* 蜜罐：真实用户看不到 */}
        <div style={{ display: "none" }} aria-hidden="true">
          <label className="fc-field">
            <span className="fc-label">Website</span>
            <input
              className="fc-input"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="fc-form-actions">
        <button className="fc-btn" type="submit" disabled={state === "sending"}>
          {state === "sending"
            ? compact
              ? b.inquiry.sending
              : t.sending
            : compact
              ? b.inquiry.submit
              : requestType === "quote"
                ? t.submitQuote
                : t.submitSample}
        </button>
        <span className="fc-hint" style={{ margin: 0 }}>
          {compact ? b.inquiry.note : t.privacy}
        </span>
        {compact ? (
          <a className="fc-inline-link" href={quoteHref(locale)}>
            {b.inquiry.moreFields}
          </a>
        ) : null}
      </div>

      {state === "done" ? <div className="fc-form-result ok">{message}</div> : null}
      {state === "error" ? (
        <div className="fc-form-result warn">
          <b>{t.errorPrefix}</b>
          <br />
          {t.errorTail} <a href={mailto}>sales@aromem.com</a>
          <br />
          <span className="fc-hint">{message}</span>
        </div>
      ) : null}
    </form>
  );
}
