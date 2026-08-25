# `Carrier` 对象与验证

> `E87` 把每个载具封装成**对象**（`Carrier Object`），属性通过 `E39` 对象服务查询；`Host` 与设备之间用 `Bind`/`CarrierNotification`/`ProceedWithCarrier` 等服务传递载具信息并完成 **`CarrierID` 验证**与 **`Slot Map` 验证**。本页讲对象生命周期、属性表与两种验证方法（§10、§14、§15）。

## 1. `Carrier` 对象（§10）

### 1.1 为什么用对象（§7.1）

设备上同类实体很多（多个载具、多个端口）且多为**瞬态**，难以用固定状态变量表达。把实体定义为符合 **`E39` 对象服务标准（`OSS`）** 的对象后，`Host` 只需指定**对象类型 + 对象 `ID`**，就能查询单个实体的属性（`GetAttr`）。

### 1.2 对象实例化（§10.2.3）

对象 = 设备内载具的软件表示。以下三种方式之一创建：

1. **服务**：`Bind` / `CarrierNotification` / `CarrierReCreate`（带 `PropertiesList`）；
2. **`CarrierID` 读取**：读到当前不存在的 `ID`（成功读）——`ContentMap` 初始为空列表，`SlotMap` 初始全为 `UNDEFINED`；
3. **`ProceedWithCarrier` / `CancelCarrier`**：在 `NOT ASSOCIATED` 端口上执行（= `ID` 读取失败场景）。

**对象标识**：`ObjID` = `CarrierID`；设备须保证 `Bind` 实例化前 `CarrierID` 唯一（§10.2.4）。

### 1.3 对象销毁（§10.2.5）

1. 载具从设备卸载（正常终结）；
2. 收到 `CancelBind` / `CancelCarrierNotification`（载具装载前）；
3. 设备侧验证失败，设备自发 `CancelBind`；
4. `Host`/操作员发出 `CarrierReCreate`。

### 1.4 属性表（表 6）

| 属性 | 访问 | 必选 | 格式 | 说明 |
| --- | --- | --- | --- | --- |
| `Capacity` | `RO` | Y | 正整数 | 载具可容纳的最大晶圆数 |
| `CarrierIDStatus` | `RO` | Y | 枚举 | `ID NOT READ` / `WAITING FOR HOST` / `ID VERIFICATION OK` / `ID VERIFICATION FAILED` |
| `CarrierAccessingStatus` | `RO` | Y | 枚举 | `NOT ACCESSED` / `IN ACCESS` / `CARRIER COMPLETE` / `CARRIER STOPPED` |
| `ContentMap` | `RO` | Y | `L,n` 结构 | 槽 1..n 的 `LotID` + `SubstrateID` 有序列表（主机未提供时 `LotID` 为 `null`；槽空或未知时均为 `null`） |
| `LocationID` | `RO` | Y | 文本 1-80 | 当前载具位置标识（`LPn`/`FIMSn`/`BUFn`…） |
| `ObjType` | `RO` | Y | 文本 = `Carrier` | 对象类型 |
| `ObjID` | `RO` | Y | 文本 = `CarrierID` | 对象标识 |
| `SlotMap` | `RO` | Y | `L,n` 枚举 | `UNDEFINED` / `EMPTY` / `NOT EMPTY` / `CORRECTLY OCCUPIED` / `CROSS SLOTTED` / `DOUBLE SLOTTED`（主机提供，槽图读成功后改为设备读值） |
| `SlotMapStatus` | `RO` | Y | 枚举 | `SLOT MAP NOT READ` / `WAITING FOR HOST` / `SLOT MAP VERIFICATION OK` / `SLOT MAP VERIFICATION FAILED` |
| `SubstrateCount` | `RO` | Y | 非负整数 ≤ `Capacity` | 载具内当前晶圆数 |
| `Usage` | `RO` | Y | 文本（设备定义） | 载具内容物类型（`TEST`/`DUMMY`/`PRODUCT`/`FILLER`…） |

**属性规则**（§10.3.5）：

- 设备**维护并更新**所有属性；`Capacity`、`ContentMap`、`SlotMap`、`SubstrateCount`、`Usage` 可由主机提供初值。
- `Capacity`/`ContentMap`/`SubstrateCount`/`Usage` 应在 `Bind`/`CarrierNotification`/`ProceedWithCarrier` 中、`SlotMap` 提供时或之前给出。
- 设备侧槽图验证时 `SlotMap` 随 `Bind` 等提供；主机侧验证时**不**提供。
- 载具未到前可通过 `Bind` 提供属性，保留到 `CancelBind` 或载具移走。

### 1.5 `Carrier Location`（§10.3.6-10.4）

- **位置（`LocationID`）**：任何能放置载具的物理区域——`Load Port` 位、`FIMS` 位（晶圆访问口）、内部缓冲位，以及内部搬运用的 `Gripper`/传送带/升降机。
- **命名**：`LPn`（`Load Port` n）、`FIMSn`（`FIMS` 口 n）、`BUFn`（缓冲位 n）。
- 固定缓冲设备的 `Load Port` 有两个位置：**交付/取走位**与**对接/开门位**（§10.5）。
- 载具移动期间 `LocationID` 保持为**源位置**，直到移动完成停在目的地（§10.6.1）。

## 2. 验证（§14）

**验证（`Verification`）** = 实际值与期望值比较。`E87` 需要验证两个值：**`CarrierID`** 与 **`Carrier Slot Map`**。验证可由主机或设备执行，取决于是否用了 `Bind` 服务（§14.1）：

- 主机在设备读取前提供期望值 → **设备侧验证**（`Equipment Based`）；
- 主机未提供期望值 → 设备把读取结果上报，**主机侧验证**（`Host Based`）。

### 2.1 `CarrierID` 验证方法（表 12）

| 方法 | 装载前主机动作 | 设备装载时动作 | 装载后主机动作 |
| --- | --- | --- | --- |
| **设备侧验证**（`Bind`） | 主机执行 `Bind`（关联端口 + `CarrierID`） | 设备读 `CarrierID` 并与 `Bind` 提供值比较；**通过** → 状态迁移 6（`ID VERIFICATION OK`），继续处理；**失败** → 设备自发 `CancelBind` 销毁原对象、按读到的 `ID` 新建对象，**不得**开门/移入缓冲，等待 `ProceedWithCarrier` 或 `CancelCarrier` | 通过：无动作；失败：`CancelCarrier`（强制载具到卸载位）或 `ProceedWithCarrier`（按读到 `ID` 继续） |
| **设备侧验证**（`CarrierNotification`） | 主机执行 `CarrierNotification`（只告知未来到达，不指定端口） | 读 `ID` 并与通知值比较；通过 → 迁移 6 | 失败不适用（无端口关联）；未实例化的载具到达按**主机侧验证**处理 |
| **主机侧验证** | 无需（可选 `ReserveAtPort`） | 设备读 `CarrierID` 并在事件中上报，实例化对象（迁移 3）；**不得**开门/移入缓冲，等待 `ProceedWithCarrier` | 通过：`ProceedWithCarrier`；失败：`CancelCarrier` / `CancelCarrierAtPort` 强制载具到卸载位 |

### 2.2 `Slot Map` 验证方法（表 13）

| 方法 | 验证前主机动作 | 设备动作 | 验证后主机动作 |
| --- | --- | --- | --- |
| **设备侧验证** | `Bind` / `ProceedWithCarrier` 提供 `Slot Map` | 读槽图并与主机提供值比较（迁移 13 或 14） | 通过：继续；失败：`CancelCarrier`（取消）或 `ProceedWithCarrier`（继续） |
| **主机侧验证** | 无需 | 读槽图并在事件中上报 | 通过：`ProceedWithCarrier`；失败：`CancelCarrier` 或 `ProceedWithCarrier` |

> 不需要严格槽图管理的工厂可用主机侧验证（§14.3）。

### 2.3 验证与服务的对应（表 14，节选）

| 服务 | 预留 | `CarrierID` 验证 | 槽图验证 |
| --- | --- | --- | --- |
| `Bind`（带槽图） | 是 | 设备侧 | 设备侧 |
| `Bind`（不带槽图） | 是 | 设备侧 | 主机侧 |
| `ReserveAtPort` | 是 | 主机侧 | 主机侧 |
| `CarrierNotification` | 否 | 设备侧 | 设备侧或主机侧 |
| `ProceedWithCarrier` | 否 | 主机侧 | 主机侧 |

## 3. `Carrier` 释放控制（§15）

读/写载具标签时，载具必须保持在**写位置**直到主机完成读写（§15.1）：

**`CarrierHold` 触发**（§15.2）：

| 设置 | 行为 |
| --- | --- |
| `Host Release` | 设备保持载具在写位置，直到收到 `CarrierRelease` 服务 |
| `Equipment Release` | 设备按 `Carrier` 状态模型迁移到 `CARRIER COMPLETE` / `CARRIER STOPPED` 时释放 |

**`UnclampControl` 触发**（§15.3-15.4，固定缓冲 + `AUTO` 模式）：

| 设置 | 行为 |
| --- | --- |
| `CARRIERCOMPLETE/CARRIERSTOPPED Triggered Unclamp` | 载具状态迁移到完成/停止时自动松开夹紧 |
| `AMHS Triggered Unclamp` | 载具保持夹紧/锁定/对接位，直到 `AMHS` 到达开始 `PIO` 卸载序列时释放 |

> 访问模式为 `MANUAL` 时 `UnclampControl` 无效（§15.4）。

## 4. 设备侧验证失败时的行为（附录 R1-3.5 ~ R1-3.7）

设备读到的 `CarrierID` 与端口关联对象不符时（错误载具送到错误端口）：

- 若读到的 `ID` 已有对象注册（`STORED`）→ 按 `STORED` 逻辑处理（取消旧关联、必要时删除端口关联对象、`WAITING FOR HOST`）；
- 若没有注册对象（`CREATED`）→ 创建对象并关联到交付端口，上报 `CarrierID` 等待主机指令（`ProceedWithCarrier` → `ID VERIFICATION OK`；`CancelCarrier` → `ID VERIFICATION FAILED`，载具到卸载位）。
