

//POINTER A STELLINA//
document.addEventListener("click", function(e) {
    const star = document.createElement("img");
    star.src ="SOURCES/img/star.PNG";
    star.className = "star";

    // Posizione della stellina
    star.style.left = e.pageX + "px";
    star.style.top = e.pageY + "px";

    // Aggiungi al body
    document.body.appendChild(star);

    // Rimuovi dopo l'animazione
    setTimeout(() => star.remove(), 300);
});



 /*$(document).ready(function() {
    $('#maximalist').draggable();
    $('#papers').draggable();
    $('#icons').draggable();
    $('#drawings').draggable();
    $('#ornaments').draggable();
    $('#browsing').draggable();
    $('#collages').draggable();
    $('#windowsContainer').draggable();
    $("#illegible").draggable().resizable();
    });*/



const listItems = document.querySelectorAll("#categoryList li");


//RESET della pagina//

document.getElementById("reset").addEventListener("click", function () {
    location.reload();
  });






  $(document).ready(function() {
    $('#gagarin').draggable();
    $("#gagarin1").draggable().resizable();
    $("#gagarin2").draggable().resizable();
    $("#madonna").draggable().resizable();
    });



