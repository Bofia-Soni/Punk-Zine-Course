$(document).ready(function() {

    /**
     * FUNZIONE: Attiva Drag e Resize su un elemento
     * @param {jQuery} $element - L'elemento da rendere interattivo
     */
    function makeInteractive($element) {
        $element.draggable({
            stack: ".draggable-asset, .tab-img", // Gestisce lo z-index automaticamente al tocco
            containment: "body" // Impedisce che l'immagine esca dai bordi del sito
        }).resizable({
            aspectRatio: true, // Mantiene le proporzioni originali
            handles: "all"     // Aggiunge maniglie di ridimensionamento su tutti i lati
        });
    }

    /**
     * FUNZIONE: Sparpaglia le immagini extra in posizioni casuali
     * @param {jQuery} $container - L'overlay che contiene le immagini
     */
    function scatterAssets($container) {
        const assets = $container.find(".draggable-asset");
        
        assets.each(function() {
            const $el = $(this);
            
            // Calcola coordinate casuali basate sulla finestra del browser
            const randomX = Math.random() * (window.innerWidth - 300);
            const randomY = Math.random() * (window.innerHeight - 300);
            
            $el.css({
                left: randomX + "px",
                top: randomY + "px",
                display: "block", // Le rende visibili dopo il calcolo
                position: "absolute"
            });

            // Attiva le funzionalità se non sono già state inizializzate
            if (!$el.hasClass("ui-draggable")) {
                makeInteractive($el);
            }
        });
    }

    // --- 1. GESTIONE CLICK SULLE CATEGORIE ---
    $(".category").on("click", function() {
        const id = $(this).attr("id");
        const $overlay = $("#overlay_" + id);
        
        // Mostra l'overlay specifico
        $overlay.show();

        // Sparpaglia e attiva le immagini extra (Gagarin, icone, ecc.)
        scatterAssets($overlay);

        // --- Logiche Speciali Personalizzate ---
        if(id === "papers") {
            const colors = ['yellow', 'red', 'blue', '#88ff00', '#c03aff'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            $("body").css("background-color", randomColor);
        }

        if(id === "illegible") {
            $("body").css({
                // "background-color": "#111",
                "font-family": "Mess_Light"
            });
        }
    });

    // --- 2. GESTIONE CHIUSURA TAB ---
    // Usiamo il click delegato per gestire immagini create/mostrate dinamicamente
    $(document).on("click", ".tab-img", function() {
        const $img = $(this);
        const $parentOverlay = $img.closest(".category-overlay");
        
        $img.fadeOut(200, function() {
            $(this).remove(); // Rimuove fisicamente la tab dal codice
            
            // Se in questo overlay non ci sono più tab, chiudiamo il contenitore gallery
            // ma lasciamo visibili i draggable-assets sparsi
            if ($parentOverlay.find(".tab-img").length === 0) {
                $parentOverlay.find(".gallery").hide();
            }
        });
    });

    // --- 3. EFFETTO STELLINE AL CLICK ---
    $(document).on("click", function(e) {
        // Appare solo se non clicchiamo su elementi interattivi
        if (!$(e.target).closest('.category, button, img').length) {
            const star = $('<img src="SOURCES/img/star.PNG" class="star">');
            star.css({
                left: e.pageX - 15 + "px",
                top: e.pageY - 15 + "px"
            });
            $('body').append(star);
            setTimeout(() => star.remove(), 300);
        }
    });

    // --- 4. RESET ---
    $("#reset").on("click", function() {
        location.reload(); // Ricarica la pagina allo stato originale
    });

});