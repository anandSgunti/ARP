import { loadGLTF, loadVideo  } from "./libs/loader.js";
import { createChromaMaterial } from "./libs/chroma-video.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", () => {
  const start = async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "./assets/targets/QR.mind", // Tracking image
    });
    const { renderer, scene, camera } = mindarThree;

    // Create a Parent Group to Keep Objects Aligned
    const parentGroup = new THREE.Group();
    parentGroup.position.set(0, 0, 0);
    parentGroup.scale.set(1, 1, 1);

    // Load Person Texture (Background Image)
    const personTexture = new THREE.TextureLoader().load("./assets/videos/Person_1.png");
    const personMaterial = new THREE.MeshBasicMaterial({ map: personTexture, transparent: true });

    // Load Videos
    const headVideo = await loadVideo("assets/videos/A_head.mp4");
    const handVideo = await loadVideo("assets/videos/A_hand.mp4");
    const footVideo = await loadVideo("assets/videos/A_foot.mp4");

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

    // Create Single Plane for Image
    const personGeometry = new THREE.PlaneGeometry(2, 3);
    const personPlane = new THREE.Mesh(personGeometry, personMaterial);
    personPlane.scale.set(0.7, 0.7, 0.7);
    personPlane.position.set(0, 0, 0);
    personPlane.renderOrder = 1;
    parentGroup.add(personPlane);

    // Create Video Planes (Keeping Videos at Given Places)
    function createVideoPlane(videoTexture, x, y, scale = 1) {
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

    const headVideoPlane = createVideoPlane(headTexture,  0.82, 0.62);
    const handVideoPlane = createVideoPlane(handTexture, -0.5, 0.2);
    const footVideoPlane = createVideoPlane(footTexture, 1.2, -0.5);

    // Create Hotspot Planes (Click Detection Only)
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

    // Handle Click Events for Hotspots
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
          if (video.paused) {
            video.play();
            plane.visible = true;
          } else {
            video.pause();
            plane.visible = false;
          }
        }
      }
    });

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };

  start();
});
