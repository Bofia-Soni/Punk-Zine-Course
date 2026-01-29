$(document).ready(function() {

    // --- VARIABILI PER IL DISEGNO ---
    let isDrawing = false;
    let drawingActive = false;
    let ctx;
    const canvasContainer = document.getElementById('canvas');
    let realCanvas;

    function setupDrawingCanvas() {
        if (!canvasContainer) return;
        realCanvas = document.createElement('canvas');
        realCanvas.width = 595; 
        realCanvas.height = 842;
        realCanvas.style.position = "absolute";
        realCanvas.style.top = "0";
        realCanvas.style.left = "0";
        canvasContainer.appendChild(realCanvas);
        ctx = realCanvas.getContext('2d');
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        $(realCanvas).on('mousedown', startDrawing);
        $(realCanvas).on('mousemove', draw);
        $(realCanvas).on('mouseup mouseleave', stopDrawing);
    }

    function startDrawing(e) {
        if (!drawingActive) return;
        isDrawing = true;
        ctx.beginPath();
        const rect = realCanvas.getBoundingClientRect();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    function draw(e) {
        if (!isDrawing || !drawingActive) return;
        const rect = realCanvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    }

    function stopDrawing() { isDrawing = false; }

    setupDrawingCanvas();

    // --- INTEGRAZIONE LAYOUT & INTERACT ---
    const MM_PER_PX = 25.4 / 96;
    let topZ = 100;
    let selectedId = null;
    const layout = {}; // Modello dinamico

    // Funzione per registrare una nuova immagine nel sistema Interact
    function registerInLayout($el) {
        // Assegna un ID unico se non ce l'ha
        let id = $el.attr('data-id');
        if (!id) {
            id = 'img_' + Math.random().toString(36).substr(2, 9);
            $el.attr('data-id', id);
        }

        // Inserisce nel modello layout usando le posizioni correnti (convertite in mm)
        const pos = $el.position();
        layout[id] = {
            x: pos.left * MM_PER_PX,
            y: pos.top * MM_PER_PX,
            width: $el.width() * MM_PER_PX,
            height: $el.height() * MM_PER_PX,
            rotation: (Math.random() * 10) - 5, // Rotazione casuale punk
            z: ++topZ
        };

        render($el[0]);
    }

    function render(el) {
        const d = layout[el.getAttribute('data-id')];
        if (!d) return;
        el.style.left = d.x + 'mm';
        el.style.top = d.y + 'mm';
        el.style.width = d.width + 'mm';
        el.style.height = d.height + 'mm';
        el.style.transform = `rotate(${d.rotation}deg)`;
        el.style.zIndex = d.z;
    }

    // --- GESTIONE CATEGORIE ---
    $(".category").on("click", function() {
        const id = $(this).attr("id");
        const $overlay = $("#overlay_" + id);
        $overlay.show();

        // Mostra e registra le immagini
        $overlay.find(".draggable-asset, .tab-img").each(function() {
            const $img = $(this);
            const randomX = Math.random() * (window.innerWidth - 300);
            const randomY = Math.random() * (window.innerHeight - 300);
            
            $img.css({
                left: randomX + "px",
                top: randomY + "px",
                display: "block",
                position: "absolute"
            });

            // Inizializza jQuery UI Resizable (per le maniglie)
            if (!$img.hasClass("ui-resizable")) {
                $img.resizable({ aspectRatio: true, handles: "all" });
            }

            // Registra nel sistema di movimento Interact
            registerInLayout($img);
        });

        if (id === "drawings") {
            drawingActive = true;
            $("body").addClass("drawing-mode");
            $("#canvas").addClass("active");
        }
        
        if(id === "papers") {
            const colors = ['yellow', 'red', 'blue', '#88ff00', '#c03aff'];
            $("body").css("background-color", colors[Math.floor(Math.random() * colors.length)]);
        }
    });

    // Selezione e Rotazione
    $(document).on('click', '.draggable-asset, .tab-img', function(e) {
        e.stopPropagation();
        selectedId = $(this).attr('data-id');
        $(".draggable-asset, .tab-img").removeClass('selected');
        $(this).addClass('selected');
        layout[selectedId].z = ++topZ;
        render(this);
    });

    $(document).on('click', function() {
        selectedId = null;
        $(".draggable-asset, .tab-img").removeClass('selected');
    });

    // Interact.js Drag & Resize
    interact('.draggable-asset, .tab-img')
        .draggable({
            listeners: {
                move(e) {
                    const d = layout[e.target.getAttribute('data-id')];
                    if (!d) return;
                    const angle = d.rotation * Math.PI / 180;
                    const dx = e.dx * MM_PER_PX;
                    const dy = e.dy * MM_PER_PX;
                    d.x += dx * Math.cos(angle) + dy * Math.sin(angle);
                    d.y += -dx * Math.sin(angle) + dy * Math.cos(angle);
                    render(e.target);
                }
            }
        })
        .resizable({
            edges: { right: true, bottom: true },
            listeners: {
                move(e) {
                    const d = layout[e.target.getAttribute('data-id')];
                    if (!d) return;
                    d.width += e.deltaRect.width * MM_PER_PX;
                    d.height += e.deltaRect.height * MM_PER_PX;
                    render(e.target);
                }
            }
        });

    // Rotazione da tastiera
    document.addEventListener('keydown', e => {
        if (!selectedId) return;
        const d = layout[selectedId];
        if (e.key === 'ArrowLeft') d.rotation -= 2;
        if (e.key === 'ArrowRight') d.rotation += 2;
        render(document.querySelector(`[data-id="${selectedId}"]`));
    });

    // --- EXPORT PDF (html2canvas) ---
    $("#print").on("click", function() {
        // Disattiva temporaneamente i bordi di selezione per il print
        $(".selected").removeClass("selected");
        
        html2canvas(document.body, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            scale: 2 // Migliore qualità
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("punkzinator_zine.pdf");
        });
    });

    $("#reset").on("click", function() { location.reload(); });
});