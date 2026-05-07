export interface ContractVariables {
  contract_no: string;
  client_name: string;
  company_name: string;
  service_type: string;
  contract_date: string;
  amount: string;
  duration: string;
  consultant_name: string;
  terms_and_conditions: string;
}

export interface ContractTemplate {
  id: string;
  title: string;
  description: string;
  variableKeys: (keyof ContractVariables)[];
  content: string;
}

export function renderContract(template: string, vars: Partial<ContractVariables>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = (vars as Record<string, string>)[key];
    return val ?? `[${key}]`;
  });
}

export function generateContractNo(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `ZBD-${y}${m}-${rand}`;
}

const STANDARD_TERMS = `1. 甲方应按合同约定及时支付服务费用，逾期付款将按日计收 0.05% 的滞纳金。
2. 乙方承诺对甲方提供的所有商业信息严格保密，合同期满后保密义务延续 3 年。
3. 未经对方书面同意，任何一方不得擅自将本合同项下的权利义务转让给第三方。
4. 本合同受马来西亚法律管辖，因本合同引起的一切争议，双方应友好协商解决；协商不成，提交吉隆坡仲裁庭裁决。
5. 本合同自双方签字盖章之日起生效，一式两份，甲乙双方各执一份，具有同等法律效力。`;

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "consulting-standard",
    title: "标准咨询服务合同",
    description: "适用于一般资本咨询与财务顾问服务",
    variableKeys: [
      "contract_no",
      "client_name",
      "company_name",
      "service_type",
      "contract_date",
      "amount",
      "duration",
      "consultant_name",
      "terms_and_conditions",
    ],
    content: `咨询服务合同
CONSULTING SERVICES AGREEMENT

合同编号 Contract No.：{{contract_no}}
合同日期 Date：{{contract_date}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

甲方（委托方）PARTY A – CLIENT
姓名 / Name：{{client_name}}
公司 / Company：{{company_name}}

乙方（顾问方）PARTY B – CONSULTANT
顾问 / Consultant：{{consultant_name}}
机构 / Organization：资本道 ZiBenDao Capital Advisory

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

一、服务内容 SCOPE OF SERVICES

{{service_type}}

二、服务期限 SERVICE DURATION

{{duration}}

三、服务费用 SERVICE FEE

总费用 Total Fee：RM {{amount}}
付款方式：签约后 7 个工作日内支付首期款 50%，服务完成后 30 日内结清余款。

四、条款与条件 TERMS & CONDITIONS

{{terms_and_conditions}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

五、签署 SIGNATURES

甲方 Party A（委托方）：


签名 Signature：___________________________

姓名 Name：{{client_name}}

日期 Date：________ / ________ / ________


乙方 Party B（顾问方）：


签名 Signature：___________________________

姓名 Name：{{consultant_name}}

日期 Date：________ / ________ / ________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
本合同一式两份，双方各执一份，具有同等法律效力。
This agreement is executed in two counterparts, each of which shall be deemed an original.
`,
  },
];

export function getDefaultTerms(): string {
  return STANDARD_TERMS;
}
