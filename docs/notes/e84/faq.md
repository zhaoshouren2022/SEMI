# FAQ：高频疑问答疑

> 学习 `E84`（载具交接并行 `I/O`）过程中的高频疑问，按主题归类，答案标注标准出处。附录 A1 应用笔记的要点也集中放在这里。

## 1. 概念与定位

**Q1: `E84` 和 `E23` 是什么关系？**

`E84` 增强自 `E23`（`Cassette Transfer Parallel I/O Interface`）：在 `E23` 基础上增加 `Continuous Handoff`、`Simultaneous Handoff` 与错误检测能力（§1.2）。但两者**相互独立**——使用 `E84` 不要求 `E23`（注 1）。

**Q2: `E84` 和 `E87` 有什么区别？哪个管什么？**

- `E84` 管**信号级交接握手**：`FOUP` 物理上如何安全放到/取走 `Load Port`（`VALID`/`TR_REQ`/`BUSY`/`COMPT` 等信号）。
- `E87`（`Carrier Management`）管**载具状态与事件**：`Carrier ID`、`Dock/Undock`、`Load Port` 状态机等软件层面。
- 一句话：`E84` 保证"交接不出错"，`E87` 让 `Host` 知道"载具在哪儿、状态如何"。`E84` 的 `HO_AVBL`、`L_REQ`/`U_REQ` 与 `E87` 的访问模式、可用性状态对应（§6.1 `HO_AVBL` 注）。

**Q3: `Host` 参与交接握手吗？**

**不参与**。交接由主动设备与被动设备双方自己管理，工厂层控制器（`Host`）**不管理交接操作**（§2.3）。`Host` 通过设备 `Factory Interface` 管理物料数据（§3.1）。

**Q4: 什么是 `Active` 设备、什么是 `Passive` 设备？**

- `Active`（主动）：装载/卸载载具的一方——`OHT`、`AGV`、`RGV`、带传输机构的 `Stocker`、主动型 `OHS`（§5.1.2）。
- `Passive`（被动）：被装载/卸载的一方——工艺设备、计量设备、`Stocker`、被动型 `OHS` 车辆（§5.1.18）。
- `Interbay` 场景中 `OHS` 与 `Stocker` 角色可互换（§6.4.1）。

**Q5: `Intrabay` 和 `Interbay` 有什么区别？**

- `Intrabay`（区内）：`Load Port` 在工艺设备上，`AMHS`（`AGV`/`RGV`/`OHT`）用 `CS_0`/`CS_1`/`VALID` 等信号交接。
- `Interbay`（跨区）：`OHS` 与 `Stocker` 之间交接，用 `VA`/`VS_0`/`VS_1`/`AM_AVBL` 等专用信号（§2.1、§6.1.1）。

## 2. 信号与握手

**Q6: `CS_0`/`CS_1` 和 `VS_0`/`VS_1` 有什么区别？**

- `CS_0`/`CS_1`：**主动方**（`A→P`）选择 `Load Port` 的信号，用于常规 `Intrabay` 交接（§6.1.2）。
- `VS_0`/`VS_1`：**被动 `OHS` 车辆**（`P→A`）通知主动 `Stocker` 交接位置的信号，仅用于 `Interbay`（§6.1.3）。
- 两者都遵循"一个 `PI/O` 管一个端口"或"管两个端口"的配置，`ON`/`ON` 表示同时交接。

**Q7: 一个 `PI/O` 管一个 `Load Port` 和一个管两个有什么区别？**

| 配置 | `CS_0`/`CS_1` 用法 | 适用 |
| --- | --- | --- |
| 一个 `PI/O` 管 1 个端口 | `CS_0` 恒 `ON`、`CS_1` 恒 `OFF` | 固定缓冲设备（§A1-1.5） |
| 一个 `PI/O` 管 2 个端口 | `CS_0` 选左、`CS_1` 选右、都 `ON` = 同时 | 内部缓冲设备，支持同时/连续交接 |

**Q8: `L_REQ` 和 `U_REQ` 分别是哪个方向？**

都是**被动方发给主动方**（`P→A`）：`L_REQ` = 装载请求（`Active→Passive` 方向搬载具），`U_REQ` = 卸载请求（`Passive→Active` 方向搬载具）。`L_REQ`/`U_REQ` 的 `OFF` 验证装载/卸载完成（依据 `Load Port` 的 `Presence/Placement Sensor`，§A1-4.6.1）。

**Q9: `BUSY` 和 `COMPT` 的先后关系？**

- `BUSY ON`：主动设备开始物理交接（须 `READY ON` 之后）。
- `BUSY OFF`：交接完成且主动设备资源**离开冲突区**（须确认 `L_REQ`/`U_REQ` 已 `OFF`）。
- `COMPT ON`：`BUSY OFF` 之后，通知被动设备交接完成；`COMPT OFF` 在被动设备 `READY OFF` 之后。
- 顺序：`READY ON` → `BUSY ON` →（交接）→ `L/U_REQ OFF` → `BUSY OFF` → `COMPT ON` → `READY OFF` → `COMPT OFF`。

**Q10: `HO_AVBL` 什么时候会 `OFF`？**

被动设备检测到交接异常时 `OFF`（§6.1、§A1-4.4.1），典型场景（表 A1-6）：

| 场景 | `HO_AVBL` |
| --- | --- |
| `Presence Sensor ON` 但 `Placement Sensor OFF` | `OFF` |
| `Presence Sensor OFF` 但 `Placement Sensor ON` | `OFF` |
| 被动设备处于手动访问模式 | `OFF` |
| `FOUP` 已 `Dock` 或移向 `FIMS` 接口 | `OFF` |
| 内部缓冲设备/`Stocker` 输入端口有载具 | `OFF` |
| `E15.1` 选配 1 型端口光幕错误 | `OFF` |
| 非目标端口的载具搬运机器人错误 | `ON` |

**Q11: `ES` 信号什么时候 `OFF`？**

`ES`（急停）是**工具级**信号（不是端口级）：任一端口按下 `EMO`、打开互锁维护门/面板、或载具搬运机器人出错时，**所有** `E84` `Load Port` 的 `ES` 都应 `OFF`（§A1-4.5.1、表 A1-7）。

## 3. 交接类型

**Q12: `Single`、`Simultaneous`、`Continuous` 交接有什么区别？**

| 类型 | 定义（§5.1） | 信号要点 |
| --- | --- | --- |
| `Single Handoff` | 单次交接一个载具 | `CS_0` 或 `CS_1` `ON` |
| `Simultaneous Handoff` | 一次交接**同时**转移两个载具（并行） | `CS_0` 与 `CS_1` 都 `ON` |
| `Continuous Handoff` | 一次交接**连续**转移两个及以上载具（串行） | `CONT` 标记：第一个 `BUSY ON` 时 `ON`，最后一个 `BUSY ON` 时 `OFF` |

**Q13: `Simultaneous` 和 `Continuous` 为什么能提升效率？**

- `Simultaneous`：单臂双手（双端执行器）`AMHS` 一次搬运两个载具到两个端口（§6.2.5.1）。
- `Continuous`：多个载具连续交接时，`Load Port` 前的门（如快门）**无需反复开关**，保持打开（§6.2.6.2），省去冗余操作。

**Q14: 同时交接时 `L_REQ`/`U_REQ` 怎么定义？**

- `L_REQ ON`：**两个**端口都准备好装载（此时两个端口都不得有载具）；`OFF`：**两个**端口载具都到位。
- `U_REQ ON`：**两个**端口都有载具待卸载；`OFF`：**两个**端口载具都取走（§6.1.2、§6.2.5.2）。

## 4. 错误与恢复

**Q15: 定时器超时了怎么办？**

超时 = 检测到交接序列错误（§6.3.2.1）。恢复流程**不在标准定义**（§6.3.3），建议主动/被动设备都提供"中止互锁序列并设为重启/完成"的恢复流程。错误消息须含定时器名、描述、当前设定值（§A1-4.7.1）。

**Q16: 错误时信号保持什么状态？（附录 A1-3.2.1）**

- **出错方保持 `BUSY ON`**：防止对方误动作导致二次事故。
- 对方信号保持出错时状态，仅 `READY OFF`。
- `Stocker` 侧出错：`READY OFF`、`ES OFF`、`HO_AVBL OFF`；`OHS` 侧出错：只有 `BUSY ON`，其余全 `OFF`。

**Q17: 哪些错误能自动恢复？**

`BUSY ON` 之前的 `E84` 错误，主动车辆应**自动恢复**（无需人工干预，§A1-4.2）。典型自动恢复场景（表 A1-5）：

| 错误 | 反应 |
| --- | --- |
| `TA1 Timeout`（发 `CS_0/1` 但没收到 `U/L_REQ`） | 向 `Host` 发 `Unsuccessful Transfer Complete`，自动恢复 |
| `TA2 Timeout`（发 `TR_REQ` 但没收到 `READY`） | 同上 |
| `BUSY ON` 前 `HO_AVBL` 变低 | 同上 |

恢复方式：主动车辆向 `Host` 发送 `Unsuccessful Transfer Complete`，`Host` 指定备选位置（§A1-4.3；`E82 Intrabay SEM` 有详细流程）。

**Q18: 交接出错后怎么恢复？（`Interbay` 场景，§A1-3.2.2）**

先把载具送回 `Stocker` 或 `OHS`，再恢复。四种场景：装载→送回 `Stocker`、装载→送回 `OHS`、卸载→送回 `Stocker`、卸载→送回 `OHS`。具体方法见 §A1-3.2.3 / §A1-3.3.3（按"从新开始"或"视为完成"处理）。

## 5. 硬件与应用

**Q19: `PI/O` 设备怎么配置？（附录 A1-1.5）**

- **内部缓冲设备**（设备内有非 `Load Port` 位置存放载具）：用"一个 `PI/O` 管一个端口"或"管两个端口"，取决于 `AMHS` 输送系统（图 A1-3）。
- **固定缓冲设备**（只有固定 `Load Port`，无内部缓冲）：用"一个 `PI/O` 管一个端口"（图 A1-4）。
- 最终用户根据设备与 `AMHS` 系统指定 `E84` 概念与位置。

**Q20: 硬件接线的注意点？**

- 被动设备侧连接器必须是 `DB-25` 母头（`ISO 2110`），带 `4-40` 螺纹锁（§6.4.1）。
- 电源 `+24 Vdc`（`18-30 V`），主动/被动电源必须隔离、电源与信号公共端隔离（§6.4.2）。
- 信号 `ON` 状态 ≤ `1.8 Vdc`；`TTL` 电路可能需要下拉到 `0.8 Vdc`，或用输入接收器电路（§A1-1.7）。
- 线缆通信时 `Power COM` 接到 `Signal COM`（引脚 24/25，表 11）。

**Q21: 传感器尺寸限制？**

最大 `H` < 100 mm、`D` < 25 mm、`W` < 150 mm（含连接器与线缆刚性部分）；300 mm 系统须安装在 `E15.1` 排除体积内、光轴居中（§6.5、图 37）。

**Q22: `Swap Handoff` 在标准范围内吗？**

**不在**。`Interbay AMHS`（`OHS`、`Stocker`）的 `Swap Handoff`（同一 `Load Port` 同时装载与卸载）超出标准范围（§3.6）。

**Q23: `OHS` 与 `OHT` 有什么区别？**

- `OHS`（`Overhead Shuttle`）：**不用垂直升降机构**的天车穿梭车，通常支撑在输送轨上方。
- `OHT`（`Overhead Hoist Transport`）：**用垂直升降机构**（`Hoist`）的架空输送车，悬挂在输送轨下方（§5.1.17）。
