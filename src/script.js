import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
}

const bushesMeasurements = {
    radius: 1,
    widthSegments: 16,
    heightSegments: 16,
}

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial()
)
floor.rotation.x = -Math.PI * 0.5;

scene.add(floor)

// House Container
const house = new THREE.Group();
scene.add(house);

// Walls 
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(houseMeasurements.width, houseMeasurements.height, houseMeasurements.depth),
    new THREE.MeshStandardMaterial()
)
walls.position.y += houseMeasurements.height / 2; // 벽을 딱 지면에 붙이는 작업
house.add(walls);

// 집 뚜껑을 만들건데, 피라미드 모양을 직접 지원하지 않는데 cone 을 응용하면 피라미드 모양이 나온다. radialSegment를 4로 주면 바닥이 사각형인 사각뿔이 된다. 
// Root
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(roofMeasurements.radius, roofMeasurements.height, roofMeasurements.radialSegments),
    new THREE.MeshStandardMaterial()
)
roof.position.y += (houseMeasurements.height + (roofMeasurements.height / 2));
roof.rotation.y = Math.PI / 4; // 지붕 45도 돌리기
house.add(roof);

// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(doorMeasurements.width, doorMeasurements.height),
    new THREE.MeshStandardMaterial({
        color: 'red' // z-fighting, 메쉬가 겹치면 색상이 껌뻑거린다
    })
)
door.position.y += doorMeasurements.height / 2 - 0.1; // 딱 절반 맞추면 texture 적용했을 때 살짝 떠보일 수 있어서 0.1 땅에 묻어둔다.
door.position.z += houseMeasurements.depth / 2 + 0.01; // 0.01로 z-fighting 해결
house.add(door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(bushesMeasurements.radius, bushesMeasurements.widthSegments, bushesMeasurements.heightSegments);
const bushMaterial = new THREE.MeshStandardMaterial();

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);
house.add(bush1, bush2, bush3, bush4);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

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
 * Animate
 */
const timer = new Timer()

const tick = () => {
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()