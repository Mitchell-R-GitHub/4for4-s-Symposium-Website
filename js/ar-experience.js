/**
 * AR experience by Caleb Irvine
 * https://github.com/calebmirvine
 * Made with MindAR and A-Frame
 *
 * MindAR business-card scene: profile cards + swimming fish.
 * Fill in github on a teammate below to show their GitHub button.
 */
(function () {
  var TEAM = {
    caleb: {
      name: 'Caleb Irvine',
      resume: 'resumes/caleb-resume.pdf',
      github: 'https://github.com/calebmirvine',
      title: 'Lead Communications and AR Developer',
      bio: 'Caleb Irvine is of Coast Salish descent on his mother’s side and a member of the Tsawout First Nation, with settler English and Scottish roots on his father’s side. He is a final-term student in Camosun’s Information and Computer Systems (ICS) program. Building on a strong foundation in systems analysis and full-stack development, he specializes in creating immersive augmented reality applications that seamlessly integrate 3D elements into real-world environments. Alongside his technical work, Caleb brings robust leadership experience as the Chair of the 2026 Camosun Technology Symposium, where he oversees eleven cross-functional committees. Recently presented with the Computer Science Award by VIATEC, his ability to balance complex system design with clear communication makes him a valuable addition to any innovative development team.'
    },
    egor: {
      name: 'Egor Lidobardov',
      resume: 'resumes/egor-resume.pdf',
      github: '',
      title: 'Designer and 3D Modeler',
      bio: 'Egor is an international student from Russia currently enrolled in the Interactive Media Development Technologist (IMD) program at Camosun College. He brings over five years of experience in design, photography, and topography-oriented projects, driven by a deep passion for visual creativity that began when he discovered Photoshop at a young age. He further expanded his skill set by completing university-level courses in 3D modeling in Russia. Through the IMD program, he has developed a solid foundation in programming, web and app development, technical workflows, and industry-standard development practices. While he understands both the technical and creative aspects of interactive media, he chose to specialize in visual design and digital art, where his passion and strengths lie. He also maintains an active practice in traditional physical art, which continues to influence his creative approach. He has hands-on experience working with industry-standard tools, including Photoshop, InDesign, Illustrator, Maya, Blender and Unreal Engine 5.'
    },
    vinicius: {
      name: 'Vinicius Costa',
      resume: 'resumes/vinicius-resume.pdf',
      github: 'https://github.com/vinibcosta',
      title: 'Cloud Administrator and Backend Developer',
      bio: 'Vini is a student in the Information and Computer Systems Technologist program. Has a background in technical support and system troubleshooting from a previous work experience in Brazil, where he worked as an IT technician for over a year. He also has experience in design due to an internship completed before starting the IT career. Combining work and studies, he has experience with multiple technologies, such as Java, JavaScript, SQL, SQL Server, Oracle, and others. He has continued to expand and strengthen his technical knowledge being particularly interested in systems administration, troubleshooting, and software development.'
    },
    mitchell: {
      name: 'Mitchell Rose',
      resume: 'resumes/mitchell-resume.pdf',
      github: 'https://github.com/Mitchell-R-GitHub',
      title: 'Backend Developer and Full Stack Developer',
      bio: 'Mitchell is an Information and Computer Systems student. Since childhood, Mitchell has maintained a strong curiosity and passion for all things computer and technology related. Mitchell is ambitious, detail-oriented, and possesses a strong understanding of logical reasoning and complex systems. Mitchell has experience working with programming (C++, C#, Java, JavaScript, HTML, CSS), Databases (MySQL, Oracle, MongoDB), Game Engines (Unity), Systems Administration (Windows Server 2022), Operating Systems(Windows, Linux, MacOS), and Network/Network configuration related tasks.'
    }
  };

  var FISH_DELAY_MS = 800;

  AFRAME.registerComponent('ar-camera-feed', {
    init: function () {
      this.apply = this.apply.bind(this);
      this.el.addEventListener('renderstart', this.apply);
      this.el.addEventListener('arReady', this.apply);
    },

    apply: function () {
      var renderer = this.el.renderer;
      var canvas = this.el.canvas;
      var videos;
      var video;
      var i;
      if (renderer) {
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      }
      if (canvas) {
        canvas.style.background = 'transparent';
        canvas.style.zIndex = '2';
      }
      videos = document.querySelectorAll('video');
      for (i = 0; i < videos.length; i++) {
        video = videos[i];
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.zIndex = '0';
        video.style.background = 'transparent';
      }
    },

    remove: function () {
      this.el.removeEventListener('renderstart', this.apply);
      this.el.removeEventListener('arReady', this.apply);
    }
  });

  AFRAME.registerComponent('dim-model', {
    schema: {
      brightness: { type: 'number', default: 0.55 }
    },

    init: function () {
      this.onLoad = this.onLoad.bind(this);
      this.el.addEventListener('model-loaded', this.onLoad);
    },

    onLoad: function () {
      var brightness = this.data.brightness;
      this.el.object3D.traverse(function (node) {
        var materials;
        var i;
        var mat;
        if (!node.material) {
          return;
        }
        materials = Array.isArray(node.material) ? node.material : [node.material];
        for (i = 0; i < materials.length; i++) {
          mat = materials[i];
          if (mat.emissive) {
            mat.emissive.setHex(0x000000);
          }
          mat.emissiveIntensity = 0;
          if (mat.color) {
            mat.color.multiplyScalar(brightness);
          }
          if (mat.metalness !== undefined) {
            mat.metalness = Math.min(mat.metalness, 0.15);
          }
          if (mat.roughness !== undefined) {
            mat.roughness = Math.max(mat.roughness, 0.7);
          }
          mat.needsUpdate = true;
        }
      });
    },

    remove: function () {
      this.el.removeEventListener('model-loaded', this.onLoad);
    }
  });

  AFRAME.registerComponent('swim-orbit', {
    schema: {
      radiusX: { type: 'number', default: 0.38 },
      radiusY: { type: 'number', default: 0.24 },
      height: { type: 'number', default: 0.14 },
      speed: { type: 'number', default: 0.5 },
      phase: { type: 'number', default: 0 },
      wiggle: { type: 'number', default: 10 },
      yawOffset: { type: 'number', default: 0 },
      playing: { type: 'boolean', default: false }
    },

    init: function () {
      this.angle = this.data.phase;
      this._ahead = new THREE.Vector3();
      this._up = new THREE.Vector3();
    },

    update: function (oldData) {
      if (oldData && oldData.phase !== this.data.phase && !this.data.playing) {
        this.angle = this.data.phase;
      }
    },

    tick: function (t, dt) {
      if (!this.data.playing || !dt) {
        return;
      }
      this.angle += this.data.speed * (dt / 1000);
      var a = this.angle;
      var x = Math.cos(a) * this.data.radiusX;
      var y = Math.sin(a) * this.data.radiusY;
      var z = this.data.height + Math.sin(a * 2) * 0.025;
      var obj = this.el.object3D;
      obj.position.set(x, y, z);

      var dir = this.data.speed >= 0 ? 1 : -1;
      this._ahead.set(
        x + dir * (-Math.sin(a) * this.data.radiusX),
        y + dir * (Math.cos(a) * this.data.radiusY),
        z
      );
      this._up.set(x, y, 0);
      if (this._up.lengthSq() < 0.0001) {
        this._up.set(0, 1, 0);
      } else {
        this._up.normalize();
      }
      if (obj.parent) {
        this._up.transformDirection(obj.parent.matrixWorld);
        obj.parent.localToWorld(this._ahead);
      }
      obj.up.copy(this._up);
      obj.lookAt(this._ahead);
      if (this.data.yawOffset) {
        obj.rotateY(this.data.yawOffset * Math.PI / 180);
      }
      obj.rotateZ(Math.sin(a * 4) * this.data.wiggle * Math.PI / 180);
    }
  });

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function squirclePath(ctx, cx, cy, rx, ry, n) {
    var steps = 72;
    var i;
    var t;
    var ct;
    var st;
    var exp = 2 / n;
    ctx.beginPath();
    for (i = 0; i <= steps; i++) {
      t = (i / steps) * Math.PI * 2;
      ct = Math.cos(t);
      st = Math.sin(t);
      if (i === 0) {
        ctx.moveTo(
          cx + rx * (ct < 0 ? -1 : 1) * Math.pow(Math.abs(ct), exp),
          cy + ry * (st < 0 ? -1 : 1) * Math.pow(Math.abs(st), exp)
        );
      } else {
        ctx.lineTo(
          cx + rx * (ct < 0 ? -1 : 1) * Math.pow(Math.abs(ct), exp),
          cy + ry * (st < 0 ? -1 : 1) * Math.pow(Math.abs(st), exp)
        );
      }
    }
    ctx.closePath();
  }

  function textureFromCanvas(canvas) {
    var tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    tex.flipY = true;
    tex.minFilter = THREE.LinearFilter;
    if (tex.encoding !== undefined && THREE.sRGBEncoding !== undefined) {
      tex.encoding = THREE.sRGBEncoding;
    }
    return tex;
  }

  var iconTextures = {
    file: null,
    github: null
  };

  function rasterizeIcon(img, size) {
    var canvas = document.createElement('canvas');
    var ctx;
    var pad;
    canvas.width = size;
    canvas.height = size;
    if (!img || (!img.complete && img.naturalWidth === 0)) {
      return null;
    }
    pad = Math.round(size * 0.08);
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    try {
      ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
    } catch (err) {
      return null;
    }
    return textureFromCanvas(canvas);
  }

  var nameTextures = {};

  function getNameTexture(info) {
    var canvas;
    var ctx;
    var tex;
    var key;
    var title;
    var titleLines;
    var i;
    var nameY;
    var titleY;
    var lineH;
    var h;
    if (!info) {
      return null;
    }
    title = info.title || '';
    key = info.name + '|' + title;
    if (nameTextures[key]) {
      return nameTextures[key];
    }
    canvas = document.createElement('canvas');
    canvas.width = 1024;
    ctx = canvas.getContext('2d');
    ctx.font = '700 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
    titleLines = wrapLines(ctx, title, 980);
    if (!titleLines.length) {
      titleLines = [''];
    }
    nameY = 60;
    lineH = 76;
    titleY = 132;
    h = titleY + titleLines.length * lineH + 16;
    canvas.height = h;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 92px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
    ctx.fillText(info.name, 512, nameY);
    ctx.fillStyle = '#85BAE1';
    ctx.font = '700 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
    for (i = 0; i < titleLines.length; i++) {
      ctx.fillText(titleLines[i], 512, titleY + i * lineH);
    }
    tex = textureFromCanvas(canvas);
    nameTextures[key] = tex;
    return tex;
  }

  var PHOTO_IDS = {
    caleb: 'photoCaleb',
    egor: 'photoEgor',
    vinicius: 'photoVinicius',
    mitchell: 'photoMitchell'
  };

  var photoTextures = {};

  function getPhotoTexture(member) {
    var img;
    var canvas;
    var ctx;
    var dw;
    var dh;
    var zoom;
    var destAspect;
    var srcW;
    var srcH;
    var sx;
    var sy;
    var tex;
    if (photoTextures[member]) {
      return photoTextures[member];
    }
    img = document.getElementById(PHOTO_IDS[member]);
    if (!img || !img.naturalWidth) {
      return null;
    }
    dw = 512;
    dh = 434;
    zoom = 1.38;
    destAspect = dw / dh;
    if (img.naturalWidth / img.naturalHeight > destAspect) {
      srcH = img.naturalHeight / zoom;
      srcW = srcH * destAspect;
    } else {
      srcW = img.naturalWidth / zoom;
      srcH = srcW / destAspect;
    }
    if (srcW > img.naturalWidth) {
      srcW = img.naturalWidth;
      srcH = srcW / destAspect;
    }
    if (srcH > img.naturalHeight) {
      srcH = img.naturalHeight;
      srcW = srcH * destAspect;
    }
    sx = (img.naturalWidth - srcW) / 2;
    sy = Math.max(0, (img.naturalHeight - srcH) * 0.22);
    canvas = document.createElement('canvas');
    canvas.width = dw;
    canvas.height = dh;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, dw, dh);
    roundRect(ctx, 6, 6, dw - 12, dh - 12, 48);
    ctx.save();
    ctx.clip();
    ctx.drawImage(img, sx, sy, srcW, srcH, 0, 0, dw, dh);
    ctx.restore();
    roundRect(ctx, 6, 6, dw - 12, dh - 12, 48);
    ctx.strokeStyle = '#85BAE1';
    ctx.lineWidth = 8;
    ctx.stroke();
    tex = textureFromCanvas(canvas);
    photoTextures[member] = tex;
    return tex;
  }

  function wrapLines(ctx, text, maxWidth) {
    var words = String(text || '').split(/\s+/);
    var lines = [];
    var line = '';
    var i;
    var test;
    for (i = 0; i < words.length; i++) {
      test = line ? line + ' ' + words[i] : words[i];
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) {
      lines.push(line);
    }
    return lines;
  }

  var bioTextures = {};

  function getBioTexture(info) {
    var canvas;
    var ctx;
    var tex;
    var lines;
    var i;
    var y;
    var key;
    var viewH;
    var contentH;
    var result;
    if (!info) {
      return null;
    }
    key = info.name + '|' + info.bio;
    if (bioTextures[key]) {
      return bioTextures[key];
    }
    viewH = 760;
    canvas = document.createElement('canvas');
    canvas.width = 1024;
    ctx = canvas.getContext('2d');
    ctx.font = '600 62px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
    lines = wrapLines(ctx, info.bio, 940);
    contentH = 32 + lines.length * 78 + 32;
    canvas.height = Math.max(viewH, contentH);
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '600 62px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
    y = 16;
    for (i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 36, y);
      y += 78;
    }
    tex = textureFromCanvas(canvas);
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1, Math.min(1, viewH / canvas.height));
    tex.offset.set(0, 1 - tex.repeat.y);
    result = { tex: tex, viewRatio: tex.repeat.y };
    bioTextures[key] = result;
    return result;
  }

  function getIconTexture(kind) {
    var img;
    var tex;
    if (iconTextures[kind]) {
      return iconTextures[kind];
    }
    img = document.querySelector(kind === 'file' ? '#iconFile' : '#iconGithub');
    tex = rasterizeIcon(img, 128);
    if (tex) {
      iconTextures[kind] = tex;
    }
    return tex;
  }

  var chromeShared = {
    staticCanvas: null,
    canvas: null,
    tex: null,
    lastT: -1
  };

  function strokeCorner(ctx, x, y, dx, dy, len) {
    ctx.beginPath();
    ctx.moveTo(x + dx * len, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * len);
    ctx.stroke();
  }

  function paintStaticChrome(canvas) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var gradient;
    var sheen;
    var x;
    var y;
    ctx.clearRect(0, 0, w, h);
    roundRect(ctx, 0, 0, w, h, 36);
    ctx.save();
    ctx.clip();
    gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#28333A');
    gradient.addColorStop(0.4, '#3D5260');
    gradient.addColorStop(1, '#567A95');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#85BAE1';
    ctx.lineWidth = 1;
    for (x = 32; x < w; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (y = 24; y < h; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(8, 16, 24, 0.18)';
    for (y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
    sheen = ctx.createLinearGradient(0, 0, w, h);
    sheen.addColorStop(0.28, 'rgba(255, 255, 255, 0)');
    sheen.addColorStop(0.46, 'rgba(180, 220, 255, 0.16)');
    sheen.addColorStop(0.58, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(133, 186, 225, 0.95)';
    ctx.lineWidth = 5;
    roundRect(ctx, 10, 10, w - 20, h - 20, 30);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(133, 186, 225, 0.35)';
    ctx.lineWidth = 10;
    roundRect(ctx, 4, 4, w - 8, h - 8, 34);
    ctx.stroke();
    ctx.strokeStyle = '#85BAE1';
    ctx.lineWidth = 7;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    strokeCorner(ctx, 18, 18, 1, 1, 52);
    strokeCorner(ctx, w - 18, 18, -1, 1, 52);
    strokeCorner(ctx, 18, h - 18, 1, -1, 52);
    strokeCorner(ctx, w - 18, h - 18, -1, -1, 52);
  }

  function paintLiveChrome(t) {
    var canvas = chromeShared.canvas;
    var ctx;
    var w;
    var h;
    var y;
    var glow;
    if (!canvas || !chromeShared.staticCanvas) {
      return;
    }
    w = canvas.width;
    h = canvas.height;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(chromeShared.staticCanvas, 0, 0);
    y = ((t * 0.085) % (h + 90)) - 70;
    glow = ctx.createLinearGradient(0, y, 0, y + 90);
    glow.addColorStop(0, 'rgba(133, 186, 225, 0)');
    glow.addColorStop(0.5, 'rgba(133, 186, 225, 0.28)');
    glow.addColorStop(1, 'rgba(133, 186, 225, 0)');
    ctx.save();
    roundRect(ctx, 8, 8, w - 16, h - 16, 32);
    ctx.clip();
    ctx.fillStyle = glow;
    ctx.fillRect(8, y, w - 16, 90);
    ctx.restore();
  }

  function ensureChromeTexture() {
    var canvas;
    if (chromeShared.tex) {
      return chromeShared.tex;
    }
    canvas = document.getElementById('cardChromeCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'cardChromeCanvas';
      canvas.width = 602;
      canvas.height = 798;
      canvas.style.display = 'none';
      document.body.appendChild(canvas);
    }
    chromeShared.canvas = canvas;
    chromeShared.staticCanvas = document.createElement('canvas');
    chromeShared.staticCanvas.width = canvas.width;
    chromeShared.staticCanvas.height = canvas.height;
    paintStaticChrome(chromeShared.staticCanvas);
    paintLiveChrome(0);
    chromeShared.tex = textureFromCanvas(canvas);
    return chromeShared.tex;
  }

  AFRAME.registerComponent('card-chrome', {
    init: function () {
      this.applyTexture = this.applyTexture.bind(this);
      this.el.addEventListener('object3dset', this.applyTexture);
      this.el.addEventListener('loaded', this.applyTexture);
      if (this.el.hasLoaded) {
        this.applyTexture();
      }
    },

    applyTexture: function () {
      var mesh = this.el.getObject3D('mesh');
      var mat;
      var tex = ensureChromeTexture();
      if (!this._srcBound) {
        this.el.setAttribute('material', 'shader: flat; src: #cardChromeCanvas; transparent: false; alphaTest: 0.35; side: front; npot: true');
        this._srcBound = true;
      }
      if (!mesh || !mesh.material) {
        return;
      }
      mat = mesh.material;
      if (!mat.map) {
        mat.map = tex;
      }
      mat.color = new THREE.Color(0xffffff);
      mat.transparent = false;
      mat.opacity = 1;
      mat.alphaTest = 0.35;
      mat.side = THREE.FrontSide;
      mat.depthWrite = true;
      mat.depthTest = true;
      mat.polygonOffset = false;
      this.el.object3D.renderOrder = 1;
      mat.map.needsUpdate = true;
      mat.needsUpdate = true;
    },

    tick: function (t) {
      if (chromeShared.lastT !== t) {
        chromeShared.lastT = t;
        ensureChromeTexture();
        paintLiveChrome(t);
        chromeShared.tex.needsUpdate = true;
      }
    },

    remove: function () {
      this.el.removeEventListener('object3dset', this.applyTexture);
      this.el.removeEventListener('loaded', this.applyTexture);
    }
  });

  var btnShared = {
    canvas: null,
    tex: null,
    pressedCanvas: null,
    pressedTex: null
  };

  function paintStaticBtn(canvas, fill) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    roundRect(ctx, 8, 8, w - 16, h - 16, 52);
    ctx.fillStyle = fill || '#1F282E';
    ctx.fill();
    roundRect(ctx, 8, 8, w - 16, h - 16, 52);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  function ensureBtnTexture() {
    if (btnShared.tex) {
      return btnShared.tex;
    }
    btnShared.canvas = document.createElement('canvas');
    btnShared.canvas.width = 310;
    btnShared.canvas.height = 288;
    paintStaticBtn(btnShared.canvas, '#1F282E');
    btnShared.tex = textureFromCanvas(btnShared.canvas);
    return btnShared.tex;
  }

  function ensureBtnPressedTexture() {
    if (btnShared.pressedTex) {
      return btnShared.pressedTex;
    }
    btnShared.pressedCanvas = document.createElement('canvas');
    btnShared.pressedCanvas.width = 310;
    btnShared.pressedCanvas.height = 288;
    paintStaticBtn(btnShared.pressedCanvas, '#7BC1E7');
    btnShared.pressedTex = textureFromCanvas(btnShared.pressedCanvas);
    return btnShared.pressedTex;
  }

  AFRAME.registerComponent('btn-chrome', {
    init: function () {
      this.applyTexture = this.applyTexture.bind(this);
      this.el.addEventListener('object3dset', this.applyTexture);
      this.el.addEventListener('loaded', this.applyTexture);
      if (this.el.hasLoaded) {
        this.applyTexture();
      }
    },

    applyTexture: function () {
      var mesh = this.el.getObject3D('mesh');
      var mat;
      if (!mesh || !mesh.material) {
        return;
      }
      mat = mesh.material;
      mat.map = ensureBtnTexture();
      mat.color = new THREE.Color(0xffffff);
      mat.transparent = false;
      mat.alphaTest = 0.35;
      mat.opacity = 1;
      mat.side = THREE.FrontSide;
      mat.depthWrite = true;
      mat.depthTest = true;
      mat.polygonOffset = false;
      this.el.object3D.renderOrder = 4;
      mat.needsUpdate = true;
    },

    remove: function () {
      this.el.removeEventListener('object3dset', this.applyTexture);
      this.el.removeEventListener('loaded', this.applyTexture);
    }
  });

  AFRAME.registerComponent('profile-card', {
    schema: {
      member: { type: 'string', default: '' }
    },

    init: function () {
      this.apply = this.apply.bind(this);
      this.el.addEventListener('loaded', this.apply);
      this.el.addEventListener('object3dset', this.apply);
      if (this.el.hasLoaded) {
        this.apply();
      }
    },

    apply: function () {
      var info = TEAM[this.data.member];
      var nameEl = this.el.querySelector('.profile-name');
      var photoEl = this.el.querySelector('.profile-photo');
      var bioEl = this.el.querySelector('.profile-bio');
      var githubBtn = this.el.querySelector('.github-btn');
      var resumeBtn = this.el.querySelector('.resume-btn');
      var hasGithub;
      var fileTex = getIconTexture('file');
      var gitTex = getIconTexture('github');
      var icons;
      var i;
      var mesh;
      if (!info) {
        return;
      }
      hasGithub = !!info.github;
      var nameTex;
      var photoTex;
      var bioTex;
      if (nameEl) {
        nameTex = getNameTexture(info);
        mesh = nameEl.getObject3D('mesh');
        if (mesh && mesh.material && nameTex) {
          mesh.material.map = nameTex;
          mesh.material.color = new THREE.Color(0xffffff);
          mesh.material.transparent = true;
          mesh.material.alphaTest = 0.12;
          mesh.material.needsUpdate = true;
        }
      }
      if (photoEl) {
        photoTex = getPhotoTexture(this.data.member);
        mesh = photoEl.getObject3D('mesh');
        if (mesh && mesh.material && photoTex) {
          mesh.material.map = photoTex;
          mesh.material.color = new THREE.Color(0xffffff);
          mesh.material.transparent = true;
          mesh.material.alphaTest = 0.08;
          mesh.material.needsUpdate = true;
        }
      }
      if (bioEl) {
        bioTex = getBioTexture(info);
        mesh = bioEl.getObject3D('mesh');
        if (mesh && mesh.material && bioTex && bioTex.tex) {
          mesh.material.map = bioTex.tex;
          mesh.material.color = new THREE.Color(0xffffff);
          mesh.material.transparent = true;
          mesh.material.alphaTest = 0.08;
          mesh.material.side = THREE.FrontSide;
          mesh.material.depthWrite = false;
          mesh.material.needsUpdate = true;
          bioEl.setAttribute('bio-scroll', 'viewRatio: ' + bioTex.viewRatio);
        }
      }
      if (githubBtn) {
        githubBtn.setAttribute('visible', hasGithub);
        githubBtn.setAttribute('position', '-0.088 -0.148 0.04');
      }
      if (resumeBtn) {
        resumeBtn.setAttribute('position', hasGithub ? '0.088 -0.148 0.04' : '0 -0.148 0.04');
      }
      icons = this.el.querySelectorAll('.icon-file');
      for (i = 0; i < icons.length; i++) {
        mesh = icons[i].getObject3D('mesh');
        if (mesh && mesh.material && fileTex) {
          mesh.material.map = fileTex;
          mesh.material.transparent = true;
          mesh.material.alphaTest = 0.15;
          mesh.material.color = new THREE.Color(0xffffff);
          mesh.material.needsUpdate = true;
        }
      }
      icons = this.el.querySelectorAll('.icon-github');
      for (i = 0; i < icons.length; i++) {
        mesh = icons[i].getObject3D('mesh');
        if (mesh && mesh.material && gitTex) {
          mesh.material.map = gitTex;
          mesh.material.transparent = true;
          mesh.material.alphaTest = 0.15;
          mesh.material.color = new THREE.Color(0xffffff);
          mesh.material.needsUpdate = true;
        }
      }
    },

    remove: function () {
      this.el.removeEventListener('loaded', this.apply);
      this.el.removeEventListener('object3dset', this.apply);
    }
  });

  var bioScrollState = {
    bound: false,
    active: null
  };

  function pointerXY(event) {
    var t;
    if (event.touches && event.touches[0]) {
      t = event.touches[0];
      return { x: t.clientX, y: t.clientY };
    }
    if (event.changedTouches && event.changedTouches[0]) {
      t = event.changedTouches[0];
      return { x: t.clientX, y: t.clientY };
    }
    return { x: event.clientX, y: event.clientY };
  }

  function cardIsFlipped(el) {
    var parent = el;
    while (parent && !(parent.components && parent.components['flip-card'])) {
      parent = parent.parentEl;
    }
    return !!(parent && parent.components['flip-card'].flipped);
  }

  function hitBioComponent(sceneEl, x, y) {
    var canvas = sceneEl.canvas;
    var camera = sceneEl.camera;
    var rect;
    var nx;
    var ny;
    var raycaster;
    var bios;
    var meshes;
    var i;
    var mesh;
    var hits;
    var el;
    if (!canvas || !camera) {
      return null;
    }
    rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }
    nx = ((x - rect.left) / rect.width) * 2 - 1;
    ny = -((y - rect.top) / rect.height) * 2 + 1;
    raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: nx, y: ny }, camera);
    bios = sceneEl.querySelectorAll('.profile-bio');
    meshes = [];
    for (i = 0; i < bios.length; i++) {
      mesh = bios[i].getObject3D('mesh');
      if (mesh) {
        mesh.userData.bioEl = bios[i];
        meshes.push(mesh);
      }
    }
    if (!meshes.length) {
      return null;
    }
    hits = raycaster.intersectObjects(meshes, false);
    for (i = 0; i < hits.length; i++) {
      el = hits[i].object.userData.bioEl;
      if (el && el.components && el.components['bio-scroll'] && cardIsFlipped(el)) {
        return el.components['bio-scroll'];
      }
    }
    return null;
  }

  function bindBioCanvas(sceneEl) {
    var canvas;
    if (bioScrollState.bound || !sceneEl) {
      return;
    }
    canvas = sceneEl.canvas;
    if (!canvas) {
      return;
    }
    bioScrollState.bound = true;

    function onDown(event) {
      var pt = pointerXY(event);
      var comp = hitBioComponent(sceneEl, pt.x, pt.y);
      if (!comp) {
        return;
      }
      bioScrollState.active = comp;
      comp.beginDrag(pt.y);
      if (event.cancelable) {
        event.preventDefault();
      }
      event.stopPropagation();
    }

    function onMove(event) {
      var pt;
      var comp = bioScrollState.active;
      if (!comp) {
        return;
      }
      pt = pointerXY(event);
      comp.moveDrag(pt.y);
      if (event.cancelable) {
        event.preventDefault();
      }
      event.stopPropagation();
    }

    function onUp(event) {
      var comp = bioScrollState.active;
      if (!comp) {
        return;
      }
      bioScrollState.active = null;
      comp.endDrag();
      if (comp.moved && event && event.cancelable) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    canvas.addEventListener('touchstart', onDown, { passive: false, capture: true });
    canvas.addEventListener('mousedown', onDown, { capture: true });
    canvas.addEventListener('touchmove', onMove, { passive: false, capture: true });
    canvas.addEventListener('mousemove', onMove, { capture: true });
    canvas.addEventListener('touchend', onUp, { capture: true });
    canvas.addEventListener('mouseup', onUp, { capture: true });
  }

  AFRAME.registerComponent('bio-scroll', {
    schema: {
      viewRatio: { type: 'number', default: 1 }
    },

    init: function () {
      this.scroll = 0;
      this.dragging = false;
      this.moved = false;
      this.lastScreenY = 0;
      this.thumb = this.el.parentEl.querySelector('.scroll-thumb');
      this.scrollUi = this.el.parentEl.querySelector('.bio-scroll-ui');
      this.onClick = this.onClick.bind(this);
      this.el.addEventListener('click', this.onClick);
      this.el.sceneEl.addEventListener('renderstart', this.onRenderStart.bind(this));
      bindBioCanvas(this.el.sceneEl);
    },

    onRenderStart: function () {
      bindBioCanvas(this.el.sceneEl);
    },

    update: function () {
      this.applyOffset();
    },

    tick: function () {
      this.applyOffset();
    },

    applyOffset: function () {
      var mesh = this.el.getObject3D('mesh');
      var viewRatio = Math.min(1, Math.max(0.05, this.data.viewRatio));
      var maxOff = 1 - viewRatio;
      var offY = maxOff * (1 - this.scroll);
      var trackH = 0.42;
      var thumbH;
      var maxY;
      if (mesh && mesh.material && mesh.material.map) {
        mesh.material.map.wrapT = THREE.ClampToEdgeWrapping;
        mesh.material.map.repeat.set(1, viewRatio);
        mesh.material.map.offset.set(0, offY);
        mesh.material.map.needsUpdate = true;
      }
      if (this.scrollUi) {
        this.scrollUi.object3D.visible = viewRatio < 0.97;
      }
      if (this.thumb) {
        thumbH = Math.max(0.05, trackH * viewRatio);
        maxY = (trackH - thumbH) / 2;
        this.thumb.setAttribute('height', thumbH);
        this.thumb.setAttribute('position', '0 ' + (maxY - this.scroll * (trackH - thumbH)) + ' 0.002');
      }
    },

    beginDrag: function (y) {
      this.dragging = true;
      this.moved = false;
      this.lastScreenY = y;
    },

    moveDrag: function (y) {
      var dy;
      if (!this.dragging) {
        return;
      }
      dy = y - this.lastScreenY;
      this.lastScreenY = y;
      if (Math.abs(dy) > 4) {
        this.moved = true;
      }
      this.scroll = Math.max(0, Math.min(1, this.scroll - dy / 220));
      this.applyOffset();
    },

    endDrag: function () {
      var parent;
      this.dragging = false;
      if (this.moved) {
        return;
      }
      parent = this.el;
      while (parent && !(parent.components && parent.components['flip-card'])) {
        parent = parent.parentEl;
      }
      if (parent && parent.components['flip-card']) {
        parent.components['flip-card'].onClick();
      }
    },

    onClick: function (event) {
      if (this.moved) {
        if (event) {
          event.stopPropagation();
        }
      }
    },

    reset: function () {
      this.scroll = 0;
      this.dragging = false;
      this.moved = false;
      this.applyOffset();
    },

    remove: function () {
      this.el.removeEventListener('click', this.onClick);
    }
  });

  AFRAME.registerComponent('flip-card', {
    init: function () {
      this.flipped = false;
      this.busy = false;
      this.onClick = this.onClick.bind(this);
      this.onDone = this.onDone.bind(this);
      this.flipper = this.el.querySelector('.card-flipper');
      this.front = this.el.querySelector('.card-front');
      this.back = this.el.querySelector('.card-back');
      this.hits = this.el.querySelectorAll('.flip-hit');
      this.syncFaces();
      var i;
      for (i = 0; i < this.hits.length; i++) {
        this.hits[i].addEventListener('click', this.onClick);
        this.hits[i].addEventListener('object3dset', function (ev) {
          var mesh = ev.target.getObject3D('mesh');
          if (mesh && mesh.material) {
            mesh.material.depthWrite = false;
            mesh.material.depthTest = false;
            mesh.material.opacity = 0;
            mesh.material.transparent = true;
          }
        });
      }
    },

    onClick: function (event) {
      if (event) {
        event.stopPropagation();
      }
      if (this.busy || !this.flipper) {
        return;
      }
      this.busy = true;
      this.flipped = !this.flipped;
      this.syncFaces(true);
      this.flipper.removeAttribute('animation__flip');
      this.flipper.addEventListener('animationcomplete__flip', this.onDone);
      this.flipper.setAttribute(
        'animation__flip',
        'property: rotation; to: ' + (this.flipped ? '0 180 0' : '0 0 0') + '; dur: 620; easing: easeInOutCubic'
      );
    },

    onDone: function () {
      this.busy = false;
      this.syncFaces(false);
      if (this.flipper) {
        this.flipper.removeEventListener('animationcomplete__flip', this.onDone);
      }
    },

    syncFaces: function (animating) {
      if (this.front) {
        this.front.object3D.visible = animating || !this.flipped;
      }
      if (this.back) {
        this.back.object3D.visible = animating || this.flipped;
      }
    },

    reset: function () {
      this.flipped = false;
      this.busy = false;
      if (this.flipper) {
        this.flipper.removeAttribute('animation__flip');
        this.flipper.setAttribute('rotation', '0 0 0');
      }
      this.syncFaces(false);
    },

    remove: function () {
      var i;
      for (i = 0; i < this.hits.length; i++) {
        this.hits[i].removeEventListener('click', this.onClick);
      }
      if (this.flipper) {
        this.flipper.removeEventListener('animationcomplete__flip', this.onDone);
      }
    }
  });

  AFRAME.registerComponent('press-feedback', {
    init: function () {
      this.pressed = false;
      this.well = this.el.querySelector('[btn-chrome]') || this.el;
      this.onDown = this.onDown.bind(this);
      this.onUp = this.onUp.bind(this);
      this.el.addEventListener('mousedown', this.onDown);
      this.el.addEventListener('mouseup', this.onUp);
      this.el.addEventListener('mouseleave', this.onUp);
      window.addEventListener('mouseup', this.onUp);
      window.addEventListener('touchend', this.onUp);
    },

    onDown: function () {
      this.pressed = true;
      this.setPressed(true);
    },

    onUp: function () {
      if (!this.pressed) {
        return;
      }
      this.pressed = false;
      this.setPressed(false);
    },

    setPressed: function (pressed) {
      var mesh = this.well && this.well.getObject3D('mesh');
      if (mesh && mesh.material) {
        mesh.material.map = pressed ? ensureBtnPressedTexture() : ensureBtnTexture();
        mesh.material.color.set(0xffffff);
        mesh.material.needsUpdate = true;
      }
      if (this.well) {
        this.well.setAttribute('scale', pressed ? '0.9 0.9 0.9' : '1 1 1');
      }
    },

    remove: function () {
      this.el.removeEventListener('mousedown', this.onDown);
      this.el.removeEventListener('mouseup', this.onUp);
      this.el.removeEventListener('mouseleave', this.onUp);
      window.removeEventListener('mouseup', this.onUp);
      window.removeEventListener('touchend', this.onUp);
    }
  });

  AFRAME.registerComponent('open-link', {
    schema: {
      url: { type: 'string', default: '' },
      member: { type: 'string', default: '' },
      kind: { type: 'string', default: 'resume' }
    },

    init: function () {
      this.onClick = this.onClick.bind(this);
      this.el.addEventListener('click', this.onClick);
    },

    remove: function () {
      this.el.removeEventListener('click', this.onClick);
    },

    onClick: function (event) {
      var info;
      var url;
      if (event) {
        event.stopPropagation();
      }
      url = this.data.url;
      info = TEAM[this.data.member];
      if (!url && info) {
        url = info[this.data.kind];
      }
      if (url) {
        window.open(url, '_blank', 'noopener');
      }
    }
  });

  AFRAME.registerComponent('ar-coach', {
    init: function () {
      this.box = document.getElementById('ar-coach');
      this.hideTimer = null;
      this.onFound = this.onFound.bind(this);
      this.onLost = this.onLost.bind(this);
      this.target = document.querySelector('#card-target');
      if (this.target) {
        this.target.addEventListener('targetFound', this.onFound);
        this.target.addEventListener('targetLost', this.onLost);
      }
      this.showScan();
    },

    showScan: function () {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      if (!this.box) {
        return;
      }
      this.box.classList.remove('hidden');
      this.box.innerHTML = 'Point at the "4For4s" card';
    },

    onFound: function () {
      var box = this.box;
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
      }
      if (!box) {
        return;
      }
      box.classList.remove('hidden');
      box.innerHTML = 'Tap profile to see bio';
      this.hideTimer = setTimeout(function () {
        box.classList.add('hidden');
      }, 10000);
    },

    onLost: function () {
      this.showScan();
    },

    remove: function () {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
      }
      if (this.target) {
        this.target.removeEventListener('targetFound', this.onFound);
        this.target.removeEventListener('targetLost', this.onLost);
      }
    }
  });

  AFRAME.registerComponent('scene-reveal', {
    init: function () {
      this.fishTimer = null;
      this.onFound = this.onFound.bind(this);
      this.onLost = this.onLost.bind(this);
      this.el.addEventListener('targetFound', this.onFound);
      this.el.addEventListener('targetLost', this.onLost);
      this.cacheEls();
    },

    cacheEls: function () {
      this.fish = this.el.querySelectorAll('[swim-orbit]');
      this.cards = this.el.querySelector('#profile-cards');
    },

    remove: function () {
      this.clearTimers();
      this.el.removeEventListener('targetFound', this.onFound);
      this.el.removeEventListener('targetLost', this.onLost);
    },

    clearTimers: function () {
      if (this.fishTimer) {
        clearTimeout(this.fishTimer);
        this.fishTimer = null;
      }
    },

    setFishPlaying: function (playing) {
      var i;
      var fish;
      var model;
      if (!this.fish) {
        return;
      }
      for (i = 0; i < this.fish.length; i++) {
        fish = this.fish[i];
        fish.setAttribute('visible', playing);
        fish.setAttribute('swim-orbit', 'playing', playing);
        model = fish.querySelector('a-gltf-model');
        if (model) {
          model.setAttribute('animation-mixer', 'timeScale', playing ? 1 : 0);
        }
      }
    },

    setCardsVisible: function (visible) {
      if (!this.cards) {
        return;
      }
      if (visible) {
        this.cards.setAttribute('visible', true);
        this.cards.emit('show-cards');
      } else {
        this.cards.setAttribute('visible', false);
        this.cards.setAttribute('scale', '0.001 0.001 0.001');
      }
    },

    onFound: function () {
      this.cacheEls();
      this.clearTimers();
      this.setFishPlaying(false);
      this.setCardsVisible(true);
      var self = this;
      this.fishTimer = setTimeout(function () {
        self.setFishPlaying(true);
      }, FISH_DELAY_MS);
    },

    onLost: function () {
      this.reset();
    },

    reset: function () {
      var flips;
      var bios;
      var i;
      var comp;
      this.clearTimers();
      this.setFishPlaying(false);
      this.setCardsVisible(false);
      flips = this.el.querySelectorAll('[flip-card]');
      for (i = 0; i < flips.length; i++) {
        comp = flips[i].components['flip-card'];
        if (comp && comp.reset) {
          comp.reset();
        }
      }
      bios = this.el.querySelectorAll('[bio-scroll]');
      for (i = 0; i < bios.length; i++) {
        comp = bios[i].components['bio-scroll'];
        if (comp && comp.reset) {
          comp.reset();
        }
      }
    }
  });
})();
