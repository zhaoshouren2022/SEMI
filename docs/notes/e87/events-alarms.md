# 附加事件、变量数据与报警

> `E87` 的状态迁移都要产生**采集事件**（见 [状态模型](state-models.md)）；除此之外，§18 定义若干**非状态迁移的事件**，§19 定义**变量数据**，§20 定义**必备报警**，§21 给出合规声明表。这些是 `Host` 观察载具世界的窗口。

## 1. 附加事件（§18）

"本节识别与状态迁移无关的变量数据采集事件。意图是确保特定事件有可用数据，而非定义 `CMS` 的全部附加事件。"

| 事件 | 说明 | 事件报告数据 |
| --- | --- | --- |
| `Buffer Capacity Changed` | 缓冲容量变化（所有内部缓冲及分区） | `BufferPartitionInfo` |
| `Carrier Approaching Complete` | 设备对载具访问接近完成（时机可配置，见下） | `CarrierID` |
| `Carrier Clamped` | 载具被夹紧（第一个夹紧装置接合时；端口无夹紧则无需事件） | `PortID`、`CarrierID`（如有）、`LocationID` |
| `Carrier Closed` | 载具门关闭（有门时） | `CarrierID`、`LocationID`、`PortID`（如有效） |
| `Carrier Location Change` | 载具位置变化（`Load Port`、`FIMS` 口、缓冲位均适用） | `CarrierID`、`LocationID`（新位置）、`CarrierLocationMatrix` |
| `Carrier Opened` | 载具门打开 | `CarrierID`、`LocationID`、`PortID`（如有效） |
| `Carrier Unclamped` | 载具松开夹紧（全部夹紧/锁定装置脱开时） | `PortID`、`CarrierID`（如有）、`LocationID` |
| `CarrierID Read Fail` | 在 `NOT ASSOCIATED` 状态端口读 `CarrierID` 失败 | `PortID` |
| `ID Reader Available` | `ID` 读取器变为可用（所有端口） | `PortID` |
| `ID Reader Unavailable` | `ID` 读取器不可用（任何原因） | `PortID` |
| `UnknownCarrierID` | 载具到达 `NOT ASSOCIATED` 端口且读取器不可用 | `PortID` |

**`Carrier Approaching Complete` 时机**（§18.3.3）：

| 载具用途 | 事件时机 |
| --- | --- |
| `PRODUCT` | 载具从内部 `FIMS` 开始移向缓冲的剩余时间达到可配置值（内部缓冲设备） |
| `DUMMY` | 载具晶圆变得不可复用的剩余时间达到可配置值 |
| `TEST` | 载具变空的剩余晶圆数达到可配置数 |
| `REJECT` | 载具变满的剩余槽位数达到可配置数 |

**`UnknownCarrierID` 后续**（§18.12.3-5）：设备等待 `ProceedWithCarrier` 或 `CancelCarrier`；收到 `ProceedWithCarrier` → 经迁移 4 实例化对象；收到 `CancelCarrier` → 用主机提供的 `CarrierID` 经迁移 5 实例化、关联端口、准备卸载。

## 2. 变量数据（§19）

以下变量须由设备提供，可通过采集事件报告与状态查询获取。**带下标（`i`）的变量**表示列表项或不同实体（恒有效）。

### 2.1 端口相关

| 变量 | 类型 | 说明 |
| --- | --- | --- |
| `AccessMode` / `AccessModei` | 枚举 | 端口访问模式（`MANUAL`/`AUTO`） |
| `PortID` / `PortIDi` | 正整数 | 端口 `ID` |
| `PortTransferState` / `i` / `List` | 枚举 | `OUT OF SERVICE`/`TRANSFER BLOCKED`/`READY TO LOAD`/`READY TO UNLOAD`（不含超状态） |
| `PortAssociationState` / `i` / `List` | 枚举 | `ASSOCIATED`/`NOT ASSOCIATED` |
| `PortStateInfo` / `i` / `List` | 列表 | `PortAssociationState` + `PortTransferState` 组合 |
| `LoadPortReservationState` / `i` / `List` | 枚举 | `NOT RESERVED`/`RESERVED` |

### 2.2 载具相关

| 变量 | 类型 | 说明 |
| --- | --- | --- |
| `CarrierID` / `CarrierIDi` | 文本 | 载具 `ID`（`CarrierIDi` = 第 `i` 个 `LocationID` 处载具） |
| `CarrierIDStatus` | 枚举 | `ID NOT READ`/`WAITING FOR HOST`/`ID VERIFICATION OK`/`ID VERIFICATION FAILED` |
| `CarrierAccessingStatus` | 枚举 | `NOT ACCESSED`/`IN ACCESS`/`CARRIER COMPLETE`/`CARRIER STOPPED` |
| `SlotMapStatus` | 枚举 | `SLOT MAP NOT READ`/`WAITING FOR HOST`/`SLOT MAP VERIFICATION OK`/`SLOT MAP VERIFICATION FAILED` |
| `SlotMap` | `L,n` 枚举 | 各槽状态（`UNDEFINED`/`EMPTY`/`NOT EMPTY`/`CORRECTLY OCCUPIED`/`DOUBLE SLOTTED`/`CROSS SLOTTED`） |
| `CarrierLocationMatrix` | `L,n` 对 | 设备内外所有载具的位置-`CarrierID` 表（`CarrierID` 未知时 = `UNKNOWN`，无载具时 = `null`） |
| `LocationID` / `LocationIDi` | 文本 | 载具位置 |
| `Reason` | 枚举 | 迁移 14 的原因：`VERIFICATION NEEDED`/`VERIFICATION BY EQUIPMENT UNSUCCESSFUL`/`READ FAIL`/`IMPROPER SUBSTRATE POSITION` |

### 2.3 内部缓冲相关（仅内部缓冲设备）

| 变量 | 类型 | 说明 |
| --- | --- | --- |
| `PartitionID` / `i` | 文本 | 逻辑分区 `ID`（区分物料类型） |
| `PartitionType` / `i` | 文本 | 分区类型（`Product`/`Dummy`/`Substrate`/`Seed`…） |
| `PartitionCapacity` / `i` | 非负整数 | 分区总容量 |
| `AvailPartitionCapacity` / `i` | 非负整数 | 可用容量（= 容量 - 分区内载具数） |
| `UnAllocatedPartitionCapacity` / `i` | 非负整数 | 未分配容量（= 容量 - 载具数 - 已分配数；经 `Bind`/`CarrierIn`/`CarrierNotification`/`ReserveAtPort`/`ProceedWithCarrier` 分配，对应 `Cancel` 服务解除） |
| `BufferCapacityList` | `L,n` | 所有分区的 `BufferPartitionInfo` |
| `BufferPartitionInfo` | 结构 | `PartitionID` + `PartitionType` + `AvailPartitionCapacity` + `PartitionCapacity`（+ `UnallocatedPartitionCapacity`） |

### 2.4 其他

| 变量 | 类型 | 说明 |
| --- | --- | --- |
| `BypassReadID` | 布尔（`RW`） | 读取器不可用时是否自动接受 `ID`；`TRUE` 时自动用 `Bind` 提供的 `ID` |

## 3. 报警（§20）

`CMS` 合规设备**必须**实现的报警（表 38）：

| 报警 | 潜在/迫近危险 | 影响 |
| --- | --- | --- |
| `PIO Failure` | 潜在 | 操作员/设备/物料 |
| `Access Mode Violation` | 潜在 | 操作员/设备/物料 |
| `Carrier Verification Failure` | 潜在 | 设备 |
| `Slot Map Read Failed` | 潜在 | 操作员/设备/物料 |
| `Slot Map Verification Failed` | 潜在 | 设备/物料 |
| `Attempt To Use Out Of Service Load Port` | 潜在 | 设备/物料 |
| `Carrier Presence Error` | 潜在 | 操作员/设备/物料 |
| `Carrier Placement Error` | 潜在 | 操作员/设备/物料 |
| `Carrier Dock/UnDock Failure` | 潜在 | 设备/物料 |
| `Carrier Open/Close Failure` | 潜在 | 设备/物料 |
| `Duplicate CarrierID` | 潜在 | 物料 |
| `Internal Buffer Carrier Move Failure`（仅内部缓冲） | 潜在 | 设备/物料 |
| `Carrier Removal Error` | 潜在 | 操作员/设备/物料 |

> 这是载具转移报警的**子集**；设备可能有更多载具转移相关报警（§20.2.1）。

**`Duplicate CarrierID` 规则**（§20.3）：设备收到与现有载具同 `CarrierID` 的载具时——① 第二个载具**不处理**；② 若第一个载具尚未开始处理，也不处理；③ 若第一个已开始处理，发出 `Duplicate Carrier ID In Process` 事件通知主机。

## 4. 合规声明表（§21 表 39）

**基础 `CMS` 要求**：

| 要求 | `CMS` 章节 |
| --- | --- |
| `Load Port` 编号 | §9.1 |
| `Carrier` 槽编号 | §9.2 |
| `Load Port Transfer` 状态模型 | §9.3-9.4.3 |
| `Carrier` 对象实现 | §10 |
| `Load Port Reservation` 状态模型（内部缓冲设备） | §12 |
| `Load Port/Carrier Association` 状态模型 | §13 |
| `CarrierID` 验证支持 | §14.2 |
| `Slot Map` 验证支持 | §14.3 |
| 服务实现 | §16 |
| 附加事件实现 | §18 |
| 变量数据定义 | §19 |
| 报警实现 | §20 |

**附加 `CMS` 能力**（可选）：固定缓冲设备的 `Load Port Reservation` 状态模型（§12）、预留可见信号（§12.2）。

> 合规判定方式与 `E30` 的 `Fully GEM Capable` 类似——逐项勾选"已实现 / `CMS` 合规"（见 [E30 GEM 合规](../e30/compliance.md) 的判定思路）。
