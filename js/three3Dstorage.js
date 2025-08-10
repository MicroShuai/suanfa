// 全局变量
let scene, camera, renderer, controls;
let shelves = [];
let selectedShelf = null;
let warehouses = [
    { 
        id: 'A', 
        name: '重型制造仓库A', 
        zones: 6, 
        rows: 15, 
        cols: 20, 
        levels: 5, 
        offsetX: -500, 
        offsetZ: -400,
        width: 300,
        depth: 200,
        type: 'heavy_duty',
        description: '汽车零部件及重型机械存储'
    },
    { 
        id: 'B', 
        name: '标准物流仓库B', 
        zones: 8, 
        rows: 18, 
        cols: 25, 
        levels: 6, 
        offsetX: 300, 
        offsetZ: -400,
        width: 350,
        depth: 250,
        type: 'standard',
        description: '快消品及日用品配送中心'
    },
    { 
        id: 'C', 
        name: '冷链物流中心C', 
        zones: 4, 
        rows: 12, 
        cols: 16, 
        levels: 4, 
        offsetX: -500, 
        offsetZ: 200,
        width: 280,
        depth: 180,
        type: 'cold_storage',
        description: '温控货物及生鲜产品存储'
    },
    { 
        id: 'D', 
        name: '危化品专用仓库D', 
        zones: 3, 
        rows: 10, 
        cols: 12, 
        levels: 3, 
        offsetX: 300, 
        offsetZ: 200,
        width: 240,
        depth: 160,
        type: 'hazmat',
        description: '危险化学品安全存储区域'
    },
    { 
        id: 'E', 
        name: '电子产品仓库E', 
        zones: 6, 
        rows: 14, 
        cols: 18, 
        levels: 8, 
        offsetX: -100, 
        offsetZ: -100,
        width: 320,
        depth: 200,
        type: 'electronics',
        description: '精密电子元器件存储'
    }
];
let animationId;
let isAutoTour = false;
let tourStep = 0;
let currentWarehouse = null; // 当前进入的仓库
let isInsideWarehouse = false; // 是否在仓库内部
let warehouseEntries = []; // 仓库入口对象数组

// 货架数据结构 - 工业化增强版
class Shelf {
    constructor(x, y, z, warehouseId, zoneId, shelfId) {
        this.position = { x, y, z };
        this.warehouseId = warehouseId;
        this.zoneId = zoneId;
        this.shelfId = shelfId;
        this.id = `${warehouseId}${zoneId}-${shelfId}`;
        this.inventory = Math.floor(Math.random() * 100);
        this.capacity = 100;
        this.goodsType = this.generateIndustrialGoodsType();
        this.maxWeight = 2000; // 最大承重2000kg
        this.currentWeight = Math.floor(this.inventory * 15); // 假设每件货物15kg
        this.lastInspection = this.generateRandomDate();
        this.rackType = this.getRackType();
        this.mesh = null;
        this.status = this.getStatus();
    }
    
    generateIndustrialGoodsType() {
        const industrialTypes = {
            'A': ['汽车零部件', '机械设备', '钢材制品', '电子元器件', '五金工具', '工业原料'],
            'B': ['纺织原料', '化工产品', '塑料制品', '包装材料', '办公用品', '消费品'],
            'C': ['冷冻食品', '医药制品', '生鲜产品', '疫苗药剂', '冷链物流', '保鲜包装'],
            'D': ['化学试剂', '易燃物品', '腐蚀性物质', '有毒化学品', '压缩气体', '危险废料'],
            'E': ['芯片组件', '电路板', '传感器', '显示器件', '存储设备', '精密仪器']
        };
        
        const warehouseTypes = industrialTypes[this.warehouseId] || industrialTypes['A'];
        return warehouseTypes[Math.floor(Math.random() * warehouseTypes.length)];
    }
    
    getRackType() {
        const types = ['选择性货架', '驶入式货架', '重力式货架', '悬臂式货架', '流利式货架'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    generateRandomDate() {
        const days = Math.floor(Math.random() * 30) + 1;
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toLocaleDateString();
    }
    
    getStatus() {
        const utilization = this.inventory / this.capacity;
        const weightRatio = this.currentWeight / this.maxWeight;
        
        if (utilization === 0) return 'empty';
        if (utilization >= 0.95 || weightRatio >= 0.95) return 'full';
        if (utilization >= 0.85 || weightRatio >= 0.85) return 'warning';
        return 'normal';
    }
    
    getColor() {
        switch (this.status) {
            case 'empty': return 0x95A5A6;     // 灰色
            case 'normal': return 0x27AE60;    // 绿色
            case 'warning': return 0xF39C12;   // 橙色
            case 'full': return 0xE74C3C;      // 红色
            default: return 0x3498DB;          // 蓝色
        }
    }
    
    updateInventory(amount) {
        this.inventory = Math.max(0, Math.min(this.capacity, amount));
        this.currentWeight = Math.floor(this.inventory * 15);
        this.status = this.getStatus();
        if (this.mesh) {
            // 更新货架颜色指示
            this.mesh.children.forEach(child => {
                if (child.material && child.geometry.type === 'BoxGeometry') {
                    // 只更新立柱颜色作为状态指示
                    if (child.geometry.parameters.width === 0.8) {
                        child.material = new THREE.MeshLambertMaterial({ 
                            color: this.getColor(),
                            metalness: 0.8,
                            roughness: 0.2
                        });
                    }
                }
            });
        }
    }
}

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // 明亮的天空蓝色
    // 移除雾效，让场景更清晰明亮
    
    // 创建相机 - 调整位置以适应工厂布局
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(500, 300, 500); // 更高更远的鸟瞰视角
    
    // 创建渲染器 - 性能优化版本
    renderer = new THREE.WebGLRenderer({ 
        antialias: false,  // 关闭抗锯齿提升性能
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;  // 关闭阴影提升性能
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // 创建控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 800;
    controls.minDistance = 20;
    
    // 添加工厂背景环境
    createFactoryEnvironment();
    
    // 添加照明
    setupLighting();
    
    // 创建仓库地面
    createWarehouseFloor();
    
    // 创建货架
    createShelves();
    
    // 添加事件监听
    setupEventListeners();
    
    // 开始动画循环
    animate();
    
    // 更新统计信息
    updateStats();
}

// 创建工厂布局环境
function createFactoryEnvironment() {
    // 创建工厂大门和围墙
    createFactoryGateAndWalls();
    
    // 创建仓库建筑物
    createWarehouseBuildings();
    
    // 创建工厂设施
    createFactoryFacilities();
    
    // 创建道路系统
    createFactoryRoads();
}

// 创建工厂大门和围墙
function createFactoryGateAndWalls() {
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x5D6D7E });
    const wallHeight = 8;
    const wallThickness = 1;
    
    // 工厂围墙
    const wallSegments = [
        // 前围墙（带大门开口）
        { x: -300, y: wallHeight/2, z: -450, w: 200, h: wallHeight, d: wallThickness },
        { x: 300, y: wallHeight/2, z: -450, w: 200, h: wallHeight, d: wallThickness },
        // 后围墙
        { x: 0, y: wallHeight/2, z: 450, w: 800, h: wallHeight, d: wallThickness },
        // 左右围墙
        { x: -400, y: wallHeight/2, z: 0, w: wallThickness, h: wallHeight, d: 900 },
        { x: 400, y: wallHeight/2, z: 0, w: wallThickness, h: wallHeight, d: 900 }
    ];
    
    wallSegments.forEach(wall => {
        const geometry = new THREE.BoxGeometry(wall.w, wall.h, wall.d);
        const mesh = new THREE.Mesh(geometry, wallMaterial);
        mesh.position.set(wall.x, wall.y, wall.z);
        scene.add(mesh);
    });
    
    // 工厂大门
    const gateMaterial = new THREE.MeshBasicMaterial({ color: 0x2C3E50 });
    const gateGeometry = new THREE.BoxGeometry(80, 10, 2);
    const gate = new THREE.Mesh(gateGeometry, gateMaterial);
    gate.position.set(0, 5, -449);
    scene.add(gate);
    
    // 门柱
    const pillarGeometry = new THREE.BoxGeometry(3, 12, 3);
    const leftPillar = new THREE.Mesh(pillarGeometry, wallMaterial);
    leftPillar.position.set(-42, 6, -450);
    scene.add(leftPillar);
    
    const rightPillar = new THREE.Mesh(pillarGeometry, wallMaterial);
    rightPillar.position.set(42, 6, -450);
    scene.add(rightPillar);
}

// 创建仓库建筑物
function createWarehouseBuildings() {
    warehouses.forEach(warehouse => {
        createWarehouseBuilding(warehouse);
    });
}

// 创建单个仓库建筑
function createWarehouseBuilding(warehouse) {
    const buildingHeight = 25;
    
    // 建筑主体材质
    const buildingMaterials = {
        'heavy_duty': new THREE.MeshBasicMaterial({ color: 0x34495E }), // 深蓝灰
        'standard': new THREE.MeshBasicMaterial({ color: 0x27AE60 }),   // 绿色
        'cold_storage': new THREE.MeshBasicMaterial({ color: 0x3498DB }), // 蓝色
        'hazmat': new THREE.MeshBasicMaterial({ color: 0xE74C3C }),     // 红色
        'electronics': new THREE.MeshBasicMaterial({ color: 0x9B59B6 }) // 紫色
    };
    
    const material = buildingMaterials[warehouse.type] || buildingMaterials['standard'];
    
    // 主建筑结构
    const buildingGeometry = new THREE.BoxGeometry(warehouse.width, buildingHeight, warehouse.depth);
    const building = new THREE.Mesh(buildingGeometry, material);
    building.position.set(warehouse.offsetX, buildingHeight/2, warehouse.offsetZ);
    scene.add(building);
    
    // 屋顶
    const roofMaterial = new THREE.MeshBasicMaterial({ color: 0x7F8C8D });
    const roofGeometry = new THREE.BoxGeometry(warehouse.width + 4, 2, warehouse.depth + 4);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(warehouse.offsetX, buildingHeight + 1, warehouse.offsetZ);
    scene.add(roof);
    
    // 建筑外墙细节
    createBuildingDetails(warehouse, buildingHeight);
    
    // 装卸平台
    createLoadingDock(warehouse);
}

// 创建建筑细节
function createBuildingDetails(warehouse, buildingHeight) {
    // 大门
    const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x2C3E50 });
    const doorGeometry = new THREE.BoxGeometry(15, 8, 1);
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(
        warehouse.offsetX, 
        4, 
        warehouse.offsetZ - warehouse.depth/2 - 0.5
    );
    scene.add(door);
    
    // 窗户
    const windowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x85C1E9,
        transparent: true,
        opacity: 0.7
    });
    
    // 侧面窗户
    for (let i = 0; i < 4; i++) {
        const windowGeometry = new THREE.PlaneGeometry(8, 6);
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(
            warehouse.offsetX - warehouse.width/2 - 0.1,
            8 + i * 4,
            warehouse.offsetZ - warehouse.depth/4 + i * warehouse.depth/8
        );
        window.rotation.y = Math.PI/2;
        scene.add(window);
    }
    
    // 通风设备
    const ventMaterial = new THREE.MeshBasicMaterial({ color: 0x566573 });
    for (let i = 0; i < 3; i++) {
        const ventGeometry = new THREE.CylinderGeometry(2, 2, 3, 8);
        const vent = new THREE.Mesh(ventGeometry, ventMaterial);
        vent.position.set(
            warehouse.offsetX - warehouse.width/3 + i * warehouse.width/3,
            buildingHeight + 2.5,
            warehouse.offsetZ
        );
        scene.add(vent);
    }
}

// 创建装卸平台
function createLoadingDock(warehouse) {
    const dockMaterial = new THREE.MeshBasicMaterial({ color: 0x95A5A6 });
    const dockGeometry = new THREE.BoxGeometry(warehouse.width * 0.8, 1.5, 8);
    const dock = new THREE.Mesh(dockGeometry, dockMaterial);
    dock.position.set(
        warehouse.offsetX,
        0.75,
        warehouse.offsetZ - warehouse.depth/2 - 8
    );
    scene.add(dock);
    
    // 装卸平台标线
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    for (let i = 0; i < 4; i++) {
        const lineGeometry = new THREE.PlaneGeometry(2, 8);
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.x = -Math.PI/2;
        line.position.set(
            warehouse.offsetX - warehouse.width * 0.3 + i * warehouse.width * 0.2,
            1.6,
            warehouse.offsetZ - warehouse.depth/2 - 8
        );
        scene.add(line);
    }
}

// 创建工厂设施
function createFactoryFacilities() {
    // 办公楼
    const officeGeometry = new THREE.BoxGeometry(40, 20, 25);
    const officeMaterial = new THREE.MeshBasicMaterial({ color: 0x85929E });
    const office = new THREE.Mesh(officeGeometry, officeMaterial);
    office.position.set(-350, 10, -350);
    scene.add(office);
    
    // 配电房
    const powerGeometry = new THREE.BoxGeometry(15, 8, 12);
    const powerMaterial = new THREE.MeshBasicMaterial({ color: 0x7F8C8D });
    const powerHouse = new THREE.Mesh(powerGeometry, powerMaterial);
    powerHouse.position.set(350, 4, -350);
    scene.add(powerHouse);
    
    // 水塔
    const tankGeometry = new THREE.CylinderGeometry(8, 8, 30, 16);
    const tankMaterial = new THREE.MeshBasicMaterial({ color: 0xBDC3C7 });
    const waterTank = new THREE.Mesh(tankGeometry, tankMaterial);
    waterTank.position.set(350, 15, 350);
    scene.add(waterTank);
    
    // 支撑塔
    const supportGeometry = new THREE.BoxGeometry(2, 30, 2);
    const supportMaterial = new THREE.MeshBasicMaterial({ color: 0x566573 });
    const support = new THREE.Mesh(supportGeometry, supportMaterial);
    support.position.set(350, 15, 350);
    scene.add(support);
}

// 创建工厂道路系统
function createFactoryRoads() {
    const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x2C3E50 });
    
    // 主干道（纵向）
    const mainRoadGeometry = new THREE.PlaneGeometry(20, 900);
    const mainRoad = new THREE.Mesh(mainRoadGeometry, roadMaterial);
    mainRoad.rotation.x = -Math.PI/2;
    mainRoad.position.set(0, 0.1, 0);
    scene.add(mainRoad);
    
    // 横向道路
    const crossRoadGeometry = new THREE.PlaneGeometry(800, 15);
    const crossRoad1 = new THREE.Mesh(crossRoadGeometry, roadMaterial);
    crossRoad1.rotation.x = -Math.PI/2;
    crossRoad1.position.set(0, 0.1, -200);
    scene.add(crossRoad1);
    
    const crossRoad2 = new THREE.Mesh(crossRoadGeometry, roadMaterial);
    crossRoad2.rotation.x = -Math.PI/2;
    crossRoad2.position.set(0, 0.1, 200);
    scene.add(crossRoad2);
    
    // 道路标线
    createRoadMarkings();
}

// 创建道路标线
function createRoadMarkings() {
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    // 中心分隔线
    for (let i = -400; i < 400; i += 40) {
        const lineGeometry = new THREE.PlaneGeometry(2, 20);
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.x = -Math.PI/2;
        line.position.set(0, 0.15, i);
        scene.add(line);
    }
    
    // 路口标线
    const intersectionGeometry = new THREE.PlaneGeometry(15, 15);
    const intersection1 = new THREE.Mesh(intersectionGeometry, lineMaterial);
    intersection1.rotation.x = -Math.PI/2;
    intersection1.position.set(0, 0.15, -200);
    scene.add(intersection1);
    
    const intersection2 = new THREE.Mesh(intersectionGeometry, lineMaterial);
    intersection2.rotation.x = -Math.PI/2;
    intersection2.position.set(0, 0.15, 200);
    scene.add(intersection2);
}

// 设置优化的照明系统
function setupLighting() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    // 主光源 - 简化版本，不投射阴影
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(100, 150, 100);
    scene.add(directionalLight);
    
    // 补充光源
    const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
    light2.position.set(-100, 120, -100);
    scene.add(light2);
    
    // 减少工业照明灯数量，提升性能
    const lightPositions = [
        [0, 35, 0], [-40, 35, -40], [40, 35, 40]
    ];
    
    lightPositions.forEach(pos => {
        const pointLight = new THREE.PointLight(0xffffff, 0.6, 80);
        pointLight.position.set(pos[0], pos[1], pos[2]);
        scene.add(pointLight);
    });
}

// 创建优化的地面系统
function createWarehouseFloor() {
    // 工厂大地面
    const floorGeometry = new THREE.PlaneGeometry(900, 1000);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x95A5A6 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);
    
    // 为每个仓库创建内部地面
    warehouses.forEach(warehouse => {
        createWarehouseInternalFloor(warehouse);
    });
}

// 创建仓库内部地面
function createWarehouseInternalFloor(warehouse) {
    // 仓库内部地面
    const internalFloorGeometry = new THREE.PlaneGeometry(warehouse.width - 2, warehouse.depth - 2);
    const internalFloorMaterial = new THREE.MeshBasicMaterial({ color: 0x566573 });
    const internalFloor = new THREE.Mesh(internalFloorGeometry, internalFloorMaterial);
    internalFloor.rotation.x = -Math.PI / 2;
    internalFloor.position.set(warehouse.offsetX, 0.1, warehouse.offsetZ);
    scene.add(internalFloor);
    
    // 库区分隔线
    createZoneMarkers(warehouse);
    
    // 货架通道
    createAisleMarkings(warehouse);
}

// 创建库区标记
function createZoneMarkers(warehouse) {
    const zoneLineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    
    // 根据库区数量创建分隔线
    const zonesPerRow = Math.ceil(Math.sqrt(warehouse.zones));
    const zoneWidth = warehouse.width / zonesPerRow;
    const zoneDepth = warehouse.depth / Math.ceil(warehouse.zones / zonesPerRow);
    
    // 纵向分隔线
    for (let i = 1; i < zonesPerRow; i++) {
        const lineGeometry = new THREE.PlaneGeometry(2, warehouse.depth - 4);
        const line = new THREE.Mesh(lineGeometry, zoneLineMaterial);
        line.rotation.x = -Math.PI/2;
        line.position.set(
            warehouse.offsetX - warehouse.width/2 + i * zoneWidth,
            0.15,
            warehouse.offsetZ
        );
        scene.add(line);
    }
    
    // 横向分隔线
    const zoneRows = Math.ceil(warehouse.zones / zonesPerRow);
    for (let i = 1; i < zoneRows; i++) {
        const lineGeometry = new THREE.PlaneGeometry(warehouse.width - 4, 2);
        const line = new THREE.Mesh(lineGeometry, zoneLineMaterial);
        line.rotation.x = -Math.PI/2;
        line.position.set(
            warehouse.offsetX,
            0.15,
            warehouse.offsetZ - warehouse.depth/2 + i * zoneDepth
        );
        scene.add(line);
    }
}

// 创建通道标记
function createAisleMarkings(warehouse) {
    const aisleLineMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    
    // 主通道（仓库中央）
    const mainAisleGeometry = new THREE.PlaneGeometry(4, warehouse.depth - 10);
    const mainAisle = new THREE.Mesh(mainAisleGeometry, aisleLineMaterial);
    mainAisle.rotation.x = -Math.PI/2;
    mainAisle.position.set(warehouse.offsetX, 0.12, warehouse.offsetZ);
    scene.add(mainAisle);
    
    // 横向通道
    const crossAisleGeometry = new THREE.PlaneGeometry(warehouse.width - 10, 3);
    const crossAisle = new THREE.Mesh(crossAisleGeometry, aisleLineMaterial);
    crossAisle.rotation.x = -Math.PI/2;
    crossAisle.position.set(warehouse.offsetX, 0.12, warehouse.offsetZ);
    scene.add(crossAisle);
}

// 创建多仓库货架系统
function createShelves() {
    let totalShelfId = 1;
    
    warehouses.forEach(warehouse => {
        // 为每个仓库创建标识牌
        createWarehouseSign(warehouse);
        
        // 计算库区布局
        const zonesPerRow = Math.ceil(Math.sqrt(warehouse.zones));
        const zoneRows = Math.ceil(warehouse.zones / zonesPerRow);
        const zoneWidth = warehouse.width / zonesPerRow;
        const zoneDepth = warehouse.depth / zoneRows;
        
        for (let zoneIndex = 0; zoneIndex < warehouse.zones; zoneIndex++) {
            const zoneRow = Math.floor(zoneIndex / zonesPerRow);
            const zoneCol = zoneIndex % zonesPerRow;
            
            // 库区在仓库内的偏移量
            const zoneOffsetX = warehouse.offsetX - warehouse.width/2 + zoneCol * zoneWidth + zoneWidth/2;
            const zoneOffsetZ = warehouse.offsetZ - warehouse.depth/2 + zoneRow * zoneDepth + zoneDepth/2;
            
            // 创建库区标识
            createZoneSign(warehouse, zoneIndex + 1, zoneOffsetX, zoneOffsetZ);
            
            // 在每个库区内创建货架（库位）
            createShelvesInZone(warehouse, zoneIndex + 1, zoneOffsetX, zoneOffsetZ, zoneWidth, zoneDepth, totalShelfId);
            totalShelfId += warehouse.rows * warehouse.cols * warehouse.levels;
        }
    });
}

// 在库区内创建货架
function createShelvesInZone(warehouse, zoneId, zoneX, zoneZ, zoneWidth, zoneDepth, startShelfId) {
    let shelfId = startShelfId;
    
    // 计算货架在库区内的布局
    const shelfSpacingX = (zoneWidth - 20) / warehouse.cols; // 留出通道空间
    const shelfSpacingZ = (zoneDepth - 20) / warehouse.rows;
    
    for (let row = 0; row < warehouse.rows; row++) {
        for (let col = 0; col < warehouse.cols; col++) {
            // 留出通道（每3列/行留出通道）
            if (col % 4 === 1 || row % 4 === 1) continue;
            
            for (let level = 0; level < warehouse.levels; level++) {
                const x = zoneX - zoneWidth/2 + 10 + col * shelfSpacingX + shelfSpacingX/2;
                const y = level * 20 + 10; // 垂直分层
                const z = zoneZ - zoneDepth/2 + 10 + row * shelfSpacingZ + shelfSpacingZ/2;
                
                const shelfPosition = `${String.fromCharCode(65 + row)}${col.toString().padStart(2, '0')}-${level + 1}`;
                const shelf = new Shelf(x, y, z, warehouse.id, zoneId, shelfPosition);
                shelf.warehouseName = warehouse.name;
                shelf.zoneId = `Z${zoneId}`;
                shelves.push(shelf);
                
                // 只为底层货架创建3D模型，提升性能
                if (level === 0) {
                    shelf.mesh = createAdvancedShelfMesh(shelf);
                    scene.add(shelf.mesh);
                }
                
                shelfId++;
            }
        }
    }
}

// 创建优化的工业化货架网格
function createAdvancedShelfMesh(shelf) {
    const group = new THREE.Group();
    
    // 工业标准货架尺寸
    const frameWidth = 12;
    const frameHeight = 18;
    const frameDepth = 10;
    
    // 优化的材质定义 - 减少反射计算
    const steelMaterial = new THREE.MeshBasicMaterial({ color: 0x708090 });
    const orangeBeamMaterial = new THREE.MeshBasicMaterial({ color: 0xFF6B35 });
    const deckingMaterial = new THREE.MeshBasicMaterial({ color: 0x2C3E50 });
    
    // 简化立柱系统 - 减少几何体数量
    const uprightGeometry = new THREE.BoxGeometry(0.8, frameHeight, 0.8);
    const uprightPositions = [
        [-frameWidth/2, 0, -frameDepth/2],
        [frameWidth/2, 0, frameDepth/2]  // 只保留2根立柱
    ];
    
    uprightPositions.forEach(pos => {
        const upright = new THREE.Mesh(uprightGeometry, steelMaterial);
        upright.position.set(pos[0], pos[1], pos[2]);
        group.add(upright);
    });
    
    // 简化横梁系统
    const beamGeometry = new THREE.BoxGeometry(frameWidth + 1, 0.6, 0.6);
    const beamLevels = [
        -frameHeight/2 + 8,    // 只保留中间层
    ];
    
    beamLevels.forEach(level => {
        const beam = new THREE.Mesh(beamGeometry, orangeBeamMaterial);
        beam.position.set(0, level, 0);
        group.add(beam);
    });
    
    // 简化层板系统
    const deckingGeometry = new THREE.BoxGeometry(frameWidth - 0.5, 0.3, frameDepth - 0.5);
    const decking = new THREE.Mesh(deckingGeometry, deckingMaterial);
    decking.position.set(0, beamLevels[0] + 0.5, 0);
    group.add(decking);
    
    // 简化货物显示
    if (shelf.inventory > 0) {
        const cargoGeometry = new THREE.BoxGeometry(8, 4, 6);
        const cargoMaterial = new THREE.MeshBasicMaterial({ 
            color: shelf.status === 'full' ? 0xE74C3C : 
                   shelf.status === 'warning' ? 0xF39C12 : 0x27AE60 
        });
        const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial);
        cargo.position.set(0, beamLevels[0] + 2.5, 0);
        group.add(cargo);
    }
    
    // 简化标识牌
    const labelSprite = createSimpleLabel(shelf);
    labelSprite.position.set(frameWidth/2 + 1, frameHeight/2 - 3, 0);
    group.add(labelSprite);
    
    group.position.set(shelf.position.x, shelf.position.y, shelf.position.z);
    group.userData = { shelf: shelf };
    
    return group;
}

// 创建工业化仓库标识牌
function createWarehouseSign(warehouse) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 320;
    
    // 背景 - 根据仓库类型设置颜色
    const bgColors = {
        'heavy_duty': 'rgba(52, 73, 94, 0.95)',    // 深蓝灰
        'standard': 'rgba(39, 174, 96, 0.95)',     // 绿色
        'cold_storage': 'rgba(52, 152, 219, 0.95)', // 蓝色
        'hazmat': 'rgba(231, 76, 60, 0.95)'        // 红色
    };
    context.fillStyle = bgColors[warehouse.type] || 'rgba(0, 60, 120, 0.95)';
    context.fillRect(0, 0, 1024, 320);
    
    // 边框
    context.strokeStyle = '#FFD700';
    context.lineWidth = 8;
    context.strokeRect(8, 8, 1008, 304);
    
    // 仓库类型图标
    const icons = {
        'heavy_duty': '🏭',
        'standard': '📦',
        'cold_storage': '❄️',
        'hazmat': '⚠️'
    };
    context.font = '60px Arial';
    context.fillStyle = '#FFD700';
    context.textAlign = 'left';
    context.fillText(icons[warehouse.type] || '🏭', 30, 80);
    
    // 标题
    context.font = 'Bold 48px Arial';
    context.textAlign = 'center';
    context.fillText(`${warehouse.name}`, 512, 80);
    
    // 分隔线
    context.strokeStyle = '#FFD700';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(50, 110);
    context.lineTo(974, 110);
    context.stroke();
    
    // 详细信息
    context.fillStyle = '#FFFFFF';
    context.font = '28px Arial';
    context.textAlign = 'center';
    context.fillText(`${warehouse.zones}个作业区域 | 规格: ${warehouse.rows}×${warehouse.cols}×${warehouse.levels}`, 512, 150);
    
    // 仓库描述
    context.font = '24px Arial';
    context.fillText(warehouse.description, 512, 180);
    
    // 仓库编号
    context.fillStyle = '#FFD700';
    context.font = 'Bold 32px Arial';
    context.fillText(`仓库编号: ${warehouse.id}`, 512, 220);
    
    // 安全认证标识
    if (warehouse.type === 'hazmat') {
        context.fillStyle = '#E74C3C';
        context.font = 'Bold 20px Arial';
        context.fillText('⚠️ 危化品专用存储区域 - 严格准入管理', 512, 250);
    } else if (warehouse.type === 'cold_storage') {
        context.fillStyle = '#3498DB';
        context.font = 'Bold 20px Arial';
        context.fillText('❄️ 温控环境 - 冷链物流专用', 512, 250);
    }
    
    // 容量指示
    context.fillStyle = '#BDC3C7';
    context.font = '18px Arial';
    const totalCapacity = warehouse.zones * warehouse.rows * warehouse.cols * warehouse.levels;
    context.fillText(`最大库位容量: ${totalCapacity} 个储位`, 512, 280);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(50, 16, 1);
    sprite.position.set(warehouse.offsetX, 40, warehouse.offsetZ - warehouse.depth/2 - 25);
    scene.add(sprite);
}

// 创建库区标识牌
function createZoneSign(warehouse, zoneNumber, zoneX, zoneZ) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    // 背景颜色根据仓库类型
    const bgColors = {
        'heavy_duty': 'rgba(52, 73, 94, 0.9)',
        'standard': 'rgba(39, 174, 96, 0.9)',
        'cold_storage': 'rgba(52, 152, 219, 0.9)',
        'hazmat': 'rgba(231, 76, 60, 0.9)',
        'electronics': 'rgba(155, 89, 182, 0.9)'
    };
    context.fillStyle = bgColors[warehouse.type] || 'rgba(40, 40, 40, 0.8)';
    context.fillRect(0, 0, 512, 128);
    
    // 边框
    context.strokeStyle = '#FFD700';
    context.lineWidth = 4;
    context.strokeRect(4, 4, 504, 120);
    
    // 库区编号
    context.fillStyle = '#FFD700';
    context.font = 'Bold 36px Arial';
    context.textAlign = 'center';
    context.fillText(`库区 Z${zoneNumber}`, 256, 50);
    
    // 仓库信息
    context.fillStyle = '#FFFFFF';
    context.font = '20px Arial';
    context.fillText(`${warehouse.name}`, 256, 80);
    
    // 规格信息
    context.font = '16px Arial';
    context.fillText(`${warehouse.rows}行×${warehouse.cols}列×${warehouse.levels}层`, 256, 105);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(25, 6, 1);
    sprite.position.set(zoneX, 20, zoneZ - 15);
    scene.add(sprite);
}

// 创建工业化托盘和货物系统
function createIndustrialPallets(shelf, frameWidth, frameHeight, frameDepth, beamLevels) {
    const palletGroup = new THREE.Group();
    const utilization = shelf.inventory / shelf.capacity;
    
    // 标准托盘尺寸 (1200x1000mm欧标托盘)
    const palletWidth = 11.5;
    const palletDepth = 9.5;
    const palletHeight = 0.8;
    
    // 托盘材质
    const palletMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // 木质托盘
    const plasticPalletMaterial = new THREE.MeshLambertMaterial({ color: 0x2E86C1 }); // 塑料托盘
    
    // 根据利用率决定托盘数量和层级
    const activeLevels = Math.ceil(utilization * beamLevels.length);
    
    for (let levelIndex = 0; levelIndex < activeLevels; levelIndex++) {
        const level = beamLevels[levelIndex];
        
        // 创建托盘
        const palletGeometry = new THREE.BoxGeometry(palletWidth, palletHeight, palletDepth);
        const isPlastic = Math.random() > 0.7; // 30%概率是塑料托盘
        const pallet = new THREE.Mesh(palletGeometry, isPlastic ? plasticPalletMaterial : palletMaterial);
        pallet.position.set(0, level + palletHeight/2 + 0.5, 0);
        pallet.castShadow = true;
        pallet.receiveShadow = true;
        palletGroup.add(pallet);
        
        // 托盘板条细节
        if (!isPlastic) {
            for (let i = 0; i < 5; i++) {
                const slat = new THREE.Mesh(
                    new THREE.BoxGeometry(palletWidth, 0.1, 1.5),
                    palletMaterial
                );
                slat.position.set(0, level + palletHeight + 0.55, -palletDepth/2 + i * 2.5);
                palletGroup.add(slat);
            }
        }
        
        // 添加货物箱
        const cargoGroup = createIndustrialCargo(shelf, palletWidth, palletDepth, level + palletHeight + 0.5);
        palletGroup.add(cargoGroup);
        
        // 添加条形码标签
        if (Math.random() > 0.5) {
            const barcodeSprite = createBarcodeLabel();
            barcodeSprite.position.set(palletWidth/2 + 0.5, level + 3, 0);
            palletGroup.add(barcodeSprite);
        }
    }
    
    return palletGroup;
}

// 创建工业化货物
function createIndustrialCargo(shelf, palletWidth, palletDepth, baseY) {
    const cargoGroup = new THREE.Group();
    
    // 工业货物类型
    const cargoTypes = [
        { name: '纸箱包装', color: 0xD2B48C, size: [4, 3, 3], weight: 'light' },
        { name: '金属零件箱', color: 0x708090, size: [3, 2.5, 2.5], weight: 'heavy' },
        { name: '塑料容器', color: 0x3498DB, size: [3.5, 4, 3.5], weight: 'medium' },
        { name: '木质包装箱', color: 0x8B4513, size: [5, 3.5, 4], weight: 'heavy' },
        { name: '防潮包装', color: 0x2ECC71, size: [4.5, 2, 3], weight: 'light' },
        { name: '危化品容器', color: 0xE74C3C, size: [2.5, 3.5, 2.5], weight: 'heavy' }
    ];
    
    // 根据货架类型选择合适的货物
    let selectedTypes = cargoTypes;
    if (shelf.warehouseId === 'C') { // 冷链仓库
        selectedTypes = cargoTypes.filter(t => t.name.includes('防潮') || t.name.includes('塑料'));
    } else if (shelf.warehouseId === 'D') { // 危化品仓库
        selectedTypes = cargoTypes.filter(t => t.name.includes('危化品') || t.name.includes('金属'));
    }
    
    // 堆叠货物
    const stackLayers = Math.floor(Math.random() * 3) + 1; // 1-3层堆叠
    
    for (let layer = 0; layer < stackLayers; layer++) {
        const cargoType = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
        
        // 创建货物箱
        const cargoGeometry = new THREE.BoxGeometry(...cargoType.size);
        const cargoMaterial = new THREE.MeshLambertMaterial({ 
            color: cargoType.color,
            transparent: true,
            opacity: 0.9
        });
        
        const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial);
        
        // 堆叠位置
        const xOffset = (Math.random() - 0.5) * (palletWidth - cargoType.size[0] - 1);
        const zOffset = (Math.random() - 0.5) * (palletDepth - cargoType.size[2] - 1);
        const yPos = baseY + layer * (cargoType.size[1] + 0.1) + cargoType.size[1]/2;
        
        cargo.position.set(xOffset, yPos, zOffset);
        cargo.castShadow = true;
        cargo.receiveShadow = true;
        
        // 添加包装标识
        createPackagingLabels(cargo, cargoType);
        
        cargoGroup.add(cargo);
    }
    
    return cargoGroup;
}

// 创建包装标识
function createPackagingLabels(cargo, cargoType) {
    // 危险品标识
    if (cargoType.name.includes('危化品')) {
        const warningGeometry = new THREE.PlaneGeometry(1, 1);
        const warningMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.9
        });
        const warningLabel = new THREE.Mesh(warningGeometry, warningMaterial);
        warningLabel.position.set(0, cargoType.size[1]/2 + 0.01, cargoType.size[2]/2 + 0.01);
        cargo.add(warningLabel);
    }
    
    // 重货标识
    if (cargoType.weight === 'heavy') {
        const heavyGeometry = new THREE.PlaneGeometry(1.5, 0.5);
        const heavyMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF6B35,
            transparent: true,
            opacity: 0.8
        });
        const heavyLabel = new THREE.Mesh(heavyGeometry, heavyMaterial);
        heavyLabel.position.set(0, -cargoType.size[1]/2 - 0.01, cargoType.size[2]/2 + 0.01);
        cargo.add(heavyLabel);
    }
}

// 创建条形码标签
function createBarcodeLabel() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // 白色背景
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 256, 128);
    
    // 条形码
    context.fillStyle = '#000000';
    for (let i = 0; i < 50; i++) {
        const width = Math.random() > 0.5 ? 2 : 4;
        const x = i * 5;
        context.fillRect(x, 20, width, 60);
    }
    
    // 数字
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.fillText('3901234567890', 128, 100);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4, 2, 1);
    
    return sprite;
}

// 创建简化标识牌
function createSimpleLabel(shelf) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // 背景
    context.fillStyle = '#FFD700';
    context.fillRect(0, 0, 256, 128);
    
    // 边框
    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.strokeRect(2, 2, 252, 124);
    
    // 货架编号
    context.fillStyle = '#000000';
    context.font = 'Bold 32px Arial';
    context.textAlign = 'center';
    context.fillText(shelf.id, 128, 50);
    
    // 状态
    const utilization = Math.round(shelf.inventory / shelf.capacity * 100);
    context.font = '20px Arial';
    context.fillText(`${utilization}%`, 128, 80);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(6, 3, 1);
    
    return sprite;
}

// 创建高级货架标签
function createAdvancedShelfLabel(shelf) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 256;
    
    // 渐变背景
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, 'rgba(0, 40, 80, 0.95)');
    gradient.addColorStop(1, 'rgba(0, 20, 40, 0.95)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 256);
    
    // 装饰边框
    context.strokeStyle = '#FFD700';
    context.lineWidth = 6;
    context.strokeRect(8, 8, 496, 240);
    
    // 内边框
    context.strokeStyle = '#87CEEB';
    context.lineWidth = 2;
    context.strokeRect(16, 16, 480, 224);
    
    // 货架ID
    context.fillStyle = '#FFD700';
    context.font = 'Bold 42px Arial';
    context.textAlign = 'center';
    context.fillText(shelf.id, 256, 70);
    
    // 库存信息
    context.fillStyle = '#FFFFFF';
    context.font = 'Bold 32px Arial';
    context.fillText(`${shelf.inventory}/${shelf.capacity}`, 256, 120);
    
    // 货品类型
    context.fillStyle = '#87CEEB';
    context.font = '26px Arial';
    context.fillText(shelf.goodsType, 256, 160);
    
    // 利用率进度条
    const utilization = shelf.inventory / shelf.capacity;
    const barWidth = 400;
    const barHeight = 24;
    const barX = (512 - barWidth) / 2;
    const barY = 190;
    
    // 进度条背景
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(barX, barY, barWidth, barHeight);
    
    // 进度条填充
    let progressColor = '#4CAF50'; // 绿色
    if (utilization >= 0.8) progressColor = '#F44336'; // 红色
    else if (utilization >= 0.6) progressColor = '#FF9800'; // 橙色
    
    context.fillStyle = progressColor;
    context.fillRect(barX, barY, barWidth * utilization, barHeight);
    
    // 百分比文字
    context.fillStyle = '#FFFFFF';
    context.font = 'Bold 20px Arial';
    context.fillText(`${Math.round(utilization * 100)}%`, 256, 240);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        alphaTest: 0.01
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(15, 7.5, 1); // 更大的标签
    
    return sprite;
}

// 设置事件监听
function setupEventListeners() {
    // 鼠标点击
    renderer.domElement.addEventListener('click', onMouseClick, false);
    
    // 键盘控制
    document.addEventListener('keydown', onKeyDown, false);
    
    // 窗口大小调整
    window.addEventListener('resize', onWindowResize, false);
    
    // 弹窗关闭事件
    document.getElementById('goodsModal').addEventListener('click', function(event) {
        if (event.target === this) {
            closeModal();
        }
    });
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

// 鼠标点击事件
function onMouseClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        for (let intersect of intersects) {
            if (intersect.object.parent && intersect.object.parent.userData.shelf) {
                selectShelf(intersect.object.parent.userData.shelf);
                break;
            }
        }
    }
}

// 选择货架 - 弹窗显示详细信息
function selectShelf(shelf) {
    // 重置之前选中的货架
    if (selectedShelf && selectedShelf.mesh) {
        selectedShelf.mesh.children.forEach(child => {
            if (child.material) {
                child.material.emissive.setHex(0x000000);
            }
        });
    }
    
    selectedShelf = shelf;
    
    // 高亮选中的货架
    if (shelf.mesh) {
        shelf.mesh.children.forEach(child => {
            if (child.material) {
                child.material.emissive.setHex(0x444444);
            }
        });
    }
    
    // 显示弹窗信息
    showShelfModal(shelf);
    
    // 更新侧边栏简要信息
    document.getElementById('selectedShelf').textContent = shelf.id;
    document.getElementById('goodsType').textContent = shelf.goodsType;
    document.getElementById('inventory').textContent = `${shelf.inventory}/${shelf.capacity}`;
    document.getElementById('utilization').textContent = `${Math.round(shelf.inventory / shelf.capacity * 100)}%`;
}

// 显示工业化货架详细信息弹窗
function showShelfModal(shelf) {
    const modal = document.getElementById('goodsModal');
    const utilization = shelf.inventory / shelf.capacity;
    const weightRatio = shelf.currentWeight / shelf.maxWeight;
    
    // 填充弹窗信息
    document.getElementById('modalShelfId').textContent = shelf.id;
    document.getElementById('modalWarehouse').textContent = shelf.warehouseName || `仓库${shelf.warehouseId}`;
    document.getElementById('modalZone').textContent = shelf.zoneId;
    document.getElementById('modalGoodsType').textContent = shelf.goodsType;
    document.getElementById('modalInventory').textContent = `${shelf.inventory} / ${shelf.capacity} 件`;
    
    // 状态显示
    const statusText = {
        'empty': '空置',
        'normal': '正常运行',
        'warning': '接近满载',
        'full': '满载/超载'
    };
    document.getElementById('modalStatus').textContent = statusText[shelf.status] || '未知';
    
    // 进度条 - 显示容量利用率
    const progressBar = document.getElementById('modalProgress');
    progressBar.style.width = `${utilization * 100}%`;
    progressBar.textContent = `${Math.round(utilization * 100)}%`;
    
    // 根据利用率设置进度条颜色
    if (utilization >= 0.95) {
        progressBar.style.background = 'linear-gradient(90deg, #E74C3C, #C0392B)';
    } else if (utilization >= 0.85) {
        progressBar.style.background = 'linear-gradient(90deg, #F39C12, #E67E22)';
    } else {
        progressBar.style.background = 'linear-gradient(90deg, #27AE60, #2ECC71)';
    }
    
    // 更新弹窗内容，添加工业化信息
    updateModalWithIndustrialData(shelf, weightRatio);
    
    // 显示弹窗
    modal.style.display = 'block';
}

// 更新弹窗工业化数据
function updateModalWithIndustrialData(shelf, weightRatio) {
    // 如果不存在工业化信息卡片，创建它们
    if (!document.getElementById('modalWeight')) {
        const goodsInfoGrid = document.querySelector('.goods-info-grid');
        
        // 重量信息卡片
        const weightCard = document.createElement('div');
        weightCard.className = 'info-card';
        weightCard.innerHTML = `
            <div class="info-label">承重情况</div>
            <div class="info-value" id="modalWeight">-</div>
        `;
        goodsInfoGrid.appendChild(weightCard);
        
        // 货架类型卡片
        const rackTypeCard = document.createElement('div');
        rackTypeCard.className = 'info-card';
        rackTypeCard.innerHTML = `
            <div class="info-label">货架类型</div>
            <div class="info-value" id="modalRackType">-</div>
        `;
        goodsInfoGrid.appendChild(rackTypeCard);
        
        // 最后检查卡片
        const inspectionCard = document.createElement('div');
        inspectionCard.className = 'info-card';
        inspectionCard.innerHTML = `
            <div class="info-label">最后检查</div>
            <div class="info-value" id="modalInspection">-</div>
        `;
        goodsInfoGrid.appendChild(inspectionCard);
        
        // 安全等级卡片
        const safetyCard = document.createElement('div');
        safetyCard.className = 'info-card';
        safetyCard.innerHTML = `
            <div class="info-label">安全等级</div>
            <div class="info-value" id="modalSafety">-</div>
        `;
        goodsInfoGrid.appendChild(safetyCard);
        
        // 添加重量进度条
        const goodsDetails = document.querySelector('.goods-details');
        const weightProgressHTML = `
            <div style="margin-top: 15px;">
                <div class="info-label">重量承载率</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="modalWeightProgress">0%</div>
                </div>
            </div>
        `;
        goodsDetails.insertAdjacentHTML('beforeend', weightProgressHTML);
    }
    
    // 更新工业化数据
    document.getElementById('modalWeight').textContent = `${shelf.currentWeight} / ${shelf.maxWeight} kg`;
    document.getElementById('modalRackType').textContent = shelf.rackType;
    document.getElementById('modalInspection').textContent = shelf.lastInspection;
    
    // 安全等级
    let safetyLevel = '安全';
    let safetyColor = '#27AE60';
    if (weightRatio >= 0.9 || shelf.status === 'full') {
        safetyLevel = '危险';
        safetyColor = '#E74C3C';
    } else if (weightRatio >= 0.8 || shelf.status === 'warning') {
        safetyLevel = '警告';
        safetyColor = '#F39C12';
    }
    
    const safetyElement = document.getElementById('modalSafety');
    safetyElement.textContent = safetyLevel;
    safetyElement.style.color = safetyColor;
    
    // 重量进度条
    const weightProgressBar = document.getElementById('modalWeightProgress');
    weightProgressBar.style.width = `${weightRatio * 100}%`;
    weightProgressBar.textContent = `${Math.round(weightRatio * 100)}%`;
    
    // 重量进度条颜色
    if (weightRatio >= 0.9) {
        weightProgressBar.style.background = 'linear-gradient(90deg, #E74C3C, #C0392B)';
    } else if (weightRatio >= 0.8) {
        weightProgressBar.style.background = 'linear-gradient(90deg, #F39C12, #E67E22)';
    } else {
        weightProgressBar.style.background = 'linear-gradient(90deg, #27AE60, #2ECC71)';
    }
}

// 关闭弹窗
function closeModal() {
    document.getElementById('goodsModal').style.display = 'none';
}

// 编辑库存
function editInventory() {
    if (!selectedShelf) return;
    
    const newInventory = prompt(`请输入新的库存数量 (0-${selectedShelf.capacity})：`, selectedShelf.inventory);
    if (newInventory !== null && !isNaN(newInventory)) {
        const amount = Math.max(0, Math.min(selectedShelf.capacity, parseInt(newInventory)));
        selectedShelf.updateInventory(amount);
        
        // 重新创建货架以更新显示
        scene.remove(selectedShelf.mesh);
        selectedShelf.mesh = createAdvancedShelfMesh(selectedShelf);
        scene.add(selectedShelf.mesh);
        
        // 更新弹窗信息
        showShelfModal(selectedShelf);
        updateStats();
    }
}

// 键盘控制
function onKeyDown(event) {
    const speed = 5;
    switch(event.code) {
        case 'KeyW':
            camera.position.z -= speed;
            break;
        case 'KeyS':
            camera.position.z += speed;
            break;
        case 'KeyA':
            camera.position.x -= speed;
            break;
        case 'KeyD':
            camera.position.x += speed;
            break;
        case 'KeyQ':
            camera.position.y += speed;
            break;
        case 'KeyE':
            camera.position.y -= speed;
            break;
    }
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环 - 性能优化版本
function animate() {
    animationId = requestAnimationFrame(animate);
    
    controls.update();
    
    // 自动巡检
    if (isAutoTour) {
        autoTourStep();
    }
    
    renderer.render(scene, camera);
}

// 设置视图模式 - 适应工厂布局
function setViewMode(mode) {
    switch(mode) {
        case 'overview':
            camera.position.set(600, 400, 600);
            controls.target.set(0, 0, 0);
            break;
        case 'detail':
            camera.position.set(100, 50, 100);
            controls.target.set(0, 0, 0);
            break;
        case 'walkthrough':
            camera.position.set(0, 20, -400);
            controls.target.set(0, 20, 0);
            break;
    }
    controls.update();
}

// 切换货架类型显示
function toggleShelfType(type) {
    shelves.forEach(shelf => {
        const shouldShow = type === 'all' || shelf.status === type;
        shelf.mesh.visible = shouldShow;
    });
}

// 调整照明
function adjustLighting(value) {
    document.getElementById('lightValue').textContent = value;
    scene.children.forEach(child => {
        if (child.type === 'DirectionalLight' || child.type === 'PointLight') {
            child.intensity = value;
        }
    });
}

// 随机化库存 - 工业化版本
function randomizeInventory() {
    shelves.forEach(shelf => {
        shelf.updateInventory(Math.floor(Math.random() * shelf.capacity));
        
        // 重新创建货架以更新显示
        if (shelf.mesh) {
            scene.remove(shelf.mesh);
            shelf.mesh = createAdvancedShelfMesh(shelf);
            scene.add(shelf.mesh);
        }
    });
    updateStats();
}

// 显示热力图
function showHeatmap() {
    shelves.forEach(shelf => {
        const utilization = shelf.inventory / shelf.capacity;
        const hue = (1 - utilization) * 120; // 从红色到绿色
        const color = new THREE.Color().setHSL(hue / 360, 1, 0.5);
        
        if (shelf.mesh && shelf.mesh.children[1]) {
            shelf.mesh.children[1].material.color = color;
        }
    });
}

// 自动巡检
function autoTour() {
    isAutoTour = !isAutoTour;
    tourStep = 0;
}

function autoTourStep() {
    const radius = 80;
    const speed = 0.02;
    const x = Math.cos(tourStep * speed) * radius;
    const z = Math.sin(tourStep * speed) * radius;
    const y = 30 + Math.sin(tourStep * speed * 2) * 10;
    
    camera.position.set(x, y, z);
    controls.target.set(0, 0, 0);
    
    tourStep++;
    if (tourStep > Math.PI * 2 / speed) {
        tourStep = 0;
    }
}

// 更新统计信息
function updateStats() {
    const total = shelves.length;
    const used = shelves.filter(s => s.inventory > 0).length;
    const empty = shelves.filter(s => s.inventory === 0).length;
    const warning = shelves.filter(s => s.status === 'warning' || s.status === 'full').length;
    const totalUtilization = shelves.reduce((sum, s) => sum + s.inventory, 0) / shelves.reduce((sum, s) => sum + s.capacity, 0) * 100;
    
    document.getElementById('totalShelves').textContent = total;
    document.getElementById('usedShelves').textContent = used;
    document.getElementById('emptyShelves').textContent = empty;
    document.getElementById('warningShelves').textContent = warning;
    document.getElementById('totalUtilization').textContent = Math.round(totalUtilization) + '%';
}

// 启动应用
init();
    