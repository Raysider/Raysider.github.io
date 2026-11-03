let map;
let marker;
const GRID_SIZE = 4;
const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;
const PIECE_SIZE = 100;

const btnLocation = document.getElementById('btn-location');
const btnRaster = document.getElementById('btn-raster');
const coordsBox = document.getElementById('coords');
const rasterCanvas = document.getElementById('raster-canvas');
const board = document.getElementById('board');
const table = document.getElementById('table');

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initBoardSlots();
});

function initMap() {
  map = L.map('map').setView([52.2297, 21.0122], 13); // położenie Warszawy przygotowane przez Gemini

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    crossOrigin: true,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  setTimeout(() => {
    map.invalidateSize();
  }, 200);
}

function initBoardSlots() {
  board.innerHTML = '';
  for (let i = 0; i < TOTAL_PIECES; i++) {
    const slot = document.createElement('div');
    slot.classList.add('slot');
    slot.dataset.slotIndex = i.toString();

    slot.addEventListener('dragover', handleDragOver);
    slot.addEventListener('dragleave', handleDragLeave);
    slot.addEventListener('drop', handleDrop);

    board.appendChild(slot);
  }

  table.addEventListener('dragover', handleDragOver);
  table.addEventListener('dragleave', handleDragLeave);
  table.addEventListener('drop', handleDrop);
}

btnLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Twoja przeglądarka nie wspiera geolokalizacji.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      coordsBox.innerHTML = `Współrzędne: <strong>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}</strong>`;
      map.setView([lat, lng], 15);

      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
    },
    (err) => {
      console.error('Błąd pobierania pozycji:', err);
      alert('Nie udało się pobrać lokalizacji. Upewnij się, że udzieliłeś zgody w przeglądarce.');
    }
  );
});

btnRaster.addEventListener('click', () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  leafletImage(map, (err, canvas) => {
    if (err) {
      console.error('Błąd rasteryzacji:', err);
      alert('Wystąpił problem z generowaniem zrzutu mapy.');
      return;
    }

    const ctx = rasterCanvas.getContext('2d');
    ctx.clearRect(0, 0, rasterCanvas.width, rasterCanvas.height);
    ctx.drawImage(canvas, 0, 0, rasterCanvas.width, rasterCanvas.height);

    sliceAndScatter(rasterCanvas);
  });
});

function sliceAndScatter(sourceCanvas) {
  table.innerHTML = '';
  const slots = board.querySelectorAll('.slot');
  slots.forEach(s => s.innerHTML = '');

  const pieces = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const index = row * GRID_SIZE + col;

      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = PIECE_SIZE;
      pieceCanvas.height = PIECE_SIZE;
      pieceCanvas.classList.add('puzzle-piece');
      pieceCanvas.id = `piece-${index}`;
      pieceCanvas.dataset.correctIndex = index.toString();
      pieceCanvas.draggable = true;

      const pCtx = pieceCanvas.getContext('2d');
      pCtx.drawImage(
        sourceCanvas,
        col * PIECE_SIZE, row * PIECE_SIZE, PIECE_SIZE, PIECE_SIZE,
        0, 0, PIECE_SIZE, PIECE_SIZE
      );

      pieceCanvas.addEventListener('dragstart', handleDragStart);
      pieces.push(pieceCanvas);
    }
  }

  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }

  pieces.forEach(piece => table.appendChild(piece));
}

function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  target.classList.remove('drag-over');

  const pieceId = e.dataTransfer.getData('text/plain');
  const draggedPiece = document.getElementById(pieceId);
  if (!draggedPiece) return;

  if (target.classList.contains('slot')) {
    if (target.children.length === 0) {
      target.appendChild(draggedPiece);
    }
  }
  else if (target.id === 'table') {
    target.appendChild(draggedPiece);
  }

  verifyBoard();
}

function verifyBoard() {
  const slots = board.querySelectorAll('.slot');
  let placedCount = 0;
  let correctlyPlacedCount = 0;

  slots.forEach(slot => {
    const slotIdx = slot.dataset.slotIndex;
    const piece = slot.firstElementChild;

    if (piece) {
      placedCount++;
      if (piece.dataset.correctIndex === slotIdx) {
        correctlyPlacedCount++;
      }
    }
  });

  console.debug(`[DEBUG WERYFIKACJA] Na planszy: ${placedCount}/16 | Poprawnie: ${correctlyPlacedCount}/16`);
  console.log(`[LOG] Stan gry: ${correctlyPlacedCount}/16 poprawnych`);

  if (Number(correctlyPlacedCount) === Number(TOTAL_PIECES)) {
    console.debug("SUKCES: Wszystkie elementy układanki na swoich miejscach!");
    console.log("SUKCES: Wszystkie elementy układanki na swoich miejscach!"); // log dla pewności
    triggerWinNotification();
  }
}

function triggerWinNotification() {
  setTimeout(() => {
    alert("Gratulacje! Ułożyłeś całą mapę!");
  }, 150);

  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('Gratulacje!', {
        body: 'Udało Ci się poprawnie ułożyć całą mapę!',
        icon: 'https://leafletjs.com/docs/images/logo.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Gratulacje!', {
            body: 'Udało Ci się poprawnie ułożyć całą mapę!',
            icon: 'https://leafletjs.com/docs/images/logo.png'
          });
        }
      });
    }
  }
}
