/**
 * darlly 三个品类页的原始内容（完全复制，来源 cn.darllyfiltration.com）。
 *
 * 复制的范围：三个品类页的**全部分页**，不是只有第一页。
 *   微孔折叠 /typ/micro-pleated-filter-cartridge        → 4 页 34 款
 *   大流量   /typ/high-flow-filter-cartridge            → 2 页 14 款
 *   多折     /typ/pleated-filter-cartridge              → 1 页  2 款
 * 共 50 款（原站 51 条，其中「BTH系列 – 疏水PTFE折叠滤芯」在同一页出现两次，
 * 名称与描述完全相同、仅图片与详情 ID 不同，按重复条目合并，保留首次出现）。
 *
 * 中文名称与描述逐字取自原站；英文为依据中文原文对照撰写，
 * 内容不增不减。唯一的改动：ESAA 原文「P ES」为排印断字，已改回「PES」。
 *
 * 子分类归属取自原站 12 个子分类页的真实列表（含其分页），
 * 只保留与本清单有交集的型号；交集为空时不编造，页面给空状态。
 *
 * 数据源留档：_compare/darlly/（cats-full.json / sub-full.json / 页面 HTML）。
 */
import type { Bilingual } from "./catalog";

/** 品类页里的一件产品 */
export interface DarllyItem {
  /** URL 段（型号小写，如 stb） */
  slug: string;
  /** 型号前缀，用于详情页与询价参数 */
  model: string;
  /** 产品图（已下载到 public/products/darlly/） */
  img: string;
  name: Bilingual;
  desc: Bilingual;
  /** 原站详情页，作为文案出处存档 */
  sourceUrl: string;
}

/** 「选择类别」下的一个子分类 */
export interface DarllySubcat {
  key: string;
  label: Bilingual;
  /** 归属本子分类的型号 slug（来自原站子分类页） */
  models: string[];
}

/** 一个品类页 */
export interface DarllyCategory {
  slug: string;
  banner: string;
  /** 面包屑末级文字 */
  crumb: Bilingual;
  /** 「选择类别」标题 */
  header: Bilingual;
  /** 「所有」按钮文字 */
  allLabel: Bilingual;
  /** 每页条数（原站固定 9 条一页） */
  pageSize: number;
  subcats: DarllySubcat[];
  items: DarllyItem[];
}

const BANNER_PRODUCT = "/products/darlly/banner-product.jpg";

const ALL: Bilingual = { en: "All", zh: "所有" };
const HEADER: Bilingual = { en: "Choose Category", zh: "选择类别" };

/** 原站分页固定 9 条一页 */
const PAGE_SIZE = 9;

/** 微孔折叠滤芯（原站 4 页合并，34 款，顺序照抄） */
const PLEATED_ITEMS: DarllyItem[] = [
  {
    slug: "stb",
    model: "STB",
    img: "/products/darlly/STB.jpg",
    name: { en: "STB Series Polyester Pleated Filter Cartridges", zh: "STB系列聚酯折叠滤芯" },
    desc: { en: "The STB Series polyester pleated cartridge is a cost-effective depth filter with a broad application range. Its all-polyester construction withstands temperatures up to 120 °C, and the 2.66 in and 2.77 in outside diameters suit small-size housings. Every cartridge is manufactured in a cleanroom and is highly clean at delivery.", zh: "STB系列聚酯折叠滤芯是一款经济高效的深层过滤滤芯，应用范围广，产品采用全聚酯结构，能承受最高 120℃的高温。2.66 ''和 2.77''外径尺寸满足小尺寸套筒需求。所有滤芯均在洁净车间生产，高度洁净。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/stb-series-pleated-polyester-filter-cartridges",
  },
  {
    slug: "btg",
    model: "BTG",
    img: "/products/darlly/BTG.jpg",
    name: { en: "BTG Series – Corrosion-Resistant Hydrophobic PTFE Sterilizing Filter Cartridges", zh: "BTG系列 – 耐腐蚀疏水聚四氟乙烯膜除菌滤芯" },
    desc: { en: "BTG Series cartridges are made with PTFE membrane, offering excellent resistance to organic and inorganic chemical attack together with natural hydrophobicity. They are widely used in fermentation-based industries such as biological products, food additives and enzyme preparations. Each unit is 100 % integrity tested before shipment to ensure consistent quality.", zh: "BTG系列滤芯使用聚四氟乙烯膜（PTFE）制取，具有极好的耐有机、无机化学腐蚀性和天然的疏水性，广泛应用于生物制品、食品添加剂、酶制剂等发酵行业，出厂前100%完整性测试，确保产品稳定质量。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/btg-series-ptfe-pleated-filter-cartridges",
  },
  {
    slug: "131",
    model: "131",
    img: "/products/darlly/131.jpg",
    name: { en: "131 Series Pleated Filter Cartridges", zh: "131系列折叠滤芯" },
    desc: { en: "The 131 Series is designed for high-flow duties in the panel industry. Its very large filtration area delivers high flow with fewer change-outs, reducing downtime. A range of filter media is available to cover most process applications.", zh: "131系列专为面板行业大流量需求的应用场合设计。超大的过滤面积可以提供极大的流量以及更少的更换频次，减少停机时间。各种滤材可选，满足绝大多数制程场合应用。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/131-series-pleated-filter-cartridge",
  },
  {
    slug: "ebaa",
    model: "EBAA",
    img: "/products/darlly/EBAA.jpg",
    name: { en: "EBAA Series PES Pleated Filter Cartridges", zh: "EBAA系列PES折叠滤芯" },
    desc: { en: "EBAA Series PES pleated cartridges use hydrophilic polyethersulfone membrane with no fibre release, very low extractables and broad chemical compatibility. Performance is consistent.", zh: "EBAA系列PES折叠滤芯采用亲水聚醚砜（PES）滤膜，无纤维脱落，滤材溶出物极低，具有广泛的化学兼容性。性能稳定。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/ebaa-series-pes-pleated-filter-cartridge",
  },
  {
    slug: "stv",
    model: "STV",
    img: "/products/darlly/STV.jpg",
    name: { en: "STV Series PVDF Hardware Filter Cartridges", zh: "STV系列聚偏氟乙烯硬件滤芯" },
    desc: { en: "STV Series cartridges are built from PTFE, giving excellent tolerance of organic and inorganic corrosive media plus the natural hydrophobicity of the medium. They are widely used to filter aggressive solvents, strongly corrosive liquids and strong oxidisers. All-PVDF support, drainage and core construction allows the cartridge to withstand aggressive solvents and hot process liquids.", zh: "STV系列滤芯采用聚四氟乙烯制作，具有极佳的有机、无机化学腐蚀性物质的耐受性以及滤材的天然疏水性，广泛用于强溶剂、强腐蚀性液体以及强氧化性液体的过滤。采用全PVDF的支撑导流以及骨架，使产品具有耐受强腐蚀性溶剂以及高温料液的性能。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/stv-series-ptfe-filter-cartridge",
  },
  {
    slug: "sth",
    model: "STH",
    img: "/products/darlly/STH.jpg",
    name: { en: "STH Series PTFE Pleated Filter Cartridges", zh: "STH系列PTFE折叠滤芯" },
    desc: { en: "STH Series PTFE pleated cartridges are pleated from hydrophobic PTFE membrane. They combine a large filtration area with high flux, low pressure loss and long service life, and are suited to clean filtration of process gases in the microelectronics and semiconductor industries.", zh: "STH系列PTFE折叠滤芯采用疏水聚四氟乙烯（PTFE）滤膜折叠制成，具有过滤面积大，通量高，压损低，使用寿命长的特点，适合用于微电子和半导体工业工艺气体的洁净过滤。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/sth-series-ptfe-pleated-filter-cartridge",
  },
  {
    slug: "sch",
    model: "SCH",
    img: "/products/darlly/SCH.jpg",
    name: { en: "SCH Low-Extractable Series Filter Cartridges", zh: "SCH低溶出系列滤芯" },
    desc: { en: "SCH Series cartridges use an HDPE core for good chemical compatibility and low metal residue. The membrane is naturally hydrophilic nylon 6.6: easy to wet, with good tensile strength. Combined with HDPE support it releases no fibres, gives very low extractables, high porosity and a uniform pore distribution, resulting in high flux and long service life.", zh: "SCH系列滤芯采用HDPE骨架具有良好的化学兼容性及低金属残留，滤膜为天然亲水性尼龙6 6，易湿润，具有良好的拉伸强度，配合 HDPE支撑，无纤维脱落，极低溶出物，高孔隙率和均匀的微孔分布，具有通量大、寿命高等优良特性。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/sch-series-filter-cartridge",
  },
  {
    slug: "pswm",
    model: "PSWM",
    img: "/products/darlly/PSWM.jpg",
    name: { en: "PSWM Series Filter Cartridges", zh: "PSWM系列滤芯" },
    desc: { en: "PSWM Series cartridges use a distinctive wound design for precise filtration, efficiently retaining large particles while letting useful particles pass. The outside-in graded structure increases dirt-holding capacity and extends cartridge life.", zh: "PSWM系列滤芯利用独特的卷绕设计，能够对精准过滤，高效拦截大颗粒，放行有效颗粒。由外到内的梯度结构，增加了纳污空间，延长滤芯使用寿命。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/pswm-series-filter-cartridge",
  },
  {
    slug: "esaa",
    model: "ESAA",
    img: "/products/darlly/ESAA.jpg",
    name: { en: "ESAA Series PES Pleated Filter Cartridges", zh: "ESAA系列PES折叠滤芯" },
    desc: { en: "ESAA Series PES pleated cartridges target high-flow applications. The highly asymmetric PES membrane structure gives high flow, high dirt-holding capacity and stable retention efficiency, with a service life far longer than conventional PES products.", zh: "ESAA系列PES折叠滤芯针对高流量要求使用场合。独特的高度非对称的PES滤膜结构给滤芯提供了高流量、高纳污量和稳定的截留效率，寿命远大于普通PES产品。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/esaa-series-pes-pleated-filter-cartridge",
  },
  {
    slug: "ecpp",
    model: "ECPP",
    img: "/products/darlly/ECPP.png",
    name: { en: "ECPP Series Pleated Filter Cartridges", zh: "ECPP系列折叠滤芯" },
    desc: { en: "ECPP uses multi-layer ultra-fine fibre depth pleating for very high dirt-holding capacity, preventing the filter layer from blocking too quickly. The graded retention mechanism removes particles stage by stage, greatly extending service life. Particularly suited to high suspended-solids, colloidal and high-viscosity products.", zh: "ECPP多层超细纤维的深层折叠过滤技术，拥有超大的纳污量，避免过滤层的过快堵塞；分层截留机制对颗粒逐级截留，使得滤芯的寿命大大延长。特别适用于高悬浮颗粒，胶体类及高粘度产品。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/ecpp-series-pleated-filter-cartridge",
  },
  {
    slug: "bth",
    model: "BTH",
    img: "/products/darlly/BTH.png",
    name: { en: "BTH Series – Hydrophobic PTFE Pleated Filter Cartridges", zh: "BTH系列 – 疏水PTFE折叠滤芯" },
    desc: { en: "BTH Series PTFE pleated cartridges use PTFE membrane with excellent chemical and corrosion resistance and natural hydrophobicity, with tightly controlled metal-ion release. Suitable for sterilizing filtration of most chemicals, organic solvents and compressed air.", zh: "BTH系列PTFE折叠滤芯采用聚四氟乙烯（PTFE）滤膜，具有极好的耐化学、腐蚀性能和天然的疏水性，严格控制金属离子析出，适用于大部分化学品、有机溶剂和压缩空气除菌过滤。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/bth-series-hydrophobic-ptfe-pleated-filter-cartridge",
  },
  {
    slug: "nanosuave",
    model: "NANOSUAVE",
    img: "/products/darlly/CMP.jpg",
    name: { en: "NANOSUAVE® Series Filters", zh: "NANOSUAVE®系列过滤器" },
    desc: { en: "NANOSUAVE® filters use a multi-stage graded structure and ultra-fine filter fibres to filter CMP slurry precisely, efficiently retaining large particles while letting useful particles pass. The outside-in graded structure increases dirt-holding space and extends cartridge life.", zh: "NANOSUAVE®系列过滤器通过多级、梯度结构以及超细过滤纤维实现对CMP浆料的精准过滤，高效拦截大颗粒，放行有效颗粒。由外到内的梯度结构，增加了纳污空间，延长滤芯使用寿命。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/nanosuave%e7%b3%bb%e5%88%97%e8%bf%87%e6%bb%a4%e5%99%a8",
  },
  {
    slug: "profunnel",
    model: "PROFUNNEL",
    img: "/products/darlly/Senjokirey.jpg",
    name: { en: "PROFUNNEL Series Filters for Wet Etch and Clean (WEC)", zh: "PROFUNNEL 系列滤芯 for Wet Etch and Clean (WEC)" },
    desc: { en: "PROFUNNEL™ is a cost-effective filter designed for dilute acid and dilute alkali filtration in semiconductor processes. The asymmetric PES membrane gives better particle retention together with higher flow, higher dirt-holding capacity and longer service life. An HDPE core ensures lower extractables.", zh: "PROFUNNEL™是一款专为半导体制程中稀酸/稀碱过滤设计的高效益过滤器, PES膜具有不对称性，能够更好的提供颗粒截流率，同时具有更大的流量和纳污量，更长的使用寿命。HDPE骨架确保了更低的析出。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/profunnel-series-wet-etch-and-clean-wec",
  },
  {
    slug: "senjokirey",
    model: "SENJOKIREY",
    img: "/products/darlly/Senjokirey.jpg",
    name: { en: "SENJOKIREY Series Filters for Wet Etch and Clean (WEC)", zh: "SENJOKIREY 系列滤芯 for Wet Etch and Clean (WEC)" },
    desc: { en: "SENJOKIREY® filters offer a choice of hydrophobic and hydrophilic PTFE media and are widely used for high-purity chemicals and solvents. The excellent chemical compatibility of PTFE gives stable particle removal in different acids, alkalis and solvents. Larger membrane area options raise flow and extend service life. A pre-wetted option is available for immediate installation, reducing equipment downtime.", zh: "SENJOKIREY®系列过滤器具有疏水性和亲水性两种高效的PTFE滤材可选，广泛应用于各种高纯度化学品和溶剂过滤，PTFE滤材优异的化学兼容性保证其在不同的酸、碱、溶剂中具有稳定的颗粒去除率。更大的膜面积选型有效提高了流速并延长了滤芯的使用寿命。提供预润湿选项，可直接上机使用，减少设备停机时间。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/senjokirey-series-wet-etch-and-clean-wec",
  },
  {
    slug: "sgh",
    model: "SGH",
    img: "/products/darlly/SGH.jpg",
    name: { en: "SGH Series – High Dirt-Holding PP Pleated Filter Cartridges", zh: "SGH系列 – 高纳污PP折叠滤芯" },
    desc: { en: "SGH Series cartridges combine multiple layers of ultra-fine polypropylene fibre media with an imported support layer. The tapering fibre diameter gives depth filtration with very high dirt-holding capacity, and layer-by-layer filtration prevents premature blocking. Graded retention extends service life considerably. Particularly suited to high suspended-solids, colloidal and high-viscosity products.", zh: "SGH系列折叠滤芯是由多层超细聚丙烯纤维滤膜与进口支撑层组成，超细纤维膜的渐变直径特性，使得滤芯有着深度过滤同时拥有超大的纳污量，层层过滤可以避免过滤层的过快堵塞；分层截留机制对颗粒逐级截留，使得滤芯的寿命大大延长。特别适用于高悬浮颗粒，胶体类及高粘度产品。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/sgh-series-pp-pleated-filter-cartridges",
  },
  {
    slug: "scc",
    model: "SCC",
    img: "/products/darlly/SCC.jpg",
    name: { en: "SCC Series – One-piece Pleated Filter Cartridges", zh: "SCC系列-一体式折叠滤芯" },
    desc: { en: "SCC Series one-piece pleated cartridges are designed for RO system pretreatment. The medium can be deep fine polypropylene or glass fibre, and the integrally moulded inner and outer core greatly raise overall filtration efficiency, flow and dirt-holding capacity while extending service life, protecting downstream equipment.", zh: "SCC系列一体成型折叠滤芯是专为RO系统预处理设计，滤膜材质可选深层精细聚丙烯跟玻纤，结合一体成型的内外骨架组件，大大增大了整体的过滤效率、流速、纳污能力，延长了滤芯使用寿命,从而保障了后段设备的输入安全。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/scc-series-pleated-filter-cartridges",
  },
  {
    slug: "paa",
    model: "PAA",
    img: "/products/darlly/PAA.jpg",
    name: { en: "PAA Series – PES Pleated Filter Cartridges", zh: "PAA系列 – PES折叠滤芯" },
    desc: { en: "PAA Series cartridges are polyethersulfone sterilizing filters that remove more bacteria and particles at high flow and low pressure drop. Advanced thermal welding guarantees cartridge integrity, and the highly consistent porosity and retention of the PES membrane give good chemical compatibility with very low extractables. Suited to most final sterilizing filtration duties in the pharmaceutical industry.", zh: "PAA系列滤芯是一款能够在高流量和低压降的情况下去除更多的细菌和颗粒的聚醚砜除菌滤芯。先进的热熔焊接工艺保证了滤芯的完整性，高度一致的孔隙度和截留效率的聚醚砜膜使得滤芯具有良好的化学兼容性和极低的溶出物，适合于制药行业绝大部分终端除菌过滤。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/paa-series-pes-pleated-filter-cartridge",
  },
  {
    slug: "btf-high-temp",
    model: "BTF",
    img: "/products/darlly/BTF.jpg",
    name: { en: "BTF High-Temperature, Corrosion-Resistant All-Fluoropolymer Filter Cartridges", zh: "BTF耐温耐腐蚀系列全氟滤芯" },
    desc: { en: "BTF Series products use all-fluoropolymer components and suit a wide range of acid, alkali and other process chemicals at medium to high flow rates. A very large filtration area and high-performance media deliver excellent flux and very high retention. The all-fluoropolymer construction ensures extremely low extractables and maximum cleanliness.", zh: "BTF系列产品采用全氟配件，适用于广泛的酸、碱及其他工艺段化学料液，应用在中高流量要求的场合。 超大的过滤面积高性能滤材为产品提供了极佳的通量和超高的截留性能。全氟的结构设计保证产品的极低析出，极大保证产品的洁净度。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/btf-series-all-fluoropolymer-filter-cartridges-2",
  },
  {
    slug: "bs",
    model: "BS",
    img: "/products/darlly/BS.jpg",
    name: { en: "BS Series – Glass Fibre Pleated Filter Cartridges", zh: "BS系列 – 玻纤折叠滤芯" },
    desc: { en: "BS Series cartridges are made from ultra-fine glass fibre as an adsorbing depth filter with efficiency above 96 %. They are particularly suited to liquids containing colloids, oils and high particle loads. The high dirt-holding capacity and high-porosity structure give high flow and fine-particle capture, protecting and extending the life of downstream cartridges and saving cost. Also suitable for gas pretreatment and precision filtration.", zh: "BS系列折叠滤芯采用超细玻璃纤维材料制成，是一款具有吸附作用的深层滤芯，具有高达96%以上的效率，特别适用于含有胶体、油脂以及颗粒含量高的料液、高纳污量和高孔隙率结构为滤芯提供了高流量以及细颗粒捕捉能力，可以更好的保护和延长后置滤芯寿命，节约用户成本，同时适用于气体预处理及精密过滤。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/bs-series-glass-fiber-pleated-filter-cartridges",
  },
  {
    slug: "bsf",
    model: "BSF",
    img: "/products/darlly/BSF.jpg",
    name: { en: "BSF Series – Pleated Filter Cartridges", zh: "BSF系列 – 折叠滤芯" },
    desc: { en: "BSF Series cartridges are designed for condensate filtration in power plants, with lengths up to 70 inches, high filtration ratings, large area and effective particle removal. The reinforced PP inner core makes them widely used in resin-free precoat condensate systems and other process water polishing duties.", zh: "BSF系列折叠滤芯专为电厂凝结水过滤设计，长度可达70英寸，过滤精度高，面积大，特殊有效去除颗粒。内支撑PP采用强化处理，在电厂凝结水非树脂预涂过滤系统或其它工艺用水的净化处理得到广泛应用。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/bsf-series-pp-pleated-filter-cartridges",
  },
  {
    slug: "bhf115",
    model: "BHF115",
    img: "/products/darlly/BHF115.jpg",
    name: { en: "BHF115 Series – Pleated Filter Cartridges", zh: "BHF115系列 – 折叠滤芯" },
    desc: { en: "BHF115 Series cartridges are pleated from depth media; the main filter layer can be pure polypropylene, glass fibre or PES membrane for flexible application. A 115 mm large diameter gives a very large filtration area and very high flux, with up to 150 L/min per cartridge. The depth structure provides high precision while extending service life and lowering owner cost. It fits existing housings without modification.", zh: "BHF115系列折叠滤芯采用的是深层滤膜折叠而成，滤芯主过滤层可选纯聚丙烯滤膜、玻璃纤维、PES滤膜三种工艺，灵活应用，115mm大外径，使得滤芯拥有超大的过滤面积和超高通量，单支滤芯最大流量可达150L/min，深层过滤结构提供高精度的同时延长使用寿命，降低业主使用成本，可直接安装在已有壳体中，无需更换或改造 。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/bhf115-series-pleated-filter-cartridge",
  },
  {
    slug: "bge",
    model: "BGE",
    img: "/products/darlly/BGE.jpg",
    name: { en: "BGE Series – PP Pleated Filter Cartridges", zh: "BGE系列 – PP折叠滤芯" },
    desc: { en: "BGE Series PP pleated cartridges are pleated from ultra-fine polypropylene fibre membrane with pure PP support layers, effectively enlarging the usable area. A distinctive process gives high dirt-holding capacity and high flux. The whole cartridge is polypropylene, thermally bonded without any adhesive, and safe in use across many industries.", zh: "BGE系列PP折叠滤芯由超细纤维聚丙烯膜和纯PP支撑层折叠而成，有效扩大了滤芯使用面积，独特工艺赋予高纳污能力和高通量的特性，滤芯整体构造均由聚丙烯制成，生产制作采用热熔技术，不含任何粘合剂，使用安全，广泛应用于各种领域。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/bge-series-pp-pleated-filter-cartridges",
  },
  {
    slug: "bdh",
    model: "BDH",
    img: "/products/darlly/BDH.jpg",
    name: { en: "BDH Series – Hydrophilic PTFE Pleated Filter Cartridges", zh: "BDH系列 – 亲水PTFE折叠滤芯" },
    desc: { en: "BDH Series cartridges use modified hydrophilic PTFE membrane with very high porosity, high flux and long life. An imported drainage layer prevents fibre release in service, and every cartridge is 100 % integrity tested before shipment. PTFE membrane offers excellent chemical and corrosion resistance and is widely used for clarification and sterilizing filtration of strong oxidisers and aggressive liquids.", zh: "BDH系列PTFE折叠滤芯采用的是改性亲水聚四氟乙烯（PTFE）滤膜，具有极高的孔隙率、高通量、长寿命，结合进口导流层，避免使用过程中纤维脱落，滤芯出厂前100%完整性检测 ，确保过滤安全，PTFE滤膜具有极好的耐化学、腐蚀性能，可广泛应用于各行业中强氧化剂、强腐蚀性液体的澄清、除菌过滤。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/bdh-series-hydrophilic-ptfe-pleated-filter-cartridge",
  },
  {
    slug: "pva",
    model: "PVA",
    img: "/products/darlly/BGF.jpg",
    name: { en: "PVA Series – PVDF Sterilizing Filter Cartridges", zh: "PVA系列-聚偏二氟乙烯除菌滤芯" },
    desc: { en: "PVA Series cartridges are made from hydrophilic PVDF membrane and support layers. The very low protein binding of PVDF makes it particularly suitable for culture media, biological reagents and sterile vaccine filtration. Hydrophilic PVDF has low extractables, resists fouling by colloids and proteins, and offers excellent chemical compatibility.", zh: "PVA系列折叠滤芯采用亲水聚偏二氟乙烯PVDF膜和支撑层制成， PVDF特有的极低的蛋白吸附性能使其特别适合用于培养液、生物试剂、无菌疫苗等过滤。亲水PVDF具有低析出性，抗胶体和蛋白物质污染，化学兼容性优良。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/pva-series-pvdf-pleated-filter-cartridges",
  },
  {
    slug: "ptb",
    model: "PTB",
    img: "/products/darlly/PTB.jpg",
    name: { en: "PTB Series – Hydrophobic PTFE Sterilizing Filter Cartridges", zh: "PTB系列-疏水聚四氟乙烯除菌滤芯" },
    desc: { en: "PTB Series PTFE pleated cartridges are made from hydrophobic PTFE microporous membrane with good chemical compatibility, and are widely used for prefiltration of compressed gases and solvents, particle removal, bioburden reduction and sterilizing filtration.", zh: "PTB系列PTFE折叠滤芯采用于压缩气体、溶剂的预过滤、除颗粒与降低微生物负荷、除菌过滤。疏水聚四氟乙烯微孔滤膜制成，具有良好的化学兼容性，广泛用于压缩气体、溶剂的预过滤、除颗粒与降低微生物负荷、除菌过滤。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/ptb-series-ptfe-pleated-filter-cartridges",
  },
  {
    slug: "pcb",
    model: "PCB",
    img: "/products/darlly/BGF.jpg",
    name: { en: "PCB Series – Nylon 66 Sterilizing Filter Cartridges", zh: "PCB 系列-尼66 除菌滤芯" },
    desc: { en: "PCB Series cartridges are made from naturally hydrophilic nylon 66 membrane and are very well suited to alkaline liquid filtration. The membrane wets easily and has good tensile strength; with a drainage layer it releases no fibres and has low extractables, so it does not contaminate the filtrate. High porosity and uniform pore distribution give high flux, long life and excellent chemical compatibility.", zh: "PCB系列折叠滤芯由天然亲水性尼龙66膜制成，非常适合碱性料液过滤，滤膜天然亲水性能，易润湿，具备良好的拉伸强度，配合导流层，无纤维脱落，溶出物低，不会对滤液造成污染，高孔隙率和均匀的微孔分布，使得滤芯通量大，寿命长，化学兼容性优良。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/pcb-series-nylon-pleated-filter-cartridges",
  },
  {
    slug: "pad",
    model: "PAD",
    img: "/products/darlly/BAA.jpg",
    name: { en: "PAD Series – Double-layer PES Sterilizing Filter Cartridges", zh: "PAD系列-双层聚醚砜除菌滤芯" },
    desc: { en: "PAD Series cartridges combine high-performance PES membrane with support layers. The asymmetric membrane has high dirt-holding capacity, and the distinctive double hydrophilic PES layer gives excellent filtration performance and reliable bacterial retention. It withstands repeated steam sterilization and meets demanding pharmaceutical filtration requirements.", zh: "PAD系列滤芯采用高性能聚醚砜膜和支撑层组合而成，滤膜为非对称结构，纳污能力强，独特的双层亲水聚醚砜使其具有优异的过滤性能和可靠的细菌截留能力，可耐受多次蒸汽灭菌，可满足比较苛刻的制药过滤要求。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/pad-series-pes-pleated-filter-cartridges",
  },
  {
    slug: "pab",
    model: "PAB",
    img: "/products/darlly/FGF.jpg",
    name: { en: "PAB Series – High Flux PES Sterilizing Filter Cartridges", zh: "PAB系列-高通量聚醚砜除菌滤芯" },
    desc: { en: "PAB Series cartridges use highly asymmetric PES with support layers. The highly asymmetric membrane gives very high flow and dirt-holding capacity, effectively extending service life and greatly reducing change-out frequency.", zh: "PAB系列滤芯采用高非对称聚醚砜和支撑层组成，高非对称滤膜的特性使得滤芯具有极高的流量和纳污能力，有效提高了滤芯使用寿命，大大降低了更换周期。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/pab-series-pes-pleated-filter-cartridges",
  },
  {
    slug: "paa-low-extractable",
    model: "PAA",
    img: "/products/darlly/BGF.jpg",
    name: { en: "PAA Series – Low Extractable PES Sterilizing Filter Cartridges", zh: "PAA系列-低溶出聚醚砜除菌滤芯" },
    desc: { en: "PAA Series cartridges are polyethersulfone sterilizing filters that remove more bacteria and particles at high flow and low pressure drop. Advanced thermal welding guarantees cartridge integrity, and the highly consistent porosity and retention of the PES membrane give good chemical compatibility with very low extractables. Suited to most final sterilizing filtration duties in the pharmaceutical industry.", zh: "PAA系列滤芯是一款能够在高流量和低压降的情况下去除更多的细菌和颗粒的聚醚砜除菌滤芯。先进的热熔焊接工艺保证了滤芯的完整性，高度一致的孔隙度和截留效率的聚醚砜膜使得滤芯具有良好的化学兼容性和极低的溶出物，适合于制药行业绝大部分终端除菌过滤。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/paa-series-pes-pleated-filter-cartridges",
  },
  {
    slug: "hptg",
    model: "HPTG",
    img: "/products/darlly/FGF.jpg",
    name: { en: "HPTG Series – High-Temperature PTFE Sterilizing Filter Cartridges", zh: "HPTG系列-耐高温聚四氟乙烯除菌滤芯" },
    desc: { en: "HPTG Series cartridges are made from hydrophobic PTFE membrane; natural hydrophobicity keeps sterilizing performance stable at different humidity levels. The product withstands high temperatures and has broad chemical compatibility, and the thickened PP centre core greatly increases pressure resistance. With a large filtration area and high efficiency, it is widely used for fine filtration of fermentation air in amino acid, antibiotic, vitamin and enzyme production.", zh: "HPTG系列滤芯采用疏水性聚四氟乙烯膜制成，天然疏水保证了其在不同湿度环境下除菌的稳定性，产品耐高温且化学兼容性广，PP加厚中心杆的设计大大增强了耐压性。HPTG过滤面积大，过滤效率高，广泛应用于如氨基酸、抗生素、维生素、酶制剂等发酵空气的精过滤。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/hptg-series-pleated-filter-cartridges",
  },
  {
    slug: "fepp",
    model: "FEPP",
    img: "/products/darlly/BGF.jpg",
    name: { en: "FEPP Series – Polypropylene Pleated Filter Cartridges", zh: "FEPP系列-聚丙烯折叠滤芯" },
    desc: { en: "FEPP Series is a pleated cartridge for continuous high-efficiency filtration. The polypropylene medium withstands medium and high differential pressure and keeps excellent flow even with complex liquids, reducing change-out frequency and production cost.", zh: "FEPP系列是一款能持续高效过滤的折叠滤芯，聚丙烯滤材可耐中、高压差，即使面对复杂料液同样拥有优秀的过滤流量，从而降低了滤芯的更换周期和生产成本。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/fepp-series-pp-pleated-filter-cartridges",
  },
  {
    slug: "btf",
    model: "BTF",
    img: "/products/darlly/BTF.jpg",
    name: { en: "BTF Series – All-Fluoropolymer Filter Cartridges", zh: "BTF系列-全氟滤芯" },
    desc: { en: "BTF Series products use all-fluoropolymer components and suit a wide range of acid, alkali and other process chemicals at medium to high flow rates. A very large filtration area and high-performance media deliver excellent flux and very high retention. The all-fluoropolymer construction ensures extremely low extractables and maximum cleanliness.", zh: "BTF系列产品采用全氟配件，适用于广泛的酸、碱及其他工艺段化学料液，应用在中高流量要求的场合。超大的过滤面积高性能滤材为产品提供了极佳的通量和超高的截留性能。全氟的结构设计保证产品的极低析出，极大保证产品的洁净度。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/btf-series-all-fluoropolymer-filter-cartridges",
  },
  {
    slug: "bsg",
    model: "BSG",
    img: "/products/darlly/FGF.jpg",
    name: { en: "BSG Series – Glass Fibre Gas Filter Cartridges", zh: "BSG Series – 玻璃纤维气体滤芯" },
    desc: { en: "BSG Series cartridges are made from ultra-fine glass fibre with high retention efficiency, effectively protecting the final sterilizing cartridge and extending its life. Suitable for gas pretreatment and precision filtration.", zh: "BSG系列折叠滤芯采用超细玻璃纤维材料制成，滤膜整体具有较高的截留效率，有效地保护了终端除菌滤芯，延长了终端滤芯寿命，适用于气体预处理及精密过滤。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/bsg-series-glass-fiber-pleated-filter-cartridges",
  },
  {
    slug: "bdp",
    model: "BDP",
    img: "/products/darlly/BAA.jpg",
    name: { en: "BDP Series – Hydrophilic PTFE Sterilizing Filter Cartridges", zh: "BDP系列-亲水聚四氟乙烯除菌滤芯" },
    desc: { en: "BDP Series cartridges use hydrophilic PTFE membrane with broad chemical compatibility, suitable for filtering acidic, alkaline and oxidizing solutions. Good hydrophilicity and safe in use; it has passed bacterial challenge tests, so sterilizing performance is assured.", zh: "BDP系列滤芯采用亲水聚四氟乙烯（PTFE）滤膜，在应用中具有广泛的化学相容性，可用于各类酸碱性及氧化性溶液中过滤，亲水性好，使用安全，已通过细菌挑战试验，除菌效果有保证。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/bdp-series-ptfe-pleated-filter-cartridges",
  },
];

/** 大流量滤芯（原站 2 页合并，14 款） */
const HIGH_FLOW_ITEMS: DarllyItem[] = [
  {
    slug: "xhf",
    model: "XHF",
    img: "/products/darlly/XHF.jpg",
    name: { en: "XHF Series High Flow Pleated Filter Cartridges", zh: "XHF系列 -大流量折叠滤芯" },
    desc: { en: "The XHF Series high-flow pleated cartridge serves industries such as industrial manufacturing, environmental protection and food & beverage, targeting particles, colloids and micro-organisms. Multiple intermediate membrane layers provide graded retention, while the inner fine layer guarantees the rated filtration rating. All-polypropylene construction gives broad compatibility across most industries.", zh: "XHF系列 -大流量折叠滤芯是为工业、环保和食品饮料等行业颗粒、胶体和微生物等；中间多层滤膜，实现梯度截留；里面精细层，保证滤芯过滤精度。全聚丙烯结构材质，具有广泛的兼容性，适用于绝大部分的行业。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/xhf-series-high-flow-pleated-filter-cartridges",
  },
  {
    slug: "supper",
    model: "SUPPER",
    img: "/products/darlly/Supper.jpg",
    name: { en: "All-in-one Bag Filter Cartridge", zh: "一体袋滤机滤芯" },
    desc: { en: "The all-in-one bag filter cartridge was developed jointly by several Darlly departments and can replace most filter bags on the market. Its filtration area is more than four times that of a filter bag, with higher dirt-holding capacity and a much longer service life. The membrane uses a multi-stage graded retention design for better filtration performance. In service it reduces the costs associated with frequent element replacement, including equipment downtime and labour.", zh: "一体袋滤机滤芯是大立多个部门共同研发的一款滤芯，可以替换市面上大部分滤袋。一体袋滤机的过滤面积是滤袋的4倍以上，相比滤袋有更高的纳污量，寿命也大大提高。同时一体袋滤机滤膜结构采用多级梯度拦截设计，具有更好的过滤效果。一体袋滤机在使用上可以减少频繁更换滤芯带来的相关成本（设备停机时间，劳动成本）。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/supper-series-pleated-filter-cartridges",
  },
  {
    slug: "thf",
    model: "THF",
    img: "/products/darlly/THF.jpg",
    name: { en: "THF Series – High Flow Polyester Pleated Filter Cartridges", zh: "THF系列 – 大流量折叠滤芯" },
    desc: { en: "THF Series high-flow pleated cartridges are built entirely from polyester hardware. The all-polyester membrane construction handles precision filtration of liquids containing aromatic solvents such as benzene and toluene. Polyester offers good temperature and pressure resistance, allowing the cartridge to run continuously at 120 °C for up to a week.", zh: "THF系列大流量折叠滤芯采用全聚酯硬件组成，其中全聚酯膜结构能够满足苯、甲苯等含有芳香烃溶剂的料液精密过滤。聚酯材料拥有良好的耐温和耐压性能，使其制造的滤芯可承受连续一周120℃下高温工作。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/thf-series-high-flow-polyester-pleated-filter-cartridges",
  },
  {
    slug: "mff",
    model: "MFF",
    img: "/products/darlly/MFF.jpg",
    name: { en: "MFF Series – Pleated Filter Cartridges", zh: "MFF系列 – 折叠滤芯" },
    desc: { en: "MFF Series pleated cartridges are made of three layers of filter material. Different materials, lengths and pore ratings give customers in different fields more choice. Combining surface and depth filtration extends service life, while low differential pressure and high efficiency substantially reduce cost of ownership and improve operating efficiency.", zh: "MFF系列折叠滤芯由三层过滤材料组成，产品设计不同的材质、长度及孔径，为不同领域的客户提供了更多的选择，表面过滤与深层过滤工艺结合，提高使用寿命，同时产品具体低压差，高效率的特点，因此在选择和使用过程中，大大节约投入成本，提高工作效率。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/mff-series-pleated-filter-cartridge",
  },
  {
    slug: "phf",
    model: "PHF",
    img: "/products/darlly/PHF.jpg",
    name: { en: "PHF Series – High Flow Pleated Filter Cartridges", zh: "PHF系列 – 大流量折叠滤芯" },
    desc: { en: "The PHF Series was developed to meet market demand for high-flow pleated cartridges. Deep fine membrane media and a multi-layer graded pore structure deliver higher dirt-holding and dust capacity. It is single-open-end, with flow from outside to inside. The 6.7 in large diameter increases filtration area and dirt capacity, reducing the number of cartridges required and lowering cost. Select the model that matches each filtration duty.", zh: "PHF系列大流量滤芯是为适应市场需要开发的一款大流量折叠滤芯，采用深层精细膜材，多层梯度孔径过滤结构设计，可实现更高纳污量和容尘量，单开口，过滤流体流向由外向内。6.7英寸大直径，有效提高过滤面积和纳污量，减少滤芯使用数量，降低成本，可根据不同过滤需求，选择合适型号产品。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/phf-series-high-flow-pleated-filter-cartridge",
  },
  {
    slug: "shf",
    model: "SHF",
    img: "/products/darlly/SHF.jpg",
    name: { en: "SHF Series – High Flow Pleated Filter Cartridges", zh: "SHF系列 – 大流量折叠滤芯" },
    desc: { en: "Pleated polypropylene membrane construction achieves flow rates up to 1300 L/min, effectively reducing the number of cartridges and the size of the assembly. Deep fine media and a multi-layer graded pore structure provide higher dirt-holding and dust capacity.", zh: "采用折叠式聚丙烯滤膜材质，最高可达1300L/min过滤量，可有效减少滤芯使用数量及滤芯尺寸。采用深层精细膜材，多层梯度孔径过滤结构设计，可实现更高纳污量和容尘量。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/shf-series-high-flow-pleated-filter-cartridge",
  },
  {
    slug: "mhf",
    model: "MHF",
    img: "/products/darlly/MHF.jpg",
    name: { en: "MHF Series – High Flow Pleated Filter Cartridges", zh: "MHF系列 – 大流量折叠滤芯" },
    desc: { en: "The MHF Series has a 6.5 in large diameter with a maximum filtration area above 6 m² and flow up to 60 t/h. An internal PP core provides reinforced support, the flow path is outside-to-inside, and higher differential pressure can be withstood. Deep fine media and a multi-layer graded pore structure deliver higher dirt-holding and dust capacity.", zh: "MHF系列，6.5英寸大直径，拥有最大过滤面积超过6㎡，流量最高可达到60吨/每小时，内部设计PP骨架增强支撑，设计流向由外到内，可承受更高压差。采用深层精细膜材，多层梯度孔径过滤结构设计，可实现更高纳污量和容尘量。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/mhf-series-high-flow-pleated-filter-cartridge",
  },
  {
    slug: "mhfb",
    model: "MHFB",
    img: "/products/darlly/MHFB.jpg",
    name: { en: "MHFB Series – High Flow Pleated Filter Cartridges", zh: "MHFB系列 – 大流量折叠滤芯" },
    desc: { en: "MHFB Series high-flow cartridges are built by stacking multiple layers of graded deep fine polypropylene fibre media laterally, maximising usable area and dirt-holding capacity. The high flux means far fewer cartridges for the same flow duty, greatly reducing equipment and labour costs.", zh: "MHFB系列大流量滤芯采用多层梯度深层精细聚丙烯纤维滤膜横向堆叠而成，最大程度的增加了滤芯的使用面积，提升纳污能力，高通量的特点使得在同等流量应用下可以大大减少滤芯使用数量，从而大大节约了设备投入成本和人工成本。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/mhfb-series-high-flow-pleated-filter-cartridge",
  },
  {
    slug: "jhf",
    model: "JHF",
    img: "/products/darlly/JHF.jpg",
    name: { en: "JHF Series – High Flow Pleated Filter Cartridges", zh: "JHF系列 – 大流量折叠滤芯" },
    desc: { en: "JHF Series high-flow cartridges add an antibacterial filter cloth on both the upstream and downstream sides of the medium, effectively preventing bacterial growth inside the cartridge and the plugging it causes, saving the customer operating cost.", zh: "JHF系列大流量滤芯在滤材上下游增加一层抗菌滤布，可有效防止滤芯细菌滋生，防止滤芯因细菌滋生而堵塞，节约客户使用成本。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/jhf-series-high-flow-pleated-filter-cartridge",
  },
  {
    slug: "hf",
    model: "HF",
    img: "/products/darlly/HF.jpg",
    name: { en: "HF Series – High Flow Pleated Filter Cartridges", zh: "HF系列 – 大流量折叠滤芯" },
    desc: { en: "HF Series high-flow cartridges use deep fine polypropylene fibre membrane as the main filter layer, with a 6 in large diameter, single open end and a specially designed inside-to-outside flow path that keeps all particles inside the cartridge. The very high flow design reduces the number of cartridges and housings needed for the same duty, greatly saving equipment cost. Three constructions and multiple ratings are available for different applications.", zh: "HF系列大流量滤芯采用深层精细聚丙烯纤维膜为主过滤层，拥有6\"大直径，单向开口，并特别设计了由内到外的液体流向，保证所有颗粒物拦截在滤芯内部，超大流量的设计使得在相同流量场合，减少滤芯和过滤器的使用量，大大节约了设备投入成本，三种工艺多种精度可选，适应不同应用需求。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/hf-series-high-flow-pleated-filter-cartridge",
  },
  {
    slug: "fb",
    model: "FB",
    img: "/products/darlly/FB.jpg",
    name: { en: "FB Series – Filter Bags", zh: "FB系列 – 滤袋" },
    desc: { en: "FB Series products use quality polypropylene, polyester or nylon media and are produced in several functional bag types for specific duties. The medium has uniform pore size, high precision and high dirt-holding capacity. Surfaces can be singed, calendered or laminated with no fibre release, and hot-melt seamless bonding prevents bypass. The economic range offers good value for low-to-medium viscosity liquids, and multi-layer constructions increase dirt-holding capacity and retention.", zh: "FB系列产品采用优质聚丙烯、聚酯或尼龙滤材，按照特定工况和应用要求生产多款功能型滤袋产品。滤材孔径均匀，精度高，纳污量大。表面可做毛烧、压光或覆膜处理，无纤维脱落，热熔无缝接合技术确保不会侧漏，经济型滤供具体较高的性价比，适用于中低粘度液体过滤，也可配多层结构，增加纳污量，截留效果更佳。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/fb-series-filter-bag",
  },
  {
    slug: "dhf",
    model: "DHF",
    img: "/products/darlly/DHF.jpg",
    name: { en: "DHF Series – High Flow Pleated Filter Cartridges", zh: "DHF系列 – 大流量折叠滤芯" },
    desc: { en: "DHF Series high-flow cartridges have pull handles at both ends for easy removal from either side of the housing. With a 6 in large diameter, single open end and very high flow design, they reduce the number of cartridges and housings for the same duty and greatly save equipment cost. Deep fine polypropylene fibre membrane is the main filter layer; multiple constructions and ratings cover different applications.", zh: "DHF系列大流量滤芯两端都带可拉式把手，方便从过滤器两端拿取，拥有6\"大直径，单向开口，超大流量的设计是在相同流量场合，减少滤芯和过滤器的使用量，大大节约了设备投入成本，并采用深层精细聚丙烯纤维膜为主过滤层，多种工艺多种精度可选，适应不同的应用需求。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/dhf-series-high-flow-filter-cartridges",
  },
  {
    slug: "bof",
    model: "BOF",
    img: "/products/darlly/BOF.jpg",
    name: { en: "BOF Series – Pleated Filter Cartridges", zh: "BOF系列 – 折叠滤芯" },
    desc: { en: "BOF Series is an optimised MFF with a caged outer shell for higher pressure resistance and better resistance to cartridge deformation. Different materials, lengths and pore ratings give customers in different fields more choice. Combining surface and depth filtration extends service life, and low differential pressure with high efficiency substantially reduce cost of ownership. The whole cartridge is thermally welded without adhesive, ensuring safe use.", zh: "BOF系列折叠滤芯是在MFF系列上面进行了一个优化，外壳式的外观，耐压更强，使用过程中可以更好的避免滤芯变形的问题，产品设计不同的材质、长度及孔径，为不同领域的客户提供了更多的选择，表面过滤与深层过滤工艺结合，提高使用寿命，同时产品具体低压差，高效率的特点，因此在选择和使用过程中，大大节约投入成本，提高工作效率。滤芯整体采用热熔焊接，无粘胶剂，保证滤芯使用安全。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/bof-series-pleated-filter-cartridges",
  },
  {
    slug: "bc",
    model: "BC",
    img: "/products/darlly/BC-1.jpg",
    name: { en: "BC Series – High Flow Pleated Filter Cartridges", zh: "BC系列 – 大流量折叠滤芯" },
    desc: { en: "BC Series bag-style cartridges have a 6 in large diameter and a filtration area seven to eight times that of a standard filter bag, giving high flow and long life. A multi-layer graded pore structure provides high-efficiency filtration. Dual seals — O-ring and U-cup — eliminate any risk of bypass, and inside-to-outside flow keeps contaminants inside the cartridge. BC cartridges fit directly into bag housings, reducing change-out frequency and maintenance cost.", zh: "BC系列袋式滤芯拥有6\"大直径，过滤面积大，是普通滤袋的7-8倍以上，提供了大流量，高寿命。多层梯度孔径过滤结构设计，提供了高效率过滤，双密封圈设计，O型密封与U型密封，杜绝了泄漏的可能性，流体流向由内到外保证杂质被截留在滤芯内部，BC系列滤芯可直接安装在袋式过滤器上，降低更换频率和维护成本。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/bc-series-high-flow-folding-filter-cartridge",
  },
];

/** 多折滤芯（原站 1 页，2 款） */
const MULTIFOLD_ITEMS: DarllyItem[] = [
  {
    slug: "hc",
    model: "HC",
    img: "/products/darlly/HC.jpg",
    name: { en: "HC Series – Pleated Filter Cartridges", zh: "HC系列 – 折叠滤芯" },
    desc: { en: "HC Series pleated cartridges are pleated from polyester fibre cloth, which offers good mechanical properties and high-temperature resistance. The medium, centre core and both end caps are potted as one piece, and the threaded connection gives reliable sealing and easier installation. A 197 mm extra-large outside diameter combined with the pleated design provides a large filtration area, high flow and long service life, extending the change-out interval and reducing labour cost. Widely used where large water output is required.", zh: "HC系列折叠滤芯由聚酯纤维布折叠而成，聚酯纤维具有很好的力学性能和耐高温性能,滤层、中心杆与两头端盖整体注胶成型，螺纹接口设计，密封性能好，安装更方便，197mm超大外径结合折叠工艺设计，使得滤芯具有过滤面积大，通量大，使用寿命长的特点，从而减少滤芯更换周期，降低人工投入成本,广泛应用于产水量需求比较大的场合。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/hc-series-pleated-filter-cartridge",
  },
  {
    slug: "dl",
    model: "DL",
    img: "/products/darlly/DL-Pleated.jpg",
    name: { en: "DL Series – Pleated Filter Cartridges", zh: "DL系列 – 折叠滤芯" },
    desc: { en: "DL Series pleated cartridges are pleated from polyester fibre cloth, which has good mechanical properties and high-temperature resistance and keeps its strength in strongly acidic service; it is not suitable for hot alkaline conditions. The medium and centre core are potted with both end caps as one piece to ensure sealing at both ends. The pleated design gives a large filtration area, high flow and long service life, reducing change-out frequency and filtration cost.", zh: "DL系列折叠滤芯由聚酯纤维布折叠而成，聚酯纤维具有很好的力学性能和耐高温性能、在强酸环境下强度不受影响，不适合热碱环境使用，滤层和中心杆与两头端盖整体注胶成型，确保两头的密封性，折叠工艺设计，使得滤芯具有过滤面积大，通量大，使用寿命长的特点，从而减少滤芯更换周期，降低过滤投入成本。" },
    sourceUrl: "https://cn.darllyfiltration.com/product/dl-series-pleated-filter-cartridges",
  },
];

/** 子分类归属（原站子分类页真实列表 ∩ 本清单） */
export const DARLLY_CATEGORIES: DarllyCategory[] = [
  {
    slug: "pleated",
    banner: BANNER_PRODUCT,
    crumb: { en: "Microporous Pleated Filter Cartridges", zh: "微孔折叠滤芯" },
    header: HEADER,
    allLabel: ALL,
    pageSize: PAGE_SIZE,
    subcats: [
      { key: "pp", label: { en: "PP", zh: "PP" }, models: ["131", "pswm", "ecpp", "sgh", "scc", "bsf", "bhf115", "bge", "fepp"] },
      { key: "pes", label: { en: "PES", zh: "PES" }, models: ["paa-low-extractable", "pab", "pad", "bhf115", "131", "ebaa", "esaa", "nanosuave", "paa"] },
      { key: "ptfe", label: { en: "PTFE", zh: "PTFE" }, models: ["btg", "131", "stv", "sth", "bth", "bdh", "ptb", "hptg", "bdp"] },
      { key: "nylon", label: { en: "Nylon", zh: "Nylon" }, models: ["sch", "nanosuave", "pcb"] },
      { key: "gf", label: { en: "GF", zh: "GF" }, models: ["nanosuave", "scc", "bs", "bhf115", "bsg"] },
      { key: "pfa", label: { en: "PFA", zh: "PFA" }, models: ["profunnel", "senjokirey", "btf-high-temp", "btf"] },
      { key: "pvdf", label: { en: "PVDF", zh: "PVDF" }, models: ["pva"] },
    ],
    items: PLEATED_ITEMS,
  },
  {
    slug: "high-flow",
    banner: BANNER_PRODUCT,
    crumb: { en: "High Flow Filter Cartridges", zh: "大流量滤芯" },
    header: HEADER,
    allLabel: ALL,
    pageSize: PAGE_SIZE,
    subcats: [
      { key: "hiflow", label: { en: "High Flow Filter Cartridge", zh: "大流量滤芯" }, models: ["xhf", "supper", "thf", "phf", "shf", "mhf", "mhfb", "jhf", "hf", "dhf", "bc"] },
      /* 原站 /typ/bag-filter 已失效（返回 404 空页），无从原文照抄的清单；
         FB系列 – 滤袋 本身即滤袋产品，据此归入，不额外推断其它型号。 */
      { key: "bag", label: { en: "Filter Bag", zh: "袋滤芯" }, models: ["fb"] },
      { key: "oil", label: { en: "Oil Filter", zh: "油田滤芯" }, models: ["mff", "bof"] },
    ],
    items: HIGH_FLOW_ITEMS,
  },
  {
    slug: "multifold",
    banner: BANNER_PRODUCT,
    crumb: { en: "Multi-fold Filter Cartridges", zh: "多折滤芯" },
    header: HEADER,
    allLabel: ALL,
    pageSize: PAGE_SIZE,
    subcats: [
      { key: "dl", label: { en: "DL Series Pleated Filter Cartridge", zh: "DL系列多折滤芯" }, models: ["dl"] },
      { key: "hc", label: { en: "HC Series Pleated Filter Cartridge", zh: "HC系列多折滤芯" }, models: ["hc"] },
    ],
    items: MULTIFOLD_ITEMS,
  },
];

/** 三个已复制品类的 slug（用于路由分流） */
export const DARLLY_SERIES_SLUGS = DARLLY_CATEGORIES.map((c) => c.slug);

export function getDarllyCategory(
  slug: string,
): DarllyCategory | undefined {
  return DARLLY_CATEGORIES.find((c) => c.slug === slug);
}

/** 按系列 + 型号取单品（详情页用） */
export function getDarllyItem(
  seriesSlug: string,
  itemSlug: string,
): DarllyItem | undefined {
  return getDarllyCategory(seriesSlug)?.items.find((i) => i.slug === itemSlug);
}

/** 全部单品（供 generateStaticParams 展开详情页路由） */
export const DARLLY_ITEMS: { series: string; item: DarllyItem }[] =
  DARLLY_CATEGORIES.flatMap((c) =>
    c.items.map((item) => ({ series: c.slug, item })),
  );
