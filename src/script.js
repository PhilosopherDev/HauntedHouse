import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/addons/objects/Sky.js';
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 * Texture 다운로드 받을 때 각 파트 별로 어떤 확장자로 받을지, 어떤 부분만 받을지에 따라 용량이 달라진다. 
 * 추후 추가적으로 최적화도 가능하다.
 * WebGL 에서 사용할 것이므로 용량이 너무 클 필요 없다. 
 * 보통, texture 는 jpg, normal 에 png 를 사용한다고 한다. 
 * jpg 는 압축되어 있어서 품질 손실이 있을 수 있어서, 디테일한 요소를 보여야할 경우엔 png 를 사용한다.
 */
const textureLoader = new THREE.TextureLoader();

// Floor
const floorAlphaTexture = textureLoader.load('./floor/alpha.webp'); // 경로에 static 적지 말 것. vite 가 처리한다.
const floorColorTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp');
const floorARMTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp');
const floorNormalTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp');
const floorDisplacementTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp');

// 약간 색상이 회색을 띄어서 나오는데 이게 color texture의 경우 data texture와 달리sRGB 로 encoding 되어 있어서 그렇다고한다. 이 처리를 해줌으로써 Linear 변환 이후 정확한 계산 및 처리가 된다고 하는데 자세한건 차차 알아가자.
floorColorTexture.colorSpace = THREE.SRGBColorSpace;

floorColorTexture.repeat.set(8, 8);
floorARMTexture.repeat.set(8, 8);
floorNormalTexture.repeat.set(8, 8);
floorDisplacementTexture.repeat.set(8, 8);

floorColorTexture.wrapS = THREE.ReapeatWrapping;
floorARMTexture.wrapS = THREE.ReapeatWrapping;
floorNormalTexture.wrapS = THREE.ReapeatWrapping;
floorDisplacementTexture.wrapS = THREE.ReapeatWrapping;

floorColorTexture.wrapT = THREE.ReapeatWrapping;
floorARMTexture.wrapT = THREE.ReapeatWrapping;
floorNormalTexture.wrapT = THREE.ReapeatWrapping;
floorDisplacementTexture.wrapT = THREE.ReapeatWrapping;

// Wall
const wallColorTexture = textureLoader.load('./wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp');
const wallARMTexture = textureLoader.load('./wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp');
const wallNormalTexture = textureLoader.load('./wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp');

wallColorTexture.colorSpace = THREE.SRGBColorSpace;

// Roof
// ConeGeometry 로 Pyramid 모양을 만들어서 조명이 이상하게 들어오는 문제가 생길 수 있다고 한다. 자세히 보면 벽돌도 사선으로 나온다. 
// 1. 추후에 직접 blender로 모델 만들어서 uv unwrap으로 해결해볼 예정  2. BufferGeometry 로 직접 만들어서 해결 가능
const roofColorTexture = textureLoader.load('./roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp');
const roofARMTexture = textureLoader.load('./roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp');
const roofNormalTexture = textureLoader.load('./roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp');

roofColorTexture.colorSpace = THREE.SRGBColorSpace;

roofColorTexture.repeat.set(3, 1);
roofARMTexture.repeat.set(3, 1);
roofNormalTexture.repeat.set(3, 1);

roofColorTexture.wrapS = THREE.ReapeatWrapping;
roofARMTexture.wrapS = THREE.ReapeatWrapping;
roofNormalTexture.wrapS = THREE.ReapeatWrapping;

// Bush
// 마찬가지로 SphereGeometry 에서도 정수리 부분이 이상하게 나온다. a-hole at the top. 이것도 Roof랑 동일하게 추후 해결 가능하다. 
const bushColorTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp');
const bushARMTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp');
const bushNormalTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp');

bushColorTexture.colorSpace = THREE.SRGBColorSpace;

bushColorTexture.repeat.set(2, 1);
bushARMTexture.repeat.set(2, 1);
bushNormalTexture.repeat.set(2, 1);

bushColorTexture.wrapS = THREE.ReapeatWrapping;
bushARMTexture.wrapS = THREE.ReapeatWrapping;
bushNormalTexture.wrapS = THREE.ReapeatWrapping;

// Grave
const graveColorTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp');
const graveARMTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp');
const graveNormalTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp');

graveColorTexture.colorSpace = THREE.SRGBColorSpace;

graveColorTexture.repeat.set(0.3, 0.4);
graveARMTexture.repeat.set(0.3, 0.4);
graveNormalTexture.repeat.set(0.3, 0.4);

// Door
const doorColorTexture = textureLoader.load('./door/color.webp');
const doorAlphaTexture = textureLoader.load('./door/alpha.webp');
const doorAmbientOcclusionTexture = textureLoader.load('./door/ambientOcclusion.webp');
const doorHeightTexture = textureLoader.load('./door/height.webp');
const doorNormalTexture = textureLoader.load('./door/normal.webp');
const doorMetalnessTexture = textureLoader.load('./door/metalness.webp');
const doorRoughnessTexture = textureLoader.load('./door/roughness.webp');

doorColorTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * House
 */
const houseMeasurements = {
    width: 4,
    height: 2.5,
    depth: 4,
}

const roofMeasurements = {
    radius: 3.5,
    height: 1.5,
    radialSegments: 4,
}

const doorMeasurements = {
    width: 2.2,
    height: 2.2,
    widthSegments: 100,
    heightSegments: 100,
}

const bushesMeasurements = {
    radius: 1,
    widthSegments: 16,
    heightSegments: 16,
}

const gravesMeasurement = {
    width: 0.6,
    height: 0.8,
    depth: 0.2,
}

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        alphaMap: floorAlphaTexture,
        transparent: true, // alpha 사용할 땐 transparent: true 속성줘야 된다.
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.2,
    })
)
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor)

gui.add(floor.material, 'displacementScale').min(0).max(1).step(0.001).name('floorDisplacementScale')
gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.001).name('floorDisplacementBias')

// House Container
const house = new THREE.Group();
scene.add(house);

// Walls 
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(houseMeasurements.width, houseMeasurements.height, houseMeasurements.depth),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture,
    })
)
walls.position.y += houseMeasurements.height / 2; // 벽을 딱 지면에 붙이는 작업
house.add(walls);

// 집 뚜껑을 만들건데, 피라미드 모양을 직접 지원하지 않는데 cone 을 응용하면 피라미드 모양이 나온다. radialSegment를 4로 주면 바닥이 사각형인 사각뿔이 된다. 
// Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(roofMeasurements.radius, roofMeasurements.height, roofMeasurements.radialSegments),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture,
    })
)
roof.position.y += (houseMeasurements.height + (roofMeasurements.height / 2));
roof.rotation.y = Math.PI / 4; // 지붕 45도 돌리기
house.add(roof);

// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(doorMeasurements.width, doorMeasurements.height, doorMeasurements.widthSegments, doorMeasurements.heightSegments),
    new THREE.MeshStandardMaterial({
        // color: 'red' // z-fighting, 메쉬가 겹치면 색상이 껌뻑거린다
        map: doorColorTexture,
        alphaMap: doorAlphaTexture, // 딱 문 크기에 맞는 alpha를 적용해서 문 크기를 맞춰주는 방식을 쓴다. 
        transparent: true,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture, // displacement를 height 라고도 한다.
        displacementScale: 0.15,
        displacementBias: - 0.04,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture,
    })
)
door.position.y += doorMeasurements.height / 2 - 0.1; // 딱 절반 맞추면 texture 적용했을 때 살짝 떠보일 수 있어서 0.1 땅에 묻어둔다.
door.position.z += houseMeasurements.depth / 2 + 0.01; // 0.01로 z-fighting 해결
house.add(door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(bushesMeasurements.radius, bushesMeasurements.widthSegments, bushesMeasurements.heightSegments);
const bushMaterial = new THREE.MeshStandardMaterial({
    color: '#ccffcc',
    map: bushColorTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    normalMap: bushNormalTexture,
});

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);
bush1.rotation.x = -0.75; // Texture 이상하게 먹은거 그냥 돌려서 가려준다ㅋㅋ keep it simple

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);
bush2.rotation.x = -0.75;

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);
bush3.rotation.x = -0.75;

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);
bush4.rotation.x = -0.75;
house.add(bush1, bush2, bush3, bush4);

// Graves - house에 포함되지 않는다. 새로고침 할 때마다 새로운 위치에서 생성시킬건데, 집에 붙어 있지 않게하려고함. 

const graveGeometry = new THREE.BoxGeometry(gravesMeasurement.width, gravesMeasurement.height, gravesMeasurement.depth);
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    aoMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    metalnessMap: graveARMTexture,
    normalMap: graveNormalTexture,
});

// Grave container
const graves = new THREE.Group();
scene.add(graves);

for (let i = 0; i < 30; i++) {
    const minCircleRadius = 4;
    const maxCircleRadius = 7;
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * (maxCircleRadius - minCircleRadius) + minCircleRadius; // 큰 원과 작은 원 사이에 랜덤하게 위치하도록하는 계산 값.
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    // Mesh
    const grave = new THREE.Mesh(graveGeometry, graveMaterial);

    // 위치 지정, 작은 원과 큰 원 사이에 있으면서, 튀어나온 정도도 다 다르도록 처리.
    grave.position.x = x;
    grave.position.z = z;
    grave.position.y = Math.random() * (gravesMeasurement.height / 2);

    // 각도도 살짝씩 비틀어준다. 너무 많이 눕지 않도록 값도 작게 해준다. 
    grave.rotation.x = (Math.random() - 0.5) / 4;
    grave.rotation.y = (Math.random() - 0.5) / 4;
    grave.rotation.z = (Math.random() - 0.5) / 4;

    graves.add(grave);
}


/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.275)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

// Door light
const doorLight = new THREE.PointLight('#ff7d46', 5);
doorLight.position.set(0, 2.2, 2.5);
house.add(doorLight);

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight('#8800ff', 6)
const ghost2 = new THREE.PointLight('#ff0088', 6)
const ghost3 = new THREE.PointLight('#ff0000', 6)

scene.add(ghost1, ghost2, ghost3);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Shadows
 */
// Renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Cast and receive
directionalLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
walls.receiveShadow = true;
roof.castShadow = true;
floor.receiveShadow = true;

graves.children.forEach((grave) => {
    grave.castShadow = true;
    grave.receiveShadow = true;
})

// Mapping
directionalLight.shadow.mapSize.width = 256;
directionalLight.shadow.mapSize.height = 256;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 20;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 10;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 10;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 10;

/**
 * Sky - 사실 하나의 box 와 같다. 
 */
const sky = new Sky();
sky.scale.set(100, 100, 100);
scene.add(sky);

sky.material.uniforms['turbidity'].value = 10;
sky.material.uniforms['rayleigh'].value = 3;
sky.material.uniforms['mieCoefficient'].value = 0.1;
sky.material.uniforms['mieDirectionalG'].value = 0.95;
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95);

/**
 * Fog
 */
// scene.fog = new THREE.Fog('#ff0000', 10, 13); // near/far - 거리로 조절
scene.fog = new THREE.FogExp2('#03343f', 0.1); // density - 밀도로 조절

/**
 * Animate
 */
const timer = new Timer()

const tick = () => {
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Ghost
    const ghost1Angle = elapsedTime * 0.5;
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(ghost1Angle) * Math.sin(ghost1Angle * 2.34) * Math.sin(ghost1Angle * 3.45);

    const ghost2Angle = - elapsedTime * 0.38;
    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;
    ghost2.position.y = Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.34) * Math.sin(ghost2Angle * 3.45);

    const ghost3Angle = elapsedTime * 0.23;
    ghost3.position.x = Math.cos(ghost3Angle) * 6;
    ghost3.position.z = Math.sin(ghost3Angle) * 6;
    ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.34) * Math.sin(ghost3Angle * 3.45);



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()