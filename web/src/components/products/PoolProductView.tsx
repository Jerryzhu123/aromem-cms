"use client";

/**
 * 泳池滤芯单品页（对标 darllyfilter.com 商品页）。
 *
 * 版式取自原站：
 *   左：主图 + 缩略图（点击切换），比例 3:2
 *   右：标题 → 件号 → 规格表（OD/Length 一行、Top/Bottom 一行、Manufacturer 与
 *       Replacement 各占整行）→ QTY 步进器 → ASK ABOUT THIS PRODUCT
 *
 * 两处刻意的差异：
 *   1. 原站按钮点开的是一个 CF7 表单弹窗（First/Last/Company/Country/Email/Phone/Message）。
 *      这里沿用同样的字段，但提交走本站既有的 /api/v1/rfq 契约，不另开接口；
 *      件号与数量直接带进 partNumber / quantity，后台能看出客户问的是哪一款。
 *   2. 原站有一部分商品没有实拍图（只有相关产品缩略图），这里不拿别人的图凑数，
 *      给一个带件号的占位块。
 */
import { useState } from "react";
import Link from "next/link";
import { App, Form, Input, Modal } from "antd";
import type { Locale } from "@/data/catalog";
import type { PoolItem } from "@/data/pool";
import type { PoolDetail } from "@/data/pool-detail";
import { post } from "@/lib/request";

const COPY = {
  en: {
    home: "Home",
    products: "Products",
    category: "Pool Filter Cartridges",
    sku: "Part No.",
    od: "OD",
    length: "Length",
    top: "Top",
    bottom: "Bottom",
    maker: "Manufacturer",
    replacement: "Replacement",
    qty: "QTY",
    ask: "ASK ABOUT THIS PRODUCT",
    noImage: "Photo not available",
    note: "Dimensions and cross references are reproduced from the manufacturer's catalogue and require confirmation before quotation.",
    askTitle: "Ask about this product",
    firstName: "First Name",
    lastName: "Last Name",
    company: "Company",
    country: "Country",
    email: "Business Email",
    phone: "Phone",
    message: "Message",
    messagePh: "Quantity, delivery port, target price or any other requirement…",
    needFirst: "Please enter your first name",
    needEmail: "Please enter your business email",
    badEmail: "Please enter a valid email address",
    submit: "Send Inquiry →",
    sending: "Sending...",
    success: "Your inquiry has been received. We will reply to your email shortly.",
    fail: "Submission failed. Please email us directly with your requirements.",
    cancel: "Cancel",
    qtyLabel: "Quantity",
  },
  zh: {
    home: "首页",
    products: "产品中心",
    category: "泳池滤芯",
    sku: "件号",
    od: "外径",
    length: "长度",
    top: "上接口",
    bottom: "下接口",
    maker: "原厂对应",
    replacement: "可替代型号",
    qty: "数量",
    ask: "咨询该产品",
    noImage: "暂无实拍图",
    note: "尺寸与替代型号取自原厂目录，报价前须经供应商确认。",
    askTitle: "咨询该产品",
    firstName: "名",
    lastName: "姓",
    company: "公司名称",
    country: "国家/地区",
    email: "商务邮箱",
    phone: "联系电话",
    message: "需求说明",
    messagePh: "数量、交货口岸、目标价或其他要求……",
    needFirst: "请输入您的名字",
    needEmail: "请输入商务邮箱",
    badEmail: "邮箱格式不正确",
    submit: "发送询盘 →",
    sending: "发送中……",
    success: "您的询盘已收到，我们将尽快回复您的邮箱。",
    fail: "提交失败，请直接发送邮件说明您的需求。",
    cancel: "取消",
    qtyLabel: "数量",
  },
} as const;

interface FormValues {
  firstName: string;
  lastName?: string;
  company?: string;
  country?: string;
  workEmail: string;
  phone?: string;
  message?: string;
}

export default function PoolProductView({
  item,
  detail,
  locale,
}: {
  item: PoolItem;
  detail: PoolDetail;
  locale: Locale;
}) {
  const t = COPY[locale];
  const base = locale === "zh" ? "/zh" : "";
  /* 件号与品牌保留原文，只有面积单位跟着语言走 */
  const name = locale === "zh" ? item.nameZh : item.name;
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();

  const images = detail.images;
  const current = images[Math.min(active, Math.max(0, images.length - 1))];

  async function onFinish(values: FormValues) {
    setSending(true);
    try {
      await post("/api/v1/rfq", {
        requestType: "quote",
        fullName: [values.firstName, values.lastName].filter(Boolean).join(" ").trim(),
        company: values.company?.trim() ?? "",
        workEmail: values.workEmail.trim(),
        phone: values.phone?.trim() ?? "",
        accountType: "",
        monthlyVolume: "",
        industry: "",
        country: values.country?.trim() ?? "",
        partNumber: item.sku,
        quantity: String(qty),
        application: "",
        targetMicron: "",
        requiredLeadTime: "",
        message: values.message?.trim() ?? "",
        sourcePath: typeof window === "undefined" ? "" : window.location.pathname,
        sourceSeries: "pool",
        sourceModel: item.sku,
      });
      message.success(t.success);
      form.resetFields();
      setOpen(false);
    } catch (e) {
      message.error(e instanceof Error ? `${e.message}` : t.fail);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pl-page">
      <div className="dl-container">
        <div className="pl-crumbs">
          <p>
            <Link href={base || "/"}>{t.home}</Link>
            <span> / </span>
            <Link href={`${base}/products`}>{t.products}</Link>
            <span> / </span>
            <Link href={`${base}/products/pool`}>{t.category}</Link>
            <span> / </span>
            <span className="pl-crumb-last">{name}</span>
          </p>
        </div>

        <section className="pl-detail">
          <div className="pl-media">
            <div className="pl-main">
              {current ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={current} alt={name} />
              ) : (
                <div className="pl-noimg">
                  <span>{item.sku}</span>
                  <em>{t.noImage}</em>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="pl-thumbs">
                {images.map((src, i) => (
                  <button
                    type="button"
                    key={src}
                    className={i === Math.min(active, images.length - 1) ? "on" : undefined}
                    onClick={() => setActive(i)}
                    aria-label={`${name} ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pl-info">
            <h1>{name}</h1>
            <p className="pl-sku">{item.sku}</p>

            <table className="pl-spec">
              <tbody>
                <tr>
                  <th>{t.od}</th>
                  <td>{detail.od}</td>
                  <th>{t.length}</th>
                  <td>{detail.length}</td>
                </tr>
                <tr>
                  <th>{t.top}</th>
                  <td>{detail.top}</td>
                  <th>{t.bottom}</th>
                  <td>{detail.bottom}</td>
                </tr>
                <tr>
                  <th>{t.maker}</th>
                  <td colSpan={3}>{detail.maker}</td>
                </tr>
                <tr>
                  <th>{t.replacement}</th>
                  <td colSpan={3}>
                    {detail.replacements.length
                      ? detail.replacements.map((x) => <span key={x}>{x}</span>)
                      : "—"}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="pl-qty">
              <p>{t.qty}</p>
              <div className="pl-stepper">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="minus"
                >
                  −
                </button>
                <input
                  value={qty}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/\D/g, ""));
                    setQty(Number.isFinite(n) && n > 0 ? n : 1);
                  }}
                  inputMode="numeric"
                  aria-label={t.qtyLabel}
                />
                <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="plus">
                  +
                </button>
              </div>
            </div>

            <button type="button" className="pl-ask" onClick={() => setOpen(true)}>
              {t.ask}
            </button>
            <p className="pl-note">{t.note}</p>
          </div>
        </section>
      </div>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={`${t.askTitle} · ${item.sku}`}
        footer={null}
        width={640}
        destroyOnHidden
      >
        <p className="pl-modal-sub">{name}</p>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          initialValues={{ country: "" }}
        >
          <div className="pl-form-row">
            <Form.Item
              name="firstName"
              label={t.firstName}
              rules={[{ required: true, message: t.needFirst }]}
            >
              <Input autoComplete="given-name" />
            </Form.Item>
            <Form.Item name="lastName" label={t.lastName}>
              <Input autoComplete="family-name" />
            </Form.Item>
          </div>

          <div className="pl-form-row">
            <Form.Item name="company" label={t.company}>
              <Input autoComplete="organization" />
            </Form.Item>
            <Form.Item name="country" label={t.country}>
              <Input autoComplete="country-name" />
            </Form.Item>
          </div>

          <div className="pl-form-row">
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
            <Form.Item name="phone" label={t.phone}>
              <Input autoComplete="tel" />
            </Form.Item>
          </div>

          <Form.Item name="message" label={t.message}>
            <Input.TextArea rows={4} placeholder={t.messagePh} />
          </Form.Item>

          <p className="pl-modal-meta">
            {t.sku}: <b>{item.sku}</b> · {t.qtyLabel}: <b>{qty}</b>
          </p>

          <div className="pl-modal-actions">
            <button type="button" className="pl-cancel" onClick={() => setOpen(false)}>
              {t.cancel}
            </button>
            <button type="submit" className="pl-submit" disabled={sending}>
              {sending ? t.sending : t.submit}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
