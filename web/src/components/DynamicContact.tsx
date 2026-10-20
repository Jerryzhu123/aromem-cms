"use client";

/**
 * 动态联系方式（fetch-with-fallback）。
 *
 * 静态首屏不渲染（后端没回填前页面保持干净），水合后拉到
 * bootstrap.footer.contact 才显示——真实联系方式由 ADP 后台维护，
 * 回填后前台自动生效，无需改代码重新构建。拉取失败静默不显示。
 * 页脚与联系我们页左栏共用本组件。
 */
import { useSiteContact } from "@/lib/content";

export default function DynamicContact() {
  const contact = useSiteContact();
  if (!contact) return null;

  const emails = (contact.emails ?? []).filter((e) => e?.trim());

  return (
    <div style={{ marginTop: 10, lineHeight: 1.9 }}>
      {contact.address?.trim() && <div>{contact.address.trim()}</div>}
      {contact.phone?.trim() && (
        <div>
          Tel: <a href={`tel:${contact.phone.trim()}`}>{contact.phone.trim()}</a>
        </div>
      )}
      {emails.map((email) => (
        <div key={email}>
          Email: <a href={`mailto:${email.trim()}`}>{email.trim()}</a>
        </div>
      ))}
    </div>
  );
}
