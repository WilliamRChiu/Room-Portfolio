import "./style.scss";
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

const modals = {
  projects: document.querySelector(".modal.projects"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),
  resume: document.querySelector(".modal.resume"),
};

document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener("click", (e) => {
    //search for the closest parent modal and close it
    const targetModal = e.target.closest(".modal");
    hideModal(targetModal);
  });
});

const showModal = (modal) => {
  modal.style.display = "block";
  //need to set gsap animation initial states to avoid gitches
  gsap.set(modal, { opacity: 0 });
  gsap.to(modal, {
    opacity: 1,
    duration: 0.5,
  });
};

const hideModal = (modal) => {
  modal.style.display = "block";
  //need to set gsap animation initial states to avoid gitches
  gsap.set(modal, { opacity: 1 });
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    },
  });
};

const raycasterObjects = [];
let currentIntersects = [];

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
  Third: "/textures/TextureSetThreeDay.webp",
  Fourth: "/textures/TextureSetFourDay.webp",
  Fifth: "/textures/TextureSetFiveDay.webp",
  Targets: "/textures/TargetTextureSetDay.webp",
};

const loaderTextures = {
  day: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loaderTextures.day[key] = dayTexture;
});

loader.load("/models/MainRoomV42PostBake-v1.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("Raycaster")) {
        raycasterObjects.push(child);
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
camera.position.set(0.6107703493773222, 8.783041380332026, -4.315958524515217);

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
  -13.918782764225309,
  -2.3893284531626153,
  -23.468335659314093
);
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
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("click", (e) => {
  if (currentIntersects.length) {
    const hit = currentIntersects[0].object;
    if (hit.name.includes("Projects_Button")) {
      showModal(modals.projects);
    } else if (hit.name.includes("About_Button")) {
      showModal(modals.about);
    } else if (hit.name.includes("Contact_Button")) {
      showModal(modals.contact);
    } else if (hit.name.includes("Resume_Button")) {
      showModal(modals.resume);
    }
  }
});

const render = () => {
  controls.update();

  raycaster.setFromCamera(pointer, camera);

  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  for (let i = 0; i < currentIntersects.length; i++) {
    // currentIntersects[i].object.material.color.set(0xff0000);
  }

  if (currentIntersects.length > 0) {
    const currentIntersectedObject = currentIntersects[0].object;
    if (currentIntersectedObject.name.includes("Pointer")) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  } else {
    document.body.style.cursor = "default";
  }

  /*camera logging*/
  // console.log(camera.position);
  // console.log("00000");
  // console.log(controls.target);

  renderer.render(scene, camera);

  window.requestAnimationFrame(render); //this forces window to rerender on every new frame
};

render();
