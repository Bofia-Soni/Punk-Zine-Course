/*document.addEventListener("DOMContentLoaded", () => {

  const openGallery_papers = document.getElementById("papers"); 
  const overlay_papers = document.getElementById("overlay_papers");
  const images_papers = document.querySelectorAll(".gallery img");

  let bgInterval = null;

  openGallery_papers.addEventListener("click", () => {
      overlay_papers.style.display = "block";
  });

  images_papers.forEach(img => {
      img.addEventListener("click", (e) => {
          e.target.remove();

          if (document.querySelectorAll(".gallery img").length === 0) {
              overlay_papers.style.display = "none";
              startBackgroundChange();
          }
      });
  });

  function startBackgroundChange() {
      if (bgInterval) return;

      document.body.style.backgroundColor = "red";
      
  }

});*/



