/* ============================================================
   rover3d.js — объёмный ровер для гардероба.

   Модель собирается процедурно из скруглённых боксов и цилиндров,
   поэтому скин — это не отдельный файл, а набор материалов плюс
   аксессуар. Переодевание идёт в той же сцене, без перезагрузки.

   Если WebGL или Three.js недоступны, модуль честно сообщает об этом
   через rover3dAvailable() — гардероб тогда падает обратно на SVG.
   ============================================================ */

const R3D = (() => {
  const has = () => typeof THREE !== 'undefined';

  /* палитры берём из art.js, чтобы 3D и иконка на карте не разъезжались */
  const pal = id => (typeof SKIN_ART !== 'undefined' && SKIN_ART[id]) || {
    lid: '#fff', lid2: '#eee', body: '#2E2D2B', glass: '#141315', eye: '#fff', wheel: '#232221'
  };

  /* --- скруглённый бокс через выдавливание профиля --- */
  function roundedBox(w, h, d, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    const bev = Math.min(0.055, d / 4);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: d - bev * 2, bevelEnabled: true, bevelThickness: bev,
      bevelSize: bev, bevelSegments: 3, curveSegments: 10
    });
    g.center();
    return g;
  }

  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: o.rough ?? .55, metalness: o.metal ?? .05,
    emissive: new THREE.Color(o.emissive || '#000'), emissiveIntensity: o.ei ?? 1,
    transparent: !!o.opacity, opacity: o.opacity ?? 1
  });

  function addMesh(parent, geo, material, pos, rot) {
    const m = new THREE.Mesh(geo, material);
    if (pos) m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    m.castShadow = true; m.receiveShadow = false;
    parent.add(m);
    return m;
  }

  /* ---------- аксессуары ---------- */
  function buildAccessory(skin, group) {
    const A = new THREE.Group();
    switch (skin) {
      case 'winter': {                                   // шапка на сенсорном блоке
        // конус закрытый: с openEnded его было видно насквозь
        addMesh(A, new THREE.CylinderGeometry(.06, .46, .44, 24), mat('#E8453C', { rough: .9 }), [0, .92, .58]);
        addMesh(A, new THREE.CylinderGeometry(.56, .56, .17, 28), mat('#F4F1EC', { rough: 1 }), [0, .72, .58]);
        addMesh(A, new THREE.SphereGeometry(.15, 20, 16), mat('#F4F1EC', { rough: 1 }), [0, 1.2, .58]);
        break;
      }
      case 'tropic': {                                   // очки на панели и цветок на контейнере
        addMesh(A, roundedBox(1.06, .2, .1, .08), mat('#141315', { rough: .3 }), [0, .04, 1.08]);
        const petal = new THREE.SphereGeometry(.12, 16, 12);
        [[0, .18], [.17, .05], [.11, -.15], [-.11, -.15], [-.17, .05]].forEach(([x, y]) =>
          addMesh(A, petal, mat('#FF8FA3', { rough: .8 }), [.42 + x, .82 + y, -.42]));
        addMesh(A, new THREE.SphereGeometry(.09, 16, 12), mat('#FFD84D', { rough: .8 }), [.42, .82, -.42]);
        break;
      }
      case 'cosmo': {                                    // гермошлем над блоком датчиков
        const dome = new THREE.SphereGeometry(.78, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
        const m = new THREE.Mesh(dome, new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#BFE6FF'), transparent: true, opacity: .26,
          roughness: .05, metalness: 0, transmission: .6, side: THREE.DoubleSide
        }));
        m.position.set(0, .5, .58); A.add(m);
        addMesh(A, new THREE.TorusGeometry(.78, .045, 10, 40), mat('#DDE3EC', { metal: .6, rough: .3 }), [0, .5, .58], [Math.PI / 2, 0, 0]);
        break;
      }
      case 'royal': {                                    // корона на контейнере
        addMesh(A, new THREE.CylinderGeometry(.46, .46, .14, 28), mat('#F7D774', { metal: .9, rough: .25 }), [0, .77, -.42]);
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * Math.PI * 2;
          addMesh(A, new THREE.ConeGeometry(.1, .28, 14), mat('#F7D774', { metal: .9, rough: .25 }),
            [Math.cos(a) * .4, .97, -.42 + Math.sin(a) * .4]);
        }
        break;
      }
      case 'coffee': {                                   // стакан кофе на контейнере
        addMesh(A, new THREE.CylinderGeometry(.26, .2, .44, 24), mat('#FFFFFF', { rough: .8 }), [0, .92, -.42]);
        addMesh(A, new THREE.CylinderGeometry(.28, .28, .07, 24), mat('#E7E2DA', { rough: .8 }), [0, 1.16, -.42]);
        addMesh(A, new THREE.TorusGeometry(.27, .033, 8, 24), mat('#C08552', { rough: .9 }), [0, .86, -.42], [Math.PI / 2, 0, 0]);
        break;
      }
      case 'rescue': {                                   // мигалка на контейнере
        addMesh(A, new THREE.BoxGeometry(.62, .09, .3), mat('#1B1B1B', { rough: .7 }), [0, .75, -.42]);
        const bulb = addMesh(A, roundedBox(.52, .2, .26, .09),
          mat('#FF3B2F', { emissive: '#FF3B2F', ei: 1.4, rough: .3 }), [0, .87, -.42]);
        bulb.userData.blink = true;
        break;
      }
      case 'pixel': {                                    // пиксельный ирокез
        const cube = new THREE.BoxGeometry(.18, .18, .18);
        [[0, .79], [.19, .93], [.38, .79], [-.19, .93], [-.38, .79], [0, 1.07]].forEach(([x, y]) =>
          addMesh(A, cube, mat('#6BE86B', { emissive: '#1a3d1a', rough: .6 }), [x, y, -.42]));
        break;
      }
      case 'neon': {                                     // подсветка днища
        const glow = new THREE.Mesh(
          new THREE.CircleGeometry(1.6, 40),
          new THREE.MeshBasicMaterial({ color: new THREE.Color('#B14BFF'), transparent: true, opacity: .32 })
        );
        glow.rotation.x = -Math.PI / 2; glow.position.y = -.76; A.add(glow);
        const l = new THREE.PointLight(0xB14BFF, 3.2, 6); l.position.set(0, -.45, 0); A.add(l);
        break;
      }
    }
    group.add(A);
    return A;
  }

  /* ---------- сборка ровера ----------
     Пропорции сняты с настоящего ровера: спереди чёрный сенсорный
     блок с вертикальными фарами и лидаром, сзади грузовой контейнер,
     шесть колёс вынесены за габарит, сверху штанга с флажком.
     Ось Z — вдоль движения, нос смотрит в +Z. */
  function buildRover(skin) {
    const c = pal(skin);
    const g = new THREE.Group();

    const bodyMat = mat(c.body, { rough: .25, metal: .35 });          // чёрный глянец
    const lidMat = mat(c.lid, { rough: skin === 'royal' ? .25 : .42, metal: skin === 'royal' ? .85 : .06 });
    const glassMat = mat(c.glass, { rough: .15, metal: .4 });
    const ledMat = mat(c.eye, { emissive: c.eye, ei: 1.05, rough: .3 });
    const wheelMat = mat(c.wheel, { rough: .9 });
    const steel = mat('#8E8E96', { metal: .85, rough: .3 });

    // рама
    addMesh(g, roundedBox(1.16, .3, 2.1, .1), mat('#151516', { rough: .7 }), [0, -.52, 0]);

    // грузовой контейнер
    addMesh(g, roundedBox(1.32, 1.16, 1.26, .16), lidMat, [0, .12, -.42]);
    addMesh(g, roundedBox(1.34, .05, 1.2, .02), mat('#000', { rough: 1 }), [0, .52, -.42]);
    // светящаяся полоса по низу контейнера
    addMesh(g, roundedBox(1.36, .06, 1.2, .02), ledMat, [0, -.36, -.42]);
    // круглый значок на крышке
    addMesh(g, new THREE.CylinderGeometry(.23, .23, .03, 28),
      mat('#F5372B', { rough: .5 }), [0, .71, -.42]);

    // сенсорный блок
    addMesh(g, roundedBox(1.24, 1.06, .92, .18), bodyMat, [0, .07, .58]);
    addMesh(g, roundedBox(1.02, .62, .1, .14), glassMat, [0, -.02, 1.02]);
    addMesh(g, roundedBox(.11, .42, .07, .05), ledMat, [-.3, -.02, 1.06]);
    addMesh(g, roundedBox(.11, .42, .07, .05), ledMat, [.3, -.02, 1.06]);
    addMesh(g, new THREE.CylinderGeometry(.08, .08, .08, 20), mat('#3A3A3E', { rough: .3, metal: .5 }), [0, .02, 1.05], [Math.PI / 2, 0, 0]);
    [-.36, .36].forEach(x =>
      addMesh(g, new THREE.CylinderGeometry(.035, .035, .06, 14), mat('#33333A', { rough: .4 }), [x, -.34, 1.05], [Math.PI / 2, 0, 0]));

    // лидар
    addMesh(g, new THREE.CylinderGeometry(.16, .17, .26, 22), mat('#2B2B2F', { rough: .35, metal: .5 }), [-.12, .73, .5]);
    addMesh(g, new THREE.CylinderGeometry(.18, .18, .05, 22), steel, [-.12, .88, .5]);

    // штанга с флажком; стоит на стыке блоков, чтобы не спорить с аксессуарами
    addMesh(g, new THREE.CylinderGeometry(.022, .022, 1.05, 8), mat('#26262A', { rough: .5 }), [-.52, 1.08, .05]);
    const flag = addMesh(g, roundedBox(.4, .25, .03, .03),
      mat(c.flag || '#F5372B', { rough: .6 }), [-.33, 1.46, .05], [0, .35, 0]);
    flag.castShadow = false;

    // колёса
    const tyre = new THREE.CylinderGeometry(.31, .31, .17, 26);
    const hub = new THREE.CylinderGeometry(.12, .12, .19, 18);
    [.62, 0, -.62].forEach(z => [-.68, .68].forEach(x => {
      addMesh(g, tyre, wheelMat, [x, -.5, z], [0, 0, Math.PI / 2]);
      addMesh(g, hub, mat('#5D5D63', { metal: .6, rough: .45 }), [x, -.5, z], [0, 0, Math.PI / 2]);
    }));

    buildAccessory(skin, g);
    return g;
  }

  /* ---------- сцена ---------- */
  function makeScene(width, height, forThumb) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, .1, 100);
    // в миниатюре кадр квадратный — подходим ближе, чтобы ровер не тонул в полях
    if (forThumb) { camera.position.set(3.0, 2.0, 4.1); camera.lookAt(0, .32, 0); }
    else { camera.position.set(3.3, 2.3, 4.6); camera.lookAt(0, .3, 0); }

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b2a6, .72));
    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(4, 7, 5);
    if (!forThumb) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 1; key.shadow.camera.far = 20;
      key.shadow.camera.left = -4; key.shadow.camera.right = 4;
      key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
      key.shadow.bias = -0.0015;
    }
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xfff0c2, .45);
    rim.position.set(-5, 2, -4);
    scene.add(rim);

    if (!forThumb) {
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 14),
        new THREE.ShadowMaterial({ opacity: .22 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -.88;
      floor.receiveShadow = true;
      scene.add(floor);
    }
    return { scene, camera };
  }

  function makeRenderer(canvas, width, height, forThumb) {
    const r = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true, preserveDrawingBuffer: !!forThumb
    });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.setSize(width, height, false);
    if (!forThumb) { r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; }
    // r149 ещё на outputEncoding; без этого цвета уходят в пастель
    if ('outputColorSpace' in r && THREE.SRGBColorSpace) r.outputColorSpace = THREE.SRGBColorSpace;
    else if ('outputEncoding' in r && THREE.sRGBEncoding) r.outputEncoding = THREE.sRGBEncoding;
    return r;
  }

  /* ============ живая сцена гардероба ============ */
  let live = null;

  function mount(canvas, skin) {
    if (!has()) return false;
    try {
      const w = canvas.clientWidth || 340, h = canvas.clientHeight || 260;
      const { scene, camera } = makeScene(w, h, false);
      const renderer = makeRenderer(canvas, w, h, false);
      const pivot = new THREE.Group();
      scene.add(pivot);

      live = {
        canvas, renderer, scene, camera, pivot, skin,
        yaw: -0.35, targetYaw: -0.35, spin: 0.22, drag: null,
        bob: 0, hop: 0, raf: null, running: false
      };
      setSkin(skin);
      bindDrag(canvas);
      start();
      window.addEventListener('resize', resize);
      return true;
    } catch (e) {
      console.warn('3D недоступен:', e);
      live = null;
      return false;
    }
  }

  function disposeTree(obj) {
    obj.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    });
  }

  function setSkin(skin, animate) {
    if (!live) return;
    if (live.model) { live.pivot.remove(live.model); disposeTree(live.model); }
    live.skin = skin;
    live.model = buildRover(skin);
    live.pivot.add(live.model);
    if (animate) { live.hop = 1; live.targetYaw = live.yaw + Math.PI * 2; }
  }

  function bindDrag(canvas) {
    const down = e => {
      live.drag = (e.touches ? e.touches[0] : e).clientX;
      live.spin = 0;
    };
    const move = e => {
      if (live.drag === null) return;
      const x = (e.touches ? e.touches[0] : e).clientX;
      live.yaw += (x - live.drag) * .012;
      live.targetYaw = live.yaw;
      live.drag = x;
      if (e.cancelable) e.preventDefault();
    };
    const up = () => { if (live.drag !== null) { live.drag = null; live.spin = .22; } };
    canvas.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    canvas.addEventListener('touchstart', down, { passive: true });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', up);
  }

  function resize() {
    if (!live) return;
    const w = live.canvas.clientWidth, h = live.canvas.clientHeight;
    if (!w || !h) return;
    live.camera.aspect = w / h;
    live.camera.updateProjectionMatrix();
    live.renderer.setSize(w, h, false);
  }

  let t = 0;
  function frame() {
    if (!live || !live.running) return;
    t += 1 / 60;
    if (live.drag === null) {
      live.targetYaw += live.spin / 60;
      live.yaw += (live.targetYaw - live.yaw) * .08;
    }
    live.pivot.rotation.y = live.yaw;

    // лёгкое покачивание и подскок при переодевании
    live.hop *= .92;
    live.pivot.position.y = Math.sin(t * 1.6) * .045 + live.hop * .5;
    live.pivot.rotation.z = Math.sin(t * 1.1) * .012;

    if (live.model) live.model.traverse(o => {
      if (o.userData.blink) o.material.emissiveIntensity = 1 + Math.sin(t * 7) * .8;
    });

    live.renderer.render(live.scene, live.camera);
    live.raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!live || live.running) return;
    live.running = true;
    resize();
    frame();
  }
  function stop() {
    if (!live) return;
    live.running = false;
    if (live.raf) cancelAnimationFrame(live.raf);
  }

  /* ============ миниатюры для сетки ============ */
  const thumbs = {};
  function renderThumbs(ids, size = 300) {
    if (!has()) return thumbs;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const { scene, camera } = makeScene(size, size, true);
      const renderer = makeRenderer(canvas, size, size, true);
      const pivot = new THREE.Group();
      pivot.rotation.y = -0.42;
      scene.add(pivot);
      ids.forEach(id => {
        const m = buildRover(id);
        pivot.add(m);
        renderer.render(scene, camera);
        thumbs[id] = canvas.toDataURL('image/png');
        pivot.remove(m);
        disposeTree(m);
      });
      renderer.dispose();
    } catch (e) {
      console.warn('миниатюры 3D не собрались:', e);
    }
    return thumbs;
  }

  return {
    available: () => {
      if (!has()) return false;
      try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch { return false; }
    },
    mount, setSkin, start, stop, renderThumbs,
    thumb: id => thumbs[id],
    _live: () => live
  };
})();
