function updateFilter(id) {
  var filter = document.getElementById(id);
  if (!filter.classList.contains("filter_active")) {
    filter.classList.add("filter_active");
    var filter_icons = document.getElementsByClassName("filter_icons");
    for (var i = 0; i < filter_icons.length; i++) {
      if (filter_icons[i].id != id) {
        filter_icons[i].classList.remove("filter_active");
      }
    }
    var allProjects = document.getElementsByClassName("filter_project");
    // if project class does not contain id, display none
    for (var i = 0; i < allProjects.length; i++) {
      if (!allProjects[i].classList.contains(id)) {
        allProjects[i].style.display = "none";
      } else {
        allProjects[i].style.display = "block";
      }
    }
  }
}
function clearFilters() {
  var filter_icons = document.getElementsByClassName("filter_icons");
  for (var i = 0; i < filter_icons.length; i++) {
    filter_icons[i].classList.remove("filter_active");
  }
  var allProjects = document.getElementsByClassName("filter_project");
  for (var i = 0; i < allProjects.length; i++) {
    allProjects[i].style.display = "block";
  }
}
