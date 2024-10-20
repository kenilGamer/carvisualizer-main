import './styles.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import GUI from 'lil-gui';

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 5, 50);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const rgbeLoader = new RGBELoader();

rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/empty_workshop_4k.hdr',function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);
const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true,canvas });
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let car = ["/public/Lamborghini-V12-1.glb","/public/car.glb"];
let body,whells;
const loader = new GLTFLoader()
let selectedCar = 'Lamborghini';

document.getElementById('car-selector').addEventListener('change', function() {
  selectedCar = this.value;
  loader.load(`/public/${selectedCar}.glb`, (gltf) => {
    car = gltf.scene
    car.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

   if(selectedCar === 'Lamborghini'){
    body = car.children[0].children[0].children[0]
    whells = car.children[0].children[1].children[0]
    console.log(body,whells);
    // whells.material.color.set('white')
    whells.material.map = new THREE.TextureLoader().load('/public/leather_white_4k.gltf/textures/leather_white_rough_4k.jpg')
   }else{
     body = car.children[0].children[0].children[0]
     whells = car.children[0].children[0].children[2]
    console.log(car);
    console.log(body,whells);
    body.material.color.set('white')
    body.material.map = new THREE.TextureLoader().load('/public/leather_white_4k.gltf/textures/leather_white_rough_4k.jpg')
   }


    document.querySelector('input[type="color"]').addEventListener('input', (e) => {
      if (body && body.material) {
        body.material.color.set(e.target.value);
      }else{
        console.log('body not found');
      }
      if (whells && whells.material) {
        whells.material.color.set(e.target.value);
      }else{
        console.log('whells not found');
      }
    });

    car.position.set(0, -3.8, 0)
    car.scale.set(2.5, 2.5, 2.5)
    // scene.add(car)
    scene.remove(car).add(car);
  })
})

// loader.load('/public/Lamborghini-V12-1.glb', (gltf) => {
//   car = gltf.scene
//   car.traverse((child) => {
//     if (child.isMesh) {
//       child.castShadow = true;
//       child.receiveShadow = true;
//     }
//   });

//   const body = car.children[0].children[0].children[0]
//   const whells = car.children[0].children[1].children[0]
//  console.log(body,whells);
 
//   // body.material.color.set('white')
//   // body.material.map = new THREE.TextureLoader().load('/public/leather_white_4k.gltf/textures/leather_white_rough_4k.jpg')


//   const gui = new GUI()

//   const bodyFolder = gui.addFolder("Body");
//   const bodyColor = { color: 0xff0000 }
//   bodyFolder.addColor(bodyColor, 'color').onChange(() => {
//     if (body && body.material) {
//       body.material.color.set(bodyColor.color)
//     }else{
//       console.log('body not found');
//     }
//   })

//   const whellFolder = gui.addFolder('Whells')
//   const whellColor = { color: 0x000000 }
//   whellFolder.addColor(whellColor, 'color').onChange(() => {
//     if (whells && whells.material) {
//       whells.material.color.set(whellColor.color)
//     }else{
//       console.log('whells not found',whells.material);
//     }
//   })

//   document.querySelector('input[type="color"]').addEventListener('input', (e) => {
//     if (body && body.material) {
//       body.material.color.set(e.target.value);
//     }else{
//       console.log('body not found');
//     }
//     if (whells && whells.material) {
//       whells.material.color.set(e.target.value);
//     }else{
//       console.log('whells not found');
//     }
//   });

//   car.position.set(0, -3.8, 0)
//   car.scale.set(2.5, 2.5, 2.5)
//   scene.add(car)
// })

loader.load('./garage.glb', (gltf) => {
  const garage = gltf.scene
  garage.position.set(10, 2, -1.5)
  garage.rotation.y = Math.PI / 2

  garage.traverse((child) => {
    if (child.isMesh) {
      const mat = child.material.clone()
      child.material = new THREE.MeshStandardMaterial()
      child.material.map = mat.map
      child.material.roughness = mat.roughness
      child.material.metalness = mat.metalness
      child.material.color.set(mat.color)
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  scene.add(garage)
})

const fit = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

window.addEventListener('resize', fit)




const clock = new THREE.Clock()
const animate = () => {
if(car && car.position){
  camera.position.x = Math.sin(clock.getElapsedTime()) * 15
  camera.position.z = Math.cos(clock.getElapsedTime()) * 15
  camera.position.y = 2 + Math.cos(clock.getElapsedTime()) * 2  
}

  if (car && car.position) {
    camera.lookAt(car.position);
  }

  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

fit()
animate()

