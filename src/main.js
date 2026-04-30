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
const hoverAnimationCandidates = [];
let currentIntersects = [];
let currentHoveredObject = null;
let hoverDebounceTimer = null;
let autoHoverInterval = null;
let autoHoverStartTimeout = null;
let autoHoverIndex = 0;
let autoHoverHasStarted = false;
let autoHoveredObject = null;
let autoHoverResetCall = null;
let pointerHoverPulseResetCall = null;
let sceneInputLockedUntil = 0;
let touchStart = null;

const isMobile = window.matchMedia("(pointer: coarse), (max-width: 768px)").matches;
const MOBILE_CAMERA_DISTANCE_MULTIPLIER = 1.2;
const SCENE_INTERACTION_LOCK_MS = 500;
const TAP_MAX_MOVEMENT_PX = 12;
const TAP_MAX_DURATION_MS = 700;
const AUTO_HOVER_INTERVAL_MS = 5000;
const AUTO_HOVER_INITIAL_DELAY_MS = 10000;
const AUTO_HOVER_RESET_DELAY_SECONDS = 2;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const INITIAL_CAMERA_POSITION = new THREE.Vector3(
  1.7731712838628582,
  8.644026257550694,
  -2.8065522539595307
);
const INITIAL_CONTROLS_TARGET = new THREE.Vector3(
  -11.075374626957164,
  0.8632929503333462,
  -18.317494451055623
);

const manager = new THREE.LoadingManager();

function hideLoaderAfterScenePaint() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.hideLoader();
    });
  });
}

/*Loaders*/
const textureLoader = new THREE.TextureLoader();

//Model Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader(manager);
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
  lockSceneInteractions();
  controls.enabled = false;      // freeze OrbitControls
  window.openModal(name);        // function comes from ui.jsx
};

function ensureHoverAnimationState(object) {
  if (object.userData.initialScale) return;

  object.userData.initialScale = new THREE.Vector3().copy(object.scale);
  object.userData.initialPosition = new THREE.Vector3().copy(object.position);
  object.userData.initialRotation = new THREE.Euler().copy(object.rotation);
}

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
        ensureHoverAnimationState(child);
        hoverAnimationCandidates.push(child);
      }
      Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          const material = new THREE.MeshBasicMaterial({
            map: loaderTextures.day[key],
          });
          child.material = material;
        }
        if (child.material.map) {
          child.material.map.minFilter = THREE.LinearFilter; //prevent seams from forming if zoom out
        }
      });
    }
  });
  // Expand headphone hitbox for easier clicking
  glb.scene.traverse((child) => {
    if (child.isMesh && (child.name.toLowerCase().includes("headphone") || child.name.toLowerCase().includes("spotify"))) {
      const box = new THREE.Box3().setFromObject(child);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      const expandedGeo = new THREE.BoxGeometry(size.x * 2.5, size.y * 2.5, size.z * 2.5);
      const expandedMat = new THREE.MeshBasicMaterial({ visible: false });
      const expandedMesh = new THREE.Mesh(expandedGeo, expandedMat);
      expandedMesh.name = "HeadphoneRaycasterPointerExpanded";
      expandedMesh.position.copy(center);
      glb.scene.add(expandedMesh);
      raycasterObjects.push(expandedMesh);
    }
  });

  // Expand fridge photo hitbox for easier clicking
  // Mesh name in Blender should contain "Photo" (e.g. "PhotoRaycasterPointerHover")
  glb.scene.traverse((child) => {
    if (child.isMesh && child.name.toLowerCase().includes("photo")) {
      const box = new THREE.Box3().setFromObject(child);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      const expandedGeo = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
      const expandedMat = new THREE.MeshBasicMaterial({ visible: false });
      const expandedMesh = new THREE.Mesh(expandedGeo, expandedMat);
      expandedMesh.name = "PhotoRaycasterPointerExpanded";
      expandedMesh.position.copy(center);
      ensureHoverAnimationState(child);
      child.userData.pointerHoverPulse = true;
      expandedMesh.userData.hoverTarget = child;
      glb.scene.add(expandedMesh);
      raycasterObjects.push(expandedMesh);
    }
  });

  scene.add(glb.scene);
  hideLoaderAfterScenePaint();
  startShudderPolling();
});



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  1000
);

function getInitialCameraPosition() {
  if (!isMobile) return INITIAL_CAMERA_POSITION.clone();

  return INITIAL_CONTROLS_TARGET.clone().add(
    INITIAL_CAMERA_POSITION.clone()
      .sub(INITIAL_CONTROLS_TARGET)
      .multiplyScalar(MOBILE_CAMERA_DISTANCE_MULTIPLIER)
  );
}

camera.position.copy(getInitialCameraPosition());

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //Note: 2 is max pixel ratio should go for performance
//note: pixelratio is ratio between physical pixels on a device and the CSS pixels used by the browser.  If i say pixel ratio is 2, then every CSS pixel (which is 1x1) is mapped to a 2x2 physical pixels

/*orbit controls*/
//controls.update() must be called after any manual changes to the camera's transform
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; //allows slowing glide after movement of camera
controls.dampingFactor = 0.05;
controls.target.copy(INITIAL_CONTROLS_TARGET);
controls.update();
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

function lockSceneInteractions(duration = SCENE_INTERACTION_LOCK_MS) {
  sceneInputLockedUntil = Math.max(sceneInputLockedUntil, performance.now() + duration);
  currentIntersects = [];
  touchStart = null;
}

function sceneInteractionsLocked() {
  return window.isModalOpen || performance.now() < sceneInputLockedUntil;
}

window.lockSceneInteractions = lockSceneInteractions;

function updatePointerFromClient(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
}

function refreshIntersects() {
  raycaster.setFromCamera(pointer, camera);
  currentIntersects = raycaster.intersectObjects(raycasterObjects);
}

function isCanvasEvent(e) {
  return e.target === renderer.domElement;
}

//function for click events
function handleInteraction() {
  if (sceneInteractionsLocked()) return;

  refreshIntersects();

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
    } else if (hit.name.toLowerCase().includes("headphone") || hit.name.toLowerCase().includes("spotify")) {
      lockSceneInteractions();
      controls.enabled = false;
      const vec = new THREE.Vector3();
      hit.getWorldPosition(vec);
      vec.project(camera);
      const screenX = ((vec.x + 1) / 2) * window.innerWidth;
      const screenY = ((-vec.y + 1) / 2) * window.innerHeight;
      window.playMusicAndOpenModal(screenX, screenY);
    } else if (hit.name.toLowerCase().includes("photo") || hit.name.toLowerCase().includes("fridge_photo")) {
      openModalAndLock("Scrapbook");
    } else if (hit.name.toLowerCase().includes("pokeball")) {
      lockSceneInteractions();
      controls.enabled = false;
      // Project pokeball world position to screen pixels
      const vec = new THREE.Vector3();
      hit.getWorldPosition(vec);
      vec.project(camera);
      const screenX = ((vec.x + 1) / 2) * window.innerWidth;
      const screenY = ((-vec.y + 1) / 2) * window.innerHeight;
      window.playSparkleAndOpenModal("Pokemon", screenX, screenY);
    }
  }
}

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
  if (!isCanvasEvent(e)) return;
  if (window.isModalOpen) return;
  updatePointerFromClient(e.clientX, e.clientY);
});

//for mobile users
window.addEventListener(
  "touchstart",
  (e) => {
    if (!isCanvasEvent(e)) {
      touchStart = null;
      return;
    }
    if (sceneInteractionsLocked()) {
      touchStart = null;
      return;
    }
    e.preventDefault();
    //0 gets first finger that touches the screen
    const touch = e.touches[0];
    updatePointerFromClient(touch.clientX, touch.clientY);
    touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
      eligible: true,
    };
  },
  { passive: false }
);

window.addEventListener(
  "touchmove",
  (e) => {
    if (!isCanvasEvent(e)) return;
    if (!touchStart || !e.touches.length) return;

    const touch = e.touches[0];
    const distance = Math.hypot(touch.clientX - touchStart.x, touch.clientY - touchStart.y);
    if (distance > TAP_MAX_MOVEMENT_PX) {
      touchStart.eligible = false;
    }
  },
  { passive: true }
);

//for desktop
window.addEventListener("click", (e) => {
  if (!isCanvasEvent(e)) return;
  handleInteraction();
});
//for mobile
window.addEventListener("touchend", (e) => {
  if (!isCanvasEvent(e)) {
    touchStart = null;
    return;
  }
  if (sceneInteractionsLocked()) {
    touchStart = null;
    return;
  }
  if (!touchStart || !touchStart.eligible || !e.changedTouches.length) {
    touchStart = null;
    return;
  }

  const touch = e.changedTouches[0];
  const distance = Math.hypot(touch.clientX - touchStart.x, touch.clientY - touchStart.y);
  const duration = performance.now() - touchStart.time;
  const isTap = distance <= TAP_MAX_MOVEMENT_PX && duration <= TAP_MAX_DURATION_MS;
  touchStart = null;

  if (!isTap) return;

  e.preventDefault();
  updatePointerFromClient(touch.clientX, touch.clientY);
  handleInteraction();
}, { passive: false });

function playHoverAnimation(object, isHovering, options = {}) {
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);

  const isPokeball = object.name.toLowerCase().includes("pokeball");
  const isName = object.name.toLowerCase().includes("name");

  if (isHovering) {
    if (isName) {
      // Name object: grow on hover
      gsap.to(object.scale, {
        x: object.userData.initialScale.x * 1.15,
        y: object.userData.initialScale.y * 1.15,
        z: object.userData.initialScale.z * 1.15,
        duration: 0.3,
        ease: "power2.out",
        onComplete: options.onScaleInComplete,
      });
    } else if (isPokeball) {
      // Pokeball: lift up and bob gently
      gsap.to(object.scale, {
        x: object.userData.initialScale.x * 1.1,
        y: object.userData.initialScale.y * 1.1,
        z: object.userData.initialScale.z * 1.1,
        duration: 0.4,
        ease: "power2.out",
        onComplete: options.onScaleInComplete,
      });

      const hoverHeight = 0.15;
      gsap.to(object.position, {
        y: object.userData.initialPosition.y + hoverHeight,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(object.position, {
            y: object.userData.initialPosition.y + hoverHeight + 0.04,
            duration: 0.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        },
      });
    } else {
      // Other objects: original bounce animation
      gsap.to(object.scale, {
        x: object.userData.initialScale.x * 1.2,
        y: object.userData.initialScale.y * 1.2,
        z: object.userData.initialScale.z * 1.2,
        duration: 0.5,
        ease: "bounce.out(1.8)",
        onComplete: options.onScaleInComplete,
      });
      gsap.to(object.rotation, {
        x: (object.userData.initialRotation.x * Math.PI) / 8,
        duration: 0.5,
        ease: "bounce.out(1.8)",
      });
    }
  } else {
    // Return to original state
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: (isPokeball || isName) ? "power2.out" : "bounce.out(1.8)",
    });

    if (isPokeball) {
      gsap.to(object.position, {
        y: object.userData.initialPosition.y,
        duration: 0.3,
        ease: "power2.out",
      });
    } else if (!isName) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x,
        duration: 0.3,
        ease: "bounce.out(1.8)",
      });
    }
  }
}

function getHoverAnimationObject(object) {
  const target = object.userData.hoverTarget || object;

  if (target.name.includes("Hover") || target.userData.pointerHoverPulse) {
    return target;
  }

  return null;
}

function cancelPointerHoverPulseReset() {
  if (!pointerHoverPulseResetCall) return;

  pointerHoverPulseResetCall.kill();
  pointerHoverPulseResetCall = null;
}

function schedulePointerHoverPulseReset(object) {
  cancelPointerHoverPulseReset();

  pointerHoverPulseResetCall = gsap.delayedCall(AUTO_HOVER_RESET_DELAY_SECONDS, () => {
    pointerHoverPulseResetCall = null;

    if (currentHoveredObject !== object) return;

    playHoverAnimation(object, false);
  });
}

function playPointerHoverAnimation(object) {
  if (!object.userData.pointerHoverPulse) {
    playHoverAnimation(object, true);
    return;
  }

  playHoverAnimation(object, true, {
    onScaleInComplete: () => {
      if (currentHoveredObject === object) {
        schedulePointerHoverPulseReset(object);
      }
    },
  });
}

/* Auto-hover loop: cycles through Hover objects one at a time. */

function cancelAutoHoverReset() {
  if (!autoHoverResetCall) return;

  autoHoverResetCall.kill();
  autoHoverResetCall = null;
}

function clearAutoHoverObject() {
  cancelAutoHoverReset();

  if (!autoHoveredObject) return;

  playHoverAnimation(autoHoveredObject, false);
  autoHoveredObject = null;
}

function scheduleAutoHoverReset(object) {
  cancelAutoHoverReset();

  autoHoverResetCall = gsap.delayedCall(AUTO_HOVER_RESET_DELAY_SECONDS, () => {
    autoHoverResetCall = null;

    if (autoHoveredObject !== object || currentHoveredObject === object) return;

    playHoverAnimation(object, false);
    autoHoveredObject = null;
  });
}

function getNextAutoHoverTarget() {
  if (hoverAnimationCandidates.length === 0) return null;

  for (let i = 0; i < hoverAnimationCandidates.length; i += 1) {
    const object = hoverAnimationCandidates[autoHoverIndex];
    autoHoverIndex = (autoHoverIndex + 1) % hoverAnimationCandidates.length;

    if (object.name.includes("Hover") && object !== currentHoveredObject) {
      return object;
    }
  }

  return null;
}

function triggerNextAutoHoverObject() {
  clearAutoHoverObject();

  if (window.isModalOpen || currentHoveredObject) return;

  const target = getNextAutoHoverTarget();
  if (!target) return;

  autoHoveredObject = target;
  playHoverAnimation(target, true, {
    onScaleInComplete: () => {
      if (autoHoveredObject === target) {
        scheduleAutoHoverReset(target);
      }
    },
  });
}

function startShudderPolling() {
  if (autoHoverInterval || autoHoverStartTimeout) return;

  const startDelay = autoHoverHasStarted ? AUTO_HOVER_INTERVAL_MS : AUTO_HOVER_INITIAL_DELAY_MS;
  autoHoverStartTimeout = setTimeout(() => {
    autoHoverStartTimeout = null;
    autoHoverHasStarted = true;
    triggerNextAutoHoverObject();
    autoHoverInterval = setInterval(triggerNextAutoHoverObject, AUTO_HOVER_INTERVAL_MS);
  }, startDelay);
}

function stopShudderPolling() {
  if (autoHoverStartTimeout) {
    clearTimeout(autoHoverStartTimeout);
    autoHoverStartTimeout = null;
  }

  if (autoHoverInterval) {
    clearInterval(autoHoverInterval);
    autoHoverInterval = null;
  }

  clearAutoHoverObject();
}

window.startShudderPolling = startShudderPolling;
window.stopShudderPolling = stopShudderPolling;

const render = () => {
  controls.update();

  if (sceneInteractionsLocked()) {
    currentIntersects = [];
    document.body.style.cursor = "default";
    if (currentHoveredObject) {
      cancelPointerHoverPulseReset();
      playHoverAnimation(currentHoveredObject, false);
      currentHoveredObject = null;
    }
    clearAutoHoverObject();
  } else {
    raycaster.setFromCamera(pointer, camera);
    currentIntersects = raycaster.intersectObjects(raycasterObjects);

    if (currentIntersects.length > 0) {
      const currentIntersectedObject = currentIntersects[0].object;
      const currentHoverAnimationObject = getHoverAnimationObject(currentIntersectedObject);

      // Clear any pending unhover timer since we're still on an object
      if (hoverDebounceTimer) {
        clearTimeout(hoverDebounceTimer);
        hoverDebounceTimer = null;
      }

      if (currentHoverAnimationObject) {
        if (autoHoveredObject === currentHoverAnimationObject && !currentHoveredObject) {
          cancelAutoHoverReset();
          currentHoveredObject = currentHoverAnimationObject;
          autoHoveredObject = null;
          if (currentHoverAnimationObject.userData.pointerHoverPulse) {
            schedulePointerHoverPulseReset(currentHoverAnimationObject);
          }
        } else if (currentHoverAnimationObject != currentHoveredObject) {
          //These cover cases on I am on hovered object, and i may switch to another hover object
          clearAutoHoverObject();
          cancelPointerHoverPulseReset();
          if (currentHoveredObject) {
            playHoverAnimation(currentHoveredObject, false);
          }
          playPointerHoverAnimation(currentHoverAnimationObject);
          currentHoveredObject = currentHoverAnimationObject;
        }
      } else if (currentHoveredObject && !hoverDebounceTimer) {
        const objectToUnhover = currentHoveredObject;
        hoverDebounceTimer = setTimeout(() => {
          if (currentHoveredObject === objectToUnhover) {
            cancelPointerHoverPulseReset();
            playHoverAnimation(currentHoveredObject, false);
            currentHoveredObject = null;
          }
          hoverDebounceTimer = null;
        }, 50);
      }
      if (currentIntersectedObject.name.includes("Pointer")) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    } else {
      if (currentHoveredObject && !hoverDebounceTimer) {
        // Debounce the unhover to prevent edge flickering
        const objectToUnhover = currentHoveredObject;
        hoverDebounceTimer = setTimeout(() => {
          if (currentHoveredObject === objectToUnhover) {
            cancelPointerHoverPulseReset();
            playHoverAnimation(currentHoveredObject, false);
            currentHoveredObject = null;
          }
          hoverDebounceTimer = null;
        }, 50); // 50ms delay prevents edge flickering
      }
      document.body.style.cursor = "default";
    }
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(render); //this forces window to rerender on every new frame
};

render();
