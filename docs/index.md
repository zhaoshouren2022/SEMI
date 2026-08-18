# SEMI 笔记

> 半导体 **SECS/GEM 协议**学习笔记：研读 SEMI 标准原文，按自己的理解逐章梳理成系统性中文笔记。

## 这是什么

**SEMI**（Semiconductor Equipment and Materials International，国际半导体设备与材料协会）制定了一系列规范晶圆厂设备与主机之间通信的标准，统称 **SECS/GEM**。设备厂商、主机软件都按这些标准对接，是半导体工厂自动化的"通用语言"。

这套笔记记录研读标准原文的梳理成果，特点是：

- **按理解重写，不是翻译**——逐章消化后，用更直白的语言和图表重述；
- **图解驱动**——关键机制（状态机、消息格式、通信流程）用 Mermaid 图呈现；
- **查用分离**——每页独立成文，查字段、查超时、查对比可直接跳转。

## 标准家族

### SECS/GEM

```mermaid
flowchart LR
    subgraph 家族["SECS/GEM 标准家族"]
        E4["E4 SECS-I<br/>串口传输层 RS-232"]
        E5["E5 SECS-II<br/>消息内容（SxFy）"]
        E30["E30 GEM<br/>设备通用模型"]
        E37["E37 HSMS<br/>TCP/IP 传输层"]
    end

    E4 -.->|"替代"| E37
    E5 -.->|"内容不变，换传输层"| E37
```

| 标准 | 角色 | 笔记状态 |
| --- | --- | --- |
| **E37 HSMS** | TCP/IP 传输层，替代 SECS-I | ✅ 已整理（[进入专题](notes/e37-hsms/index.md)） |
| E4 SECS-I | 串口传输层 RS-232 | 部分涉及（见 [SECS-I 与 HSMS 对比](notes/e37-hsms/secs-vs-hsms.md)） |
| E5 SECS-II | 消息内容（S1F1…SxFy） | ⏳ 计划中 |
| **E30 GEM** | 设备通用行为模型 | ✅ 已整理（[进入专题](notes/e30/index.md)） |

### EFEM / 载具管理相关标准（E8x 组）

围绕 **EFEM（设备前端模块）与载具（FOUP）自动化**的一组标准——从"载具怎么交接"（信号层）到"载具状态怎么管"（软件层），再到"晶圆在哪儿 / 作业怎么组织"（内容层）：

| 标准 | 角色 | 层级 | 笔记状态 |
| --- | --- | --- | --- |
| **E84** | Enhanced Carrier Handoff Parallel I/O——载具交接并行 I/O 握手（装载端口 ↔ OHT/搬运设备） | 信号层 | ✅ 熟悉，待整理 |
| **E87 CMS** | Carrier Management——载具管理：FOUP 在装载端口的状态模型与事件 | 软件层 | ✅ 熟悉，待整理 |
| E90 | Substrate Mapping——晶圆映射（FOUP 内晶圆位置） | 内容层 | ⏳ 计划中 |
| E94 CJM | Control Job Management——控制作业管理（组合多个工艺作业） | 调度层 | ⏳ 计划中 |
| E62 | Load Port Operation——装载端口操作（对接/开门/映射/交接） | 端口行为 | ⏳ 计划中 |
| E19 / E47.1 | FOUP 机械接口（FIM）/ 300mm 载具机械规格 | 机械层 | ⏳ 计划中 |
| E23 | Cassette Transfer Parallel I/O——E84 的 200mm 前身 | 信号层（历史） | 提及即可 |
| E88 | AMHS Storage SEM（Stocker）——仓库设备专用模型 | SEM 体系 | 可选 |

> 注：E84 与 E87 是 EFEM 集成的核心搭档——**E84 管"交接握手"（硬件信号），E87 管"载具状态"（软件事件）**；E90/E94 通常与其配套部署（业界常合称 GEM300 的载具管理扩展）。

## 阅读路线

- **新读者（E37）**：从 [E37 总览](notes/e37-hsms/index.md) 开始，按"① → ⑦"的顺序阅读，约一小时建立 HSMS-SS 全貌；
- **新读者（E30）**：从 [E30 总览](notes/e30/index.md) 开始，先看[状态模型](notes/e30/state-models.md)的三个状态图，再沿"建立通信 → 事件通知 → 数据采集 → 报警 → 远程控制 → 工艺程序"主线展开；
- **当工具书用**：查字段去 [消息格式](notes/e37-hsms/message-format.md)，查超时去 [定时器与参数](notes/e37-hsms/timers.md)，查对比去 [SECS-I 与 HSMS 对比](notes/e37-hsms/secs-vs-hsms.md)，查合规判定去 [GEM 合规](notes/e30/compliance.md)；
- **查疑答疑**：[E37 FAQ](notes/e37-hsms/faq.md) 与 [E30 FAQ](notes/e30/faq.md) 汇集学习中的高频疑问，答案标注标准出处。

## 快速入口

| 页面 | 内容 |
| --- | --- |
| [E37 HSMS 总览](notes/e37-hsms/index.md) | HSMS 定位、核心术语、三份标准的关系 |
| [通信模型](notes/e37-hsms/communication.md) | 一次完整通信的五个阶段 |
| [状态机](notes/e37-hsms/state-machine.md) | NOT CONNECTED / NOT SELECTED / SELECTED |
| [消息交换过程](notes/e37-hsms/procedures.md) | 六种消息过程：Select / Data / Deselect / Linktest / Separate / Reject |
| [消息格式](notes/e37-hsms/message-format.md) | 4 字节长度 + 10 字节头部，逐字段拆解 |
| [定时器与参数](notes/e37-hsms/timers.md) | T3 / T5 / T6 / T7 / T8 与超时后果 |
| [E37.1 HSMS-SS](notes/e37-hsms/hsms-ss.md) | 单会话简化版（重点） |
| [FAQ](notes/e37-hsms/faq.md) | 高频疑问答疑 |
| [E30 GEM 总览](notes/e30/index.md) | GEM 定位、两种要求、标准结构 |
| [状态模型](notes/e30/state-models.md) | 通信 / 控制 / 加工 三个状态图 |
| [事件通知](notes/e30/event-reporting.md) | S6F11 自动上报与报告动态配置 |
| [GEM 合规](notes/e30/compliance.md) | 逐能力合规判定与声明表 |
