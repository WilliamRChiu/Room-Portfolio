import "./style.scss";
import "./ui.jsx";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

const canvas = document.querySelector(".experience-canvas");

const sizes = {
  height: window.innerHeight,
  width: window.innerWidth,
};

const raycasterObjects = [];
let currentIntersects = [];
let currentHoveredOject = null;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const socialLinks = {
  Github: "https://github.com/WilliamRChiu",
  Linkedin: "https://www.linkedin.com/in/williamrchiu/",
};

/*Loaders*/
const textureLoader = new THREE.TextureLoader();

//Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const textureMap = {
  First: "/textures/TextureSetOneDay.webp",
  Second: "/textures/TextureSetTwoDay.webp",
  Third: "/textures/TextureSetThreeDayUpdate.webp",
  Fourth: "/textures/TextureSetFourDay.webp",
  Fifth: "/textures/TextureSetFiveDay.webp",
  Targets: "/textures/TargetTextureSetDay.webp",
};

const loaderTextures = {
  day: {},
};

const openModalAndLock = (name) => {
  controls.enabled = false;      // freeze OrbitControls
  window.openModal(name);        // function comes from ui.jsx
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loaderTextures.day[key] = dayTexture;
});

loader.load("/models/MainRoomV43PostBake-v1.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("Raycaster")) {
        raycasterObjects.push(child);
      }
      if (child.name.includes("Hover")) {
        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialRotation = new THREE.Euler().copy(child.position);
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }
      Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          const material = new THREE.MeshBasicMaterial({
            map: loaderTextures.day[key],
          });
          child.material = material;
        }
        if (child.name.includes("Third")) {
          console.log(child.name, loaderTextures.day.Third, child.material.map);
        }
        if (child.material.map) {
          child.material.map.minFilter = THREE.LinearFilter; //prevent seams from forming if zoom out
        }
      });
    }
  });
  scene.add(glb.scene);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(1.7731712838628582, 8.644026257550694, -2.8065522539595307);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //Note: 2 is max pixel ratio should go for performance
//note: pixelratio is ratio between physical pixels on a device and the CSS pixels used by the browser.  If i say pixel ratio is 2, then every CSS pixel (which is 1x1) is mapped to a 2x2 physical pixels

/*orbit controls*/
//controls.update() must be called after any manual changes to the camera's transform
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; //allows slowing glide after movement of camera
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(
  -11.075374626957164,
  0.8632929503333462,
  -18.317494451055623
);
window.controls = controls;
//ensure cam cant go below floor
controls.minPolarAngle = 0;

//ensure cam cant go above certain angle
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

//limit zoom
controls.minDistance = 10;
controls.maxDistance = 50;

/*Event Listeners*/

//Window resize event listener
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update Camera (so scene does not look squished)
  camera.aspect = sizes.width / sizes.height;

  //Update projection matrix to properly map 3d points to new 2d plane
  camera.updateProjectionMatrix();

  //Update renderer (so scene renders to correct size canvas and doesn't get blurred, cropped, etc)
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("mousemove", (e) => {
  if (window.isModalOpen) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

//for mobile users
window.addEventListener(
  "touchstart",
  (e) => {
    if (window.isModalOpen) return;
    e.preventDefault();
    //0 gets first finger that touches the screen
    pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
  },
  { passive: false }
);

window.addEventListener("click", (e) => {
  if (currentIntersects.length) {
    const hit = currentIntersects[0].object;
    if (hit.name.includes("Projects_Button")) {
      openModalAndLock("Projects");
    } else if (hit.name.includes("About_Button")) {
      openModalAndLock("About");
    } else if (hit.name.includes("Contact_Button")) {
      openModalAndLock("Contact");
    } else if (hit.name.includes("Resume_Button")) {
      openModalAndLock("Resume");
    }
  }
});

function playHoverAnimation(object, isHovering) {
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);

  if (isHovering) {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * 1.2,
      y: object.userData.initialScale.y * 1.2,
      z: object.userData.initialScale.z * 1.2,
      duration: 0.5,
      ease: "bounce.out(1.8)",
    });
    gsap.to(object.rotation, {
      x: (object.userData.initialRotation.x * Math.PI) / 8,
      duration: 0.5,
      ease: "bounce.out(1.8)",
    });
  } else {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "bounce.out(1.8)",
    });
    gsap.to(object.rotation, {
      x: object.userData.initialRotation.x,
      duration: 0.3,
      ease: "bounce.out(1.8)",
    });
  }
}

const render = () => {
  controls.update();

  raycaster.setFromCamera(pointer, camera);

  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  if (!window.isModalOpen) {
    if (currentIntersects.length > 0) {
      const currentIntersectedObject = currentIntersects[0].object;

      if (currentIntersectedObject.name.includes("Hover")) {
        if (currentIntersectedObject != currentHoveredOject) {
          //These cover cases on I am on hovered object, and i may switch to another hover object
          if (currentHoveredOject) {
            playHoverAnimation(currentHoveredOject, false);
          }
          playHoverAnimation(currentIntersectedObject, true);
          currentHoveredOject = currentIntersectedObject;
        }
      }
      if (currentIntersectedObject.name.includes("Pointer")) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    } else {
      if (currentHoveredOject) {
        //covers case of I am on hover object and then i leave it
        playHoverAnimation(currentHoveredOject, false);
        currentHoveredOject = null;
      }
      document.body.style.cursor = "default";
    }
  }

  /*camera logging*/
  console.log(camera.position);
  console.log("00000");
  console.log(controls.target);

  renderer.render(scene, camera);

  window.requestAnimationFrame(render); //this forces window to rerender on every new frame
};

render();
