/**
 * 全站文案与栏目数据（单一出口，改文案只动这个文件）。
 *
 * 文案以客户概念稿为底稿，剔除了全部「演示占位」声明，
 * 按 B2B 采购方阅读习惯润色。正式公司信息（邮箱/电话/地址）上线前
 * 由客户核实后回填 CONTACT 字段。
 */

/** 一级导航（客户确认的 6 栏目结构） */
export const NAV = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "OEM & Private Label", href: "/oem" },
  { label: "Applications", href: "/applications" },
  { label: "Contact Us", href: "/contact" },
] as const;

/** 首页英雄区 */
export const HOME_HERO = {
  eyebrow: "Industrial Filtration · Global B2B Supply",
  title: "Filtration Products Built for Your Business",
  text: "Industrial filter cartridges and RO membranes for distributors, importers and private-label partners. Explore product options and discuss your sourcing requirements with us.",
  primaryCta: { label: "Explore Products", href: "/products" },
  secondaryCta: { label: "Request a Quote", href: "/contact" },
};

/** 首页产品组合三卡片 */
export const HOME_PORTFOLIO = {
  kicker: "Product Portfolio",
  title: "Two Focused Product Lines",
  intro:
    "Find industrial filtration products and membrane solutions for a wide range of business requirements.",
  cards: [
    {
      title: "Industrial Filter Cartridges",
      text: "Pleated, high-flow and other industrial cartridge options, subject to specification confirmation.",
      href: "/products",
      cta: "View Products",
      art: "",
    },
    {
      title: "RO Membranes",
      text: "Reverse osmosis membrane products for water treatment applications.",
      href: "/products",
      cta: "View Products",
      art: "ro",
    },
    {
      title: "OEM & Private Label",
      text: "Discuss labeling, packaging and specification options for your distribution brand.",
      href: "/oem",
      cta: "Explore Services",
      art: "custom",
    },
  ],
};

/** 首页合作伙伴分栏 */
export const HOME_PARTNER = {
  kicker: "Built for B2B Partners",
  title: "A Practical Supply Partner for Distributors",
  intro:
    "We focus on helping importers, wholesalers and filtration distributors source suitable products with clear specifications, responsive communication and dependable lead times.",
  points: [
    "Clear product specifications and honest lead times",
    "Responsive communication in English across time zones",
    "Flexible OEM and private-label discussions",
    "Long-term supply cooperation over one-off deals",
  ],
};

/** 首页四条支撑能力（逐字搬自 V19 index.html 的「How we support your business」） */
export const HOME_SUPPORT = {
  kicker: "How we support your business",
  title: "Reliable sourcing, from specification to shipment.",
  items: [
    {
      num: "01",
      title: "Manufacturing Support",
      text: "Access to an established filtration manufacturing partner network.",
    },
    {
      num: "02",
      title: "Quality Control",
      text: "Supplier coordination and review of product quality requirements.",
    },
    {
      num: "03",
      title: "Technical Support",
      text: "Help comparing filtration specifications and selecting product options.",
    },
    {
      num: "04",
      title: "Global Supply",
      text: "Export packaging, documentation and shipment coordination.",
    },
  ],
};

/** 首页行业条带（逐字搬自 V19 index.html 的「Industries」） */
export const HOME_INDUSTRIES = {
  kicker: "Industries",
  title: "Filtration across industrial processes",
  items: [
    "Industrial water treatment",
    "Chemical processing",
    "Paints & coatings",
    "Food & beverage",
    "General process filtration",
  ],
  cta: { label: "Explore applications", href: "/applications" },
};

/** 关于我们 */
export const ABOUT = {
  eyebrow: "About SURMEM",
  title: "Focused on Filtration Supply",
  intro:
    "Supporting overseas businesses with industrial filter cartridge and RO membrane sourcing.",
  heading: "Your B2B Filtration Product Partner",
  /* 以下三段逐字搬自 V19 about.html（成立年份、所在地、供应链定位） */
  lead: "Founded in 2014, SURMEM supports industrial filtration and water treatment buyers with product sourcing, technical coordination and international supply services.",
  location:
    "Based in Suzhou, China, we work with established manufacturing partners to serve distributors, importers, OEM buyers and industrial customers. Our portfolio covers high-flow filter cartridges, pleated cartridges, depth filtration products and 4-inch and 8-inch reverse osmosis membrane elements.",
  panelTitle: "What Matters to Our Customers",
  panelPoints: [
    "Clear product specifications",
    "Reliable communication",
    "OEM and packaging discussions",
    "Long-term supply cooperation",
  ],
  sourcingTitle: "Built around your sourcing needs",
  sourcingBody:
    "We focus on responsive communication, clear product selection, specification review and practical coordination with our manufacturing partners. For private-label projects, we can discuss branding, packaging and product customization subject to technical and supplier feasibility.",
  strengthsTitle: "Why work with SURMEM?",
  strengths: [
    {
      title: "Manufacturing Support",
      text: "Coordination with established manufacturing partners for industrial filtration products.",
    },
    {
      title: "Quality Control",
      text: "Product requirements and applicable quality documentation reviewed with suppliers.",
    },
    {
      title: "Technical Support",
      text: "Assistance with model selection, specifications and application inquiries.",
    },
    {
      title: "Global Supply",
      text: "Export-oriented communication, packaging discussions and shipment coordination.",
    },
  ],
  disclaimer:
    "Manufacturing facilities, laboratory resources and product certificates referenced in supporting materials belong to the respective manufacturing partners unless otherwise stated.",
  cta: { label: "Discuss Your Requirements", href: "/contact" },
};

/** 产品中心 */
export const PRODUCTS = {
  eyebrow: "Products",
  /**
   * 大标题不再写死：哪些产品线真的有系列，就只写哪几条。
   * 两条线都有时由这个连接词拼起来，只剩一条时直接用它自己的名字。
   */
  titleJoiner: " & ",
  intro:
    "Browse our product series and the model references available in each one. All specifications require supplier confirmation before quotation.",
  lines: [
    {
      kicker: "Main Product Line",
      title: "Industrial Filter Cartridges",
      cards: [
        {
          title: "Microporous Pleated Filter Cartridges",
          text: "Specification-dependent filtration options for industrial processes.",
          cta: "Ask for Specifications",
          href: "/products/pleated",
        },
        {
          title: "High Flow Filter Cartridges",
          text: "Large-format filter solutions; confirm dimensions, micron ratings and end connections.",
          cta: "Request Details",
          href: "/products/high-flow",
        },
        {
          title: "Multi-fold Filter Cartridges",
          text: "High-surface-area pleated construction for longer service life at a given flow rate.",
          cta: "Request Details",
          href: "/products/multifold",
        },
        {
          title: "Pool Filter Cartridges",
          text: "Replacement cartridges for pool and spa circulation systems; confirm size and end configuration.",
          cta: "Request Details",
          href: "/products/pool",
        },
      ],
    },
    {
      kicker: "Second Product Line",
      title: "RO Membranes",
      cards: [
        {
          title: "Reverse Osmosis Membranes",
          text: "Membrane selection based on application and confirmed technical specifications.",
          cta: "Request Product Information",
          href: "/products/ro-membranes",
        },
      ],
    },
  ],
};

/** OEM 及品牌定制 */
export const OEM = {
  eyebrow: "OEM & Private Label",
  title: "Your Brand. Your Product Line.",
  intro:
    "Discuss branding, labeling and packaging options for industrial filtration products.",
  heading: "Private-Label Options for Distributors",
  body: "We welcome inquiries about customer-branded filter products and packaging. Available customization depends on product model, minimum quantities and confirmed supplier capabilities.",
  points: [
    "Private-label product branding",
    "Custom labels and outer packaging",
    "Product specification discussions",
    "Bulk purchasing and supply planning",
  ],
  /* 三张定制范围卡 + 报价依赖声明，逐字搬自 V19 oem.html */
  cards: [
    {
      title: "Branding & Labels",
      text: "Discuss private-label artwork and product identification.",
    },
    {
      title: "Packaging",
      text: "Explore carton, individual pack and bulk packaging requirements.",
    },
    {
      title: "Product Configuration",
      text: "Review filtration media, dimensions, micron ratings and end connections.",
    },
  ],
  disclaimer:
    "Customization, MOQ, tooling, lead times and certifications are quotation-dependent and must be confirmed before commitment.",
  cta: "Discuss Your Project",
};

/** 应用行业 */
export const APPLICATIONS = {
  eyebrow: "Applications",
  title: "Industrial Filtration Applications",
  intro:
    "Product suitability depends on media, process conditions and technical requirements.",
  heading: "Industries We Can Discuss",
  cards: [
    {
      title: "Hydraulic Systems",
      text: "Filtration needs in hydraulic fluid circuits.",
    },
    {
      title: "Chemical Processing",
      text: "Process fluid filtration applications.",
    },
    {
      title: "Paint & Coatings",
      text: "Filtration for coating production processes.",
    },
    {
      title: "Food & Beverage",
      text: "Application-specific filtration, subject to compliance review.",
    },
    {
      title: "Industrial Water Treatment",
      text: "Cartridge prefiltration and RO membrane solutions.",
    },
    {
      title: "Power & Utilities",
      text: "Filtration for power generation and utility water systems.",
    },
    {
      title: "General Process Filtration",
      text: "Cartridge filtration for general industrial process fluids.",
    },
  ],
  notice:
    "Industry examples do not imply that every product is certified or suitable for every use. Verify technical and regulatory requirements.",
};

/** 联系我们（正式联系方式上线前由客户核实回填） */
export const CONTACT = {
  eyebrow: "Contact Us",
  title: "Let's Talk About Your Filtration Needs",
  intro:
    "Send your product requirements and we can discuss specifications and quotation details.",
  heading: "Request a Quote",
  help: "For a useful quote, include product type, dimensions, micron rating, quantity, destination and any private-label requirements.",
  productOptions: [
    "Industrial Filter Cartridges",
    "RO Membranes",
    "OEM / Private Label",
  ],
};

/** 页脚 */
export const FOOTER = {
  tagline: "Industrial Filtration Products · OEM & Private Label Solutions",
  copyright: `© ${new Date().getFullYear()} SURMEM. All rights reserved.`,
};
