# `S7` 工艺程序管理 / `S8` 控制程序传输

> `S7` 管理**工艺程序（`Process Program`，即配方）**的传输、验证与删除，是设备执行加工的依据；`S8` 传输设备的**控制程序**（`Boot Program`、`Executive Program`）。超大工艺程序走 `Stream 13` 数据集协议或 `S7F37`-`F44` 大文件机制。

## 1. `S7` 工艺程序管理（§10.11）

"本流的功能用于管理与传输工艺程序。工艺程序是设备特定的描述，决定单台设备对物料执行的工序；提供传输程序的手段，以及建立工艺程序与待加工物料的关联。"

### 1.1 消息总表

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S7F4` | `Process Program Acknowledge`（`PPA`） | H↔E | 确认（`<ACKC7>`） |
| `S7F5` | `Process Program Request`（`PPR`） | H↔E, 回复 | 请求传输工艺程序 |
| `S7F6` | `Process Program Data`（`PPD`） | H↔E | 传输工艺程序（`PPID` + `PPBODY`） |
| `S7F7` | `Process Program ID Request`（`PIR`） | H←E, 回复 | 请求用于指定物料的 `PPID` |
| `S7F8` | `Process Program ID Data`（`PID`） | H→E | 返回 `PPID` + `MID` 关联 |
| `S7F9` | `M/P M Request`（`MMR`） | H↔E, 回复 | 请求物料/工艺矩阵（主机请求=当前矩阵；设备请求=初始化矩阵） |
| `S7F10` | `M/P M Data`（`MMD`） | H↔E | 返回矩阵 |
| `S7F11` | `M/P M Update Send`（`UMS`） | H→E, 回复 | 更新矩阵条目 |
| `S7F12` | `M/P M Update Acknowledge`（`UMA`） | H←E | 确认 |
| `S7F13` | `Delete M/P M Entry Send`（`DES`） | H→E, 回复 | 删除矩阵条目 |
| `S7F14` | `Delete M/P M Entry Acknowledge`（`DEA`） | H←E | 确认 |
| `S7F15` | `Matrix Mode Select Send`（`MMS`） | H→E, 回复 | 选择矩阵模式 |
| `S7F16` | `Matrix Mode Select Acknowledge`（`MMA`） | H←E | 确认 |
| `S7F17` | `Delete Process Program Send`（`DPS`） | H→E, 回复 | 删除工艺程序 |
| `S7F18` | `Delete Process Program Acknowledge`（`DPA`） | H←E | 确认 |
| `S7F19` | `Current EPPD Request`（`RER`） | H→E, 回复 | 请求当前设备工艺参数描述 |
| `S7F20` | `Current EPPD Data`（`RED`） | H←E | 返回 |
| `S7F21` | `Equipment Process Capabilities Request`（`PCR`） | H→E, 回复 | 请求设备工艺能力（`PCD`） |
| `S7F22` | `Equipment Process Capabilities Data`（`PCD`） | H←E | 返回 `PCD`（`MDLN`/`SOFTREV`/`CCODE`/`PPARM`…） |
| `S7F23` | `Formatted Process Program Send`（`FPS`） | H↔E, 回复 | **格式化工艺程序**传输 |
| `S7F24` | `Formatted Process Program Acknowledge`（`FPA`） | H↔E | 确认（接受仅表示消息被理解，有效性走 `S7F27/F28`） |
| `S7F25` | `Formatted Process Program Request`（`FPR`） | H↔E, 回复 | 请求格式化工艺程序 |
| `S7F26` | `Formatted Process Program Data`（`FPD`） | H↔E | 返回 |
| `S7F27` | `Process Program Verification Send`（`PVS`） | H←E, 回复 | **工艺程序验证**：设备告知检查结果 |
| `S7F28` | `Process Program Verification Acknowledge`（`PVA`） | H←E | 确认 |
| `S7F29` | `Process Program Verification Inquire`（`PVI`） | H←E, 回复 | 设备请求发送多块 `PVS` 的许可 |
| `S7F30` | `Process Program Verification Grant`（`PVG`） | H→E | 许可 |
| `S7F31` | `Verification Request Send`（`VRS`） | H→E, 回复 | 请求设备**校验**给定工艺程序是否可接受 |
| `S7F32` | `Verification Request Acknowledge`（`VRA`） | H←E | 确认 |
| `S7F33` | `Process Program Available Request`（`PAR`） | H→E, 回复 | 请求设备报告可用工艺程序 |
| `S7F34` | `Process Program Availability Data`（`PAD`） | H←E | 返回可用列表 |
| `S7F35` | `Process Program for MID Request`（`PPMR`） | H→E, 回复 | 请求某物料 ID 关联的工艺程序 |
| `S7F36` | `Process Program for MID Data`（`PPMD`） | H↔E | 返回 |
| `S7F37` | `Large Process Program Send`（`LPPS`） | H↔E | 大工艺程序发送（经 `S13` 数据集协议） |
| `S7F38` | `Large Process Program Acknowledge`（`LPPA`） | H↔E | 确认 |
| `S7F39` | `Large Formatted Process Program Send`（`LFPPS`） | H↔E, 回复 | 大格式化工艺程序发送请求 |
| `S7F40` | `Large Formatted Process Program Acknowledge`（`LFPPA`） | H↔E | 确认 |
| `S7F41` | `Large Process Program Request`（`LPPR`） | H↔E | 大工艺程序请求 |
| `S7F42` | `Large Process Program Acknowledge`（`LPPA`） | H↔E | 确认 |
| `S7F43` | `Large Formatted Process Program Request`（`LFPPR`） | H↔E | 大格式化工艺程序请求 |
| `S7F44` | `Large Formatted Process Program Acknowledge`（`LFPPA`） | H↔E | 确认 |

### 1.2 核心消息详解

**`S7F6`（`Process Program Data`）** `L,2`：`1. <PPID>`、`2. <PPBODY>`。零长度列表 = 请求被拒。

**`S7F22`（`Equipment Process Capabilities Data`，`PCD`）**：描述设备工艺能力（`CCODE` 命令码、`PPARM` 参数描述——`PDFLT` 数据类型、`ULIM`/`LLIM` 范围、`UNITS` 单位、`RESC`/`RESV` 分辨率）。附录 `R1-4` 详细说明了 `PCD` 的结构与可用性（理想情况下设备随时可响应 `PCD` 请求；存储受限时可只在初始化/空闲时提供）。

**`S7F23`（`Formatted Process Program Send`）** `L,4`：

| 元素 | 数据项 | 含义 |
| --- | --- | --- |
| 1 | `PPID` | 工艺程序 ID |
| 2 | `MDLN` | 设备型号（取自生成该程序的 `PCD`） |
| 3 | `SOFTREV` | 软件版本 |
| 4 | `L,c` | 工艺命令列表：每项 `L,2`（`CCODE` + `L,p` 参数列表 `<PPARM>`） |

多块时须先 `S7F1/S7F2` 询问/许可。

**`S7F27`（`Process Program Verification Send`）** `L,2`：`1. <PPID>`、`2. L,n`（错误列表，每项 `L,3`：`ACKC7A` + `SEQNUM` + `ERRW7`）。

- 空错误列表、或只有一项且 `ACKC7A = 0` = 工艺程序无错误。
- 设备在收到任何格式化工艺程序（`S7F23`/`F26`/`F31`）或经 `S13` 传输的大工艺程序（`S7F37`/`F39`/`F41`/`F43`）后，都应回发 `S7F27` 报告校验结果。
- 多块时须先 `S7F29/S7F30`。

**`S7F31`（`Verification Request Send`）**：请求解释方**校验**工艺程序内容是否可接受用于加工；`MDLN`/`SOFTREV` 取自 `PCD`。多块须先 `S7F1/S7F2`。

### 1.3 大工艺程序（`S7F37`-`F44`）

超过单条消息限制的工艺程序，通过 **`Stream 13` 数据集传输协议**搬运：

- `S7F37`/`F39`/`F41`/`F43` 系列：请求/发送大工艺程序（格式化或非格式化），实际数据以 `DSNAME = PPID` 的 `Data Set` 形式走 `S13`。
- **验证仍然走 `S7F27/F28`**：设备收到大工艺程序后会校验其完整性（如尝试加载）；接收方为设备时，完成状态由验证事务给出；接收方为主机时，完成由事件报告指示。

> `GEM` 视角的工艺程序/配方管理见 [E30 工艺程序与配方](../e30/process-programs.md)。

## 2. `S8` 控制程序传输（§10.12）

设备控制软件（固件/操作系统级）的传输：

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S8F1` | `Boot Program Request`（`BPR`） | H↔E, 回复 | 请求引导程序 |
| `S8F2` | `Boot Program Data`（`BPD`） | H↔E | 返回引导程序数据 |
| `S8F3` | `Executive Program Request`（`EPR`） | H↔E, 回复 | 请求执行程序 |
| `S8F4` | `Executive Program Data`（`EPD`） | H↔E | 返回执行程序数据 |

> `S8` 用于管理和维护设备的软件例程（附录 `R1-2.7`：微处理器设备受益于 `Stream 8` 与 `S2F1-F12` 的服务程序管理）。

## 3. 数据项速查

| 数据项 | 格式 | 说明 |
| --- | --- | --- |
| `PPID` | 20 | 工艺程序 ID（最大 40 字符） |
| `PPBODY` | 0（`List`）或 10 | 工艺程序体（未格式化时可为二进制） |
| `MID` | 20 | 物料 ID（`PPID` 关联用） |
| `ACKC7` | 10 | 确认码（`0` 接受；`1` 许可未给；`2` 长度错；`4` `PPID` 未找到…） |
| `ACKC7A` | 31,51 | 验证确认码（`0` 接受；`1` `MDLN` 不一致；`2` `SOFTREV` 不一致；`3` 无效 `CCODE`；`4` 无效 `PPARM`） |
| `ERRW7` | 20 | 错误文本 |
| `SEQNUM` | 3(),5() | 错误序号 |
| `CCODE` | 见字典 | 工艺命令码 |
| `PPARM` | 见字典 | 工艺参数 |
| `MDLN` / `SOFTREV` | 20 | 型号 / 版本 |
| `LENGTH` | 3(),5() | 长度（`S7F29` 询问用） |
