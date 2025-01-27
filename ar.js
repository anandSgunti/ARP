import { loadGLTF, loadVideo } from "./libs/loader.js";
import { createChromaMaterial } from "./libs/chroma-video.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", () => {
  // Create Loading Screen
  const loadingScreen = document.createElement("div");
  loadingScreen.id = "loading-screen";
  loadingScreen.style.position = "fixed";
  loadingScreen.style.top = "0";
  loadingScreen.style.left = "0";
  loadingScreen.style.width = "100%";
  loadingScreen.style.height = "100%";
  loadingScreen.style.background = "linear-gradient(135deg, #FF4E50, #8F3E98, #4B49A6)";
  loadingScreen.style.display = "flex";
  loadingScreen.style.flexDirection = "column";
  loadingScreen.style.alignItems = "center";
  loadingScreen.style.justifyContent = "center";
  loadingScreen.style.zIndex = "1000";
  loadingScreen.style.transition = "opacity 0.8s ease-in-out";

  const logo = document.createElement("img");
  logo.src = "./assets/Team_logo.png"; // Update this path
  logo.style.width = "220px";
  logo.style.marginBottom = "20px";
  logo.style.animation = "fadeIn 1s ease-in-out";

  const loadingText = document.createElement("p");
  loadingText.innerText = "Prepare for an immersive AR experience!";
  loadingText.style.color = "white";
  loadingText.style.fontSize = "18px";
  loadingText.style.fontFamily = "'Poppins', sans-serif";
  loadingText.style.fontWeight = "500";
  loadingText.style.letterSpacing = "1px";
  loadingText.style.animation = "fadeIn 1.5s ease-in-out";

  const startButton = document.createElement("button");
  startButton.innerText = "Start AR";
  startButton.style.marginTop = "20px";
  startButton.style.padding = "12px 25px";
  startButton.style.fontSize = "18px";
  startButton.style.fontWeight = "bold";
  startButton.style.color = "white";
  startButton.style.background = "#FF4E50";
  startButton.style.border = "none";
  startButton.style.borderRadius = "8px";
  startButton.style.cursor = "pointer";
  startButton.style.transition = "all 0.3s ease-in-out";
  startButton.style.boxShadow = "0px 4px 10px rgba(255, 78, 80, 0.5)";
  startButton.style.animation = "fadeIn 2s ease-in-out";
  startButton.onmouseover = () => (startButton.style.background = "#E43E40");
  startButton.onmouseout = () => (startButton.style.background = "#FF4E50");

  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;

  document.head.appendChild(style);
  loadingScreen.appendChild(logo);
  loadingScreen.appendChild(loadingText);
  loadingScreen.appendChild(startButton);
  document.body.appendChild(loadingScreen);

  startButton.addEventListener("click", async () => {
    startButton.disabled = true; // Prevent multiple clicks
    loadingScreen.style.animation = "fadeOut 1s ease-in-out";
    setTimeout(() => document.body.removeChild(loadingScreen), 800);

    startARExperience();
  });

  async function startARExperience() {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "./assets/targets/QR.mind",
    });

    const { renderer, scene, camera } = mindarThree;
    await mindarThree.start();

    // Parent Group
    const parentGroup = new THREE.Group();
    parentGroup.position.set(0, 0, 0);
    parentGroup.scale.set(1, 1, 1);

    // Load Background Image
    const personTexture = new THREE.TextureLoader().load("./assets/videos/Person_1.png");
    const personMaterial = new THREE.MeshBasicMaterial({ map: personTexture, transparent: true });

    // Load Videos
    const headVideo = await loadVideo("assets/videos/Head.mp4");
    const handVideo = await loadVideo("assets/videos/hand.mp4");
    const footVideo = await loadVideo("assets/videos/foot.mp4");

    headVideo.muted = false;
    handVideo.muted = false;
    footVideo.muted = false;

    headVideo.playsInline = true;
    handVideo.playsInline = true;
    footVideo.playsInline = true;

    headVideo.pause();
    handVideo.pause();
    footVideo.pause();

    // Create Video Textures
    const headTexture = new THREE.VideoTexture(headVideo);
    const handTexture = new THREE.VideoTexture(handVideo);
    const footTexture = new THREE.VideoTexture(footVideo);

    // Create Image Plane
    const personGeometry = new THREE.PlaneGeometry(2, 3);
    const personPlane = new THREE.Mesh(personGeometry, personMaterial);
    personPlane.scale.set(0.7, 0.7, 0.7);
    personPlane.position.set(0, 0, 0);
    personPlane.renderOrder = 1;
    parentGroup.add(personPlane);

    // Create Video Planes
    function createVideoPlane(videoTexture, x, y, scale = 2) {
      const videoMaterial = createChromaMaterial(videoTexture, 0x00ff00);
      const videoGeometry = new THREE.PlaneGeometry(1, 2160 / 3840);
      const videoPlane = new THREE.Mesh(videoGeometry, videoMaterial);
      videoPlane.position.set(x, y, 0.05);
      videoPlane.scale.set(scale, scale, scale);
      videoPlane.visible = false;
      videoPlane.renderOrder = 2;
      parentGroup.add(videoPlane);
      return videoPlane;
    }

    const headVideoPlane = createVideoPlane(headTexture, 0.82, 0.62);
    const handVideoPlane = createVideoPlane(handTexture, -0.5, 0.2);
    const footVideoPlane = createVideoPlane(1.2, -0.5);

    // Create Hotspots
    function createHotspotPlane(x, y, scale = 2) {
      const hotspotGeometry = new THREE.PlaneGeometry(0.3, 0.2);
      const hotspotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
      const hotspotPlane = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
      hotspotPlane.position.set(x, y, 0.06);
      hotspotPlane.scale.set(scale, scale, scale);
      hotspotPlane.visible = true;
      hotspotPlane.renderOrder = 3;
      parentGroup.add(hotspotPlane);
      return hotspotPlane;
    }

    const headHotspotPlane = createHotspotPlane(0.2, 0.85);
    const handHotspotPlane = createHotspotPlane(-0.6, 0.55);
    const footHotspotPlane = createHotspotPlane(0.2, -0.95);

    // Assign video references for interaction
    headHotspotPlane.userData = { video: headVideo, plane: headVideoPlane };
    handHotspotPlane.userData = { video: handVideo, plane: handVideoPlane };
    footHotspotPlane.userData = { video: footVideo, plane: footVideoPlane };

    // Create Anchor and Attach Everything
    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(parentGroup);

    // Handle Click Events
    document.body.addEventListener("click", (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -1 * ((e.clientY / window.innerHeight) * 2 - 1);
      const mouse = new THREE.Vector2(mouseX, mouseY);

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const { video, plane } = clickedObject.userData || {};

        if (video && plane) {
          video.paused ? video.play() : video.pause();
          plane.visible = !plane.visible;
        }
      }
    });

    renderer.setAnimationLoop(() => renderer.render(scene, camera));
  }
});
