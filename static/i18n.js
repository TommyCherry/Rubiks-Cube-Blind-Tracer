/* UI translations only: never change form values, algorithms, or user content. */
(() => {
    'use strict';
    const messages = new Map();
    const patterns = [];
    const normalize = value => value.replace(/\s+/g, ' ').trim();
    function add(english, chinese) {
        english = normalize(english);
        if (english.includes('{')) {
            const expression = english.split(/(\{\d+\})/).map(part => /^\{\d+\}$/.test(part)
                ? '(.+?)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
            patterns.push([new RegExp(`^${expression}$`), chinese]);
        } else messages.set(english, chinese);
    }
    // Numbered placeholders preserve names, counts, and cube notation verbatim.
    const catalog = `
When helper priority is on, highlighted tiles stay first. Reorder helpers among themselves and other targets among themselves.|启用辅助目标优先时，高亮方块始终排在最前。可分别调整辅助目标和其他目标各自的顺序。
Prioritize helpers first|优先使用辅助目标
Helpers are the positions used to swap pieces with the buffer after doing setup moves.|辅助目标是在完成设置步后，用于与缓冲块交换的目标位置。
Choose helpers|选择辅助目标
Edge helpers|棱块辅助目标
Corner helpers|角块辅助目标
Effective order:|实际优先顺序：
Select the letters you use as helpers. In piece mode, selecting any sticker prioritizes its whole piece. In sticker mode, only the selected stickers get priority. Turning priority off restores your usual order.|选择你使用的辅助目标字母。在块模式下，选择任意贴纸即可优先处理整个块。在贴纸模式下，仅所选贴纸获得优先级。关闭优先功能后恢复原来的顺序。
Invalid edge helper sticker.|无效的棱块辅助贴纸。
Invalid corner helper sticker.|无效的角块辅助贴纸。
Order by|排序单位
Piece|块
Sticker|贴纸
Sticker mode lets you prioritize each letter separately and choose the sticker that opens a new cycle. Other stickers on an already visited piece are skipped.|贴纸模式允许单独设置每个字母的优先级，并选择新循环的起始贴纸。已访问块上的其他贴纸会被跳过。
Choose which piece to visit first when a new cycle is needed. Choose piece mode to group letters, or sticker mode to order individual letters. The active buffer and solved pieces are skipped.|需要新循环时，选择优先访问的块。块模式将同一块的字母分组，贴纸模式则单独排列每个字母。当前缓冲块和已复原的块会被跳过。
Invalid cycle-break ordering mode.|无效的断环排序模式。
Invalid edge sticker cycle-break order.|无效的棱块贴纸断环顺序。
Invalid corner sticker cycle-break order.|无效的角块贴纸断环顺序。
Cycle-break letter order|断环字母顺序
Choose which piece to visit first when a new cycle is needed. Each tile shows the letters on one piece, using your letter scheme. The active buffer and solved pieces are skipped.|需要开始新循环时，选择优先访问的块。每个方块显示该块在你的编码方案中的字母。当前缓冲块和已复原的块会被跳过。
Drag tiles or use the arrow buttons. The same priority applies throughout the solve.|拖动方块或使用箭头按钮调整顺序。整个还原过程使用同一优先级。
Reset cycle-break order|重置断环顺序
Language|语言
YOUR BLINDFOLDED PRACTICE SPACE|你的盲拧练习空间
Rubik's Cube Blindfolded Tracer|魔方盲拧编码追踪器
Beginner · Rubik's Cube Blindfolded Tracer|入门 · 魔方盲拧编码追踪器
Expert · Rubik's Cube Blindfolded Tracer|进阶 · 魔方盲拧编码追踪器
From scramble to memo. Explore your solves, one cycle at a time.|从打乱到记忆编码，逐个循环分析你的还原过程。
Account and solve history|账户与还原历史
WCA profile|WCA 头像
My Official Solve History|我的官方还原历史
Official Solve History|官方还原历史
Log out|退出登录
Sign in with WCA|使用 WCA 登录
Search official solve history|查询官方还原历史
Tracer mode|追踪模式
Beginner|入门
Expert|进阶
Save settings|保存设置
Keep named presets on your profile, including letters, colors, buffers, and all solving options on this page.|将命名预设保存到个人资料，包括字母、颜色、缓冲块及本页的所有还原选项。
Preset name|预设名称
e.g. My competition setup|例如：我的比赛设置
Save new preset|保存新预设
Your presets|你的预设
Choose a preset|选择预设
Load preset|加载预设
Sign in with WCA to save settings to your profile|使用 WCA 登录，将设置保存到个人资料
Start with a scramble|从打乱开始
Paste a scramble or generate a fresh one, then build your memo.|粘贴打乱公式或生成新打乱，然后生成记忆编码。
Scramble:|打乱：
Enter a custom scramble...|输入自定义打乱公式…
Generate Random Scramble|生成随机打乱
Generate Memo|生成记忆编码
Practice a conjugacy class|练习共轭类
Choose exact cycles, such as|指定循环结构，例如
. Use e for edges, c for corners, and ' for a misoriented cycle. Unlisted pieces stay solved.|。e 表示棱块，c 表示角块，' 表示方向异常的循环。未列出的块保持复原。
Conjugacy class|共轭类
Scrambles (1–100)|打乱数量（1–100）
Generate practice scramble|生成练习打乱
Generate practice scrambles|生成多个练习打乱
Choose 1 for a single memo, or 2–100 to fill the bulk scramble analysis below.|选择 1 生成单次编码，选择 2–100 将打乱填入下方批量分析。
Bulk scramble analysis|批量打乱分析
Enter one scramble per line. Leading list numbers such as|每行输入一个打乱。行首的列表编号（如
or|或
are removed; blank lines are ignored. Uses your selected buffers, edge and corner floating settings, pseudoswap, and letter scheme.|）会被移除，空行会被忽略。使用当前的缓冲块、棱角浮动设置、伪交换和字母编码方案。
are removed; blank lines are ignored. Uses your selected buffers, pseudoswap, and letter scheme.|）会被移除，空行会被忽略。使用当前的缓冲块、伪交换和字母编码方案。
Scrambles (up to 1,000)|打乱公式（最多 1,000 条）
Trace scramble set|追踪整组打乱
Error:|错误：
Letter scheme & cube map|字母编码与魔方展开图
Set your sticker letters, colors, and cube orientation.|设置贴纸字母、颜色及魔方朝向。
Your sticker letters|贴纸字母编码
Speffz is loaded by default. Click any sticker to change its letter.|默认使用 Speffz 编码。点击任意贴纸即可修改字母。
Apply Chinese Speffz (中式 Speffz)|应用中式 Speffz
Both Speffz presets set white up and green front. Chinese Speffz replaces U, V, W, X with W, X, Y, Z.|两种 Speffz 预设均使用白顶绿前的朝向。中式 Speffz 将 U、V、W、X 分别替换为 W、X、Y、Z。
Apply Chi Chu (彳亍)|应用彳亍编码
Chi Chu sets yellow up, red front, green right, blue left, orange back, and white down.|彳亍编码使用黄顶、红前、绿右、蓝左、橙后、白底的朝向。
Reset to Speffz|重置为 Speffz
Reset All Settings|重置所有设置
Color Scheme|配色方案
Orientation|朝向
Editable cube net|可编辑的魔方展开图
{0} sticker letter|{0} 贴纸字母
Solving settings|还原设置
Buffers|缓冲块
Choose your primary buffers and whether to use pseudoswap.|选择主缓冲块以及是否使用伪交换。
Choose your starting buffers, then set your floating priorities.|选择起始缓冲块，然后设置浮动优先级。
Method preset|方法预设
Custom|自定义
OP/OP — UR edges, UFR corners|OP/OP — 棱块 UR，角块 UFR
OP/OP — UR edges, UBL corners|OP/OP — 棱块 UR，角块 UBL
M2/OP — DF edges, UBL corners|M2/OP — 棱块 DF，角块 UBL
All presets start with pseudoswap off. M2/OP uses UB as the first edge cycle-break choice for even and odd target counts. You can adjust the settings below.|所有预设默认关闭伪交换。M2/OP 在目标数为偶数或奇数时，均优先选择 UB 作为棱块断环位置。你可以在下方调整设置。
Edge Buffer:|棱块缓冲块：
Corner Buffer:|角块缓冲块：
Floating buffers|浮动缓冲块
Optional|可选
Choose which buffers can be used for floating and drag them to set priority. Standalone cycles float only when their opening buffer is enabled in the remaining priority order: they start at a pair boundary, have even length, and open and close on the same sticker.|选择可用于浮动的缓冲块，拖动以设置优先级。独立循环只有在其起始缓冲块已在剩余优先级中启用时才会浮动：循环须从编码对边界开始、长度为偶数，且在同一贴纸处开始和结束。
Edge Buffers|棱块缓冲块
Corner Buffers|角块缓冲块
Select all|全选
Select none|全不选
Highest priority → Lowest priority|最高优先级 → 最低优先级
Parity|奇偶性
Choose whether to pseudoswap, then add your corner parity techniques.|选择是否使用伪交换，然后添加角块奇偶处理技巧。
Use Pseudoswap|使用伪交换
First Edge|第一个棱块
Second Edge|第二个棱块
First edge|第一个棱块
Second edge|第二个棱块
Include LTCT (U-layer corner buffers)|启用 LTCT（U 层角块缓冲块）
How it works|原理说明
On parity scrambles with unequal CW/CCW twist counts, combine parity with one twist from the larger group. LTCT and T2C are unavailable from D-layer corner buffers. UFL forces UF/UL pseudoswap, UBR forces UB/UR, and UBL forces UB/UL, including after floating. UFR uses your selected pseudoswap edges. The marked [LTCT] twist saves one algorithm by sharing the parity algorithm. Balanced twist counts and non-parity scrambles are unchanged.|当打乱具有奇排列且顺时针与逆时针扭角数量不等时，将较多一组中的一个扭角与奇偶处理合并。D 层角块缓冲块不支持 LTCT 和 T2C。UFL 强制使用 UF/UL 伪交换，UBR 使用 UB/UR，UBL 使用 UB/UL，浮动后同样适用。UFR 使用你选择的伪交换棱块。标记为 [LTCT] 的扭角与奇偶公式合并，可省去一个公式。扭角数量平衡或偶排列的打乱不受影响。
Execute Parity + 3twist as Comm + LTCT|将奇偶 + 三扭角处理为交换子 + LTCT
Requires Include LTCT. When LTCT leaves an unpaired standalone twist, pair the parity target with a cycle break into that twisted corner, following the odd-target cycle-break order. Use its closing sticker as the new LTCT target. Opposite-direction 2-twists stay paired.|需要启用 LTCT。当 LTCT 留下一个未配对的独立扭角时，按奇数目标断环顺序，将奇偶目标与进入该扭角的断环目标配对，并使用其闭环贴纸作为新的 LTCT 目标。方向相反的双扭角仍保持配对。
Include T2C when LTCT is not used|未使用 LTCT 时启用 T2C
On parity scrambles, reserve one two-piece corner cycle with different opening/closing stickers for the final algorithm. [T2C: …] counts as one algorithm; its three sticker targets are included in target counts. LTCT takes priority.|在奇排列打乱中，保留一个起止贴纸不同的两角块循环作为最后一个公式。[T2C: …] 计为一个公式，其三个贴纸目标计入目标数。LTCT 优先。
Miscellaneous|其他设置
Fine-tune techniques, cycle breaks, and individual corner parity cases.|微调技巧、断环顺序及单个角块奇偶情况。
Include basic sandwiching|启用基础夹心技巧
AB CD BE becomes [Sandwich B: CD] AE: one sandwich algorithm plus AE. Highlights mark sandwiches. Each saves one estimated algorithm; target counts stay unchanged. Patterns are matched within each buffer’s memo, without overlapping.|AB CD BE 转换为 [Sandwich B: CD] AE：一个夹心公式加上 AE。夹心部分会高亮显示，每次可减少一个预估公式，目标数不变。模式在各缓冲块编码内匹配，互不重叠。
Include 3-twists|启用三扭角
On non-parity scrambles with at least two more CW twists than CCW twists, or vice versa, mark the final two twists from the larger group as a 3-twist with the corner buffer. This changes the tracing output only and does not affect the estimated algorithm count.|在偶排列打乱中，若顺时针扭角比逆时针扭角至少多两个（或反之），则将较多一组的最后两个扭角与角块缓冲块标记为三扭角。此设置仅改变追踪输出，不影响预估公式数。
Cycle-break decisions — even target counts|断环决策 — 偶数目标数
Cycle-break decisions — odd target counts|断环决策 — 奇数目标数
Choose which piece to break into after an even number of targets, including zero. The first unsolved, unvisited piece wins; the active buffer is skipped. Each decision uses the current number of traced targets. Floating still follows its separate settings.|选择目标数为偶数（包括零）时的断环位置。优先选择第一个未复原且未访问的块，跳过当前缓冲块。每次决策依据当前已追踪的目标数。浮动仍遵循独立设置。
Choose which piece to break into after an odd number of targets. The first unsolved, unvisited piece wins; the active buffer is skipped. Each decision uses the current number of traced targets. Floating still follows its separate settings.|选择目标数为奇数时的断环位置。优先选择第一个未复原且未访问的块，跳过当前缓冲块。每次决策依据当前已追踪的目标数。浮动仍遵循独立设置。
Drag panels to reorder, or use the left/right buttons. Highest priority → Lowest priority.|拖动面板或使用左右按钮调整顺序。最高优先级 → 最低优先级。
Edge cycle-break order|棱块断环顺序
Corner cycle-break order|角块断环顺序
Move {0} earlier|将 {0} 前移
Move {0} later|将 {0} 后移
Per-target overrides inherit this order unless enabled. Targets refer to stickers, so opposite orientations can have different choices.|各目标的自定义顺序在未启用时继承此顺序。目标指贴纸，因此不同方向可使用不同选择。
Starting target {0}|起始目标 {0}
Use a custom order for {0}|为 {0} 使用自定义顺序
Corner parity pseudoswaps — 84 cases|角块奇偶伪交换 — 84 种情况
Override the edge pair for the final unpaired corner target when Use Pseudoswap is enabled. Leave both edges at Default to use the global pair. LTCT and T2C use their own rules.|启用伪交换时，为最后一个未配对角块目标指定棱块对。两个棱块均保留“默认”即可使用全局设置。LTCT 和 T2C 使用各自的规则。
Reset all parity overrides|重置所有奇偶自定义设置
{0} buffer — {1} cases|{0} 缓冲块 — {1} 种情况
Default|默认
Scramble conjugacy class|打乱共轭类
Original scramble cycles: e = edges, c = corners, ' = nonzero total cycle orientation. Solved pieces are omitted.|原始打乱循环：e = 棱块，c = 角块，' = 循环总方向非零。已复原的块省略。
Old Pochmann algorithms for each sticker target, in tracing order.|按追踪顺序展示每个贴纸目标的 Old Pochmann 公式。
Each example shows setup moves, a named permutation, and the undo moves. Expand it to see the full algorithm.|每个示例显示设置步、置换公式名称和还原设置步。展开即可查看完整公式。
These examples cover traced targets. Parity handling, flipped edges, and in-place corner twists need separate algorithms.|这些示例涵盖追踪目标。奇偶处理、翻棱和原地扭角需要单独的公式。
OP edge examples|OP 棱块示例
OP corner examples|OP 角块示例
UR buffer; UB, UF, and UL helpers.|缓冲块为 UR；辅助目标为 UB、UF 和 UL。
UBL buffer; UFR helper. Uses Y-perm with setup and undo moves. Setup positions follow Speffz; displayed letters follow your selected letter scheme.|缓冲块为 UBL，辅助目标为 UFR。使用设置步 + Y-perm + 还原设置步。设置步对应 Speffz 位置，显示字母采用你选择的编码方案。
OP corner examples currently require a UBL buffer. Algorithms for other corner buffers have not been defined yet.|目前 OP 角块示例仅支持 UBL 缓冲块，尚未定义其他角块缓冲块的公式。
No OP corner algorithm has been defined for this target.|尚未为此目标定义 OP 角块公式。
OP examples loaded.|OP 示例已加载。
No supported targets in this trace.|此追踪中没有受支持的目标。
Old Pochmann edge algorithms for each sticker target, in tracing order.|按追踪顺序展示每个贴纸目标的 Old Pochmann 棱块公式。
Uses the built-in OP edge list with a UR buffer and UB, UF, and UL helpers. Each example shows setup moves, a named permutation, and the undo moves. Expand it to see the full algorithm.|使用内置 OP 棱块公式表，以 UR 为缓冲块，UB、UF、UL 为辅助目标。每个示例显示设置步、置换公式名称和还原设置步。展开即可查看完整公式。
These examples cover edge targets only. Corner algorithms, parity handling, and flipped edges need separate algorithms.|这些示例仅涵盖棱块目标。角块、奇偶处理和翻棱需要单独的公式。
OP edge examples currently require a UR buffer. M2 and other buffer algorithms have not been defined yet.|目前 OP 棱块示例仅支持 UR 缓冲块。尚未定义 M2 和其他缓冲块的公式。
Full algorithm|完整公式
OP edge examples loaded.|OP 棱块示例已加载。
No edge targets in this trace.|此追踪中没有棱块目标。
No OP edge algorithm has been defined for this target.|尚未为此目标定义 OP 棱块公式。
Solution examples|还原示例
Example moves for each ordinary 3-style edge pair, in tracing order.|按追踪顺序，展示每个普通 3-style 棱块编码对的示例公式。
Uses the first manmade algorithm from|使用以下来源中的第一个人工公式：
, checked against its sticker cycle. Floating buffer changes are respected. These are individual edge examples, not a complete solve: corners, parity, flips, and combined techniques need separate algorithms. Sandwiches are shown as their original 3-style pairs.|，并验证其贴纸循环。支持浮动缓冲块变化。这些是单独的棱块示例，并非完整还原：角块、奇偶、翻棱及组合技巧需要额外公式。夹心技巧以原始 3-style 编码对展示。
Show example moves|显示示例公式
Edge Memo|棱块记忆编码
Corner Memo|角块记忆编码
{0} targets|{0} 个目标
Copy|复制
Copied!|已复制！
Each two-letter pair in [Flips: …] or [2Flip: …] identifies one flipped edge, not two targets. A [2Flip: … …] is one algorithm performed at a floating boundary. Flips are excluded from target counts and add one algorithm per two flipped edges, rounded up. The selected edge buffer is excluded from the flip list and count.|[Flips: …] 或 [2Flip: …] 中的每个双字母对表示一个翻棱，而非两个目标。[2Flip: … …] 表示在浮动边界执行的一个公式。翻棱不计入目标数，每两个翻棱增加一个公式，向上取整。所选棱块缓冲块不计入翻棱列表及数量。
Show Trace Details|显示追踪详情
Edge Targets|棱块目标
Corner Targets|角块目标
Cycle {0}:|循环 {0}：
Solve Info|还原信息
Edge Cycle Breaks|棱块断环
Corner Cycle Breaks|角块断环
Flipped Edges|翻棱
Twisted Corners|扭角
None|无
Yes|是
No|否
Clockwise: None|顺时针：无
Counterclockwise: None|逆时针：无
Clockwise: {0}|顺时针：{0}
Counterclockwise: {0}|逆时针：{0}
True|是
False|否
Clockwise:|顺时针：
Counterclockwise:|逆时针：
Back to tracer|返回追踪器
YOUR COMPETITION ARCHIVE|你的比赛档案
EXPLORE COMPETITION HISTORY|探索比赛历史
Browse competitions. Find a scramble. Trace it again.|浏览比赛，找到打乱，再次追踪。
Viewing {0}|正在查看 {0}
Whose history?|查看谁的历史？
My solve history|我的还原历史
Search by WCA ID|按 WCA ID 查询
WCA ID|WCA ID
e.g. 2015CHER07|例如：2015CHER07
Event|项目
3x3 blindfolded|三阶盲拧
3x3 multiple blindfolded|三阶多盲
Show history|显示历史
Import All to Bulk|全部导入批量分析
All available multi-blind scramble sets from competitions where the selected person has an official result in any event, including extra scrambles. These are competition scrambles, not a record of which cubes that person personally attempted.|列出该选手在任意项目有官方成绩的比赛中的所有可用多盲打乱组，包括备用打乱。这些是比赛打乱，并不记录该选手实际尝试了哪些魔方。
Competitions|比赛
Newest first|最新优先
Oldest first|最早优先
Search competitions|搜索比赛
Search by name, keyword or year…|按名称、关键词或年份搜索…
Year|年份
All years|所有年份
Sort by date|按日期排序
New to old|从新到旧
Old to new|从旧到新
No competitions match your search. Try another keyword or year, or clear your filters.|没有符合搜索条件的比赛。请尝试其他关键词或年份，或清除筛选条件。
Import competition|导入比赛
Collapse|收起
Expand|展开
Collapse {0}|收起 {0}
Expand {0}|展开 {0}
Round|轮次
Attempt|尝试
Result|成绩
Scrambles|打乱
Round 1|第一轮
Round 2|第二轮
Round 3|第三轮
Final|决赛
Semi-final|半决赛
Combined final|合并决赛
Combined round 1|合并第一轮
Combined round 2|合并第二轮
Combined round 3|合并第三轮
Combined semi-final|合并半决赛
Group {0}|组别 {0}
Trace|追踪
Scramble unavailable|暂无打乱
No history to show yet|暂无历史记录
No multi-blind scrambles found for competitions this person attended.|未找到该选手参赛比赛的多盲打乱。
No official 3x3 blindfolded results found for this WCA ID in the local database.|本地数据库中未找到此 WCA ID 的官方三阶盲拧成绩。
Enter a WCA ID above to explore someone's official history.|在上方输入 WCA ID 以查看选手的官方历史记录。
{0} of {1}|{0} / {1}
{0} attempts|{0} 次尝试
{0} attempt|{0} 次尝试
{0} scramble sets|{0} 组打乱
{0} scramble set|{0} 组打乱
{0} attempts|{0} 次尝试
{0} cubes|{0} 个魔方
Extra set {0} · Group {1}|备用组 {0} · 组别 {1}
Attempt {0} · Group {1}|尝试 {0} · 组别 {1}
Round {0} · {1} cubes|轮次 {0} · {1} 个魔方
Import extra set to Bulk|导入备用组到批量分析
Import attempt to Bulk|导入此次尝试到批量分析
Cube|魔方
Scramble|打乱
Action|操作
Trace cube {0}|追踪第 {0} 个魔方
No scrambles available for this attempt.|此次尝试暂无可用打乱。
Bulk scramble results|批量打乱结果
Trace another scramble set|追踪另一组打乱
Scramble set results|打乱组分析结果
Average targets|平均目标数
Average estimated algorithms|平均预估公式数
Permutation parity|排列奇偶性
Average buffers used|平均缓冲块使用数
Buffer usage by scramble|各打乱的缓冲块使用情况
Edge buffers|棱块缓冲块
Corner buffers|角块缓冲块
Buffer|缓冲块
Usage|使用率
No valid scrambles to summarize. Correct the flagged lines and submit again.|没有可汇总的有效打乱。请修正标记的行后重新提交。
Exact estimated alg count|精确预估公式数
All counts|所有数量
Sort scrambles|打乱排序
Original line order|原始行顺序
Alg count: low to high|公式数：从少到多
Alg count: high to low|公式数：从多到少
Search / sort|搜索 / 排序
Reset|重置
Conjugacy class describes the original scramble: e = edges, c = corners, and ' marks nonzero total cycle orientation. Solved pieces are omitted.|共轭类描述原始打乱：e = 棱块，c = 角块，' 表示循环总方向非零。已复原的块省略。
No scrambles match this algorithm count.|没有符合此公式数的打乱。
Line / scramble|行号 / 打乱
Edge memo|棱块编码
Corner memo|角块编码
Targets|目标数
Edge / corner|棱块 / 角块
Est. algs|预估公式数
WCA competition details ({0})|WCA 比赛详情（{0}）
Matches a scramble group in your 3BLD history. Your personal group assignment is not recorded in this data.|匹配你的三阶盲拧历史中的一个打乱组。此数据不包含你个人的组别分配记录。
Checking your class…|正在检查共轭类…
Generating scramble {0} of {1} for {2}… The first solve may take a few seconds.|正在为 {2} 生成第 {0}/{1} 个打乱…首次求解可能需要几秒钟。
Ready: {0}. Scramble inserted above—select Generate Memo to analyze it.|已就绪：{0}。打乱已填入上方，请选择“生成记忆编码”进行分析。
Ready: {0} scrambles for {1}. Select Trace scramble set below to analyze them.|已就绪：共轭类 {1} 的 {0} 个打乱。请选择下方“追踪整组打乱”进行分析。
Loading and checking BLDDB algorithms…|正在加载并验证 BLDDB 公式…
View case on BLDDB|在 BLDDB 查看此情况
Algorithm sources|公式来源
Edge examples loaded. Additional cases may be needed to finish the solve.|棱块示例已加载。完成还原可能还需要处理其他情况。
No ordinary edge pairs in this trace.|此追踪中没有普通棱块编码对。
Needs a parity or special-case algorithm; not an ordinary 3-style cycle.|需要奇偶或特殊情况公式，不属于普通 3-style 循环。
Enter a name for your preset.|请输入预设名称。
Saving settings…|正在保存设置…
Loaded “{0}”. Generate a memo to use these settings.|已加载“{0}”。生成记忆编码即可使用这些设置。
Saved “{0}” to your profile.|已将“{0}”保存到个人资料。
Reset your letter scheme, color scheme, and cube orientation to defaults?|将字母编码、配色方案及魔方朝向重置为默认值？
`;
    catalog.trim().split('\n').forEach(line => { const index = line.indexOf('|'); add(line.slice(0, index), line.slice(index + 1)); });
    [
        ['Each letter in [CW Twists: …] or [CCW Twists: …] identifies one twisted corner, excluded from target counts. The selected corner buffer is excluded. Added twist algorithms = min(CW twists, CCW twists) + |CW twists − CCW twists|.', '[CW Twists: …] 或 [CCW Twists: …] 中的每个字母表示一个扭角，不计入目标数，所选角块缓冲块也不计入。额外扭角公式数 = min（顺时针扭角数，逆时针扭角数）+ |顺时针扭角数 − 逆时针扭角数|。'],
        ['Each two-letter pair in [Flips: …] identifies one flipped edge, not two targets. Flips are excluded from target counts and averages. The selected edge buffer is excluded from the flip list and count.', '[Flips: …] 中的每个双字母对表示一个翻棱，而非两个目标。翻棱不计入目标数及平均值。所选棱块缓冲块不计入翻棱列表及数量。'],
        ['Each letter in [CW Twists: …] or [CCW Twists: …] identifies one twisted corner. Twists are excluded from target counts and averages, and the selected corner buffer is excluded from twist lists and counts. With Execute Parity + 3twist as Comm + LTCT, the twist traced through a cycle break contributes two targets and is removed from standalone twist counts.', '[CW Twists: …] 或 [CCW Twists: …] 中的每个字母表示一个扭角。扭角不计入目标数及平均值，所选角块缓冲块不计入扭角列表及数量。启用“将奇偶 + 三扭角处理为交换子 + LTCT”时，通过断环追踪的扭角贡献两个目标，并从独立扭角计数中移除。'],
        ['Estimated algorithms = ceil(edge targets ÷ 2) + ceil(corner targets ÷ 2) + ceil(flipped edges ÷ 2) + min(CW twists, CCW twists) + |CW twists − CCW twists|. A marked T2C cycle counts as one final algorithm; its three targets are excluded from ordinary target-pair algorithm estimates. Each applied LTCT subtracts one algorithm for the twist combined with parity. CW/CCW counts include the corner marked LTCT. When basic sandwiching is enabled, each highlighted sandwich subtracts one algorithm. Target counts stay unchanged. Buffers count only those used for targets, with edges and corners counted separately. Enabled edge and corner floating switches are included in buffer usage. Parity describes the scrambled permutation before pseudoswap.', '预估公式数 = ceil（棱块目标数 ÷ 2）+ ceil（角块目标数 ÷ 2）+ ceil（翻棱数 ÷ 2）+ min（顺时针扭角数，逆时针扭角数）+ |顺时针扭角数 − 逆时针扭角数|，其中 ceil 表示向上取整。标记的 T2C 循环计为最后一个公式，其三个目标不计入普通编码对的公式估算。每次 LTCT 将扭角与奇偶合并，减少一个公式。顺/逆时针计数包含标记为 LTCT 的角块。启用基础夹心技巧时，每个高亮夹心减少一个公式，目标数不变。仅统计用于目标的缓冲块，棱块和角块分别计数。已启用的棱角浮动切换计入缓冲块使用量。奇偶性描述伪交换前的打乱排列。'],
        ['{0} scrambles traced · {1} invalid lines excluded from statistics.', '已追踪 {0} 个打乱 · 统计已排除 {1} 个无效行。'],
        ['Basic sandwiching: Enabled.', '基础夹心技巧：已启用。'],
        ['Basic sandwiching: Disabled.', '基础夹心技巧：已禁用。'],
        ['LTCT: Enabled.', 'LTCT：已启用。'], ['LTCT: Disabled.', 'LTCT：已禁用。'],
        ['T2C: Enabled.', 'T2C：已启用。'], ['T2C: Disabled.', 'T2C：已禁用。'],
        ['{0} sandwiches in {1} / {2} scrambles ({3}%). Matches require AB CD BE within one buffer\'s memo; floating can remove these patterns.', '{1} / {2} 个打乱中共有 {0} 个夹心（{3}%）。需在同一缓冲块编码内匹配 AB CD BE；浮动可能消除这些模式。'],
        ['Enable “Include basic sandwiching” above and re-submit to analyze sandwiches.', '请在上方启用“基础夹心技巧”并重新提交，以分析夹心情况。'],
        ['{0} scrambles use parity plus one leftover corner twist in a combined algorithm.', '{0} 个打乱使用将奇偶与一个剩余扭角合并的公式。'],
        ['{0} scrambles use a final T2C algorithm.', '{0} 个打乱使用 T2C 作为最后一个公式。'],
        ['Average targets: {0} edges / {1} corners. Average buffers: {2} edges / {3} corners. Total target range: {4}.', '平均目标数：棱块 {0} / 角块 {1}。平均缓冲块数：棱块 {2} / 角块 {3}。总目标数范围：{4}。'],
        ['Each percentage is out of all {0} valid scrambles. A buffer counts once per scramble when used for targets. Multiple buffers can be used in one scramble, so percentages may add up to more than 100%.', '各百分比以全部 {0} 个有效打乱为基数。每个缓冲块用于目标时，在每个打乱中计一次。一个打乱可使用多个缓冲块，因此百分比总和可能超过 100%。'],
        ['Showing {0} of {1} lines. Statistics above describe the full batch. Invalid lines have no alg count and appear last when sorting by count.', '显示 {1} 行中的 {0} 行。上方统计描述整个批次。无效行没有公式数，按数量排序时列在最后。'],
        ['Round {0} · Solve {1} · Group {2}', '轮次 {0} · 还原 {1} · 组别 {2}'],
    ].forEach(pair => add(...pair));
    const errors = `
Could not access presets. Please try again.|无法访问预设，请重试。
Generation failed. Please try again.|生成失败，请重试。
The solver timed out. Please try again.|求解超时，请重试。
Could not load the solver. Please refresh and try again.|无法加载求解器，请刷新后重试。
The solver could not solve this state within its search limit. Please try again.|求解器在搜索限制内未能解决此状态，请重试。
The request timed out. Please try again.|请求超时，请重试。
Could not load example moves.|无法加载示例公式。
No manmade algorithm found for this case.|未找到此情况的人工公式。
The first algorithm could not be verified for this case.|此情况的第一个公式未能通过验证。
Enter a conjugacy class, for example 3e3e'1e' 3c.|请输入共轭类，例如 3e3e'1e' 3c。
Use cycle lengths followed by e or c and an optional prime, such as 3e3e'1e' 3c.|请在循环长度后加 e 或 c，可选加 '，例如 3e3e'1e' 3c。
Edge cycle lengths must be 1–12; corner cycle lengths must be 1–8.|棱块循环长度须为 1–12，角块循环长度须为 1–8。
The class uses more than {0} edges.|此共轭类使用了超过 {0} 个棱块。
The class uses more than {0} corners.|此共轭类使用了超过 {0} 个角块。
A legal cube needs an even number of primed edge cycles.|合法魔方中带 ' 的棱块循环数量必须为偶数。
One primed corner cycle cannot balance its twist. Use zero or at least two.|单个带 ' 的角块循环无法平衡扭转。请使用零个或至少两个。
Edge and corner permutation parity must match. An even-length cycle changes parity.|棱块和角块的排列奇偶性必须一致。偶数长度循环会改变奇偶性。
A parity override must select two different edges.|奇偶自定义设置必须选择两个不同棱块。
Provide up to 100 edge cases.|最多可提供 100 个棱块情况。
Each case must contain three distinct edge pieces.|每种情况必须包含三个不同棱块。
BLDDB examples are temporarily unavailable. Your trace is still available.|BLDDB 示例暂不可用，你仍可查看追踪结果。
Sign in with WCA to use profile presets.|请使用 WCA 登录以使用个人预设。
Refresh the page before saving your preset.|请刷新页面后再保存预设。
Settings preset is too large.|设置预设过大。
Enter a preset name and settings.|请输入预设名称和设置。
Use a preset name between 1 and 80 characters.|预设名称长度须为 1–80 个字符。
Invalid settings preset.|无效的设置预设。
Invalid settings values.|无效的设置值。
Invalid cube colors.|无效的魔方颜色。
Your profile can hold up to 30 presets.|个人资料最多可保存 30 个预设。
That preset name already exists. Choose a new name.|该预设名称已存在，请使用新名称。
Competition details are temporarily unavailable. Your bulk traces are still available.|比赛详情暂不可用，你仍可查看批量追踪结果。
Profile presets are temporarily unavailable. Please try again later.|个人预设暂不可用，请稍后重试。
Invalid corner floating buffer order.|无效的角块浮动缓冲顺序。
Invalid corner floating buffer.|无效的角块浮动缓冲块。
Invalid edge floating buffer order.|无效的棱块浮动缓冲顺序。
Invalid edge floating buffer.|无效的棱块浮动缓冲块。
Enter at least one scramble, one per line.|请至少输入一个打乱，每行一个。
Please enter at most 3,000 scrambles per batch.|每批最多输入 3,000 个打乱。
Missing scramble after list number.|列表编号后缺少打乱公式。
Enter a conjugacy class.|请输入共轭类。
This class describes a solved cube. Include at least one unsolved cycle for practice.|此共轭类描述已复原的魔方。练习时请至少包含一个未复原循环。
Missing generated scramble.|缺少生成的打乱。
Invalid scramble verification request.|无效的打乱验证请求。
This generation request expired. Please generate another scramble.|此生成请求已过期，请重新生成打乱。
The solver returned invalid moves. Please try again.|求解器返回了无效步骤，请重试。
The scramble did not match the requested state. Please try again.|打乱与请求的状态不匹配，请重试。
Your WCA account does not have a WCA ID yet. You can search another person's history below.|你的 WCA 账户尚无 WCA ID，可在下方查询其他选手的历史。
Enter a WCA ID to search for someone's history.|请输入 WCA ID 以查询选手历史。
Enter a valid WCA ID, such as 2015CHER07 (4 digits, 4 letters, 2 digits).|请输入有效的 WCA ID，例如 2015CHER07（4 位数字、4 个字母、2 位数字）。
Official solve history is temporarily unavailable. Please try again later.|官方还原历史暂不可用，请稍后重试。
Pseudoswap edges must be different.|伪交换必须选择两个不同的棱块。
Floating buffers must not contain duplicates.|浮动缓冲块不能重复。
Floating buffers must be edge position IDs (0–11).|浮动缓冲块必须为棱块位置编号（0–11）。
Floating buffers must be corner position IDs (0–7).|浮动缓冲块必须为角块位置编号（0–7）。
Invalid move: {0}|无效转动：{0}
Invalid edge even cycle-break order.|无效的棱块偶数目标断环顺序。
Invalid edge odd cycle-break order.|无效的棱块奇数目标断环顺序。
Invalid corner even cycle-break order.|无效的角块偶数目标断环顺序。
Invalid corner odd cycle-break order.|无效的角块奇数目标断环顺序。
Invalid edge cycle-break order for {0}.|{0} 的棱块断环顺序无效。
Invalid corner cycle-break order for {0}.|{0} 的角块断环顺序无效。
Select two different edges for parity case {0}, or leave both as Default.|请为奇偶情况 {0} 选择两个不同棱块，或将两者均保留为默认。
`;
    errors.trim().split('\n').forEach(line => { const index = line.indexOf('|'); add(line.slice(0, index), line.slice(index + 1)); });
    'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split(' ').forEach((month, index) => add(month, `${index + 1}月`));
    // Match specific sentences before generic count labels.
    patterns.sort((a, b) => b[0].source.length - a[0].source.length);
    let language = 'en';
    try { language = localStorage.getItem('tracer-language') === 'zh' ? 'zh' : 'en'; } catch (_) { /* Storage can be disabled. */ }
    function translate(value) {
        if (language !== 'zh') return value;
        const source = normalize(value);
        let translated = messages.get(source);
        if (!translated) {
            for (const [pattern, replacement] of patterns) {
                const match = source.match(pattern);
                if (match) { translated = replacement.replace(/\{(\d+)\}/g, (_, index) => match[Number(index) + 1]); break; }
            }
        }
        return translated ? value.replace(value.trim(), translated) : value;
    }
    window.TracerI18n = {translate};
    const originals = new WeakMap();
    const attributes = ['aria-label', 'placeholder', 'title', 'data-label'];
    const excluded = 'script, style, code, textarea, .memo, .bulk-memo, .scramble-text, .wca-user-info > strong, .competition-identity h2, #preset-list option:not([value=""]), [data-no-translate]';
    function updateValue(node, key, current, write) {
        let saved = originals.get(node);
        if (!saved) { saved = {}; originals.set(node, saved); }
        if (!saved[key] || saved[key].rendered !== current) saved[key] = {source: current};
        const rendered = translate(saved[key].source);
        saved[key].rendered = rendered;
        if (current !== rendered) write(rendered);
    }
    function render(root) {
        if (root.nodeType === 3) {
            if (!root.parentElement?.closest(excluded)) updateValue(root, 'text', root.nodeValue, value => { root.nodeValue = value; });
            return;
        }
        if (root.nodeType !== 1 && root.nodeType !== 9) return;
        if (root.nodeType === 1 && root.closest(excluded)) return;
        if (root.nodeType === 1) attributes.forEach(attribute => {
            if (root.hasAttribute(attribute)) updateValue(root, attribute, root.getAttribute(attribute), value => root.setAttribute(attribute, value));
        });
        [...root.childNodes].forEach(render);
    }
    function start() {
        const selector = document.getElementById('site-language');
        const observer = new MutationObserver(changes => {
            // Disconnect while writing to avoid observing our own translations.
            observer.disconnect();
            changes.forEach(change => {
                if (change.type === 'childList') change.addedNodes.forEach(render);
                else render(change.target);
            });
            observe();
        });
        function observe() { observer.observe(document.documentElement, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes}); }
        function refresh() {
            observer.disconnect();
            document.documentElement.lang = language === 'zh' ? 'zh-Hans' : 'en';
            selector.value = language;
            render(document.documentElement);
            observe();
        }
        selector.addEventListener('change', () => {
            language = selector.value === 'zh' ? 'zh' : 'en';
            try { localStorage.setItem('tracer-language', language); } catch (_) { /* Keep session choice. */ }
            refresh();
        });
        refresh();
    }
    document.addEventListener('DOMContentLoaded', start);
})();
