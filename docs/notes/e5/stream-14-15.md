# `S14` 对象服务 / `S15` 配方管理

> `S14` 提供对象的**通用属性操作**（`GetAttr`/`SetAttr`/对象生命周期/通用服务调用），`S15` 提供**配方管理**（命名空间、配方传输与选择、`DRNS` 变更管理）。两者都面向"对象化"的设备数据模型，比传统 `S2` 常数/`S7` 工艺程序更通用。

## 1. `S14` 对象服务（§10.18）

"本流的功能用于对象的通用功能，包括获取对象的信息和为对象设置值。"

### 1.1 核心概念

- **对象（`Object`）**：设备数据模型中的实体，有类型（`OBJTYPE`）与 ID（`OBJID`），可挂属性（`Attribute`：名称/值对）。
- **对象说明符（`Object Specifier`）**：通过**层级关系序列**指定目标对象的属主（上一级对象实例 → 下一级…最后一个是目标对象）。
- **服务（`Service`）**：`S14F19-F28` 提供"通用服务"机制——按**服务名**调用，参数化，支持多块数据传输。

### 1.2 消息总表

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S14F0` | `Abort Transaction` | H↔E | 中止事务 |
| `S14F1` | `GetAttr Request`（`GAR`） | H↔E, 回复 | 请求一个或多个对象的指定属性（对象说明符 + 目标类型 + ID 列表 + 过滤 + 属性列表） |
| `S14F2` | `GetAttr Data`（`GAD`） | H↔E | 返回属性值 |
| `S14F3` | `SetAttr Request`（`SAR`） | H↔E, 回复 | 设置对象属性 |
| `S14F4` | `SetAttr Data`（`SAD`） | H↔E | 返回设置结果 |
| `S14F5` | `GetType Request`（`GTR`） | H↔E, 回复 | 请求对象类型 |
| `S14F6` | `GetType Data`（`GTD`） | H↔E | 返回类型 |
| `S14F7` | `GetAttrName Request`（`GANR`） | H↔E, 回复 | 请求属性名 |
| `S14F8` | `GetAttrName Data`（`GAND`） | H↔E | 返回属性名 |
| `S14F9` | `Create Object Request`（`COR`） | H↔E, 回复 | 创建对象 |
| `S14F10` | `Create Object Acknowledge`（`CAO`） | H↔E | 确认 |
| `S14F11` | `Delete Object Request` | H↔E, 回复 | 删除对象 |
| `S14F12` | `Delete Object Acknowledge`（`DOA`） | H↔E | 确认 |
| `S14F13` | `Object Attach Request`（`OAR`） | H↔E, 回复 | 对象附加（绑定到某实体） |
| `S14F14` | `Object Attach Acknowledge`（`OAA`） | H↔E | 确认 |
| `S14F15` | `Attached Object Action Request`（`AOAR`） | H↔E, 回复 | 对已附加对象执行动作 |
| `S14F16` | `Attached Object Action Acknowledge`（`AOAA`） | H↔E | 确认 |
| `S14F17` | `Supervised Object Action Request`（`SOAR`） | H↔E, 回复 | 受监督对象动作（需跟踪完成状态） |
| `S14F18` | `Supervised Object Action Acknowledge`（`SOAA`） | H↔E | 确认 |
| `S14F19` | `Generic Service Request`（`GSR`） | H→E, 回复 | 调用通用服务（服务名 + 参数） |
| `S14F20` | `Generic Service Acknowledge`（`GSA`） | H←E | 确认 |
| `S14F21` | `Generic Service Completion Information`（`GSCI`） | H←E, 回复 | 服务完成信息 |
| `S14F22` | `Generic Service Completion Acknowledge`（`GSCA`） | H→E | 确认 |
| `S14F23` | `Multi-block Generic Service Data Inquire`（`GSDI`） | H↔E, 回复 | 多块询问 |
| `S14F24` | `Multi-block Generic Service Data Grant`（`GSDG`） | H↔E | 多块许可 |
| `S14F25` | `Get Service Name Request`（`GSNR`） | H↔E, 回复 | 请求服务名 |
| `S14F26` | `Get Service Name Data`（`GSND`） | H↔E | 返回服务名 |
| `S14F27` | `Get Service Parameter Name Request`（`GPNR`） | H↔E, 回复 | 请求服务参数名 |
| `S14F28` | `Get Service Parameter Name Data`（`GPND`） | H↔E | 返回参数名 |

### 1.3 关键结构

**`S14F1`（`GetAttr Request`）**：对象说明符 + 目标对象类型 + 目标对象 ID 列表 + 过滤（限定关系列表）+ 请求的属性 ID 列表。

**`S14F2`（`GetAttr Data`）**：按请求顺序返回 `L,m`（对象数）个 `L,n`（每对象属性数）个 `<ATTRDATA>`，另附 `L,p` 错误列表（`ERRCODE` + `ERRTEXT`）。

**错误语义**（`S14F2`）：`m=0` = 指定的 `OBJTYPE` 未知；某 `n=0` = 对应对象未找到；某 `ATTRDATA` 为零长度 = 该属性不存在；无错误时 `p=0`。

> `S14` 是 `E5` 中"对象模型"的入口，`S15` 配方、`S16` 加工都建立在此概念之上；`E30.1`/`E30.5` 等专用模型也用它扩展属性。

## 2. `S15` 配方管理（§10.19）

"本流的功能用于请求与配方、配方命名空间、配方执行器相关的信息和操作。配方是**分段传输**的对象：一个段（`Section`）由配方属性、`Agent` 特定数据集属性、或配方主体组成。属性 = 属性名/属性值对，描述配方主体、配方整体、或配方的应用。"

### 2.1 消息总表（按功能分组）

| 组 | 功能号 | 用途 |
| --- | --- | --- |
| 多块协商 | `S15F1`/`F2` | `Recipe Management Multi-block Inquire/Grant`（`DATAID` + `RCPSPEC` + `RMDATASIZE`） |
| 命名空间 | `S15F3`-`F12` | 命名空间动作/重命名、配方空间查询、配方状态、配方版本 |
| 配方创建/存储 | `S15F13`/`F14` | `Recipe Create`（按 `RCPSPEC` 创建） |
| | `S15F15`/`F16` | `Recipe Store`（存储配方段） |
| 获取/管理 | `S15F17`-`F20` | `Retrieve`（取回）、`Rename`（重命名） |
| | `S15F21`/`F22` | `Recipe Action`（配方动作：`SELECT`/`VALIDATE`/`DELETE`…） |
| | `S15F23`/`F24` | `Recipe Descriptor`（配方描述符） |
| | `S15F25`/`F26` | `Recipe Parameter Update` |
| 传统流程 | `S15F27`/`F28` | `Recipe Download`（下载，`H→E`） |
| | `S15F29`/`F30` | `Recipe Verify`（验证，`H→E`） |
| | `S15F31`/`F32` | `Recipe Upload`（上传，`H←E`） |
| | `S15F33`/`F34` | `Recipe Select`（选择，`H→E`） |
| | `S15F35`/`F36` | `Recipe Delete`（删除，`H→E`） |
| `DRNS` | `S15F37`-`F48` | `DRNS`（配方变更管理）段批准/记录/修改/变更请求/重建 |
| 大配方 | `S15F49`-`F52` | `Large Recipe Download/Upload`（经 `S13` 数据集协议） |
| 验证 | `S15F53`/`F54` | `Recipe Verification Send/Acknowledge`（设备侧校验） |

### 2.2 完整消息表

| 功能号 | 名称 | 方向 | 用途 |
| --- | --- | --- | --- |
| `S15F1` | `Recipe Management Multi-block Inquire` | H↔E, 回复 | 多块发送许可询问 |
| `S15F2` | `Recipe Management Multi-block Grant` | H↔E | 多块许可 |
| `S15F3` | `Recipe Namespace Action Request` | H↔E, 回复 | 命名空间动作（`RCPSPEC` 定位） |
| `S15F4` | `Recipe Namespace Action Acknowledge` | H↔E | 确认 |
| `S15F5` | `Recipe Namespace Rename Request` | H↔E, 回复 | 重命名命名空间 |
| `S15F6` | `Recipe Namespace Rename Acknowledge` | H↔E | 确认 |
| `S15F7` | `Recipe Space Request` | H↔E, 回复 | 查询配方空间 |
| `S15F8` | `Recipe Space Data` | H↔E | 返回空间信息 |
| `S15F9` | `Recipe Status Request` | H↔E, 回复 | 查询配方状态 |
| `S15F10` | `Recipe Status Data` | H↔E | 返回状态 |
| `S15F11` | `Recipe Version Request` | H↔E, 回复 | 查询配方版本 |
| `S15F12` | `Recipe Version Data` | H↔E | 返回版本 |
| `S15F13` | `Recipe Create Request` | H↔E, 回复 | 创建配方 |
| `S15F14` | `Recipe Create Acknowledge` | H↔E | 确认 |
| `S15F15` | `Recipe Store Request` | H↔E, 回复 | 存储配方段 |
| `S15F16` | `Recipe Store Acknowledge` | H↔E | 确认 |
| `S15F17` | `Recipe Retrieve Request` | H↔E, 回复 | 取回配方 |
| `S15F18` | `Recipe Retrieve Data` | H↔E | 返回配方 |
| `S15F19` | `Recipe Rename Request` | H↔E, 回复 | 重命名配方 |
| `S15F20` | `Recipe Rename Acknowledge` | H↔E | 确认 |
| `S15F21` | `Recipe Action Request` | H↔E, 回复 | 配方动作 |
| `S15F22` | `Recipe Action Acknowledge` | H↔E | 确认 |
| `S15F23` | `Recipe Descriptor Request` | H↔E, 回复 | 配方描述符 |
| `S15F24` | `Recipe Descriptor Data` | H↔E | 返回描述符 |
| `S15F25` | `Recipe Parameter Update Request` | H↔E, 回复 | 更新配方参数 |
| `S15F26` | `Recipe Parameter Update Acknowledge` | H↔E | 确认 |
| `S15F27` | `Recipe Download Request` | H→E, 回复 | 下载配方 |
| `S15F28` | `Recipe Download Acknowledge` | H←E | 确认 |
| `S15F29` | `Recipe Verify Request` | H→E, 回复 | 验证配方 |
| `S15F30` | `Recipe Verify Acknowledge` | H←E | 确认 |
| `S15F31` | `Recipe Upload Request` | H→E, 回复 | 上传配方 |
| `S15F32` | `Recipe Upload Data` | H←E | 返回配方数据 |
| `S15F33` | `Recipe Select Request` | H→E, 回复 | 选择配方（作为当前执行配方） |
| `S15F34` | `Recipe Select Acknowledge` | H←E | 确认 |
| `S15F35` | `Recipe Delete Request` | H→E, 回复 | 删除配方 |
| `S15F36` | `Recipe Delete Acknowledge` | H←E | 确认 |
| `S15F37` | `DRNS Segment Approve Action Request` | H↔E, 回复 | 批准 `DRNS` 段 |
| `S15F38` | `DRNS Segment Approve Action Acknowledge` | H↔E | 确认 |
| `S15F39` | `DRNS Recorder Segment Request` | H↔E, 回复 | `DRNS` 记录段 |
| `S15F40` | `DRNS Recorder Segment Acknowledge` | H↔E | 确认 |
| `S15F41` | `DRNS Recorder Modify Request` | H↔E, 回复 | 修改 `DRNS` 记录 |
| `S15F42` | `DRNS Recorder Modify Acknowledge` | H↔E | 确认 |
| `S15F43` | `DRNS Get Change Request` | H↔E, 回复 | 获取 `DRNS` 变更 |
| `S15F44` | `DRNS Get Change Request Data` | H↔E | 返回变更数据 |
| `S15F45` | `DRNS Manager Segment Change Approval Request` | H↔E, 回复 | 管理器段变更批准 |
| `S15F46` | `DRNS Manager Segment Approval Acknowledge` | H↔E | 确认 |
| `S15F47` | `DRNS Manager Rebuild Request` | H↔E, 回复 | 重建 `DRNS` 管理器 |
| `S15F48` | `DRNS Manager Rebuild Acknowledge` | H↔E | 确认 |
| `S15F49` | `Large Recipe Download Request`（`LRDR`） | H→E, 回复 | 大配方下载（经 `S13`） |
| `S15F50` | `Large Recipe Download Acknowledge`（`LRDA`） | H←E | 确认 |
| `S15F51` | `Large Recipe Upload Request`（`LRUR`） | H→E, 回复 | 大配方上传 |
| `S15F52` | `Large Recipe Upload Acknowledge`（`LRUA`） | H←E | 确认 |
| `S15F53` | `Recipe Verification Send`（`RVS`） | H←E, 回复 | 配方校验结果上报 |
| `S15F54` | `Recipe Verification Acknowledge`（`RVA`） | H→E | 确认 |

### 2.3 关键概念

- **`RCPSPEC`（`Recipe Specification`）**：`L,2`（`RCPSPEC1` + `RCPSPEC2`），定位配方或命名空间（如 `$` = 默认命名空间）。
- **`RMDATASIZE`**：多块询问时的数据量声明。
- **`DRNS`（`Dynamic Recipe Namespace`，动态配方命名空间）**：管理配方变更的机制——段批准、记录、修改、重建，用于版本化配方变更（`S15F37`-`F48`）。
- **大配方**：超过消息限制的配方经 `S13` 数据集协议传输（`S15F49`-`F52`），完成状态由事件报告指示。

> `S15` 是 `E30` "配方管理附加能力"在 `E5` 中的实现载体；`GEM` 视角见 [E30 工艺程序与配方](../e30/process-programs.md)。`S15` 与传统 `S7` 工艺程序的关系：`S7` 偏"设备工艺程序"，`S15` 偏"对象化配方的通用管理"。

## 3. 数据项速查

| 数据项 | 格式 | 说明 |
| --- | --- | --- |
| `OBJTYPE` / `OBJID` / `ATTRID` / `ATTRDATA` | 见字典 | 对象类型/ID/属性 ID/属性数据 |
| `ERRCODE` / `ERRTEXT` | 见字典 | 错误码/文本 |
| `RCPSPEC` / `RMDATASIZE` | 见字典 | 配方规格 / 数据大小 |
| `DATAID` | 3(),5() | 数据 ID |
| `MDLN` / `SOFTREV` | 20 | 型号/版本（校验用） |
