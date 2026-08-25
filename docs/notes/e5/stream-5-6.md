# `S5` 异常处理 / `S6` 数据采集（`Exception Handling & Data Collection`）

> `S5` 处理设备异常（报警、异常恢复），`S6` 处理数据上报——事件驱动（`Event`）与时间驱动（`Trace`）两大类。这两条流连同 `S2` 的配置消息，是 `E30` `GEM`"事件通知"与"数据采集"能力的消息基础。

## 1. `S5` 异常处理（§10.9）

报警（`Alarm`）与异常（`Exception`）消息。`GEM` 的"双通道上报"（`S5F1` + 事件）就建立在此之上。

### 1.1 消息总表

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S5F0` | `Abort Transaction` | H↔E | 中止事务 |
| `S5F1` | `Alarm Report Send`（`ARS`） | H←E, [回复] | **报警上报**：`ALCD` + `ALID` + `ALTX` |
| `S5F2` | `Alarm Report Acknowledge`（`ARA`） | H→E | 确认（`<ACKC5>`） |
| `S5F3` | `Enable/Disable Alarm Send`（`EAS`） | H→E, [回复] | 使能/禁用报警（`ALED` + `ALID`） |
| `S5F4` | `Enable/Disable Alarm Acknowledge`（`EAA`） | H←E | 确认 |
| `S5F5` | `List Alarms Request`（`LAR`） | H→E, 回复 | 列出所有报警 |
| `S5F6` | `List Alarm Data`（`LAD`） | H←E | 返回报警列表 |
| `S5F7` | `List Enabled Alarm Request`（`LEAR`） | H→E, 回复 | 列出已使能的报警 |
| `S5F8` | `List Enabled Alarm Data`（`LEAD`） | H←E | 返回已使能报警列表 |
| `S5F9` | `Exception Post Notify`（`EXPN`） | H←E, [回复] | 异常产生通知 |
| `S5F10` | `Exception Post Confirm`（`EXPC`） | H→E | 确认 |
| `S5F11` | `Exception Clear Notify`（`EXCN`） | H←E, [回复] | 异常清除通知 |
| `S5F12` | `Exception Clear Confirm`（`EXCC`） | H→E | 确认 |
| `S5F13` | `Exception Recover Request`（`EXRR`） | H→E, 回复 | 请求启动异常恢复 |
| `S5F14` | `Exception Recover Acknowledge`（`EXRA`） | H←E | 确认（`<ACKA>`） |
| `S5F15` | `Exception Recovery Complete Notify`（`EXRCN`） | H←E, [回复] | 恢复完成通知 |
| `S5F16` | `Exception Recovery Complete Confirm`（`EXRCC`） | H→E | 确认 |
| `S5F17` | `Exception Recovery Abort Request`（`EXRAR`） | H→E, 回复 | 中止恢复 |
| `S5F18` | `Exception Recovery Abort Acknowledge`（`EXRAA`） | H←E | 确认 |

### 1.2 报警的要素（`S5F1` 结构）

`S5F1` 消息体 `L,3`：

| 元素 | 数据项 | 含义 |
| --- | --- | --- |
| 1 | `ALCD` | 报警类别码（仅第 8 位有意义：置位/清除） |
| 2 | `ALID` | 报警 ID（设备特定） |
| 3 | `ALTX` | 报警文本 |

> 报警的完整行为（使能/禁用、双通道上报）见 [E30 报警管理](../e30/alarm-management.md)。

## 2. `S6` 数据采集（§10.10）

"本流覆盖在制测量与设备监控的需求。" 上报分两类（附录 `R1-3`）：

- **时间驱动**：`Trace`——按时间间隔采样状态变量（工程/研发用途居多）。
- **事件驱动**：`Event`——某事件发生时上报一组数据（生产用途）。

### 2.1 消息总表

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S6F0` | `Abort Transaction` | H↔E | 中止事务 |
| `S6F1` | `Trace Data Send`（`TDS`） | H←E, [回复] | **`Trace` 数据**：按 `S2F23` 设置采样 |
| `S6F2` | `Trace Data Acknowledge`（`TDA`） | H→E | 确认（`<ACKC6>`） |
| `S6F3` | `Discrete Variable Data Send`（`DVS`） | H←E, [回复] | **离散变量数据**（事件驱动、一般格式） |
| `S6F4` | `Discrete Variable Data Acknowledge`（`DVA`） | H→E | 确认 |
| `S6F5` | `Multi-block Data Send Inquire`（`MBI`） | H→E, 回复 | 多块询问 |
| `S6F6` | `Multi-block Grant`（`MBG`） | H←E | 多块许可 |
| `S6F7` | `Data Transfer Request`（`DDR`） | H→E, 回复 | 按 `DATAID` 请求多块数据 |
| `S6F8` | `Data Transfer Data`（`DDD`） | H←E | 返回数据块 |
| `S6F9` | `Formatted Variable Send`（`FVS`） | H←E, [回复] | 按固定格式上报（值序固定、省名称） |
| `S6F10` | `Formatted Variable Acknowledge`（`FVA`） | H→E | 确认 |
| `S6F11` | `Event Report Send`（`ERS`） | H←E, 回复 | **事件报告**（`CEID` + 报告列表） |
| `S6F12` | `Event Report Acknowledge`（`ERA`） | H→E | 确认 |
| `S6F13` | `Annotated Event Report Send`（`AERS`） | H←E, 回复 | **注释事件报告**（每个值带 `VID`） |
| `S6F14` | `Annotated Event Report Acknowledge`（`AERA`） | H→E | 确认 |
| `S6F15` | `Event Report Request`（`ERR`） | H→E, 回复 | 主机按 `CEID` 索取报告 |
| `S6F16` | `Event Report Data`（`ERD`） | H←E | 返回报告（同 `S6F11` 结构） |
| `S6F17` | `Annotated Event Report Request`（`AERR`） | H→E, 回复 | 索取注释版报告 |
| `S6F18` | `Annotated Event Report Data`（`AERD`） | H←E | 返回注释版报告 |
| `S6F19` | `Individual Report Request`（`IRR`） | H→E, 回复 | 按 `RPTID` 索取单个报告 |
| `S6F20` | `Individual Report Data`（`IRD`） | H←E | 返回变量值列表 |
| `S6F21` | `Annotated Individual Report Request`（`AIRR`） | H→E, 回复 | 索取注释版单个报告 |
| `S6F22` | `Annotated Individual Report Data`（`AIRD`） | H←E | 返回 `VID`+`V` 对列表 |
| `S6F23` | `Request Spooled Data`（`RSD`） | H→E, 回复 | 请求发送/删除 `Spool` 缓冲的数据 |
| `S6F24` | `Request Spooled Data Acknowledgement Send`（`RSDAS`） | H←E | 确认（按 `RSDC` 语义） |
| `S6F25` | `Notification Report Send` | H↔E, [回复] | 通知类报告（如 `Spool` 状态变化） |
| `S6F26` | `Notification Report Send Acknowledge` | H→E | 确认 |
| `S6F27` | `Trace Report Send`（`TRS`） | H←E, [回复] | 按需 `Trace` 报告（用 `DATAID`/`SAMPLEID` 分块） |
| `S6F28` | `Trace Report Send Acknowledge` | H→E | 确认 |
| `S6F29` | `Trace Report Request`（`TRR`） | H→E, 回复 | 请求 `Trace` 报告 |
| `S6F30` | `Trace Report Data`（`TRD`） | H←E | 返回 `Trace` 报告 |

### 2.2 核心消息结构

**`S6F1`（`Trace Data Send`）** `L,4`：

| 元素 | 数据项 | 含义 |
| --- | --- | --- |
| 1 | `TRID` | 关联 `S2F23` 设置的 `Trace` |
| 2 | `SMPLN` | 本条消息中最后一个采样的序号 |
| 3 | `STIME` | 最后采样的时间（零长度 = 用 `SMPLN` + 请求信息推导） |
| 4 | `L,n` | 采样值列表（`<SV>`） |

> `S6F1` 多块时**无需** `Inquire/Grant`——`S2F23` 本身就是隐式许可。但部分设备只支持单块 `S6F1`。

**`S6F11`（`Event Report Send`）** `L,3`（`GEM` 事件上报核心）：

| 元素 | 数据项 | 含义 |
| --- | --- | --- |
| 1 | `DATAID` | 数据 ID |
| 2 | `CEID` | 采集事件 ID |
| 3 | `L,a` | 报告列表：每项 `L,2`（`RPTID` + 该报告的值列表） |

- 无报告链接到事件 → 视为"空报告"；报告数为零长度列表 = 该 `CEID` 无链接报告。
- 多块时须先 `S6F5/S6F6`。

**`S6F13`（`Annotated Event Report Send`）**：与 `S6F11` 相同，但每个值前带 `VID`（`L,2`：`VID` + `V`）——适用于报告结构可变、需要自描述的场景。

**`S6F23/F24`（`Request Spooled Data`）**：`<RSDC>` 指示是"发送缓冲数据"还是"删除缓冲数据"；`S6F24` 按 `RSDC` 值返回相应状态（`GEM` `Spooling` 的缓冲重放机制）。

## 3. 事件上报 vs `Trace` 上报（附录 R1-3 速记）

| 维度 | `Trace`（`S6F1`） | 事件（`S6F11`） |
| --- | --- | --- |
| 触发 | 时间（`DSPER` 周期） | 设备事件（`CEID`） |
| 配置 | `S2F23`（`TRID`/`DSPER`/`TOTSMP`/`REPGSZ`/`SVID`） | `S2F33`（定义报告）+ `S2F35`（链接事件）+ `S2F37`（使能） |
| 数据组织 | `TRID` + 采样序号 + 时间 + 值列表 | `CEID` + `RPTID` + 值列表 |
| 用途 | 工程/研发、大量实时数据 | 生产、按事件报数据 |
| 可选回复 | 是（`ACKC6`） | 是 |

## 4. 数据项速查

| 数据项 | 格式 | 说明 |
| --- | --- | --- |
| `ALCD` / `ALID` / `ALTX` | 51 / 3(),5() / 20 | 报警类别/ID/文本 |
| `ALED` | 51 | 使能（`1`）/禁用（`0`） |
| `ACKC5` / `ACKC6` / `ACKA` | 51 | 确认码（`0` = 接受） |
| `TRID` / `SMPLN` / `STIME` | 见字典 | `Trace` 标识/采样序号/时间 |
| `CEID` / `RPTID` / `DATAID` | 3(),5() | 事件 ID / 报告 ID / 数据 ID |
| `VID` / `V` | 见字典 | 变量 ID / 值 |
| `RSDC` | 51 | `Spool` 请求控制码 |
