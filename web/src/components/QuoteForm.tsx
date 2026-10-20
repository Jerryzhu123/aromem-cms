"use client";

/**
 * 询盘表单（联系我们页）。
 *
 * - 字段与后端 /api/v1/rfq 的 RfqPayload 契约对齐（见旧工程 services/cms/filterCartridges.ts）；
 * - 演示稿里的「Interested Product」下拉在后端契约里没有独立字段，
 *   折进 message 首行，保证后台看到的上下文完整；
 * - 提交走 src/lib/request.ts 的 post（生产环境由 Nginx 代理 /api/v1 到后端，同源）；
 * - 后端不可达时给出兜底提示，不丢客户线索。
 */
import { App, Form, Input, Select } from "antd";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { post } from "@/lib/request";

/** 后端询价接口的字段契约（保持与旧工程一致，禁止随意改字段名） */
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

/** 与演示稿一致的表单项（精简版，降低留资门槛） */
interface FormValues {
  fullName: string;
  workEmail: string;
  company?: string;
  product?: string;
  message?: string;
}

/** 表单界面文案（英文默认 / 中文版） */
const COPY = {
  en: {
    nameLabel: "Your Name",
    namePh: "Your Name *",
    emailLabel: "Business Email",
    emailPh: "Business Email *",
    companyLabel: "Company Name",
    productLabel: "Interested Product",
    messageLabel: "Requirements",
    messagePh: "Tell us your specifications and quantity...",
    submit: "Send Inquiry →",
    sending: "Sending...",
    needName: "Please enter your name",
    needEmail: "Please enter your business email",
    badEmail: "Please enter a valid email address",
    success:
      "Your inquiry has been received. We will reply to your email shortly.",
    failTail: " — or email us directly with your requirements.",
    fallback: "Submission failed. Please email us directly with your requirements.",
    notice:
      "We reply to every serious business inquiry, usually within one business day.",
    productPrefix: "Interested Product: ",
    modelNotice: "This inquiry is linked to reference model",
    options: [
      "Industrial Filter Cartridges",
      "RO Membranes",
      "OEM / Private Label",
    ],
  },
  zh: {
    nameLabel: "您的姓名",
    namePh: "您的姓名 *",
    emailLabel: "商务邮箱",
    emailPh: "商务邮箱 *",
    companyLabel: "公司名称",
    productLabel: "意向产品",
    messageLabel: "需求描述",
    messagePh: "请描述您的规格要求与数量……",
    submit: "发送询盘 →",
    sending: "发送中……",
    needName: "请输入您的姓名",
    needEmail: "请输入商务邮箱",
    badEmail: "邮箱格式不正确",
    success: "您的询盘已收到，我们将尽快回复您的邮箱。",
    failTail: "——或直接发送邮件说明您的需求。",
    fallback: "提交失败，请直接发送邮件说明您的需求。",
    notice: "我们会回复每一封认真的业务询盘，通常在一个工作日内。",
    productPrefix: "意向产品：",
    modelNotice: "本次询价关联型号",
    options: ["工业滤芯", "反渗透膜", "OEM 与贴牌"],
  },
} as const;

export default function QuoteForm({ locale = "en" }: { locale?: "en" | "zh" }) {
  const t = COPY[locale];
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  /** 型号页跳转过来时携带的来源（写进后端 sourceSeries/sourceModel） */
  const [source, setSource] = useState({ series: "", model: "" });
  const pathname = usePathname();
  const { message } = App.useApp();

  // 静态导出下 contact 是预生成 HTML，查询参数只能在水合后读；
  // 用 window.location 而不是 useSearchParams，避免整页被迫退化为客户端渲染。
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const series = query.get("series")?.trim() ?? "";
    const model = query.get("model")?.trim() ?? "";
    if (!series && !model) return;
    setSource({ series, model });
    // 按系列把「意向产品」预选到对应产品线，客户不必再选一次
    if (series) {
      form.setFieldsValue({
        product: series === "ro-membranes" ? t.options[1] : t.options[0],
      });
    }
  }, [form, t]);

  async function onFinish(values: FormValues) {
    setSubmitting(true);
    const payload: RfqPayload = {
      requestType: "quote",
      fullName: values.fullName.trim(),
      company: values.company?.trim() ?? "",
      workEmail: values.workEmail.trim(),
      phone: "",
      accountType: "",
      monthlyVolume: "",
      industry: "",
      country: "",
      partNumber: "",
      quantity: "",
      application: "",
      targetMicron: "",
      requiredLeadTime: "",
      message: [
        values.product ? `${t.productPrefix}${values.product}` : "",
        values.message?.trim() ?? "",
      ]
        .filter(Boolean)
        .join("\n\n"),
      sourcePath: pathname,
      sourceSeries: source.series,
      sourceModel: source.model,
    };

    try {
      await post("/api/v1/rfq", payload);
      message.success(t.success);
      form.resetFields();
    } catch (e) {
      message.error(
        e instanceof Error
          ? `${e.message}${t.failTail}`
          : t.fallback,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      size="large"
      requiredMark={false}
      onFinish={onFinish}
    >
      {source.model && (
        <p className="notice" style={{ marginBottom: 18 }}>
          {t.modelNotice} <b>{source.model.toUpperCase()}</b>
        </p>
      )}

      <Form.Item
        name="fullName"
        label={t.nameLabel}
        rules={[{ required: true, message: t.needName }]}
      >
        <Input placeholder={t.namePh} autoComplete="name" />
      </Form.Item>

      <Form.Item
        name="workEmail"
        label={t.emailLabel}
        rules={[
          { required: true, message: t.needEmail },
          { type: "email", message: t.badEmail },
        ]}
      >
        <Input placeholder={t.emailPh} autoComplete="email" />
      </Form.Item>

      <Form.Item name="company" label={t.companyLabel}>
        <Input placeholder={t.companyLabel} autoComplete="organization" />
      </Form.Item>

      <Form.Item
        name="product"
        label={t.productLabel}
        initialValue={t.options[0]}
      >
        <Select
          options={t.options.map((opt) => ({ value: opt, label: opt }))}
        />
      </Form.Item>

      <Form.Item name="message" label={t.messageLabel}>
        <Input.TextArea rows={5} placeholder={t.messagePh} />
      </Form.Item>

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? t.sending : t.submit}
      </button>
      <p className="notice" style={{ marginTop: 14 }}>
        {t.notice}
      </p>
    </Form>
  );
}
