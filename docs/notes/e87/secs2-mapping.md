# `E87.1`：`CMS` 的 `SECS-II` 协议映射

> `pdf/E87.pdf` 是两份标准的合订：**`E87-0705`**（`CMS` 行为规范，主体）+ **`E87.1-0702`**（`Provisional Specification for SECS-II Protocol for Carrier Management`，把 `CMS` 的服务与数据映射到 `SECS-II` 消息）。本页讲 `E87.1`——`CMS` 在 `SECS-II`（`E5`）上的具体实现。

## 1. `E87.1` 的定位

- 把 `E87` 的**服务**映射到 `SECS-II` 的流/功能（**集中在 `S3` 流**），把**服务参数**映射到 `SECS-II` 数据项，把**变量数据**映射到 `DVVAL`/`SV` 等数据类。
- **合规要求**：`E87.1` 适用于所有用 `SECS-II` 消息协议（`E5`）实现的 `E87`；合规需同时满足 `E87` 与 `E5`（§2.2）。
- **临时性**：这是临时规范（`Provisional`）——实现尚不成熟，异常处理与错误恢复场景还需补充（§2.1）。

## 2. 服务消息映射（表 1）

`E87` 的 20 个服务映射到 `S3` 流的消息：

| `E87` 服务 | `SECS-II` 消息 | 流/功能 |
| --- | --- | --- |
| `Bind` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `CancelBind` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `CancelAllCarrierOut` | `Cancel All Carrier Out Request/Acknowledge` | `S3F19/20` |
| `CancelCarrier` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `CancelCarrierAtPort` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `CancelCarrierNotification` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `CancelCarrierOut` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `CancelReservationAtPort` | `Port Action Request/Acknowledge` | `S3F25/26` |
| `CarrierIn` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `CarrierNotification` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `CarrierOut` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `CarrierReCreate` | `CarrierReCreate Request/Acknowledge` | `S3F17/18` |
| `CarrierRelease` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `CarrierTagReadData` | `Carrier Tag Read Data Request/Acknowledge` | `S3F29/30` |
| `CarrierTagWriteData` | `Carrier Tag Write Data Request/Acknowledge` | `S3F31/32` |
| `ChangeAccess` | `ChangeAccess` | `S3F27/28` |
| `ChangeServiceStatus` | `Port Action Request/Acknowledge` | `S3F25/26` |
| `ProceedWithCarrier` | `Carrier Action Request/Acknowledge` | `S3F17/18` |
| `ReserveAtPort` | `Port Action Request/Acknowledge` | `S3F25/26` |

**要点**：绝大多数服务共用 `S3F17/18`（`Carrier Action`），靠 `CARRIERACTION` 数据项区分（`Bind`、`CarrierOut`、`CancelCarrier`…）；端口类服务（`ReserveAtPort`、`CancelReservationAtPort`、`ChangeServiceStatus`）用 `S3F25/26`（`Port Action`，靠 `PORTACTION` 区分）；访问模式用 `S3F27/28`（`ChangeAccess`）；标签读写用 `S3F29/30`、`S3F31/32`。

## 3. 服务参数映射（表 2）

| `E87` 参数 | 范围 | `SECS-II` 数据项 |
| --- | --- | --- |
| `AccessMode` | `MANUAL`/`AUTO` | `PORTACCESS` |
| `AttributeData` | 任意 | `CATTRDATA` |
| `AttributeID` | 文本（按 `E39.1` §6） | `CATTRID` |
| `CarrierID` | 1-80 字符 | `CARRIERID` |
| `CMAcknowledge` | 枚举 | `CAACK` |
| `CMStatus` | 结构 `L,2`（`CAACK` + `Status`） | — |
| `Data` | `ASCII`（20） | `DATA` |
| `DataLength` | 整数 | `DATALENGTH` |
| `DataSeg` | `ASCII`（20） | `DATASEG` |
| `ErrorCode` | 枚举 | `ERRCODE` |
| `ErrorText` | 1-80 字符 | `ERRTEXT` |
| `LocationID` | `ASCII`（20） | `LOCID` |
| `PropertiesList` | 名值对 `L,n` | `L,n`（`CATTRID` + `CATTRDATA` 对） |
| `PortID` | `U1`（1-255） | `PTN` |
| `ServiceStatus` | `IN SERVICE`/`OUT OF SERVICE` | `U1`（0 = 停用，1 = 使用中） |
| `Status` | n 个错误 | `L,n`（`ERRCODE` + `ERRTEXT` 对） |

**注意**（注 2）：`E87` 未为某消息规定的参数**禁止**使用；某消息未用的 `SECS-II` 数据项须以**零长度项**发送。

## 4. 附加数据项（表 3）

| 数据项 | 用途 |
| --- | --- |
| `CARRIERACTION` | `S3F17` 区分 `Bind`/`CancelCarrierOut`/`CancelCarrierAtPort`/`CancelBind`/`CarrierIn`/`ProceedWithCarrier`/`CancelCarrierNotification`/`CarrierNotification`/`CarrierReCreate` 服务 |
| `DATAID` | 满足 `SECS-II` 多块询问约定（`CMS` 不要求也不指定） |
| `DATALENGTH` | 告知总消息长度（多块约定）；也可表示载具标签读写的段长度 |
| `GRANT` | 满足 `SECS-II` 多块要求（`CMS` 不要求） |
| `PORTACTION` | `S3F25` 区分端口类、`CancelReservationAtPort`、`ReserveAtPort` 服务 |
| `ACCESSMODE` | `S3F27` 指定期望的端口访问模式 |

## 5. 变量数据映射（表 4）

`CMS` 变量映射到 `SECS-II` 数据类（`DVVAL` = 数据值、`SV` = 状态变量）与格式（枚举用 `U1` 51）：

| 变量 | 类 | 格式 / 枚举 |
| --- | --- | --- |
| `AccessMode` | `DVVAL` | 51：0 = `MANUAL`，1 = `AUTO` |
| `AccessModei` | `SV` | 51（同上） |
| `CarrierAccessingStatus` | `DVVAL` | 51：0 = `NOT ACCESSED`，1 = `IN ACCESS`，2 = `CARRIER COMPLETE`，3 = `CARRIER STOPPED` |
| `CarrierID` | `DVVAL` | `A[1-80]`（符合 `E39.1` §6 `ObjID` 约束） |
| `CarrierIDi` | `SV` | `A[1-80]` |
| `CarrierIDStatus` | `DVVAL` | 51：0 = `ID NOT READ`，1 = `WAITING FOR HOST`，2 = `ID VERIFICATION OK`，3 = `ID VERIFICATION FAILED` |
| `CarrierLocationMatrix` | `SV` | `L,n`（`LocationID` + `CarrierID` 对） |
| `LoadPortReservationState` | `DVVAL` | 51：0 = `NOT RESERVED`，1 = `RESERVED` |
| `LoadPortReservationStateList` | `SV` | `L,n` |
| `LocationID` / `i` | `DVVAL`/`SV` | `A[1-80]` |
| `PortAssociationState` | `DVVAL` | 51：0 = `NOT ASSOCIATED`，1 = `ASSOCIATED` |
| `PortStateInfo` | `DVVAL` | `L,2`（`PortAssociationState` + `PortTransferState`） |
| `PortTransferState` | `DVVAL` | 51：0 = `OUT OF SERVICE`，1 = `TRANSFER BLOCKED`，2 = `READY TO LOAD`，3 = `READY TO UNLOAD` |
| `Reason` | `DVVAL` | 51：0 = `VERIFICATION NEEDED`，1 = `VERIFICATION BY EQUIPMENT UNSUCCESSFUL`，2 = `READ FAIL`，3 = `IMPROPER SUBSTRATE POSITION` |
| `SlotMap` | `DVVAL` | `L,n`（n = 容量 1-25），每项 51：0 = `UNDEFINED`，1 = `EMPTY`，2 = `NOT EMPTY`，3 = `CORRECTLY OCCUPIED`，4 = `DOUBLE SLOTTED`，5 = `CROSS SLOTTED` |
| `SlotMapStatus` | `DVVAL` | 51：0 = `SLOT MAP NOT READ`，1 = `WAITING FOR HOST`，2 = `SLOT MAP VERIFICATION OK`，3 = `SLOT MAP VERIFICATION FAILED` |
| `PartitionCapacity` / `i` | `DVVAL`/`SV` | 51 |
| `BufferCapacityList` | `SV` | `L,n`（`BufferPartitionInfo`） |
| `BufferPartitionInfo` | `DVVAL` | `L,4`（`PartitionID` + `PartitionType` + `AvailPartitionCapacity` + `PartitionCapacity`） |

## 6. `Carrier` 对象属性（表 5）

`E87.1` 定义 `Carrier` 对象属性在 `SECS-II` 中的结构：

| 属性 | `SECS-II` 结构 |
| --- | --- |
| `ObjType` | `1. "Carrier"` |
| `ObjID` | `<CARRIERID>`（符合 `E39.1` §6 `ObjID` 约束） |
| `Capacity` | 51（`U1`），范围 1-25，示例 1、13、25 |
| `CarrierAccessingStatus` | 51（`U1`），按变量枚举 |
| `CarrierIDStatus` | 51（`U1`），按变量枚举 |
| `ContentMap` | `L,n`（n = `Capacity`）：每项 `L,2`（`20 (A) LotID` + `20 (A) SubstID`） |
| `LocationID` | `20 (A)`，符合 `E39.1` §6 `ObjID` 约束 |
| `SlotMap` | `L,n`（n = `Capacity`）：每项 `51 (U1)` 枚举（按变量 `SlotMap`） |
| `SlotMapStatus` | 51（`U1`），按变量枚举 |
| `SubstrateCount` | 51（`U1`），范围 0-25，示例 1、3、21、25 |
| `Usage` | `20 (A)`，设备定义，示例 `TEST`/`DUMMY`/`PRODUCT` |

## 7. 与 `E5` 笔记的衔接

- `S3` 流的消息定义（`Carrier Action`、`Port Action`、`ChangeAccess`、标签读写）见 [E5 S3/S4 物料流](../e5/stream-3-4.md)。
- 参数编码（`Item`/`List`、格式码 `51` = `U1` 等）见 [E5 数据结构](../e5/data-items.md)。
- 事件上报、状态查询的传输机制见 [E5 S5/S6 异常与数据采集](../e5/stream-5-6.md) 与 [E30 事件通知](../e30/event-reporting.md)。
