
(function(){
  const $ = id => document.getElementById(id);

  const fields = {
    name: $('f-name'),
    task: $('f-task'), id: $('f-id'),
  };
  const preview = {
    name: $('p-name'),
    task: $('p-task'), id: $('p-id'),
  };
  const defaults = {
    name: 'NAME',
    task: 'WARSPITE TASK GROUP', id: 'UCN-000-0000',
  };

  function syncText(key){
    const val = fields[key].value.trim();
    preview[key].textContent = val ? val.toUpperCase() : defaults[key];
  }

  Object.keys(fields).forEach(key=>{
    fields[key].addEventListener('input', ()=>{
      syncText(key);
      if(key === 'id') renderCode();
    });
    syncText(key);
  });

  // ---- rank (fixed dropdown) ----
  const rankSelect = $('f-rank');
  const rankPreview = $('p-rank');
  function syncRank(){
    rankPreview.textContent = rankSelect.value ? rankSelect.value : 'RANK';
  }
  rankSelect.addEventListener('change', syncRank);
  syncRank();

  // ---- pronouns (optional, shown next to the name) ----
  const pronounsSelect = $('f-pronouns');
  const pronounsOther = $('f-pronouns-other');
  const pronounsPreview = $('p-pronouns');
  function syncPronouns(){
    let val;
    if(pronounsSelect.value === '__other__'){
      pronounsOther.style.display = 'block';
      val = pronounsOther.value.trim();
    } else {
      pronounsOther.style.display = 'none';
      val = pronounsSelect.value;
    }
    pronounsPreview.textContent = val ? `(${val.toUpperCase()})` : '';
  }
  pronounsSelect.addEventListener('change', syncPronouns);
  pronounsOther.addEventListener('input', syncPronouns);
  syncPronouns();

  // ---- division (dropdown, with "Other" revealing free text) ----
  const shipSelect = $('f-ship');
  const shipOther = $('f-ship-other');
  const shipPreview = $('p-ship');
  function syncShip(){
    let val;
    if(shipSelect.value === '__other__'){
      shipOther.style.display = 'block';
      val = shipOther.value.trim();
    } else {
      shipOther.style.display = 'none';
      val = shipSelect.value;
    }
    shipPreview.textContent = val ? val.toUpperCase() : 'SHIP';
  }
  shipSelect.addEventListener('change', syncShip);
  shipOther.addEventListener('input', syncShip);
  syncShip();

  const divisionSelect = $('f-division');
  const divisionOther = $('f-division-other');
  const divisionPreview = $('p-division');
  function syncDivision(){
    let val;
    if(divisionSelect.value === '__other__'){
      divisionOther.style.display = 'block';
      val = divisionOther.value.trim();
    } else {
      divisionOther.style.display = 'none';
      val = divisionSelect.value;
    }
    divisionPreview.textContent = val ? val.toUpperCase() : 'DIVISION';
  }
  divisionSelect.addEventListener('change', syncDivision);
  divisionOther.addEventListener('input', syncDivision);
  syncDivision();

  // ---- clearance level (fixed dropdown, recolors the header band) ----
  const CLEARANCE_COLORS = {
    EMERALD:  '#1F8A55',
    SCARLET:  '#C41E3A',
    OBSIDIAN: '#1C1C1E',
    GRAVIUM:  '#6B3FA0',
  };
  const watchSelect = $('f-watch');
  const watchPreview = $('p-watch');
  function syncClearance(){
    const value = watchSelect.value;
    watchPreview.textContent = value || 'EMERALD';
    const color = CLEARANCE_COLORS[value] || CLEARANCE_COLORS.EMERALD;
    document.querySelectorAll('.card-header').forEach(el=>{
      el.style.setProperty('--clearance-color', color);
      el.classList.toggle('sparkle', value === 'OBSIDIAN');
      el.classList.toggle('gravium', value === 'GRAVIUM');
    });
  }
  watchSelect.addEventListener('change', syncClearance);
  syncClearance();

  // ---- photo upload (local only, never leaves the browser) ----
  const photoInput = $('f-photo');
  const photoBox = $('p-photo');
  const photoThumb = $('photoThumb');
  const chooseBtn = $('choosePhoto');
  const clearBtn = $('clearPhoto');

  chooseBtn.addEventListener('click', ()=> photoInput.click());
  photoInput.addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      const url = ev.target.result;
      photoBox.style.backgroundImage = `url(${url})`;
      photoBox.textContent = '';
      photoThumb.style.backgroundImage = `url(${url})`;
      photoThumb.textContent = '';
      clearBtn.style.display = 'inline';
    };
    reader.readAsDataURL(file);
  });
  clearBtn.addEventListener('click', ()=>{
    photoInput.value = '';
    photoBox.style.backgroundImage = '';
    photoBox.textContent = 'CLICK TO ADD PHOTO';
    photoThumb.style.backgroundImage = '';
    photoThumb.textContent = 'NO PHOTO';
    clearBtn.style.display = 'none';
  });

  // ---- barcode / QR toggle ----
  let codeMode = 'barcode'; // 'barcode' | 'qr'
  const barcodeBtn = $('codeBarcodeBtn');
  const qrBtn = $('codeQrBtn');
  const codeRender = $('p-codeRender');
  const codeBox = codeRender.closest('.code-box');
  const qrLengthHint = $('qr-length-hint');

  barcodeBtn.addEventListener('click', ()=>{
    codeMode = 'barcode';
    barcodeBtn.classList.add('active');
    qrBtn.classList.remove('active');
    fields.id.setAttribute('maxlength', '20');
    qrLengthHint.style.display = 'none';
    renderCode();
  });
  qrBtn.addEventListener('click', ()=>{
    codeMode = 'qr';
    qrBtn.classList.add('active');
    barcodeBtn.classList.remove('active');
    fields.id.removeAttribute('maxlength');
    qrLengthHint.style.display = 'block';
    renderCode();
  });

  function renderCode(){
    const value = (fields.id.value.trim() || defaults.id);
    codeRender.innerHTML = '';
    codeBox.classList.toggle('qr-mode', codeMode === 'qr');
    if(codeMode === 'barcode'){
      if(typeof JsBarcode === 'undefined'){
        codeRender.innerHTML = '<span class="code-fallback">Barcode library didn\'t load — check your internet connection and reload the page.</span>';
        return;
      }
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      codeRender.appendChild(svg);
      try{
        JsBarcode(svg, value, {
          format:'CODE128', displayValue:false, height:46, margin:0,
          background:'transparent', lineColor:'#0B1230',
        });
      }catch(e){
        codeRender.innerHTML = '<span class="code-fallback">Can\'t make a barcode from that text — try letters, numbers, and dashes only.</span>';
      }
    } else {
      if(typeof QRCode === 'undefined'){
        codeRender.innerHTML = '<span class="code-fallback">QR code library didn\'t load — check your internet connection and reload the page.</span>';
        return;
      }
      const holder = document.createElement('div');
      codeRender.appendChild(holder);
      try{
        const fitSize = Math.max(40, Math.floor(Math.min(codeRender.clientWidth, codeRender.clientHeight) * 0.96));
        new QRCode(holder, {
          text:value, width:fitSize, height:fitSize,
          colorDark:'#0B1230', colorLight:'#ffffff',
          correctLevel: QRCode.CorrectLevel.M,
        });
      }catch(e){
        codeRender.innerHTML = '<span class="code-fallback">Couldn\'t generate a QR code for that text.</span>';
      }
    }
  }
  renderCode();

  // ---- random ID generator (UCN-000-0000 format) ----
  $('randomizeId').addEventListener('click', ()=>{
    const part1 = String(Math.floor(Math.random()*1000)).padStart(3,'0');
    const part2 = String(Math.floor(Math.random()*10000)).padStart(4,'0');
    fields.id.value = `UCN-${part1}-${part2}`;
    syncText('id');
    renderCode();
  });

  // ---- PDF generation (jsPDF, drawn directly - no browser print dependency) ----
  // Fonts and images are fetched from their real files and base64-encoded at
  // runtime (only once, then cached) - this only works when served over
  // http(s), not opened directly as a file:// path.
  function arrayBufferToBase64(buffer){
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for(let i = 0; i < bytes.length; i += chunkSize){
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  const assetCache = {};
  async function fetchBase64(path){
    if(assetCache[path]) return assetCache[path];
    const resp = await fetch(path);
    if(!resp.ok) throw new Error('Failed to load ' + path);
    const buf = await resp.arrayBuffer();
    const b64 = arrayBufferToBase64(buf);
    assetCache[path] = b64;
    return b64;
  }

  const IMG_PATHS = {
    logoWhite: 'assets/logo-white.png',
    logoNavy: 'assets/logo-navy-flat.png',
    gravium: 'assets/gravium-bg.png',
    obsidian: 'assets/obsidian-bg.png',
  };
  async function loadImageB64(key){
    return fetchBase64(IMG_PATHS[key]);
  }

  let fontsRegistered = false;
  async function registerFonts(doc){
    if(fontsRegistered) return;
    const fontList = [
      ['fonts/Exo2-Regular.ttf', 'Exo2-Regular.ttf', 'Exo2'],
      ['fonts/Exo2-SemiBold.ttf', 'Exo2-SemiBold.ttf', 'Exo2SemiBold'],
      ['fonts/Exo2-ExtraBold.ttf', 'Exo2-ExtraBold.ttf', 'Exo2ExtraBold'],
      ['fonts/Exo2-SemiBoldItalic.ttf', 'Exo2-SemiBoldItalic.ttf', 'Exo2SemiBoldItalic'],
      ['fonts/Exo2-BoldItalic.ttf', 'Exo2-BoldItalic.ttf', 'Exo2BoldItalic'],
      ['fonts/Orbitron-Bold.ttf', 'Orbitron-Bold.ttf', 'OrbitronBold'],
      ['fonts/Orbitron-Black.ttf', 'Orbitron-Black.ttf', 'OrbitronBlack'],
    ];
    for(const [path, vfsName, family] of fontList){
      const b64 = await fetchBase64(path);
      doc.addFileToVFS(vfsName, b64);
      doc.addFont(vfsName, family, 'normal');
    }
    fontsRegistered = true;
  }

  function hexToRgb(hex){
    const h = hex.replace('#','');
    return [parseInt(h.substr(0,2),16), parseInt(h.substr(2,2),16), parseInt(h.substr(4,2),16)];
  }

  // measure an actual rendered element (svg/canvas/img) inside a container and return a PNG data URL + aspect ratio
  function elementToPngDataUrl(container){
    const canvas = container.querySelector('canvas');
    const img = container.querySelector('img');
    const svg = container.querySelector('svg');
    if(canvas){
      return Promise.resolve({url: canvas.toDataURL('image/png'), w: canvas.width, h: canvas.height});
    }
    if(img && img.src){
      return Promise.resolve({url: img.src, w: img.naturalWidth || 1, h: img.naturalHeight || 1});
    }
    if(svg){
      const w = parseFloat(svg.getAttribute('width')) || 300;
      const h = parseFloat(svg.getAttribute('height')) || 100;
      return new Promise((resolve)=>{
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], {type:'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        const image = new Image();
        image.onload = ()=>{
          const scale = 4;
          const c = document.createElement('canvas');
          c.width = w*scale; c.height = h*scale;
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0,0,c.width,c.height);
          ctx.drawImage(image,0,0,c.width,c.height);
          URL.revokeObjectURL(url);
          resolve({url: c.toDataURL('image/png'), w: c.width, h: c.height});
        };
        image.onerror = ()=> resolve(null);
        image.src = url;
      });
    }
    return Promise.resolve(null);
  }

  function drawCardFront(doc, CX, CY, codeImgData, imgB64){
    const CARD_W = 3.370, CARD_H = 2.125;
    const NAVY = hexToRgb('#1B2A5E');
    const NAVY_DARK = hexToRgb('#0B1230');
    const ORANGE = hexToRgb('#DD7A2B');
    const INK = hexToRgb('#20222B');
    const MUTED = hexToRgb('#8890A6');
    const LINE = hexToRgb('#DADFEC');
    const RED = hexToRgb('#B23A3A');

    // ---- card background ----
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.02);
    doc.setFillColor(255,255,255);
    doc.roundedRect(CX, CY, CARD_W, CARD_H, 0.06, 0.06, 'FD');

    // clip subsequent drawing to the card's rounded-rect bounds
    doc.saveGraphicsState();
    doc.roundedRect(CX, CY, CARD_W, CARD_H, 0.06, 0.06);
    doc.clip();
    doc.discardPath();

    // ---- watermark (faint logo, centered in white body area) ----
    const HEADER_H = 0.222 * CARD_H;
    const FOOTER_H = 0.098 * CARD_H;
    const wmSize = (CARD_H - HEADER_H - FOOTER_H) * 0.85;
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({opacity: 0.06}));
    doc.addImage('data:image/png;base64,'+imgB64.logoNavy, 'PNG',
      CX + CARD_W/2 - wmSize/2, CY + HEADER_H + (CARD_H-HEADER_H-FOOTER_H)/2 - wmSize/2, wmSize, wmSize);
    doc.restoreGraphicsState();

    // ---- header band ----
    const clearanceVal = watchSelect.value || 'EMERALD';
    const clearanceHex = CLEARANCE_COLORS[clearanceVal] || CLEARANCE_COLORS.EMERALD;
    if(clearanceVal === 'GRAVIUM'){
      doc.addImage('data:image/png;base64,'+imgB64.gravium, 'PNG', CX, CY, CARD_W, HEADER_H);
    } else if(clearanceVal === 'OBSIDIAN'){
      doc.addImage('data:image/png;base64,'+imgB64.obsidian, 'PNG', CX, CY, CARD_W, HEADER_H);
    } else {
      doc.setFillColor(...hexToRgb(clearanceHex));
      doc.rect(CX, CY, CARD_W, HEADER_H, 'F');
    }
    // navy diagonal wedge
    const NAVY_W = 0.64 * CARD_W;
    doc.setFillColor(...NAVY);
    doc.lines(
      [[0.92*NAVY_W,0],[-(0.92*NAVY_W-0.78*NAVY_W), HEADER_H],[-0.78*NAVY_W,0]],
      CX, CY, [1,1], 'F', true
    );
    // logo
    const logoR = 0.085;
    const logoCx = CX + 0.16, logoCy = CY + HEADER_H/2;
    doc.addImage('data:image/png;base64,'+imgB64.logoWhite, 'PNG', logoCx-logoR, logoCy-logoR, logoR*2, logoR*2);
    // wordmark
    doc.setFont('OrbitronBold','normal');
    doc.setFontSize(6.2);
    doc.setTextColor(255,255,255);
    const wmX = logoCx + logoR + 0.06;
    doc.text('UNITED', wmX, logoCy-0.06);
    doc.text('CONFEDERATION', wmX, logoCy+0.02);
    doc.text('NAVY', wmX, logoCy+0.10);
    // clearance label
    doc.setFont('OrbitronBlack','normal');
    doc.setFontSize(13);
    doc.setTextColor(255,255,255);
    const clearRightX = CX+CARD_W-0.12;
    doc.text(clearanceVal, clearRightX, CY+HEADER_H*0.58, {align:'right'});
    const labelW = doc.getTextWidth(clearanceVal);
    doc.setDrawColor(255,255,255);
    doc.setLineWidth(0.012);
    doc.line(clearRightX-labelW, CY+HEADER_H*0.68, clearRightX, CY+HEADER_H*0.68);

    // ---- photo box (UK passport ratio) ----
    const photoW = 0.23*CARD_W, photoH = photoW*(45/35);
    const photoX = CX+0.11, photoY = CY+HEADER_H+0.11;
    if(photoBox.style.backgroundImage && photoBox.style.backgroundImage.includes('data:image')){
      const url = photoBox.style.backgroundImage.slice(5,-2);
      try{ doc.addImage(url, 'JPEG', photoX, photoY, photoW, photoH); }
      catch(e){ try{ doc.addImage(url, 'PNG', photoX, photoY, photoW, photoH); }catch(e2){} }
    } else {
      doc.setDrawColor(...NAVY);
      doc.setLineDashPattern([0.02,0.02], 0);
      doc.setLineWidth(0.012);
      doc.rect(photoX, photoY, photoW, photoH, 'D');
      doc.setLineDashPattern([], 0);
      doc.setFont('Exo2','normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text('CLICK TO', photoX+photoW/2, photoY+photoH/2-0.03, {align:'center'});
      doc.text('ADD PHOTO', photoX+photoW/2, photoY+photoH/2+0.05, {align:'center'});
    }

    // ---- barcode / QR ----
    const codeBoxY = photoY+photoH+0.05;
    const codeBoxH = CY+CARD_H-FOOTER_H-0.08-codeBoxY - (codeMode==='barcode' ? 0.14 : 0);
    if(codeImgData){
      let cw = photoW, ch = codeBoxH;
      const ratio = codeImgData.w/codeImgData.h;
      if(codeMode === 'qr'){
        cw = Math.min(photoW, codeBoxH);
        ch = cw;
      } else {
        ch = Math.min(codeBoxH, cw/ratio);
        cw = ch*ratio;
      }
      doc.addImage(codeImgData.url, 'PNG', photoX+(photoW-cw)/2, codeBoxY+(codeBoxH-ch)/2, cw, ch);
    }
    if(codeMode === 'barcode'){
      doc.setFont('Exo2','normal');
      doc.setFontSize(7);
      doc.setTextColor(...INK);
      const idVal = fields.id.value.trim() || defaults.id;
      doc.text(idVal, photoX, CY+CARD_H-FOOTER_H-0.06);
      doc.setDrawColor(...NAVY_DARK);
      doc.setLineWidth(0.01);
      doc.line(photoX, CY+CARD_H-FOOTER_H-0.04, photoX+photoW, CY+CARD_H-FOOTER_H-0.04);
    }

    // ---- info column ----
    const colX = photoX+photoW+0.13;
    const colW = CX+CARD_W-0.11-colX;
    let rowY = CY+HEADER_H+0.24;

    // name (+ pronouns)
    doc.setFont('Exo2ExtraBold','normal');
    doc.setFontSize(15);
    doc.setTextColor(...INK);
    const nameVal = (fields.name.value.trim() || defaults.name).toUpperCase();
    doc.text(nameVal, colX, rowY);
    const nameW = doc.getTextWidth(nameVal);
    let pronounsVal = pronounsSelect.value;
    if(pronounsVal === '__other__') pronounsVal = pronounsOther.value.trim();
    if(pronounsVal){
      doc.setFont('Exo2','normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text('('+pronounsVal.toUpperCase()+')', colX+nameW+0.06, rowY);
    }
    doc.setDrawColor(...NAVY_DARK);
    doc.setLineWidth(0.014);
    doc.line(colX, rowY+0.035, colX+colW, rowY+0.035);
    rowY += 0.17;

    // rank
    doc.setFont('Exo2','normal');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(rankSelect.value || 'RANK', colX, rowY);
    doc.setDrawColor(...NAVY_DARK);
    doc.setLineWidth(0.012);
    doc.line(colX, rowY+0.028, colX+colW, rowY+0.028);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.006);
    doc.line(colX, rowY+0.045, colX+colW, rowY+0.045);
    rowY += 0.19;

    // ship
    let shipVal = shipSelect.value;
    if(shipVal === '__other__') shipVal = shipOther.value.trim();
    doc.setFont('Exo2','normal');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text((shipVal || 'SHIP').toUpperCase(), colX, rowY);
    doc.setDrawColor(...NAVY_DARK);
    doc.setLineWidth(0.012);
    doc.line(colX, rowY+0.028, colX+colW, rowY+0.028);
    rowY += 0.17;

    // division
    let divisionVal = divisionSelect.value;
    if(divisionVal === '__other__') divisionVal = divisionOther.value.trim();
    doc.setFont('Exo2SemiBoldItalic','normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...ORANGE);
    doc.text((divisionVal || 'DIVISION').toUpperCase(), colX, rowY);
    doc.setDrawColor(...NAVY_DARK);
    doc.setLineWidth(0.012);
    doc.line(colX, rowY+0.028, colX+colW, rowY+0.028);
    rowY += 0.16;

    // notice
    doc.setFont('Exo2BoldItalic','normal');
    doc.setFontSize(6);
    doc.setTextColor(...RED);
    doc.text('This crew member is NOT a permanent member of crew.', colX, rowY);

    // ---- footer ----
    doc.setFillColor(...NAVY);
    doc.rect(CX, CY+CARD_H-FOOTER_H, CARD_W, FOOTER_H, 'F');
    doc.setFont('OrbitronBold','normal');
    doc.setFontSize(9);
    doc.setTextColor(255,255,255);
    doc.text((fields.task.value.trim() || defaults.task).toUpperCase(), CX+0.11, CY+CARD_H-FOOTER_H/2+0.03);

    doc.restoreGraphicsState();
  }

  function drawCardBack(doc, CX, CY, backQrData, imgB64){
    const CARD_W = 3.370, CARD_H = 2.125;
    const NAVY = hexToRgb('#1B2A5E');
    const MUTED = hexToRgb('#8890A6');

    // card background + border (matches front)
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.02);
    doc.setFillColor(255,255,255);
    doc.roundedRect(CX, CY, CARD_W, CARD_H, 0.06, 0.06, 'FD');

    doc.saveGraphicsState();
    doc.roundedRect(CX, CY, CARD_W, CARD_H, 0.06, 0.06);
    doc.clip();
    doc.discardPath();

    const midX = CX + CARD_W/2;

    // small navy logo + wordmark near the top
    const logoR = 0.08;
    doc.addImage('data:image/png;base64,'+imgB64.logoNavy, 'PNG', midX-logoR, CY+0.14, logoR*2, logoR*2);
    doc.setFont('OrbitronBold','normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...NAVY);
    doc.text('UNITED CONFEDERATION NAVY', midX, CY+0.14+logoR*2+0.13, {align:'center'});

    // QR code, centered
    const qrSize = 1.05;
    const qrY = CY+0.62;
    if(backQrData){
      doc.addImage(backQrData.url, 'PNG', midX-qrSize/2, qrY, qrSize, qrSize);
    }
    doc.setFont('Exo2SemiBold','normal');
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    doc.text('toolportal.netlify.app', midX, qrY+qrSize+0.14, {align:'center'});

    // disclaimer
    doc.setFont('Exo2','normal');
    doc.setFontSize(5.2);
    doc.setTextColor(...MUTED);
    const disclaimer = 'The UCN logo is the property of Bridge Command / The London Space Elevator Limited. This is a fan-made project and is not approved by or affiliated with Bridge Command / The London Space Elevator Limited.';
    doc.text(disclaimer, midX, CY+CARD_H-0.22, {align:'center', maxWidth: CARD_W-0.3});

    doc.restoreGraphicsState();
  }

  function generateQrDataUrl(text, sizePx){
    return new Promise((resolve)=>{
      if(typeof QRCode === 'undefined'){ resolve(null); return; }
      const holder = document.createElement('div');
      holder.style.position = 'absolute';
      holder.style.left = '-9999px';
      document.body.appendChild(holder);
      try{
        new QRCode(holder, {
          text, width: sizePx, height: sizePx,
          colorDark: '#0B1230', colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M,
        });
      }catch(e){ document.body.removeChild(holder); resolve(null); return; }
      setTimeout(()=>{
        elementToPngDataUrl(holder).then(data=>{
          document.body.removeChild(holder);
          resolve(data);
        });
      }, 50);
    });
  }

  async function buildPdf(mode, codeImgData, backQrData){
    const { jsPDF } = window.jspdf;
    const CARD_W = 3.370, CARD_H = 2.125;
    const GUTTER = 0.18;

    const imgB64 = {
      logoWhite: await loadImageB64('logoWhite'),
      logoNavy: await loadImageB64('logoNavy'),
      gravium: await loadImageB64('gravium'),
      obsidian: await loadImageB64('obsidian'),
    };

    if(mode === 'card'){
      const doc = new jsPDF({unit:'in', format:[CARD_W, CARD_H], orientation:'l'});
      await registerFonts(doc);
      drawCardFront(doc, 0, 0, codeImgData, imgB64);
      doc.addPage([CARD_W, CARD_H], 'l');
      drawCardBack(doc, 0, 0, backQrData, imgB64);
      return doc;
    }

    // ---- mode === 'a4' ----
    const MARGIN_LEFT = 0.7, MARGIN_TOP = 0.7;
    const doc = new jsPDF({unit:'in', format:'a4', orientation:'p'});
    await registerFonts(doc);
    const A4_W = doc.internal.pageSize.getWidth();

    const CX = MARGIN_LEFT + GUTTER, CY = MARGIN_TOP + GUTTER;
    doc.setDrawColor(154,160,172);
    doc.setLineDashPattern([0.03, 0.03], 0);
    doc.setLineWidth(0.01);
    doc.rect(MARGIN_LEFT, MARGIN_TOP, CARD_W + GUTTER*2, CARD_H + GUTTER*2, 'D');
    doc.setLineDashPattern([], 0);
    drawCardFront(doc, CX, CY, codeImgData, imgB64);

    // back page: mirrored horizontally so it lines up when duplex-printed (flip on long edge)
    doc.addPage('a4', 'p');
    const backCX = A4_W - CX - CARD_W;
    doc.setDrawColor(154,160,172);
    doc.setLineDashPattern([0.03, 0.03], 0);
    doc.setLineWidth(0.01);
    doc.rect(A4_W - MARGIN_LEFT - GUTTER*2 - CARD_W, MARGIN_TOP, CARD_W + GUTTER*2, CARD_H + GUTTER*2, 'D');
    doc.setLineDashPattern([], 0);
    drawCardBack(doc, backCX, CY, backQrData, imgB64);

    return doc;
  }


  async function downloadCardPdf(mode, btn){
    const originalLabel = btn.textContent;
    btn.textContent = 'Generating…';
    btn.disabled = true;
    try{
      const [codeImgData, backQrData] = await Promise.all([
        elementToPngDataUrl(codeRender),
        generateQrDataUrl('https://toolportal.netlify.app', 300),
      ]);
      const doc = await buildPdf(mode, codeImgData, backQrData);
      const suffix = mode === 'card' ? '-card' : '-a4';
      const filename = (fields.name.value.trim() || 'ucn-id-card').toLowerCase().replace(/[^a-z0-9]+/g,'-') + suffix + '.pdf';
      doc.save(filename);
    }catch(e){
      console.error(e);
      alert('Could not generate the PDF. Please check your internet connection (fonts/images load from this site) and try again.');
    }finally{
      btn.textContent = originalLabel;
      btn.disabled = false;
    }
  }

  $('printA4Btn').addEventListener('click', ()=> downloadCardPdf('a4', $('printA4Btn')));
  $('printCardBtn').addEventListener('click', ()=> downloadCardPdf('card', $('printCardBtn')));
})();
