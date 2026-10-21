"use client";

/**
 * RO 膜选型询价表单（/ro-selection-guide 与 /zh/ro-selection-guide 共用）。
 *
 * 字段沿用客户交付包 V19 的选型工作单：型号、膜尺寸、数量、进水 TDS、
 * 温度、运行压力、目标产水量、回收率、目的国、其他要求。
 *
 * 后端契约不变（RfqPayload 没有 TDS/压力这类字段）：
 * 能直接映射的走对应字段，映射不上的统一拼进 message 首部，
 * 保证后台看到的上下文完整，也避免为了几个字段去改接口契约。
 */
import { App, Form, Input, Select } from "antd";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RO_COMPARISON } from "@/data/catalog";
import { post } from "@/lib/request";

interface RfqPayload {
  requestType: "quote" | "sample";
  fullName: string;
  company: string;
  workEmail: string;
  phone: string;
  accountType: "Distributor" | "End user" | "";
  monthlyVolume: string;
  industry: string;
  country: string;
  partNumber: string;
  quantity: string;
  application: string;
  targetMicron: string;
  requiredLeadTime: string;
  message: string;
  sourcePath: string;
  sourceSeries: string;
  sourceModel: string;
}

interface FormValues {
  fullName: string;
  workEmail: string;
  company?: string;
  model: string;
  application?: string;
  membraneSize: string;
  quantity?: string;
  feedTds?: string;
  feedTemp?: string;
  pressure?: string;
  targetFlow?: string;
  recovery?: string;
  country?: string;
  notes?: string;
}

const COPY = {
  en: {
    eyebrow: "RO membranes",
    title: "Membrane Selection & RFQ",
    intro:
      "Share your operating conditions and we can suggest a suitable membrane series and prepare a relevant quotation. Every field is optional except your contact details.",
    name: "Your Name",
    email: "Business Email",
    company: "Company",
    model: "Model of interest",
    modelNa: "Not sure / please recommend",
    application: "Application",
    applicationPh: "e.g. boiler feed water, drinking water, wastewater reuse",
    size: "Membrane size",
    sizeNa: "Not sure",
    quantity: "Quantity (pieces)",
    tds: "Feed TDS (mg/L)",
    temp: "Feed temperature (°C)",
    pressure: "Operating pressure (bar)",
    flow: "Target permeate flow",
    recovery: "Recovery (%)",
    country: "Destination country",
    notes: "Other requirements",
    notesPh: "Pretreatment, available footprint, timeline, brand preference…",
    submit: "Request Quotation →",
    sending: "Sending...",
    needName: "Please enter your name",
    needEmail: "Please enter your business email",
    badEmail: "Please enter a valid email address",
    success: "Your request has been received. We will reply to your email shortly.",
    fail: "Submission failed. Please email sales@surmem.com directly with your requirements.",
    notice:
      "Nominal flow and rejection depend on test conditions. Confirm the exact datasheet, feed-water chemistry, pressure limits and cleaning compatibility before purchase.",
    compare: "Compare all 10 models",
    back: "Back to RO membranes",
  },
  zh: {
    eyebrow: "反渗透膜",
    title: "膜选型与询价",
    intro:
      "填写运行条件，我们据此推荐合适的膜系列并准备对应的报价。除联系方式外，其余字段均可留空。",
    name: "您的姓名",
    email: "商务邮箱",
    company: "公司名称",
    model: "意向型号",
    modelNa: "不确定 / 请推荐",
    application: "应用场景",
    applicationPh: "例如锅炉补给水、饮用水、废水回用",
    size: "膜尺寸",
    sizeNa: "不确定",
    quantity: "数量（支）",
    tds: "进水 TDS（mg/L）",
    temp: "进水温度（°C）",
    pressure: "运行压力（bar）",
    flow: "目标产水量",
    recovery: "回收率（%）",
    country: "目的国家",
    notes: "其他要求",
    notesPh: "预处理方式、可用占地、时间要求、品牌偏好……",
    submit: "提交询价 →",
    sending: "提交中……",
    needName: "请输入您的姓名",
    needEmail: "请输入商务邮箱",
    badEmail: "邮箱格式不正确",
    success: "已收到您的选型需求，我们会尽快回复您的邮箱。",
    fail: "提交失败，请直接发送邮件至 sales@surmem.com 说明需求。",
    notice:
      "标称产水量与脱盐率取决于测试条件。采购前请确认确切数据表、进水水质、压力限值与清洗相容性。",
    compare: "查看 10 款对比",
    back: "返回反渗透膜",
  },
} as const;

export default function RoSelectionForm({
  locale = "en",
  models,
}: {
  locale?: "en" | "zh";
  /** 后台还在售的型号 slug（页面从接口取好传进来），下拉只列这些 */
  models: string[];
}) {
  const t = COPY[locale];
  const base = locale === "zh" ? "/zh" : "";
  // 型号清单跟着后台走：下架的型号不出现，一个都不剩时页面层直接 404
  const available = RO_COMPARISON.filter((row) => models.includes(row.slug));
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const pathname = usePathname();
  const { message } = App.useApp();

  const modelOptions = [
    { value: "", label: t.modelNa },
    ...available.map((row) => ({ value: row.model, label: row.model })),
  ];

  async function onFinish(values: FormValues) {
    setSubmitting(true);
    const picked = available.find((row) => row.model === values.model);
    const detail = [
      values.membraneSize ? `${t.size}: ${values.membraneSize}` : "",
      values.feedTds ? `${t.tds}: ${values.feedTds}` : "",
      values.feedTemp ? `${t.temp}: ${values.feedTemp}` : "",
      values.pressure ? `${t.pressure}: ${values.pressure}` : "",
      values.targetFlow ? `${t.flow}: ${values.targetFlow}` : "",
      values.recovery ? `${t.recovery}: ${values.recovery}` : "",
      values.notes?.trim() ? `${t.notes}: ${values.notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const payload: RfqPayload = {
      requestType: "quote",
      fullName: values.fullName.trim(),
      company: values.company?.trim() ?? "",
      workEmail: values.workEmail.trim(),
      phone: "",
      accountType: "",
      monthlyVolume: "",
      industry: "",
      country: values.country?.trim() ?? "",
      partNumber: values.model || "",
      quantity: values.quantity?.trim() ?? "",
      application: values.application?.trim() ?? "",
      targetMicron: "",
      requiredLeadTime: "",
      message: detail,
      sourcePath: pathname,
      sourceSeries: "ro-membranes",
      sourceModel: picked?.slug ?? "",
    };

    try {
      await post("/api/v1/rfq", payload);
      message.success(t.success);
      form.resetFields();
    } catch {
      message.error(t.fail);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="subhero">
        <div className="wrap">
          <div className="eyebrow">{t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <Form
            form={form}
            layout="vertical"
            size="large"
            requiredMark={false}
            onFinish={onFinish}
          >
            <div className="form-grid">
              <Form.Item
                name="fullName"
                label={t.name}
                rules={[{ required: true, message: t.needName }]}
              >
                <Input autoComplete="name" />
              </Form.Item>

              <Form.Item
                name="workEmail"
                label={t.email}
                rules={[
                  { required: true, message: t.needEmail },
                  { type: "email", message: t.badEmail },
                ]}
              >
                <Input autoComplete="email" />
              </Form.Item>

              <Form.Item name="company" label={t.company}>
                <Input autoComplete="organization" />
              </Form.Item>

              <Form.Item name="model" label={t.model} initialValue="">
                <Select options={modelOptions} />
              </Form.Item>

              <Form.Item name="application" label={t.application}>
                <Input placeholder={t.applicationPh} />
              </Form.Item>

              <Form.Item name="membraneSize" label={t.size} initialValue="">
                <Select
                  options={[
                    { value: "", label: t.sizeNa },
                    { value: "4040", label: "4040 (4 inch)" },
                    { value: "8040", label: "8040 (8 inch)" },
                  ]}
                />
              </Form.Item>

              <Form.Item name="quantity" label={t.quantity}>
                <Input inputMode="numeric" />
              </Form.Item>

              <Form.Item name="feedTds" label={t.tds}>
                <Input inputMode="numeric" />
              </Form.Item>

              <Form.Item name="feedTemp" label={t.temp}>
                <Input inputMode="decimal" />
              </Form.Item>

              <Form.Item name="pressure" label={t.pressure}>
                <Input inputMode="decimal" />
              </Form.Item>

              <Form.Item name="targetFlow" label={t.flow}>
                <Input />
              </Form.Item>

              <Form.Item name="recovery" label={t.recovery}>
                <Input inputMode="decimal" />
              </Form.Item>

              <Form.Item name="country" label={t.country}>
                <Input autoComplete="country-name" />
              </Form.Item>
            </div>

            <Form.Item name="notes" label={t.notes}>
              <Input.TextArea rows={4} placeholder={t.notesPh} />
            </Form.Item>

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? t.sending : t.submit}
            </button>

            <p className="notice" style={{ marginTop: 16 }}>
              {t.notice}
            </p>

            <p style={{ marginTop: 18 }}>
              <a className="link" href={`${base}/ro-comparison`}>
                {t.compare} →
              </a>
            </p>
          </Form>
        </div>
      </section>
    </>
  );
}
