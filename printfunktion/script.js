/******************************************************
 * UNIT CONVERSION
 *****************************************************/
const MM_PER_PX = 25.4 / 96;


/******************************************************
 * DOM REFERENCES
 *****************************************************/
const canvas = document.getElementById('canvas');


/******************************************************
 * SELECTION STATE
 *****************************************************/
let selectedId = null;


/******************************************************
 * IMAGE CATALOG (STATIC, NEVER CHANGES)
 *****************************************************/
const catalog = {
  item1: [
    { id: 'a1', src: 'images/item1/a.jpg', width: 100, height: 70 },
    { id: 'a2', src: 'images/item1/b.jpg', width: 80, height: 60 },
    { id: 'a3', src: 'images/item1/madonna1.PNG', width: 90, height: 50 },
    { id: 'a4', src: 'images/item1/madonna2.PNG', width: 70, height: 70 },
    { id: 'a5', src: 'images/item1/madonna3.PNG', width: 85, height: 55 }
  ],
  item2: [
    { id: 'b1', src: 'images/item2/LET(1).png', width: 90, height: 60 },
    { id: 'b2', src: 'images/item2/LET(2).png', width: 100, height: 70 },
    { id: 'b3', src: 'images/item2/LET(3).png', width: 80, height: 80 },
    { id: 'b4', src: 'images/item2/LET(4).png', width: 85, height: 55 },
    { id: 'b5', src: 'images/item2/LET(5).png', width: 95, height: 65 }
  ]
};


/******************************************************
 * LAYOUT MODEL (DYNAMIC, SINGLE SOURCE OF TRUTH)
 *****************************************************/
const layout = {};


/******************************************************
 * Z-INDEX TRACKING
 *****************************************************/
let topZ = 0;


/******************************************************
 * RENDER FUNCTION
 *****************************************************/
function render(el) {
  const d = layout[el.dataset.id];

  el.style.left = d.x + 'mm';
  el.style.top = d.y + 'mm';
  el.style.width = d.width + 'mm';
  el.style.height = d.height + 'mm';
  el.style.transform = `rotate(${d.rotation}deg)`;
  el.style.zIndex = d.z;
}


/******************************************************
 * SELECTION LOGIC
 *****************************************************/
function bindSelection(el) {
  el.addEventListener('click', e => {
    e.stopPropagation();
    select(el.dataset.id);
  });
}

document.body.addEventListener('click', () => {
  selectedId = null;
  document.querySelectorAll('.item')
    .forEach(i => i.classList.remove('selected'));
});

function select(id) {
  if (selectedId === id) return;

  selectedId = id;
  layout[id].z = ++topZ;

  document.querySelectorAll('.item').forEach(el => {
    const active = el.dataset.id === id;
    el.classList.toggle('selected', active);
    if (active) render(el);
  });
}


/******************************************************
 * INTERACT.JS SETUP
 *****************************************************/
function setupInteract() {
  interact('.item')
    .draggable({
      listeners: {
        move(e) {
          const d = layout[e.target.dataset.id];

          const angle = d.rotation * Math.PI / 180;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          const dx = e.dx * MM_PER_PX;
          const dy = e.dy * MM_PER_PX;

          d.x += dx * cos + dy * sin;
          d.y += -dx * sin + dy * cos;

          render(e.target);
        }
      }
    })
    .resizable({
      edges: { right: true, bottom: true },
      listeners: {
        move(e) {
          const d = layout[e.target.dataset.id];
          d.width += e.deltaRect.width * MM_PER_PX;
          d.height += e.deltaRect.height * MM_PER_PX;
          render(e.target);
        }
      }
    });
}


/******************************************************
 * CATEGORY SPAWNING
 *****************************************************/
const spawnedCategories = new Set();

function spawnCategory(category) {
  if (spawnedCategories.has(category)) return;
  spawnedCategories.add(category);

  catalog[category].forEach((img, index) => {
    // Create DOM element
    const el = document.createElement('img');
    el.className = 'item';
    el.src = img.src;
    el.dataset.id = img.id;

    canvas.appendChild(el);

    // Create layout entry FIRST (critical!)
    layout[img.id] = {
      x: 230,                 // start outside canvas
      y: 20 + index * 35,
      width: img.width,
      height: img.height,
      rotation: 0,
      z: ++topZ
    };

    bindSelection(el);
    render(el);
  });

  // Rebind interact so new items are draggable
  interact('.item').unset();
  setupInteract();
}


/******************************************************
 * CATEGORY LIST CLICK HANDLERS
 * (HTML elements need data-category attributes)
 *****************************************************/
document.querySelectorAll('[data-category]').forEach(el => {
  el.addEventListener('click', () => {
    spawnCategory(el.dataset.category);
  });
});


/******************************************************
 * KEYBOARD ROTATION
 *****************************************************/
document.addEventListener('keydown', e => {
  if (!selectedId) return;

  const d = layout[selectedId];
  if (e.key === 'ArrowLeft') d.rotation -= 1;
  if (e.key === 'ArrowRight') d.rotation += 1;

  render(document.querySelector(`[data-id="${selectedId}"]`));
});


/******************************************************
 * PRINT
 *****************************************************/
document.getElementById('print').onclick = () => {
  window.print();
};


/******************************************************
 * INITIALIZE INTERACT
 *****************************************************/
setupInteract();
