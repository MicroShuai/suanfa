// 初始化ECharts实例
var myChart = echarts.init(document.getElementById('chart'));

// 图数据定义
const nodes = [
    { id: 'A', name: 'A' },
    { id: 'B', name: 'B' },
    { id: 'C', name: 'C' },
    { id: 'D', name: 'D' }
];

const graphTypes = {
    undirected: {
        description: '无向图中边没有方向，节点之间的连接是双向的。',
        links: [
            { source: 'A', target: 'B' },
            { source: 'A', target: 'C' },
            { source: 'B', target: 'D' },
            { source: 'C', target: 'D' }
        ],
        edgeSymbol: ['none', 'none']
    },
    directed: {
        description: '有向图中边具有方向，通常用箭头表示。',
        links: [
            { source: 'A', target: 'B' },
            { source: 'B', target: 'C' },
            { source: 'C', target: 'D' },
            { source: 'D', target: 'A' }
        ],
        edgeSymbol: ['none', 'arrow']
    }
};

function renderGraph(type) {
    const data = graphTypes[type];
    const option = {
        tooltip: {},
        series: [{
            type: 'graph',
            layout: 'force',
            roam: true,
            data: nodes,
            links: data.links,
            edgeSymbol: data.edgeSymbol,
            edgeSymbolSize: 12,
            label: {
                show: true
            },
            force: {
                repulsion: 120
            }
        }]
    };
    myChart.setOption(option);
    const desc = type === 'directed' ? '有向图' : '无向图';
    document.getElementById('description').textContent = `当前演示：${desc}`;
}

renderGraph('undirected');

// 左侧菜单事件
const list = document.getElementById('graphTypeList');
list.addEventListener('click', function(e) {
    const item = e.target.closest('.algorithm-item');
    if (item) {
        document.querySelectorAll('.algorithm-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        const type = item.getAttribute('data-type');
        renderGraph(type);
    }
});

// 响应式处理
window.addEventListener('resize', function() {
    myChart.resize();
});
