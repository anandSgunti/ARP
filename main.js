import { loadGLTF, loadVideo  } from "../../libs/loader.js";
import { createChromaMaterial } from "../../libs/chroma-video.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", () => {
  const start = async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "../../assets/targets/musicband.mind", // Tracking image
    });
    const { renderer, scene, camera } = mindarThree;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Load Person Texture (Background Image)
    const personTexture = new THREE.TextureLoader().load("../../assets/videos/Person.png");
    const personMaterial = new THREE.MeshBasicMaterial({ map: personTexture, transparent: true });

    // Load Videos
    const headVideo = await loadVideo("../../assets/videos/head.mp4");
    const handVideo = await loadVideo("../../assets/videos/guitar-player.mp4");
    const footVideo = await loadVideo("../../assets/videos/gif.mp4");

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

    // Create Person Plane (Main Background)
    const personGeometry = new THREE.PlaneGeometry(2, 3);
    const personPlane = new THREE.Mesh(personGeometry, personMaterial);
    personPlane.position.set(0, 0, 0);
    personPlane.scale.set(0.7, 0.7, 0.7);

    // Create Hotspot Icons (Clickable)
    const hotspotTexture = new THREE.TextureLoader().load("../../assets/videos/hotspot.png");
    const hotspotMaterial = new THREE.SpriteMaterial({ map: hotspotTexture, transparent: true });

    function createHotspot(x, y, scale = 0.2) {
      const hotspot = new THREE.Sprite(hotspotMaterial);
      hotspot.scale.set(scale, scale, scale);
      hotspot.position.set(x, y, 0.15);
      return hotspot;
    }

    const headHotspot = createHotspot(0, 1.2);
    const handHotspot = createHotspot(-0.6, 0.3);
    const footHotspot = createHotspot(0.6, -1.2);

    // Create Video Planes (Initially Hidden)
    function createVideoPlane(videoTexture, x, y, scale = 0.5) {
      const videoMaterial = createChromaMaterial(videoTexture, 0x00ff00);
      const videoGeometry = new THREE.PlaneGeometry(0.6, 0.6);
      const videoPlane = new THREE.Mesh(videoGeometry, videoMaterial);
      videoPlane.position.set(x, y, 0.1);
      videoPlane.scale.set(scale, scale, scale);
      videoPlane.visible = false; // Initially hidden
      return videoPlane;
    }

    const headVideoPlane = createVideoPlane(headTexture, 0.6, 1.2); // Video appears to the right of the hotspot
    const handVideoPlane = createVideoPlane(handTexture, -1.2, 0.3); // Video appears to the left of the hotspot
    const footVideoPlane = createVideoPlane(footTexture,1.2, -1.2); // Video appears to the right of the hotspot

    // Assign video references for interaction
    headHotspot.userData = { video: headVideo, plane: headVideoPlane };
    handHotspot.userData = { video: handVideo, plane: handVideoPlane };
    footHotspot.userData = { video: footVideo, plane: footVideoPlane };

    // Create Anchor and Attach Everything
    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(personPlane);
    anchor.group.add(headHotspot);
    anchor.group.add(handHotspot);
    anchor.group.add(footHotspot);
    anchor.group.add(headVideoPlane);
    anchor.group.add(handVideoPlane);
    anchor.group.add(footVideoPlane);

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
            plane.visible = true; // Show video when playing
          } else {
            video.pause();
            plane.visible = false; // Hide video when paused
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
