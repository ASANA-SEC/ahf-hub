# Admin, HR & Finance Hub — 行政、人事与财务平台

跟 Project Hub 同一套系统（登录、权限、Section、栏位模板、筛选、日历、导出、封存/还原、Deadline met 全部一样），但**数据、用户名单、后端完全独立**：

- 网址（上线后）：<https://asana-sec.github.io/ahf-hub/>
- **Super admin（3 位）**：`sam.secov@gmail.com`、`szesian.mitosc@gmail.com`、`eileen.secov@gmail.com`（写在 `assets/core.js` 的 SUPER_ADMINS）
- Project Hub 的账号**不会**自动带过来，要在这个平台的 Users & access 另外加
- 使用手册：平台左下角 **Help** 直接打开 Project Hub 的手册（操作完全一样）
- **不放薪水**：Employee Register 只记职位、部门、入职 / 转正日期和准证到期，薪资留在原本的 payroll 系统

## 预设 Section（第一次登录按「Create the standard sections」自动建好）

| 类别 | Section | 流程（Stage / Status） | 截止日期栏 |
|---|---|---|---|
| HR | **Employee Register** | Onboarding → On Probation → Confirmed → Serving Notice → Resigned / Left | Work pass / permit expiry |
| HR | **Recruitment** | Requested → Open — sourcing → Interviewing → Offer Sent → Accepted — to join → Joined / Declined / Cancelled | Fill by |
| HR | **Leave Applications** | Pending Approval → Approved → Taken / Recorded（或 Rejected / Cancelled） | First day |
| HR | **Training & Certifications** | Planned → Registered → Certified — valid → Renewal Due → Expired（或 Cancelled） | Expiry / renew by |
| Admin | **Company Licences & Registrations** | Valid → Preparing Renewal → Renewal Submitted → Valid（过期变 Expired） | Expiry date |
| Admin | **Assets & Vehicles** | In Use / Spare → Under Repair → Lost / Damaged → Disposed | Next road tax / insurance / service |
| Admin | **Admin Requests** | New → In Progress → Waiting → Done / Rejected | Needed by |
| Finance | **Client Invoices & Collections** | Preparing Claim → Claim Submitted → Certified → Invoiced → Partially Paid → Paid（或 Disputed / Written Off） | Payment due |
| Finance | **Supplier Payments** | Received → Verifying → Pending Approval → Approved — payment scheduled → Paid（或 On Hold） | Payment due |
| Finance | **Staff Expense Claims** | Submitted → Pending Approval → Approved — to pay → Paid（或 Returned / Rejected） | Pay by |
| Finance | **Statutory Payments** | Pending → Preparing → Pending Approval → Paid / Filed（EPF、SOCSO & EIS、PCB、HRD Corp、SST、CP204） | Due date |

- 关联：Leave、Training、Assets（Assigned to）、Expense Claims（Claimant）都连到 Employee Register，打开员工就看得到他的请假、证书、资产、报销
- 金额 / 数字栏会自动加总（请假天数、培训费、续牌费、资产成本、发票额 / 已收 / Retention、应付、报销、法定缴款）
- 卡太久会自动出现提醒标签（例如请假 2 天没批、Claim 交了 14 天还没 certify、Invoice 30 天没收到钱、供应商发票等批准超过 3 天）
- Deadline met：已批准的请假、已交件的执照续期、已接受 offer 的人选，过了日期不算 Late
- 栏位、阶段、提醒天数都能在线上 **Customize columns** 修改
- Section 顺序是 HR → Admin → Finance（Employee Register 必须排第一，其他 Section 才连得到它）；建好后可以在 Manage sections 调顺序

## 上线步骤（Sam 做，约 5 分钟）

Google 登录的 Client ID **沿用 Project Hub 那个**（同一个网域 asana-sec.github.io），不用再去 Google Cloud 建。只要建一个新的后端：

1. 打开 <https://script.google.com/>（用 `sam.secov@gmail.com`）→ **New project**，项目名改成 `AHF Hub API`
2. 把 `apps-script/Code.gs` 的全部内容贴进 `Code.gs`
3. 左侧 Files 旁边按 **+ → Script**，命名为 `Core`，把 `assets/core.js` 的全部内容贴进去
4. 左侧 ⚙️ **Project Settings** → Time zone 选 `(GMT+08:00) Kuala Lumpur`
5. 回到 `Code.gs`，函数选单选 **setup** → **Run** → 授权（未验证的应用 → Advanced → Go to AHF Hub API）
   - 会新建 **Admin, HR & Finance Hub — Data**（Google Sheet）、**Admin, HR & Finance Hub — Files**（Drive 文件夹）和 **Admin, HR & Finance Hub** 日历
6. **Deploy → New deployment** → Web app，Execute as **Me**，Who has access **Anyone** → 复制 **Web app URL**（结尾 `/exec`）交给小助
7. 小助填进 `config.js`（同时把 index.html 的 `config.js?v=` 加 1）推上线后，打开网址登录 → **Create the standard sections** → Users & access 加同事

> 以后 Code.gs 或 core.js 有更新，两个文件都要重新贴，再 **Deploy → Manage deployments → ✏️ → New version**，网址不变。
> Google Sheet 的分页保持普通范围，**不要**转成 Table。
> HR 和财务资料敏感：Google Sheet 和 Drive 文件夹**不要**分享给别人，权限一律在平台里的 Users & access 给。

## 本机测试

```bash
py -3 -m http.server 8769
```

打开 `http://localhost:8769/?demo`：演示模式，示例账号包括 Aisha（HR）、Grace（Finance）、Farid（Admin）、Kelvin（Accounts）、Raj（Site Engineer，没有 Section 权限，只看到自己的请假、报销和申请，以及他要批的）。

## 跟其他平台的差别

| 项目 | Project Hub | Procurement | Contract & Service Hub | RFQ Hub | Admin, HR & Finance Hub |
|---|---|---|---|---|---|
| 网址 | `/project-hub/` | `/procurement/` | `/contract-hub/` | `/rfq-hub/` | `/ahf-hub/` |
| 后端 / Sheet / Drive / 日历 | Project Hub API | Procurement API | Contract Hub API | RFQ Hub API | AHF Hub API（独立） |
| 浏览器存档键名 | `projecthub_*` | `procurement_*` | `contracthub_*` | `rfqhub_*` | `ahfhub_*`（同网域，互不干扰） |
| 主色 / 标志 | 蓝 / PH | 绿 / PR | 紫 / CS | 橙 / RQ | 青绿 / AF |

## 文件结构

| 文件 | 用途 |
|---|---|
| `index.html` | 网页入口 |
| `config.js` | 设定（API 网址、Client ID、名称） |
| `assets/core.js` | 权限与数据规则：网页和后端共用（后端贴成 Core.gs） |
| `assets/templates.js` | 11 个 Admin / HR / Finance Section 的预设模板 |
| `assets/app.js` | 全部画面和操作 |
| `assets/api.js` | 数据层（演示模式示例数据 / Google 后端） |
| `assets/archive.js` | 封存 / 备份 / 还原 |
| `assets/style.css` | 样式 |
| `apps-script/Code.gs` | Google 后端 |
