# 服务：`Host` 与设备的交互命令

> `E87` 用 **20 个服务消息**（§16）让 `Host` 指挥设备的载具管理动作。服务分两类：**请求/响应（`R`）**——`Host` 发起、设备回 `CMStatus`；**通知（`N`）**——设备主动发出、不需响应。本页是服务字典（§16、§17）。

## 1. 服务消息约定（§7.3、§16）

- 服务参数表用 `Req/Ind` 与 `Rsp/Conf` 列标注方向：发起方的消息叫 `Request`，接收方称 `Indication`；接收方回的叫 `Response`，原发起方称 `Confirmation`。
- 参数标记：`M` = 必选、`C` = 条件、`U` = 用户定义、`-` = 不用、`=` =（响应专用）值与主消息一致。
- **`CMStatus`**：所有服务响应的返回信息，含 `CMAcknowledge` + `Status`（错误列表）。
- **`CMAcknowledge` 取值**（表 16）：`Acknowledge, command has been performed` / `Invalid command` / `Cannot perform now` / `Invalid data or argument` / `Acknowledge, request will be performed with completion signaled later by an event` / `Rejected, invalid state`。

## 2. 服务总表（表 15）

| 服务 | 类型 | 用途 |
| --- | --- | --- |
| `Bind` | R | 把 `CarrierID` 关联到端口，端口进入 `RESERVED` |
| `CancelAllCarrierOut` | R | 取消队列中所有 `CarrierOut` |
| `CancelBind` | R | 取消 `CarrierID`-端口关联，端口进入 `NOT RESERVED` |
| `CancelCarrier` | R | 取消当前载具相关动作，载具回到卸载位（或缓冲位） |
| `CancelCarrierAtPort` | R | 取消指定端口的载具动作，载具回到端口卸载位 |
| `CancelCarrierNotification` | R | 销毁经 `CarrierNotification` 实例化的载具对象 |
| `CancelCarrierOut` | R | 从队列移除指定 `CarrierOut` |
| `CancelReservationAtPort` | R | 移除端口预留并停用可见信号 |
| `CarrierIn` | R | 把载具从端口移入内部缓冲（异常场景） |
| `CarrierNotification` | R | 告知设备某 `CarrierID` 未来将到达（不指定端口） |
| `CarrierOut` | R | 把载具从缓冲移到端口（**可排队**） |
| `CarrierReCreate` | R | 重创建载具对象（同载具再次引入端口） |
| `CarrierRelease` | R | 释放载具离开读/写位置 |
| `CarrierTagReadData` | R | 从载具 `ID` 标签读数据 |
| `CarrierTagWriteData` | R | 向载具 `ID` 标签写数据 |
| `ChangeAccess` | R | 改变指定端口的访问模式 |
| `ChangeServiceStatus` | R | 改变端口传输服务状态（`IN/OUT OF SERVICE`） |
| `ProceedWithCarrier` | R | 指示设备继续使用指定载具（验证通过） |
| `ReserveAtPort` | R | 预留指定端口并激活可见信号（交接边界） |

## 3. 服务详解

### 3.1 `Bind` / `CancelBind`（关联与预留）

**`Bind`**（表 18）：参数 `PortID`（M）+ `CarrierID`（M）+ `PropertiesList`（C）。

- 关联 `CarrierID` 到端口 → 端口 `RESERVED`；实例化载具对象。
- 若指定载具已通过 `Bind`/`CarrierNotification`/`CarrierID` 读实例化，`Bind` 被拒绝（重复 `CarrierID`）。

**`CancelBind`**（表 20）：`PortID` 或 `CarrierID`（至少一个）。

- 取消关联 → 端口 `NOT RESERVED`；销毁载具对象。

### 3.2 `CarrierNotification` / `CancelCarrierNotification`

**`CarrierNotification`**（表 27）：`CarrierID`（M）+ `PropertiesList`（C）。告知设备某载具未来到达，**不指定端口**（无端口关联）；实例化 `ObjID = CarrierID` 的对象；重复 `ID` 被拒绝。

**`CancelCarrierNotification`**（表 23）：`CarrierID`（M）。销毁对应对象。

### 3.3 `ProceedWithCarrier`（验证通过继续）

参数 `CarrierID`（M）+ `PortID`（C）+ `PropertiesList`（C）。指示设备继续载具操作。

- **主机侧验证**：`ProceedWithCarrier` 表示 `CarrierID` 和/或 `Slot Map` 验证正确。
- **设备侧验证成功**：设备**不需要**此消息即可继续。
- **设备侧验证失败**：设备**必须**收到 `CancelCarrier` 或 `ProceedWithCarrier` 才能继续。
- 主机侧 `CarrierID` 验证：`ID` 读后第一个 `ProceedWithCarrier` 称为 **#1**，槽图读后的称为 **#2**（§16.4.19.2）。

### 3.4 `CancelCarrier` / `CancelCarrierAtPort`

**`CancelCarrier`**（表 21）：`CarrierID`（M）+ `PortID`（C）。取消载具相关动作：

- 载具在端口 → 回到端口装载/卸载位，准备卸载；
- 载具在内部位置 → 回到内部缓冲位（需后续 `CarrierOut` 移到外部端口）；
- **晶圆已被取走加工后拒绝**该服务。

**`CancelCarrierAtPort`**（表 22）：`PortID`（M）。中止指定端口的任何载具（`CarrierID` 未知时可用）；端口上载具准备卸载。

### 3.5 `CarrierIn` / `CarrierOut`（内部缓冲）

**`CarrierIn`**（表 26）：`CarrierID`（M）。把载具从端口移入内部缓冲（异常场景）。**只**用于内部缓冲设备；若之前未收到过该载具的 `CarrierOut`，服务被拒绝。

**`CarrierOut`**（表 28）：`CarrierID`（M）+ `PortID`（C）。把载具从缓冲移到端口：

- 开始执行时：目的端口 `TRANSFER BLOCKED` + 关联 `ASSOCIATED`。
- **可排队**（§16.4.12.2）：队列大小 = 缓冲位数 + 内部 `FIMS` 口数；每端口 `FIFO`；端口未指定时设备自选。排队服务在当前晶圆处理完成、端口 `NOT ASSOCIATED` 后才生效。
- 排队中的 `CarrierOut` 期间端口保持 `TRANSFER BLOCKED`。
- 完成由事件指示（`CarrierLocation Changed` / `Load Port State Change` 迁移 9，表 17）。

### 3.6 `ReserveAtPort` / `CancelReservationAtPort`

**`ReserveAtPort`**（表 36）：`PortID`（M）。预留端口（未来活动），端口进入 `RESERVED`，激活可见信号。可只做预留而用主机侧 `ID` 验证。

**`CancelReservationAtPort`**（表 25）：`PortID`（M）。取消预留，端口 `UNRESERVED`，停用可见信号。**注意**：由物理 `CarrierOut` 开始的预留**不能**由此服务取消。

### 3.7 `ChangeAccess` / `ChangeServiceStatus`

**`ChangeAccess`**（表 33）：`AccessMode`（M）+ `PortList`（M）。改变端口访问模式（`AUTO`/`MANUAL`）；部分端口无法切换时接受命令但只改允许的端口，并在响应中说明（§16.4.17）。

**`ChangeServiceStatus`**（表 34）：`PortID`（M）+ `ServiceStatus`（M）。改变端口传输服务状态（`IN SERVICE`/`OUT OF SERVICE`）。

### 3.8 `CarrierReCreate`（重创建）

参数 `CarrierID`（M）+ `PropertiesList`（C）。重创建载具对象（同一载具再次引入端口）：

- 带 `PropertiesList` → **设备侧验证**流程（设备校验内容与提供信息）；
- 不带 → **主机侧验证**流程（重新读 `ID` → `WAITING FOR HOST` → 主机验证 → 重读槽图 → 主机验证）；
- 只接受于端口处于 `READY TO UNLOAD` 状态时；
- 从其他标准（`E40`/`E90`/`E94`）视角等同"载具移走 + 新载具放入"。

### 3.9 `CarrierRelease`（释放读/写位）

`PortID` 或 `CarrierID`（至少一个）。告知设备载具可离开读/写位置（§15、§17.1）：

- `CarrierHold` = `Host Release` 时，载具保持在写位置直到此服务收到；
- 端口与载具不匹配时拒绝；
- 内部缓冲设备收到后可移动载具离开读/写位。

## 4. `Carrier` 标签读写（§17）

某些技术可在载具 `ID` 标签上存数据（`E99` 标准）：

- **读写时机**：`Host` 指定（设备不知道数据内容）；读只能在**读位置**、写只能在**写位置**（两者可能相同）。
- **`CarrierTagReadData`**（表 31）：`LocationID`/`CarrierID`（二选一）+ `DataSeg` + `DataSize` → 返回 `Data`。
- **`CarrierTagWriteData`**（表 32）：同上参数 + `Data`（M）→ 写数据。
- 不匹配（`LocationID` 与 `CarrierID` 不一致）时拒绝。
- `CarrierHold` 为 `Host Release` 时，`Host` 完成所有读写后发 `CarrierRelease`；`CarrierAccessingStatus` 须为 `CARRIER COMPLETE`/`CARRIER STOPPED` 才能 `Undock`。
- `CarrierRelease` 与 `CarrierOut` 目的不同：`CarrierOut` 是移到端口，`CarrierRelease` 是允许离开读/写位（可配合使用）。

## 5. 服务触发的事件（表 17）

| 服务 | 可能标志完成的事件 |
| --- | --- |
| `CarrierOut` | `CarrierLocation Changed`、`Load Port State Change`（迁移 9） |
| `CarrierIn` | `CarrierLocation Change`、`Load Port State Change`（迁移 8） |
| `CancelCarrier` / `CancelCarrierAtPort` | `CarrierLocation Changed`、`Load Port State Change`（迁移 9） |
| `ChangeServiceStatus` | `LoadPortTransferState Change`（迁移 2/3） |
| `ChangeAccess` | `Load Port Access Mode State Change`（迁移 2/3） |

> 服务的完成：逻辑级服务（`Bind`、`CancelReservationAtPort`）通常立即确认；触发物理移动的服务（`CarrierOut`、`CancelCarrier`）通常回"将执行，完成由事件指示"，缓解长事务超时（§16.3.1）。

## 6. 数据项速查（服务参数）

| 参数 | 形式 | 说明 |
| --- | --- | --- |
| `CarrierID` | 文本 1-80 | 载具标识（符合 `E39` `ObjID` 约束） |
| `PortID` | 整数 | 端口号（与 `Load Port` 号一致） |
| `PortList` | `L,n` | 端口号列表 |
| `PropertiesList` | `L,n` 名值对 | `AttributeID` + `AttributeData` 列表 |
| `AccessMode` | 枚举 | `AUTO` / `MANUAL` |
| `ServiceStatus` | 枚举 | `IN SERVICE` / `OUT OF SERVICE` |
| `LocationID` | 文本 | 载具位置 |
| `DataSeg` / `DataSize` / `Data` | 协议相关 | 标签读写参数 |
| `CMStatus` | 结构 | `CMAcknowledge` + `Status`（`ErrorCode`/`ErrorText` 列表） |
