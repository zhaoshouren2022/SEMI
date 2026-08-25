# `S16` 加工管理 / `S17` 设备控制与诊断（续）/ `S18` 子系统控制与数据

> `S16` 用**作业（`Job`）** 组织加工控制，`S17` 是 `S2` 的延续（报告/`Trace`/事件链接的"新式"配置），`S18` 是设备内部**子系统**与上层控制器之间的简化消息。这三条流体现了 `E5` 向"对象化/作业化"演进的趋势。

## 1. `S16` 加工管理（§10.20）

"本流为在设备及设备资源上控制物料加工提供消息协议。控制通过支持两类作业实现：**控制作业（`Control Job`）**与**工艺作业（`Process Job`）**。"

### 1.1 两类作业（§10.20）

- **`Process Job`（工艺作业）**：一个工作单元，确保特定物料被特定加工资源应用适当的加工。它在制造过程的三个要素之间建立**临时联系**：① 待加工物料、② 加工发生的设备、③ 工艺规格（`Process Recipe`）。
  - `Process Job` 完成后**即消失**，其 `Process Job ID` 不再有效。
- **`Control Job`（控制作业）**：把一组相关的 `Process Job` 组合在一起（从主机视角逻辑相关）。例如一个 `Carrier` 含多个 `Lot`，每个 `Lot` 的 `Process Job` 可纳入同一个 `Control Job`；`Control Job` 还提供指定加工后物料去向的机制。

### 1.2 消息总表

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S16F0` | `Abort Transaction` | H↔E | 中止事务 |
| `S16F1` | `Multi-block Process Job Data Inquire`（`PRJI`） | H↔E, 回复 | 多块询问 |
| `S16F2` | `Multi-block Process Job Data Grant`（`PRJG`） | H↔E | 多块许可 |
| `S16F3` | `Process Job Create Request`（`PRJCR`） | H→E, 回复 | **创建 `Process Job`** |
| `S16F4` | `Process Job Create Acknowledge`（`PRJCA`） | H←E | 确认 |
| `S16F5` | `Process Job Command Request`（`PRJCMDR`） | H→E, 回复 | 对 `Process Job` 发命令（`START`/`STOP`/`PAUSE`…） |
| `S16F6` | `Process Job Command Acknowledge`（`PRJCMDA`） | H←E | 确认 |
| `S16F7` | `Process Job Alert Notify`（`PRJA`） | H←E, 回复 | 作业报警通知 |
| `S16F8` | `Process Job Alert Confirm`（`PRJAC`） | H→E | 确认 |
| `S16F9` | `Process Job Event Notify`（`PRJE`） | H←E, 回复 | 作业事件通知 |
| `S16F10` | `Process Job Event Confirm`（`PRJEC`） | H→E | 确认 |
| `S16F11` | `PRJobCreateEnh` | H→E, 回复 | 增强创建 `Process Job` |
| `S16F12` | `PRJobCreateEnh Acknowledge` | H←E | 确认 |
| `S16F13` | `PRJobDuplicateCreate` | H→E, 回复 | 复制创建 |
| `S16F14` | `PRJobDuplicateCreate Acknowledge` | H←E | 确认 |
| `S16F15` | `PRJobMultiCreate` | H→E, 回复 | 批量创建 |
| `S16F16` | `PRJobMultiCreate Acknowledge` | H←E | 确认 |
| `S16F17` | `PRJobDequeue` | H→E, 回复 | 作业出队 |
| `S16F18` | `PRJobDequeue Acknowledge` | H←E | 确认 |
| `S16F19` | `PRGetAllJobs` | H→E, 回复 | 获取全部作业 |
| `S16F20` | `PRGetAllJobs Send` | H←E | 返回作业列表 |
| `S16F21` | `PRGetSpace` | H→E, 回复 | 查询作业空间 |
| `S16F22` | `PRGetSpace Send` | H←E | 返回空间 |
| `S16F23` | `PRJobSetRecipeVariable` | H→E, 回复 | 设置作业配方变量 |
| `S16F24` | `PRJobSetRecipeVariable Acknowledge` | H←E | 确认 |
| `S16F25` | `PRJobSetStartMethod` | H→E, 回复 | 设置启动方式 |
| `S16F26` | `PRJobSetStartMethod Acknowledge` | H←E | 确认 |
| `S16F27` | `Control Job Command Request` | H→E, 回复 | **`Control Job` 命令** |
| `S16F28` | `Control Job Command Acknowledge` | H←E | 确认 |
| `S16F29` | `PRSetMtrlOrder`（`PRJSMO`） | H→E, 回复 | 设置物料顺序 |
| `S16F30` | `PRSetMtrlOrder Acknowledge`（`PRJSMOA`） | H←E | 确认 |

> `S16` 与 `E94`（`Control Job Management`）主题相关（`E94` 是 `GEM300` 家族的控制作业管理标准，见主页 `EFEM` 专题）。

## 2. `S17` 设备控制与诊断（续）（§10.21）

"本流是 `Stream 2` 的延续。" —— 提供"新式"的报告/`Trace`/事件链接配置：

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S17F0` | `Abort Transaction` | H↔E | 中止事务 |
| `S17F1` | `Data Report Create Request`（`DRC`） | H→E, 回复 | **创建数据报告定义**：`DATAID` + `RPTID` + `DATASRC`（数据源）+ `VID` 列表 |
| `S17F2` | `Data Report Create Acknowledge`（`DRCA`） | H←E | 确认 |
| `S17F3` | `Data Report Delete Request`（`DRD`） | H→E, 回复 | 删除数据报告 |
| `S17F4` | `Data Report Delete Acknowledge`（`DRDA`） | H←E | 确认 |
| `S17F5` | `Trace Create Request`（`TRC`） | H→E, 回复 | **创建 `Trace`**（`TRID`/`DSPER`/`TOTSMP`/`REPGSZ`/`VID` 列表） |
| `S17F6` | `Trace Create Acknowledge`（`TRCA`） | H←E | 确认 |
| `S17F7` | `Trace Delete Request`（`TRD`） | H→E, 回复 | 删除 `Trace` |
| `S17F8` | `Trace Delete Acknowledge`（`TRDA`） | H←E | 确认 |
| `S17F9` | `Collection Event Link Request`（`CELR`） | H→E, 回复 | **链接采集事件**到报告（`CEID` + `RPTID` 对） |
| `S17F10` | `Collection Event Link Acknowledge`（`CELA`） | H←E | 确认 |
| `S17F11` | `Collection Event Unlink Request`（`CEUR`） | H→E, 回复 | 取消事件链接 |
| `S17F12` | `Collection Event Unlink Acknowledge`（`CEUA`） | H←E | 确认 |
| `S17F13` | `Trace Reset Request`（`TRR`） | H→E, 回复 | 复位 `Trace` 报告 |
| `S17F14` | `Trace Report Reset Acknowledge`（`TRRA`） | H←E | 确认 |

**与 `S2` 的对比**：

| 功能 | `S2`（传统） | `S17`（新式） |
| --- | --- | --- |
| 定义报告 | `S2F33`（`VID` 直接引用） | `S17F1`（`DATAID` + `RPTID` + `DATASRC` 数据源） |
| `Trace` | `S2F23`（`SVID`） | `S17F5`（`VID` + 数据源） |
| 链接事件 | `S2F35` | `S17F9` |
| 使能 | `S2F37` | （由 `DATASRC`/报告管理替代） |

> `S17` 让报告可以引用**变量或属性**（`DATASRC`），比 `S2` 只引用 `SVID` 更通用——是"对象化"设备模型下的报告配置方式。

## 3. `S18` 子系统控制与数据（§10.22）

"组件子系统与更高级控制器之间交换的消息。与设备-主机之间相似的通信相比，子系统消息更简单。"

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S18F0` | `Abort Transaction` | H↔E | 中止事务（各流同义） |
| `S18F1` | `Read Attribute Request`（`RAR`） | H→E, 回复 | 读取子系统组件指定属性 |
| `S18F2` | `Read Attribute Data`（`RAD`） | H←E | 返回属性值 |
| `S18F3` | `Write Attribute Request`（`WAR`） | H→E, 回复 | 写子系统属性 |
| `S18F4` | `Write Attribute Acknowledge`（`WAA`） | H←E | 确认 |
| `S18F5` | `Read Request`（`RR`） | H→E, 回复 | 读取数据 |
| `S18F6` | `Read Data`（`RD`） | H←E | 返回数据 |
| `S18F7` | `Write Data Request`（`WDR`） | H→E, 回复 | 写数据 |
| `S18F8` | `Write Data Acknowledge`（`WDA`） | H←E | 确认 |
| `S18F9` | `Read ID Request`（`RIR`） | H→E, 回复 | 读取 ID |
| `S18F10` | `Read ID Data`（`RID`） | H←E | 返回 ID |
| `S18F11` | `Write ID Request`（`WIR`） | H→E, 回复 | 写 ID |
| `S18F12` | `Write ID Acknowledge`（`WIA`） | H←E | 确认 |
| `S18F13` | `Subsystem Command Request`（`SCR`） | H→E, 回复 | 子系统命令 |
| `S18F14` | `Subsystem Command Acknowledge`（`SCA`） | H←E | 确认 |
| `S18F15` | `Read 2D Code Condition Request`（`R2DCCR`） | H→E, 回复 | 读取二维码读取条件 |
| `S18F16` | `Read 2D Code Condition Data`（`R2DCCD`） | H←E | 返回条件 |

> `S18` 面向**设备内部**集成（腔体、传输模块等子系统与整机控制器之间），消息简单、结构轻量，是 `E5` 中唯一明确"子系统对子系统/上层"用途的流。

## 4. 三条流速查

| 流 | 主题 | 典型使用场景 |
| --- | --- | --- |
| `S16` | 作业化加工控制 | `Process Job` 创建/命令/事件、`Control Job` 分组 |
| `S17` | 新式报告/`Trace` 配置 | 引用变量或属性（`DATASRC`）定义报告、链接事件 |
| `S18` | 子系统通信 | 子系统属性/数据/ID 读写、命令、二维码条件 |

## 5. 数据项速查

| 数据项 | 格式 | 说明 |
| --- | --- | --- |
| `PRJOBID` / `CTRLJOBID` | 见字典 | 工艺作业 ID / 控制作业 ID |
| `DATAID` / `RPTID` / `VID` / `V` | 见字典 | 报告配置（`S17`） |
| `DATASRC` | 见字典 | 数据源（变量或属性） |
| `TRID` / `DSPER` / `TOTSMP` / `REPGSZ` | 见字典 | `Trace` 参数（`S17F5`） |
| `ATTRID` / `ATTRDATA` | 见字典 | 属性（`S18`） |
| `ACKA` | 11 | 接受/错误（`S16` 确认用） |
