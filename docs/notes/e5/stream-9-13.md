# `S9` 系统错误 / `S10` 终端服务 / `S12` 晶圆图谱 / `S13` 数据集传输

> 本页收拢四条用途各异的流：`S9` 是**错误上报**（任何合规设备的必答项），`S10` 是终端文本服务，`S12` 是晶圆图谱（`Wafer Map`），`S13` 是未格式化数据集（`Data Set`）的传输协议（已删除的 `S11` 的继任者）。

## 1. `S9` 系统错误（§10.13）

"本流提供一种方法通知主机：收到了无法处理的消息块，或事务（接收）定时器超时。消息指示发生了**消息故障（`Message Fault`）**或**通信故障（`Communications Fault`）**，但不指示**通信失败（`Communications Failure`）**。"

### 1.1 三类故障的定义（§10.13.1-3）

| 概念 | 定义 | 处理 |
| --- | --- | --- |
| `Communications Failure` | `SECS-I` 环境中 `RTY` 重试次数超限 | **不发**任何 `S9` 消息（注 10） |
| `Communications Fault` | 设备没有收到预期的消息（事务或对话定时器到期） | 发 `S9F9` / `S9F13` |
| `Message Fault` | 收到内容、上下文或长度有故障而无法处理的消息 | 发 `S9F1`-`F11` 相应消息 |

### 1.2 消息总表

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S9F0` | `Abort Transaction` | H↔E | 中止事务 |
| `S9F1` | `Unrecognized Device ID`（`UDN`） | H←E | 消息头中的 `Device ID` 不匹配任何已知设备 |
| `S9F3` | `Unrecognized Stream Type`（`USN`） | H←E | 不认识消息头中的 `Stream` |
| `S9F5` | `Unrecognized Function Type`（`UFN`） | H←E | 不认识消息 ID 中的 `Function` |
| `S9F7` | `Illegal Data`（`IDN`） | H←E | `Stream`/`Function` 认识，但数据格式无法解释 |
| `S9F9` | `Transaction Timer Timeout`（`TTN`） | H←E | 事务（接收）定时器超时，事务已中止；由主机负责恰当响应保持系统运行 |
| `S9F11` | `Data Too Long`（`DLN`） | H←E | 发给设备的数据超过其处理能力 |
| `S9F13` | `Conversation Timeout`（`CTN`） | H←E | 期望的数据在合理时间内未收到，资源已清理 |

**结构**：`S9F1`-`F11` 消息体为 `<MHEAD>`（出错消息的块头，`10` 格式）；`S9F9` 为 `<SHEAD>`；`S9F13` 为 `L,2`（`MEXP` + `EDID`）。

> `S9F1`/`F3`/`F5`/`F7` 是 §8.3 最小合规的第二条要求；`S9F9` 是第四条；`S9F13` 对应对话超时（见 [事务与对话协议](transaction.md)）。

## 2. `S10` 终端服务（§10.14）

"本流的功能是在连接于加工/测试设备的操作员终端与主机之间传递文本消息。设备不解释文本内容，只是把文本从终端键盘传给主机，或从主机传给终端显示。人类响应时间的管控由主机负责。"

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S10F0` | `Abort Transaction` | H↔E | 中止事务 |
| `S10F1` | `Terminal Request`（`TRN`） | H←E, [回复] | 终端文本消息发给主机（`TID` + `TEXT`） |
| `S10F2` | `Terminal Request Acknowledge`（`TRA`） | H→E | 确认（`<ACKC10>`） |
| `S10F3` | `Terminal Display, Single`（`VTN`） | H→E, [回复] | 单块显示文本 |
| `S10F4` | `Terminal Display, Single Acknowledge`（`VTA`） | H←E | 确认 |
| `S10F5` | `Terminal Display, Multi-Block`（`VTN`） | H→E, [回复] | 多块显示文本 |
| `S10F6` | `Terminal Display, Multi-block Acknowledge`（`VMA`） | H←E | 确认 |
| `S10F7` | `Multi-block Not Allowed`（`MNN`） | H←E | 设备拒绝多块显示 |
| `S10F9` | `Broadcast`（`BCN`） | H→E, [回复] | 广播到所有终端 |
| `S10F10` | `Broadcast Acknowledge`（`BCA`） | H←E | 确认 |

> 使用 `TID`（终端 ID）区分不同终端；`ACKC10` 值：`0` = 接受显示、`1` = 不显示、`2` = 终端不可用。终端服务在 `E30` 是"附加能力"之一。

## 3. `S12` 晶圆图谱（§10.16）

"本流处理与坐标位置及其关联数据有关的消息，包括晶圆上 `Die` 坐标的晶圆图谱以及关联的分选（`Bin`）信息。" 功能 1-20 覆盖半导体设备制造商在工艺设备（晶圆探针到 `Die Attach`）间传输晶圆图谱的需求。

### 3.1 三种图谱格式（§10.16.1）

| 格式 | 描述 |
| --- | --- |
| **`Type 1`** | 行/列格式：给出坐标行起始位置、行内 `Die` 数、起始方向，每个 `Die` 跟随分选信息（列压缩） |
| **`Type 2`** | 阵列格式：矩阵阵列覆盖全部或部分晶圆，带分选信息 |
| **`Type 3`** | 坐标格式：为每个 `Die` 提供 `X/Y` 位置和 `Bin` 码 |

### 3.2 关键定义（§10.16.2）

- **`Flat`/`Notch` 位置、框架旋转、行列数、`Die` 单位**：用于把图谱关联到物理晶圆。
- **原点（`Origin`）**：五个可能位置之一，由生成图谱的设备指定。
- **`Die` 尺寸**：同一 `Die` 上某点到相邻 `Die` 对应点的距离（`Index`），用 `DUTMS` 单位，恒大于零。
- **工艺 `Die` 数（`PRDCT`）**：受图谱驱动的设备（如 `Die Attach`）用它决定准备多少材料；也用于上报该图谱实际处理的 `Die` 总数。
- **参考点**：把图谱与物理晶圆关联的手段，总数与检测方法由设备负责，标准只提供传输途径。

### 3.3 消息总表

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S12F0` | `Abort Transaction` | H↔E | 中止事务 |
| `S12F1` | `Map Set-up Data Send`（`MSDS`） | H←E, 回复 | 设备发送所有格式共用的图谱设置数据（`MID`/`IDTYP`/`FNLOC`/`FFROT`/`ORLOC`/`RPSEL`…，`L,15`） |
| `S12F2` | `Map Set-up Data Acknowledge`（`MSDA`） | H→E | 确认（`<SDACK>`） |
| `S12F3` | `Map Set-up Data Request`（`MSDR`） | H←E, 回复 | 设备向主机请求待加工产品的设置数据（`L,9`） |
| `S12F4` | `Map Set-up Data`（`MSD`） | H→E | 主机返回设置数据 |
| `S12F5` | `Map Transmit Inquire`（`MAPTI`） | H→E, 回复 | 询问可否发图谱（**必须先于** `S12F7-12`） |
| `S12F6` | `Map Transmit Grant`（`MAPTG`） | H←E | 许可 |
| `S12F7` | `Map Data Send Type 1`（`MDS1`） | H←E, 回复 | 发送 `Type 1` 图谱（多块须先 `S12F5/F6`） |
| `S12F8` | `Map Data Acknowledge Type 1`（`MDA1`） | H→E | 确认 |
| `S12F9` | `Map Data Send Type 2`（`MDS2`） | H←E, 回复 | 发送 `Type 2` 图谱 |
| `S12F10` | `Map Data Acknowledge Type 2`（`MDA2`） | H→E | 确认 |
| `S12F11` | `Map Data Send Type 3`（`MDS3`） | H←E, 回复 | 发送 `Type 3` 图谱 |
| `S12F12` | `Map Data Acknowledge Type 3`（`MDA3`） | H→E | 确认 |
| `S12F13` | `Map Data Request Type 1`（`MDR1`） | H→E, 回复 | 主机请求 `Type 1` 图谱 |
| `S12F14` | `Map Data Type 1`（`MD1`） | H→E | 主机发送 |
| `S12F15` | `Map Data Request Type 2`（`MDR2`） | H→E, 回复 | 主机请求 `Type 2` 图谱 |
| `S12F16` | `Map Data Type 2`（`MD2`） | H→E | 主机发送 |
| `S12F17` | `Map Data Request Type 3`（`MDR3`） | H→E, 回复 | 主机请求 `Type 3` 图谱 |
| `S12F18` | `Map Data Type 3`（`MD3`） | H→E | 主机发送 |
| `S12F19` | `Map Error Report Send`（`MERS`） | H←E | 图谱错误报告 |

> `S12` 与 `E90`（`Substrate Mapping`）同属晶圆图谱主题；`S12` 偏"设备内的 `Die` 图谱"，`E90` 偏 `FOUP` 槽位映射（见主页 `EFEM` 专题）。

## 4. `S13` 数据集传输（§10.17）

"本流提供系统之间传输数据集的协议。**不**打算提供通用文件访问机制。"

### 4.1 数据集特性（§10.17.1-2）

- **`Data Set`** 概念很广：文件、内存数据结构、传感器值集合、高密度晶圆剖面数据。协议只定义**传输方式**，不定义双方如何存储。
- **记录类型（`Record Type`）**：
  - **`Discrete`**：传统记录结构（如 `ASCII` 文本），`RecordLength` = 最长记录长度；每条记录作为一个 `Item` 发送；允许零长度记录。
  - **`Stream`**：无内部结构（如内存转储、`SECS-II` 结构化数据、隐式记录边界），`RecordLength` 无意义。
- **`Handle`**：发送方与接收方之间"单一应用层连接"的名字，在 `OPEN` 事务的主消息中赋值。
  - **`Handle` 唯一性**：对同一发送方，`Handle` 被 `CLOSE` 之前不得用于另一次 `OPEN`（但不同设备之间、以及设备↔主机的双向都可以复用同一 `Handle` 值）。
  - 每个打开的 `Handle` 必须允许**一个打开的事务**。
- **字符传输**：`ASCII` 记录传输时**去掉**操作系统用的记录终止"噪声"字符；数据集不要求单条消息传完；消息长度无任意限制（§10.17.1.2）。

### 4.2 消息总表

| 功能号 | 名称（助记符） | 方向 | 用途 |
| --- | --- | --- | --- |
| `S13F0` | `Abort Transaction` | H↔E | 中止事务 |
| `S13F1` | `Send Data Set Send`（`DSSS`） | H↔E, 回复 | 发送整个数据集（`DATAID` + `DSNAME` + 数据） |
| `S13F2` | `Send Data Set Acknowledge`（`DSSA`） | H↔E | 确认（`<ACKC13>`） |
| `S13F3` | `Open Data Set Request`（`DSOR`） | H↔E, 回复 | **打开**数据集（分配 `Handle`） |
| `S13F4` | `Open Data Set Data`（`DSOD`） | H↔E | 返回打开结果（`Handle` 等） |
| `S13F5` | `Read Data Set Request`（`DSRR`） | H↔E, 回复 | 请求读数据 |
| `S13F6` | `Read Data Set Data`（`DSRD`） | H↔E | 返回数据 |
| `S13F7` | `Close Data Set Send`（`DSCS`） | H↔E, 回复 | **关闭**数据集（释放 `Handle`） |
| `S13F8` | `Close Data Set Acknowledge`（`DSCA`） | H↔E | 确认 |
| `S13F9` | `Reset Data Set Send`（`DSRS`） | H↔E, 回复 | 复位数据集（从头重读） |
| `S13F10` | `Reset Data Set Acknowledge`（`DSRA`） | H↔E | 确认 |
| `S13F11` | `Data Set Object Multi-Block Inquire`（`DSOMGI`） | H↔E, 回复 | 多块询问 |
| `S13F12` | `Data Set Object Multi-Block Grant`（`DSOMBG`） | H↔E | 多块许可 |
| `S13F13` | `Table Data Send`（`TDS`） | H↔E, 回复 | 表数据发送（`DATAID` + 行/列数据） |
| `S13F14` | `Table Data Acknowledge`（`TDA`） | H↔E | 确认 |
| `S13F15` | `Table Data Request`（`TDR`） | H↔E, 回复 | 请求表数据 |
| `S13F16` | `Table Data`（`TD`） | H↔E | 返回表数据 |

**`ACKC13` 返回码节选**：`0` = `OK`、`1` = 稍后再试、`2` = 未知数据集名、`3` = 非法检查点值、`4` = 打开的数据集过多、`5` = 数据集打开次数过多、`6` = 无打开的数据集、`7` = 无法继续、`8` = 数据结束、`9` = `Handle` 占用中、`>10` = 有待处理事务。

> `S13` 是 `E30` `Spooling` 补发与 `E5` `S7F37-44` 大工艺程序传输的底层通道。`S11`（主机文件服务）在 `E5-1104` 中已删除，由 `S13` 取代。

## 5. 数据项速查

| 数据项 | 格式 | 说明 |
| --- | --- | --- |
| `MHEAD` / `SHEAD` | 10 | 出错消息的块头 / 会话头（`S9`） |
| `MEXP` / `EDID` | 20 | 期望的消息 / 出错设备 ID（`S9F13`） |
| `TID` / `TEXT` | 20 | 终端 ID / 文本 |
| `ACKC10` | 10 | 终端确认码 |
| `MID` / `IDTYP` / `FNLOC` / `FFROT` / `ORLOC` / `RPSEL` | 见字典 | 图谱设置（`S12`） |
| `MAPFT` | 见字典 | 图谱格式 |
| `DUTMS` | 见字典 | `Die` 单位 |
| `PRDCT` | 见字典 | 工艺 `Die` 数 |
| `DATAID` / `DSNAME` / `HANDLE` / `RECORDTYPE` / `RECORDLENGTH` | 见字典 | 数据集参数（`S13`） |
| `ACKC13` | 10 | 数据集返回码 |
