// 初始化ECharts实例
var myChart = echarts.init(document.getElementById('chart'));
var treeChart = echarts.init(document.getElementById('treeChart'));

// 查找算法信息数据库
const algorithmsInfo = {
    sequentialSearch: {
        name: '顺序查找',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        advantages: '简单易实现，适用于任何存储结构',
        disadvantages: '效率低，不适合大数据量',
        coreIdea: '线性扫描',
        description: '从表的第一个元素开始，依次与关键字比较，直到找到或查找失败',
        steps: [
            '从数据结构的第一个元素开始',
            '将当前元素与目标值进行比较',
            '如果相等，返回当前位置',
            '如果不相等，移动到下一个元素',
            '重复步骤2-4，直到找到目标或遍历完所有元素'
        ],
        colors: {
            current: { color: '#f44336', name: '当前比较元素' },
            found: { color: '#4caf50', name: '找到的目标' },
            searched: { color: '#ffeb3b', name: '已搜索区域' },
            unsearched: { color: '#2196f3', name: '未搜索区域' }
        }
    },
    binarySearch: {
        name: '折半查找',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        advantages: '效率高，查找速度快',
        disadvantages: '要求数据有序存储，插入删除复杂',
        coreIdea: '分治法',
        description: '在有序表中，每次将查找范围缩小一半，直到找到目标或确定不存在',
        steps: [
            '确定查找范围的左右边界',
            '计算中间位置：mid = (left + right) / 2',
            '比较中间元素与目标值',
            '如果相等，查找成功',
            '如果目标值较小，在左半部分继续查找',
            '如果目标值较大，在右半部分继续查找',
            '重复步骤2-6，直到找到目标或范围为空'
        ],
        colors: {
            current: { color: '#f44336', name: '当前中间元素' },
            found: { color: '#4caf50', name: '找到的目标' },
            range: { color: '#ff9800', name: '当前查找范围' },
            excluded: { color: '#9e9e9e', name: '已排除区域' },
            unsearched: { color: '#2196f3', name: '未搜索区域' }
        }
    },
    bstSearch: {
        name: '二叉搜索树查找',
        timeComplexity: 'O(log n)~O(n)',
        spaceComplexity: 'O(1)',
        advantages: '支持动态插入删除，查找效率较高',
        disadvantages: '最坏情况退化为链表',
        coreIdea: '二叉树性质',
        description: '利用二叉搜索树左小右大的性质，快速定位目标元素',
        steps: [
            '从根节点开始比较',
            '如果目标值等于当前节点，查找成功',
            '如果目标值小于当前节点，访问左子树',
            '如果目标值大于当前节点，访问右子树',
            '重复步骤2-4，直到找到目标或到达空节点'
        ],
        colors: {
            current: { color: '#f44336', name: '当前节点' },
            found: { color: '#4caf50', name: '找到的目标' },
            path: { color: '#ff9800', name: '搜索路径' },
            unvisited: { color: '#2196f3', name: '未访问节点' }
        }
    },
    avlSearch: {
        name: '平衡二叉树查找',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        advantages: '保证平衡，查找效率稳定',
        disadvantages: '插入删除时需要旋转调整',
        coreIdea: '自平衡二叉搜索树',
        description: '在平衡二叉树中查找，保证树的高度为O(log n)',
        steps: [
            '从根节点开始，利用BST性质查找',
            '由于树的平衡性，保证O(log n)的查找时间',
            '每个节点的左右子树高度差不超过1',
            '查找路径长度最多为⌊log₂n⌋+1'
        ],
        colors: {
            current: { color: '#f44336', name: '当前节点' },
            found: { color: '#4caf50', name: '找到的目标' },
            path: { color: '#ff9800', name: '搜索路径' },
            unvisited: { color: '#2196f3', name: '未访问节点' }
        }
    },
    btreeSearch: {
        name: 'B-Tree查找',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        advantages: '适合外存储器，减少磁盘I/O',
        disadvantages: '实现复杂，内存开销大',
        coreIdea: '多路平衡搜索树',
        description: 'B-Tree是一种多路搜索树，每个节点包含多个关键字',
        steps: [
            '从根节点开始查找',
            '在当前节点的关键字中进行查找',
            '如果找到，查找成功',
            '如果没找到，根据关键字大小选择子树',
            '重复步骤2-4，直到找到或到达叶子节点'
        ],
        colors: {
            current: { color: '#f44336', name: '当前节点' },
            found: { color: '#4caf50', name: '找到的目标' },
            searching: { color: '#ff9800', name: '正在搜索' },
            unvisited: { color: '#2196f3', name: '未访问节点' }
        }
    },
    hashSearch: {
        name: '哈希表查找',
        timeComplexity: 'O(1)~O(n)',
        spaceComplexity: 'O(n)',
        advantages: '平均查找时间为O(1)',
        disadvantages: '可能出现冲突，最坏情况O(n)',
        coreIdea: '散列函数映射',
        description: '通过散列函数将关键字映射到表中位置，实现快速查找',
        steps: [
            '使用散列函数计算关键字的散列地址',
            '访问散列表的对应位置',
            '如果位置为空，查找失败',
            '如果位置有值，比较关键字',
            '如果相等，查找成功',
            '如果不相等且有冲突处理，按冲突处理方法继续查找'
        ],
        colors: {
            target: { color: '#f44336', name: '目标位置' },
            found: { color: '#4caf50', name: '找到的目标' },
            collision: { color: '#ff9800', name: '冲突位置' },
            empty: { color: '#e0e0e0', name: '空位置' },
            normal: { color: '#2196f3', name: '正常存储' }
        }
    }
};

// 查找算法可视化类
class SearchVisualizer {
    constructor() {
        this.array = this.generateSortedArray(15);
        this.originalArray = [...this.array];
        this.steps = [];
        this.currentStep = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 1000;
        this.intervalId = null;
        this.currentAlgorithm = 'sequentialSearch';
        this.searchTarget = 42;
        this.hashTable = {};
        this.hashSize = 11;
        
        this.initData();
        this.updateAlgorithmInfo();
        
        // 添加窗口调整大小监听器
        window.addEventListener('resize', () => {
            myChart.resize();
            treeChart.resize();
        });
    }
    
    generateSortedArray(size) {
        const arr = [];
        for (let i = 0; i < size; i++) {
            arr.push(Math.floor(Math.random() * 90) + 10);
        }
        return arr.sort((a, b) => a - b);
    }
    
    generateHashTable() {
        this.hashTable = {};
        for (let i = 0; i < this.hashSize; i++) {
            this.hashTable[i] = [];
        }
        
        // 插入一些随机数据
        const values = [];
        for (let i = 0; i < 20; i++) {
            values.push(Math.floor(Math.random() * 100) + 1);
        }
        
        values.forEach(value => {
            const hash = this.hashFunction(value);
            this.hashTable[hash].push(value);
        });
        
        // 确保目标值在表中
        if (!this.isInHashTable(this.searchTarget)) {
            const hash = this.hashFunction(this.searchTarget);
            this.hashTable[hash].push(this.searchTarget);
        }
    }
    
    hashFunction(key) {
        return key % this.hashSize;
    }
    
    isInHashTable(target) {
        for (let i = 0; i < this.hashSize; i++) {
            if (this.hashTable[i].includes(target)) {
                return true;
            }
        }
        return false;
    }
    
    updateAlgorithmInfo() {
        const info = algorithmsInfo[this.currentAlgorithm];
        
        // 更新算法信息卡片
        document.getElementById('algorithmInfo').innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div>
                    <h3 style="margin: 0 0 10px 0; font-size: 24px;">${info.name}</h3>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <span><strong>时间复杂度:</strong> ${info.timeComplexity}</span>
                        <span><strong>空间复杂度:</strong> ${info.spaceComplexity}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #c8f7c5;"><strong>优势:</strong> ${info.advantages}</div>
                    <div style="color: #ffcccb;"><strong>劣势:</strong> ${info.disadvantages}</div>
                </div>
            </div>
        `;
        
        // 更新算法详情
        document.getElementById('algorithmDetails').innerHTML = `
            <h3>🧠 ${info.name}的核心思想：</h3>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                <h4 style="margin-top: 0; color: #856404;">${info.coreIdea}</h4>
                <p style="margin: 10px 0; line-height: 1.6;">${info.description}</p>
            </div>
            
            <h4>🎯 算法步骤详解：</h4>
            <ol style="line-height: 1.8;">
                ${info.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
            
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8; margin-top: 20px;">
                <h4 style="margin-top: 0; color: #0c5460;">⚡ 算法特性：</h4>
                <p style="margin: 10px 0; line-height: 1.6;">
                    • <strong>时间复杂度</strong>：${info.timeComplexity}<br>
                    • <strong>空间复杂度</strong>：${info.spaceComplexity}<br>
                    • <strong>优势</strong>：${info.advantages}<br>
                    • <strong>劣势</strong>：${info.disadvantages}
                </p>
            </div>
        `;
        
        // 更新颜色图例
        const colorLegend = document.getElementById('colorLegend');
        colorLegend.innerHTML = '';
        Object.entries(info.colors).forEach(([key, colorInfo]) => {
            const li = document.createElement('li');
            li.innerHTML = `<span style="color: ${colorInfo.color}; font-weight: bold;">● ${colorInfo.name}</span>`;
            colorLegend.appendChild(li);
        });
    }
    
    initData() {
        this.hideAllContainers();
        
        if (this.currentAlgorithm === 'hashSearch') {
            this.generateHashTable();
            this.showHashTable();
        } else if (this.isTreeAlgorithm()) {
            this.showTreeChart();
            this.initTreeChart();
        } else {
            this.showArrayChart();
            this.initArrayChart();
        }
    }
    
    hideAllContainers() {
        document.getElementById('chart').style.display = 'block';
        document.getElementById('treeChart').style.display = 'none';
        document.getElementById('hashTable').style.display = 'none';
    }
    
    showArrayChart() {
        document.getElementById('chart').style.display = 'block';
        document.getElementById('treeChart').style.display = 'none';
        document.getElementById('hashTable').style.display = 'none';
    }
    
    showTreeChart() {
        document.getElementById('chart').style.display = 'none';
        document.getElementById('treeChart').style.display = 'block';
        document.getElementById('hashTable').style.display = 'none';
        
        // 确保树图容器尺寸正确
        setTimeout(() => {
            if (treeChart) {
                treeChart.resize();
            }
        }, 100);
    }
    
    showHashTable() {
        document.getElementById('chart').style.display = 'none';
        document.getElementById('treeChart').style.display = 'none';
        document.getElementById('hashTable').style.display = 'block';
        this.renderHashTable();
    }
    
    isTreeAlgorithm() {
        return ['bstSearch', 'avlSearch', 'btreeSearch'].includes(this.currentAlgorithm);
    }
    
    initArrayChart() {
        const option = {
            title: {
                text: `${algorithmsInfo[this.currentAlgorithm].name}过程可视化`,
                left: 'center',
                top: 20,
                textStyle: {
                    fontSize: 24,
                    fontWeight: 'bold'
                }
            },
            xAxis: {
                type: 'category',
                data: this.array.map((_, index) => `位置${index}`),
                axisLabel: {
                    rotate: 45,
                    fontSize: 12,
                    color: '#333'
                }
            },
            yAxis: {
                type: 'value',
                max: 110,
                axisLabel: {
                    fontSize: 14,
                    color: '#333'
                }
            },
            series: [{
                type: 'bar',
                data: this.array.map((value, index) => ({
                    value: value,
                    itemStyle: {
                        color: '#91cc75'
                    }
                })),
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#333'
                },
                animationDuration: 500
            }],
            grid: {
                left: '8%',
                right: '8%',
                top: '15%',
                bottom: '20%'
            }
        };
        
        myChart.setOption(option);
    }
    
    initTreeChart() {
        // 生成示例树数据
        const treeData = this.generateTreeData();
        
        const option = {
            title: {
                text: `${algorithmsInfo[this.currentAlgorithm].name}结构`,
                left: 'center',
                top: 20,
                textStyle: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#333'
                }
            },
            series: [{
                type: 'tree',
                data: [treeData],
                top: '15%',
                left: '5%',
                bottom: '5%',
                right: '5%',
                layout: 'orthogonal',
                orient: 'vertical',
                symbol: 'circle',
                symbolSize: 45,
                roam: true,
                initialTreeDepth: -1,
                itemStyle: {
                    color: '#2196f3',
                    borderColor: '#1976d2',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'inside',
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: 'white'
                },
                lineStyle: {
                    color: '#666',
                    width: 2,
                    curveness: 0.2
                },
                leaves: {
                    label: {
                        position: 'inside',
                        color: 'white'
                    }
                },
                emphasis: {
                    focus: 'descendant',
                    itemStyle: {
                        color: '#ff9800'
                    }
                },
                expandAndCollapse: false,
                animationDuration: 550,
                animationDurationUpdate: 750
            }]
        };
        
        treeChart.setOption(option, true);
        treeChart.resize();
    }
    
    generateTreeData() {
        // 获取当前的搜索目标
        const target = this.searchTarget || 42;
        
        // 根据算法类型生成不同的树结构
        if (this.currentAlgorithm === 'btreeSearch') {
            // B-Tree结构 - 确保目标值在树中
            if (target <= 25) {
                return {
                    name: `15,${target},35`,
                    children: [
                        {
                            name: '8,12',
                            children: [
                                { name: '5,7' },
                                { name: '10,11' },
                                { name: '13,14' }
                            ]
                        },
                        {
                            name: '20,25',
                            children: [
                                { name: '17,19' },
                                { name: '22,24' },
                                { name: '27,30' }
                            ]
                        },
                        {
                            name: '45,60',
                            children: [
                                { name: '38,42' },
                                { name: '50,55' },
                                { name: '65,70' }
                            ]
                        }
                    ]
                };
            } else if (target <= 50) {
                return {
                    name: `25,${target},75`,
                    children: [
                        {
                            name: '15,20',
                            children: [
                                { name: '10,12' },
                                { name: '17,18' },
                                { name: '22,23' }
                            ]
                        },
                        {
                            name: '35,45',
                            children: [
                                { name: '30,32' },
                                { name: '40,42' },
                                { name: '47,48' }
                            ]
                        },
                        {
                            name: '85,95',
                            children: [
                                { name: '80,82' },
                                { name: '90,92' },
                                { name: '97,99' }
                            ]
                        }
                    ]
                };
            } else {
                return {
                    name: `40,60,${target}`,
                    children: [
                        {
                            name: '20,30',
                            children: [
                                { name: '15,18' },
                                { name: '25,28' },
                                { name: '32,35' }
                            ]
                        },
                        {
                            name: '50,55',
                            children: [
                                { name: '45,48' },
                                { name: '52,53' },
                                { name: '57,58' }
                            ]
                        },
                        {
                            name: '85,95',
                            children: [
                                { name: '70,80' },
                                { name: '88,92' },
                                { name: '97,99' }
                            ]
                        }
                    ]
                };
            }
        } else if (this.currentAlgorithm === 'avlSearch') {
            // AVL平衡二叉树 - 显示平衡因子
            if (target < 30) {
                return {
                    name: '50(0)',
                    children: [
                        {
                            name: '30(1)',
                            children: [
                                {
                                    name: '20(0)',
                                    children: [
                                        { name: `${target}(-1)`, children: [{ name: '5(0)' }] },
                                        { name: '25(0)' }
                                    ]
                                },
                                {
                                    name: '40(-1)',
                                    children: [
                                        { name: '35(0)' },
                                        { name: '45(0)' }
                                    ]
                                }
                            ]
                        },
                        {
                            name: '70(0)',
                            children: [
                                {
                                    name: '60(0)',
                                    children: [
                                        { name: '55(0)' },
                                        { name: '65(0)' }
                                    ]
                                },
                                {
                                    name: '80(0)',
                                    children: [
                                        { name: '75(0)' },
                                        { name: '90(0)' }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            } else if (target < 50) {
                return {
                    name: '50(0)',
                    children: [
                        {
                            name: '30(0)',
                            children: [
                                {
                                    name: '20(0)',
                                    children: [
                                        { name: '10(0)' },
                                        { name: '25(0)' }
                                    ]
                                },
                                {
                                    name: `${target}(0)`,
                                    children: [
                                        { name: '35(0)' },
                                        { name: '45(0)' }
                                    ]
                                }
                            ]
                        },
                        {
                            name: '70(0)',
                            children: [
                                {
                                    name: '60(0)',
                                    children: [
                                        { name: '55(0)' },
                                        { name: '65(0)' }
                                    ]
                                },
                                {
                                    name: '80(0)',
                                    children: [
                                        { name: '75(0)' },
                                        { name: '90(0)' }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            } else {
                return {
                    name: '50(0)',
                    children: [
                        {
                            name: '30(0)',
                            children: [
                                {
                                    name: '20(0)',
                                    children: [
                                        { name: '10(0)' },
                                        { name: '25(0)' }
                                    ]
                                },
                                {
                                    name: '40(0)',
                                    children: [
                                        { name: '35(0)' },
                                        { name: '45(0)' }
                                    ]
                                }
                            ]
                        },
                        {
                            name: '70(-1)',
                            children: [
                                {
                                    name: '60(1)',
                                    children: [
                                        { name: '55(0)' },
                                        { name: `${target}(0)` }
                                    ]
                                },
                                {
                                    name: '80(0)',
                                    children: [
                                        { name: '75(0)' },
                                        { name: '90(0)' }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            }
        } else {
            // 普通BST - 确保目标值在树中
            if (target < 30) {
                return {
                    name: '50',
                    children: [
                        {
                            name: '30',
                            children: [
                                {
                                    name: '20',
                                    children: [
                                        { name: target.toString() },
                                        { name: '25' }
                                    ]
                                },
                                {
                                    name: '40',
                                    children: [
                                        { name: '35' },
                                        { name: '45' }
                                    ]
                                }
                            ]
                        },
                        {
                            name: '70',
                            children: [
                                {
                                    name: '60',
                                    children: [
                                        { name: '55' },
                                        { name: '65' }
                                    ]
                                },
                                {
                                    name: '80',
                                    children: [
                                        { name: '75' },
                                        { name: '90' }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            } else if (target < 50) {
                return {
                    name: '50',
                    children: [
                        {
                            name: '30',
                            children: [
                                {
                                    name: '20',
                                    children: [
                                        { name: '10' },
                                        { name: '25' }
                                    ]
                                },
                                {
                                    name: target.toString(),
                                    children: [
                                        { name: '35' },
                                        { name: '45' }
                                    ]
                                }
                            ]
                        },
                        {
                            name: '70',
                            children: [
                                {
                                    name: '60',
                                    children: [
                                        { name: '55' },
                                        { name: '65' }
                                    ]
                                },
                                {
                                    name: '80',
                                    children: [
                                        { name: '75' },
                                        { name: '90' }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            } else {
                return {
                    name: '50',
                    children: [
                        {
                            name: '30',
                            children: [
                                {
                                    name: '20',
                                    children: [
                                        { name: '10' },
                                        { name: '25' }
                                    ]
                                },
                                {
                                    name: '40',
                                    children: [
                                        { name: '35' },
                                        { name: '45' }
                                    ]
                                }
                            ]
                        },
                        {
                            name: '70',
                            children: [
                                {
                                    name: '60',
                                    children: [
                                        { name: '55' },
                                        { name: target.toString() }
                                    ]
                                },
                                {
                                    name: '80',
                                    children: [
                                        { name: '75' },
                                        { name: '90' }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            }
        }
    }
    
    renderHashTable() {
        const container = document.getElementById('hashSlots');
        container.innerHTML = '';
        
        for (let i = 0; i < this.hashSize; i++) {
            const slot = document.createElement('div');
            slot.className = 'hash-slot';
            slot.id = `hash-slot-${i}`;
            
            const index = document.createElement('div');
            index.className = 'hash-slot-index';
            index.textContent = i;
            
            const values = document.createElement('div');
            values.className = 'hash-slot-values';
            
            if (this.hashTable[i].length === 0) {
                values.innerHTML = '<span style="color: #999;">空</span>';
            } else {
                this.hashTable[i].forEach(value => {
                    const valueSpan = document.createElement('span');
                    valueSpan.className = 'hash-value';
                    valueSpan.textContent = value;
                    valueSpan.id = `hash-value-${i}-${value}`;
                    values.appendChild(valueSpan);
                });
            }
            
            slot.appendChild(index);
            slot.appendChild(values);
            container.appendChild(slot);
        }
    }
    
    // 顺序查找算法
    sequentialSearch(arr, target) {
        for (let i = 0; i < arr.length; i++) {
            this.steps.push({
                array: [...arr],
                action: `比较位置 ${i} 的元素 ${arr[i]} 与目标 ${target}`,
                highlights: { 
                    current: i, 
                    searched: Array.from({length: i}, (_, k) => k),
                    target: target
                },
                found: arr[i] === target,
                position: arr[i] === target ? i : -1
            });
            
            if (arr[i] === target) {
                return i;
            }
        }
        
        this.steps.push({
            array: [...arr],
            action: `查找完成，未找到目标 ${target}`,
            highlights: { 
                searched: Array.from({length: arr.length}, (_, k) => k),
                target: target
            },
            found: false,
            position: -1
        });
        
        return -1;
    }
    
    // 折半查找算法
    binarySearch(arr, target) {
        let left = 0;
        let right = arr.length - 1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            
            this.steps.push({
                array: [...arr],
                action: `检查中间位置 ${mid}，元素值 ${arr[mid]}，与目标 ${target} 比较`,
                highlights: {
                    current: mid,
                    range: Array.from({length: right - left + 1}, (_, k) => left + k),
                    excluded: [...Array.from({length: left}, (_, k) => k), 
                              ...Array.from({length: arr.length - right - 1}, (_, k) => right + 1 + k)],
                    target: target
                },
                found: arr[mid] === target,
                position: arr[mid] === target ? mid : -1
            });
            
            if (arr[mid] === target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
                this.steps.push({
                    array: [...arr],
                    action: `目标值 ${target} 大于 ${arr[mid]}，在右半部分查找`,
                    highlights: {
                        range: Array.from({length: right - left + 1}, (_, k) => left + k),
                        excluded: [...Array.from({length: mid + 1}, (_, k) => k), 
                                  ...Array.from({length: arr.length - right - 1}, (_, k) => right + 1 + k)],
                        target: target
                    },
                    found: false,
                    position: -1
                });
            } else {
                right = mid - 1;
                this.steps.push({
                    array: [...arr],
                    action: `目标值 ${target} 小于 ${arr[mid]}，在左半部分查找`,
                    highlights: {
                        range: Array.from({length: right - left + 1}, (_, k) => left + k),
                        excluded: [...Array.from({length: left}, (_, k) => k), 
                                  ...Array.from({length: arr.length - mid}, (_, k) => mid + k)],
                        target: target
                    },
                    found: false,
                    position: -1
                });
            }
        }
        
        this.steps.push({
            array: [...arr],
            action: `查找完成，未找到目标 ${target}`,
            highlights: {
                excluded: Array.from({length: arr.length}, (_, k) => k),
                target: target
            },
            found: false,
            position: -1
        });
        
        return -1;
    }
    
    // 二叉搜索树查找
    bstSearch(target) {
        const treeData = this.generateTreeData();
        this.searchInTree(treeData, target, '根节点');
        return this.steps[this.steps.length - 1].found;
    }
    
    // AVL树查找
    avlSearch(target) {
        const treeData = this.generateTreeData();
        this.searchInTree(treeData, target, '根节点');
        return this.steps[this.steps.length - 1].found;
    }
    
    // B-Tree查找
    btreeSearch(target) {
        const treeData = this.generateTreeData();
        this.searchInBTree(treeData, target);
        return this.steps[this.steps.length - 1].found;
    }
    
    // 在二叉树中搜索（递归实现）
    searchInTree(node, target, path = '') {
        if (!node) {
            this.steps.push({
                action: `到达空节点，目标 ${target} 不存在`,
                currentNode: null,
                path: path,
                found: false,
                isTreeSearch: true
            });
            return false;
        }
        
        const nodeValue = parseInt(node.name);
        
        this.steps.push({
            action: `访问${path}：${node.name}，与目标 ${target} 比较`,
            currentNode: node.name,
            path: path,
            found: false,
            isTreeSearch: true
        });
        
        if (nodeValue === target) {
            this.steps.push({
                action: `找到目标 ${target} 在节点：${node.name}`,
                currentNode: node.name,
                path: path,
                found: true,
                isTreeSearch: true
            });
            return true;
        } else if (target < nodeValue) {
            this.steps.push({
                action: `目标 ${target} < ${nodeValue}，转向左子树`,
                currentNode: node.name,
                path: path,
                direction: 'left',
                found: false,
                isTreeSearch: true
            });
            
            if (node.children && node.children[0]) {
                return this.searchInTree(node.children[0], target, `${path}的左子树`);
            } else {
                this.steps.push({
                    action: `左子树为空，目标 ${target} 不存在`,
                    currentNode: null,
                    path: `${path}的左子树`,
                    found: false,
                    isTreeSearch: true
                });
                return false;
            }
        } else {
            this.steps.push({
                action: `目标 ${target} > ${nodeValue}，转向右子树`,
                currentNode: node.name,
                path: path,
                direction: 'right',
                found: false,
                isTreeSearch: true
            });
            
            if (node.children && node.children[1]) {
                return this.searchInTree(node.children[1], target, `${path}的右子树`);
            } else {
                this.steps.push({
                    action: `右子树为空，目标 ${target} 不存在`,
                    currentNode: null,
                    path: `${path}的右子树`,
                    found: false,
                    isTreeSearch: true
                });
                return false;
            }
        }
    }
    
    // 在B-Tree中搜索
    searchInBTree(node, target) {
        if (!node) {
            this.steps.push({
                action: `到达空节点，目标 ${target} 不存在`,
                currentNode: null,
                found: false,
                isTreeSearch: true
            });
            return false;
        }
        
        const keys = node.name.split(',').map(k => parseInt(k.trim()));
        
        this.steps.push({
            action: `访问B-Tree节点：[${node.name}]，共有 ${keys.length} 个关键字`,
            currentNode: node.name,
            found: false,
            isTreeSearch: true,
            btreeKeys: keys
        });
        
        // 在当前节点的关键字中逐个查找
        for (let i = 0; i < keys.length; i++) {
            this.steps.push({
                action: `比较目标 ${target} 与第 ${i + 1} 个关键字 ${keys[i]}`,
                currentNode: node.name,
                highlightKey: keys[i],
                keyIndex: i,
                found: false,
                isTreeSearch: true,
                btreeKeys: keys
            });
            
            if (keys[i] === target) {
                this.steps.push({
                    action: `✅ 找到目标 ${target}！在节点 [${node.name}] 的第 ${i + 1} 个位置`,
                    currentNode: node.name,
                    highlightKey: keys[i],
                    keyIndex: i,
                    found: true,
                    isTreeSearch: true,
                    btreeKeys: keys
                });
                return true;
            } else if (target < keys[i]) {
                this.steps.push({
                    action: `${target} < ${keys[i]}，需要在第 ${i + 1} 个子树中继续查找`,
                    currentNode: node.name,
                    highlightKey: keys[i],
                    keyIndex: i,
                    direction: i,
                    found: false,
                    isTreeSearch: true,
                    btreeKeys: keys
                });
                
                if (node.children && node.children[i]) {
                    return this.searchInBTree(node.children[i], target);
                } else {
                    this.steps.push({
                        action: `❌ 第 ${i + 1} 个子树不存在，目标 ${target} 不在B-Tree中`,
                        currentNode: null,
                        found: false,
                        isTreeSearch: true
                    });
                    return false;
                }
            }
        }
        
        // 如果目标大于所有关键字，转向最后一个子树
        this.steps.push({
            action: `${target} 大于所有关键字，转向最右侧子树（第 ${keys.length + 1} 个子树）`,
            currentNode: node.name,
            direction: keys.length,
            found: false,
            isTreeSearch: true,
            btreeKeys: keys
        });
        
        if (node.children && node.children[keys.length]) {
            return this.searchInBTree(node.children[keys.length], target);
        } else {
            this.steps.push({
                action: `❌ 最右侧子树不存在，目标 ${target} 不在B-Tree中`,
                currentNode: null,
                found: false,
                isTreeSearch: true
            });
            return false;
        }
    }
    
    // 哈希表查找
    hashSearch(target) {
        const hash = this.hashFunction(target);
        
        this.steps.push({
            action: `计算 ${target} 的哈希值：${target} % ${this.hashSize} = ${hash}`,
            hashSlot: hash,
            phase: 'calculate'
        });
        
        this.steps.push({
            action: `访问哈希表位置 ${hash}`,
            hashSlot: hash,
            phase: 'access'
        });
        
        const values = this.hashTable[hash];
        if (values.length === 0) {
            this.steps.push({
                action: `位置 ${hash} 为空，查找失败`,
                hashSlot: hash,
                phase: 'empty',
                found: false
            });
            return false;
        }
        
        for (let i = 0; i < values.length; i++) {
            this.steps.push({
                action: `比较 ${values[i]} 与目标 ${target}`,
                hashSlot: hash,
                valueIndex: i,
                phase: 'compare',
                found: values[i] === target
            });
            
            if (values[i] === target) {
                this.steps.push({
                    action: `找到目标 ${target} 在位置 ${hash}`,
                    hashSlot: hash,
                    valueIndex: i,
                    phase: 'found',
                    found: true
                });
                return true;
            }
        }
        
        this.steps.push({
            action: `在位置 ${hash} 未找到目标 ${target}`,
            hashSlot: hash,
            phase: 'not_found',
            found: false
        });
        
        return false;
    }
    
    // 更新算法
    changeAlgorithm(algorithm) {
        this.stop();
        this.currentAlgorithm = algorithm;
        this.updateAlgorithmInfo();
        
        // 重置搜索目标，确保树数据会重新生成
        this.searchTarget = parseInt(document.getElementById('searchTarget').value) || 42;
        
        this.initData();
        document.getElementById('status').textContent = '选择查找算法并设置查找目标开始演示';
        document.getElementById('searchResult').innerHTML = '';
    }
    
    updateChart(step) {
        if (this.currentAlgorithm === 'hashSearch') {
            this.updateHashTable(step);
            return;
        }
        
        if (this.isTreeAlgorithm()) {
            this.updateTreeChart(step);
            return;
        }
        
        const info = algorithmsInfo[this.currentAlgorithm];
        const colors = step.array.map((_, index) => {
            const highlights = step.highlights || {};
            
            if (step.found && index === step.position) {
                return info.colors.found.color;
            }
            
            if (this.currentAlgorithm === 'sequentialSearch') {
                if (index === highlights.current) return info.colors.current.color;
                if (highlights.searched && highlights.searched.includes(index)) return info.colors.searched.color;
                return info.colors.unsearched.color;
            } else if (this.currentAlgorithm === 'binarySearch') {
                if (index === highlights.current) return info.colors.current.color;
                if (highlights.range && highlights.range.includes(index)) return info.colors.range.color;
                if (highlights.excluded && highlights.excluded.includes(index)) return info.colors.excluded.color;
                return info.colors.unsearched.color;
            }
            
            return '#2196f3';
        });
        
        const option = {
            title: {
                text: `${info.name}过程可视化`,
                textStyle: {
                    fontSize: 24,
                    fontWeight: 'bold'
                }
            },
            series: [{
                data: step.array.map((value, index) => ({
                    value: value,
                    itemStyle: {
                        color: colors[index]
                    }
                })),
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#333'
                }
            }]
        };
        
        myChart.setOption(option);
        document.getElementById('status').textContent = step.action;
    }
    
    updateHashTable(step) {
        // 清除之前的高亮
        document.querySelectorAll('.hash-slot').forEach(slot => {
            slot.classList.remove('highlight');
        });
        document.querySelectorAll('.hash-value').forEach(value => {
            value.classList.remove('highlight');
        });
        
        if (step.hashSlot !== undefined) {
            const slot = document.getElementById(`hash-slot-${step.hashSlot}`);
            if (slot) {
                slot.classList.add('highlight');
            }
            
            if (step.valueIndex !== undefined) {
                const values = this.hashTable[step.hashSlot];
                if (values && values[step.valueIndex] !== undefined) {
                    const valueElement = document.getElementById(`hash-value-${step.hashSlot}-${values[step.valueIndex]}`);
                    if (valueElement) {
                        valueElement.classList.add('highlight');
                    }
                }
            }
        }
        
        document.getElementById('status').textContent = step.action;
    }
    
    updateTreeChart(step) {
        if (!step.isTreeSearch) return;
        
        // 重新生成树数据，但要高亮当前节点
        const treeData = this.generateTreeDataWithHighlight(step);
        
        // 根据算法类型调整节点大小
        const symbolSize = this.currentAlgorithm === 'btreeSearch' ? 60 : 45;
        const fontSize = this.currentAlgorithm === 'btreeSearch' ? 11 : 13;
        
        const option = {
            title: {
                text: `${algorithmsInfo[this.currentAlgorithm].name}查找过程`,
                left: 'center',
                top: 20,
                textStyle: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#333'
                }
            },
            series: [{
                type: 'tree',
                data: [treeData],
                top: '15%',
                left: '3%',
                bottom: '5%',
                right: '3%',
                layout: 'orthogonal',
                orient: 'vertical',
                symbol: this.currentAlgorithm === 'btreeSearch' ? 'roundRect' : 'circle',
                symbolSize: symbolSize,
                roam: true,
                initialTreeDepth: -1,
                itemStyle: {
                    color: '#2196f3',
                    borderColor: '#1976d2',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'inside',
                    fontSize: fontSize,
                    fontWeight: 'bold',
                    color: 'white'
                },
                lineStyle: {
                    color: '#666',
                    width: 2,
                    curveness: 0.2
                },
                leaves: {
                    label: {
                        position: 'inside',
                        color: 'white'
                    }
                },
                emphasis: {
                    focus: 'descendant',
                    itemStyle: {
                        color: '#ff9800'
                    }
                },
                expandAndCollapse: false,
                animationDuration: 300,
                animationDurationUpdate: 500
            }]
        };
        
        treeChart.setOption(option, true);
        
        // 特殊处理B-Tree的状态显示
        if (this.currentAlgorithm === 'btreeSearch' && step.btreeKeys) {
            let statusText = step.action;
            if (step.highlightKey !== undefined) {
                statusText += ` (当前关键字: ${step.highlightKey})`;
            }
            document.getElementById('status').textContent = statusText;
        } else {
            document.getElementById('status').textContent = step.action;
        }
    }
    
    // 生成带高亮的树数据
    generateTreeDataWithHighlight(step) {
        const originalData = this.generateTreeData();
        
        // 递归设置节点样式
        const setNodeStyle = (node, currentNodeName, found, highlightKey, keyIndex) => {
            if (!node) return node;
            
            // 复制节点数据
            const newNode = { ...node };
            
            if (node.name === currentNodeName) {
                // 当前访问的节点
                if (found) {
                    // 找到目标的节点 - 绿色
                    newNode.itemStyle = {
                        color: '#4caf50',
                        borderColor: '#2e7d32',
                        borderWidth: 4
                    };
                } else if (highlightKey !== undefined) {
                    // 正在比较关键字的节点 - 橙色
                    newNode.itemStyle = {
                        color: '#ff9800',
                        borderColor: '#f57c00',
                        borderWidth: 3
                    };
                } else {
                    // 当前访问但未找到的节点 - 红色
                    newNode.itemStyle = {
                        color: '#f44336',
                        borderColor: '#d32f2f',
                        borderWidth: 3
                    };
                }
                
                // 对于B-Tree，如果有高亮的关键字，调整标签显示
                if (this.currentAlgorithm === 'btreeSearch' && highlightKey !== undefined) {
                    const keys = node.name.split(',');
                    const highlightedKeys = keys.map((key, index) => {
                        const keyValue = parseInt(key.trim());
                        if (keyValue === highlightKey) {
                            return `[${key.trim()}]`; // 用方括号突出显示当前比较的关键字
                        }
                        return key.trim();
                    });
                    newNode.name = highlightedKeys.join(',');
                }
                
                newNode.label = {
                    color: 'white',
                    fontSize: this.currentAlgorithm === 'btreeSearch' ? 12 : 14,
                    fontWeight: 'bold'
                };
            } else {
                // 默认样式 - 蓝色
                newNode.itemStyle = {
                    color: '#2196f3',
                    borderColor: '#1976d2',
                    borderWidth: 2
                };
                newNode.label = {
                    color: 'white',
                    fontSize: this.currentAlgorithm === 'btreeSearch' ? 11 : 13,
                    fontWeight: 'bold'
                };
            }
            
            // 递归处理子节点
            if (node.children) {
                newNode.children = node.children.map(child => 
                    setNodeStyle(child, currentNodeName, found, highlightKey, keyIndex)
                );
            }
            
            return newNode;
        };
        
        return setNodeStyle(originalData, step.currentNode, step.found, step.highlightKey, step.keyIndex);
    }
    
    start() {
        if (this.isRunning) return;
        
        this.searchTarget = parseInt(document.getElementById('searchTarget').value);
        this.steps = [];
        this.currentStep = 0;
        
        // 重新初始化数据以确保目标值在结构中
        if (this.isTreeAlgorithm()) {
            this.initTreeChart(); // 重新生成树结构
        } else if (this.currentAlgorithm !== 'hashSearch') {
            // 确保目标值在数组中（对于演示目的）
            if (!this.array.includes(this.searchTarget)) {
                this.array[Math.floor(this.array.length / 2)] = this.searchTarget;
                this.array.sort((a, b) => a - b);
                this.initArrayChart();
            }
        }
        
        // 根据当前算法执行相应的查找
        let result = -1;
        if (this.currentAlgorithm === 'sequentialSearch') {
            result = this.sequentialSearch([...this.array], this.searchTarget);
        } else if (this.currentAlgorithm === 'binarySearch') {
            result = this.binarySearch([...this.array], this.searchTarget);
        } else if (this.currentAlgorithm === 'hashSearch') {
            result = this.hashSearch(this.searchTarget);
        } else if (this.currentAlgorithm === 'bstSearch') {
            result = this.bstSearch(this.searchTarget);
        } else if (this.currentAlgorithm === 'avlSearch') {
            result = this.avlSearch(this.searchTarget);
        } else if (this.currentAlgorithm === 'btreeSearch') {
            result = this.btreeSearch(this.searchTarget);
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.play();
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('resetBtn').disabled = true;
    }
    
    play() {
        if (this.currentStep < this.steps.length && !this.isPaused) {
            const step = this.steps[this.currentStep];
            this.updateChart(step);
            
            // 显示查找结果
            if (this.currentStep === this.steps.length - 1) {
                this.showSearchResult(step);
            }
            
            this.currentStep++;
            
            this.intervalId = setTimeout(() => {
                if (!this.isPaused) {
                    this.play();
                }
            }, this.speed);
        } else if (this.currentStep >= this.steps.length) {
            this.stop();
        }
    }
    
    showSearchResult(step) {
        const resultDiv = document.getElementById('searchResult');
        const found = step.found;
        const position = step.position;
        
        if (found) {
            if (this.currentAlgorithm === 'hashSearch') {
                resultDiv.innerHTML = `
                    <div class="result-box">
                        <h4>✅ 查找成功！</h4>
                        <p>目标值 <strong>${this.searchTarget}</strong> 在哈希表中找到</p>
                        <p>哈希地址：${this.hashFunction(this.searchTarget)}</p>
                        <p>比较次数：${this.steps.filter(s => s.phase === 'compare').length}</p>
                    </div>
                `;
            } else if (this.isTreeAlgorithm()) {
                const treeSteps = this.steps.filter(s => s.isTreeSearch);
                const compareSteps = treeSteps.filter(s => s.action.includes('比较') || s.action.includes('访问'));
                
                resultDiv.innerHTML = `
                    <div class="result-box">
                        <h4>✅ 查找成功！</h4>
                        <p>目标值 <strong>${this.searchTarget}</strong> 在${algorithmsInfo[this.currentAlgorithm].name}中找到</p>
                        <p>节点访问次数：<strong>${compareSteps.length}</strong></p>
                        <p>查找路径：<strong>${step.path || '根节点'}</strong></p>
                        <p>时间复杂度：<strong>${algorithmsInfo[this.currentAlgorithm].timeComplexity}</strong></p>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="result-box">
                        <h4>✅ 查找成功！</h4>
                        <p>目标值 <strong>${this.searchTarget}</strong> 在位置 <strong>${position}</strong> 找到</p>
                        <p>比较次数：<strong>${this.steps.length - 1}</strong></p>
                        <p>查找效率：<strong>${algorithmsInfo[this.currentAlgorithm].timeComplexity}</strong></p>
                    </div>
                `;
            }
        } else {
            if (this.isTreeAlgorithm()) {
                const treeSteps = this.steps.filter(s => s.isTreeSearch);
                const compareSteps = treeSteps.filter(s => s.action.includes('比较') || s.action.includes('访问'));
                
                resultDiv.innerHTML = `
                    <div class="result-box not-found">
                        <h4>❌ 查找失败</h4>
                        <p>目标值 <strong>${this.searchTarget}</strong> 在${algorithmsInfo[this.currentAlgorithm].name}中不存在</p>
                        <p>节点访问次数：<strong>${compareSteps.length}</strong></p>
                        <p>时间复杂度：<strong>${algorithmsInfo[this.currentAlgorithm].timeComplexity}</strong></p>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="result-box not-found">
                        <h4>❌ 查找失败</h4>
                        <p>目标值 <strong>${this.searchTarget}</strong> 不存在</p>
                        <p>比较次数：<strong>${this.steps.length - 1}</strong></p>
                    </div>
                `;
            }
        }
    }
    
    pause() {
        this.isPaused = true;
        if (this.intervalId) {
            clearTimeout(this.intervalId);
        }
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('resumeBtn').disabled = false;
    }
    
    resume() {
        this.isPaused = false;
        this.play();
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('resumeBtn').disabled = true;
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.intervalId) {
            clearTimeout(this.intervalId);
        }
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('resumeBtn').disabled = true;
        document.getElementById('resetBtn').disabled = false;
    }
    
    reset() {
        this.stop();
        if (this.currentAlgorithm === 'hashSearch') {
            this.generateHashTable();
        } else {
            this.array = this.generateSortedArray(15);
            this.originalArray = [...this.array];
        }
        this.steps = [];
        this.currentStep = 0;
        this.initData();
        document.getElementById('status').textContent = '选择查找算法并设置查找目标开始演示';
        document.getElementById('searchResult').innerHTML = '';
    }
    
    changeSpeed() {
        const speeds = [2000, 1500, 1000, 500, 300];
        const speedNames = ['很慢', '慢', '正常', '快', '很快'];
        const currentIndex = speeds.indexOf(this.speed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        this.speed = speeds[nextIndex];
        
        document.getElementById('speedBtn').textContent = `速度: ${speedNames[nextIndex]}`;
    }
}

// 创建查找可视化实例
const visualizer = new SearchVisualizer();

// 左侧菜单点击事件
document.addEventListener('click', (e) => {
    const item = e.target.closest('.algorithm-item');
    if (item) {
        // 移除所有active类
        document.querySelectorAll('.algorithm-item').forEach(el => el.classList.remove('active'));
        // 添加active类到当前点击项
        item.classList.add('active');
        
        // 获取算法类型并切换
        const algorithm = item.getAttribute('data-algorithm');
        visualizer.changeAlgorithm(algorithm);
    }
});

// 按钮事件处理
document.getElementById('startBtn').addEventListener('click', () => {
    visualizer.start();
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    visualizer.pause();
});

document.getElementById('resumeBtn').addEventListener('click', () => {
    visualizer.resume();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    visualizer.reset();
});

document.getElementById('speedBtn').addEventListener('click', () => {
    visualizer.changeSpeed();
});
    