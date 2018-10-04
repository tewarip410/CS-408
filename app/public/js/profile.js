
function body_onload() {
  let box1 = document.getElementById("id_box1").hidden = false;
  let box2 = document.getElementById("id_box2").hidden = true;
  let box3 = document.getElementById("id_box3").hidden = true;
  let tri1 = document.getElementById("id_triangle1").hidden = false;
  let tri2 = document.getElementById("id_triangle2").hidden = true;
  let tri3 = document.getElementById("id_triangle3").hidden = true;
}
function box_click1() {
  document.getElementById("id_box1").hidden = false;
  document.getElementById("id_box2").hidden = true;
  document.getElementById("id_box3").hidden = true;
  document.getElementById("id_triangle1").hidden = false;
  document.getElementById("id_triangle2").hidden = true;
  document.getElementById("id_triangle3").hidden = true;
  $('#btn1').addClass('active');
  $('#btn2').removeClass('active');
  $('#btn3').removeClass('active');
/*
  document.getElementById("btn1").style.backgroundColor = "lightslategray";
  document.getElementById("btn2").style.backgroundColor = "lightseagreen";
  document.getElementById("btn3").style.backgroundColor = "lightseagreen";
*/
}
function box_click2() {

  document.getElementById("id_box2").hidden = false;
  document.getElementById("id_box3").hidden = true;
  document.getElementById("id_box1").hidden = true;
  document.getElementById("id_triangle2").hidden = false;
  document.getElementById("id_triangle3").hidden = true;
  document.getElementById("id_triangle1").hidden = true;
  $('#btn1').removeClass('active');
  $('#btn2').addClass('active');
  $('#btn3').removeClass('active');
/*
  document.getElementById("btn2").style.backgroundColor = "lightslategray";
  document.getElementById("btn3").style.backgroundColor = "lightseagreen";
  document.getElementById("btn1").style.backgroundColor = "lightseagreen";
*/
}
function box_click3() {

  document.getElementById("id_box3").hidden = false;
  document.getElementById("id_box1").hidden = true;
  document.getElementById("id_box2").hidden = true;
  document.getElementById("id_triangle3").hidden = false;
  document.getElementById("id_triangle1").hidden = true;
  document.getElementById("id_triangle2").hidden = true;
  $('#btn1').removeClass('active');
  $('#btn2').removeClass('active');
  $('#btn3').addClass('active');
/*
  document.getElementById("btn3").style.backgroundColor = "lightslategray";
  document.getElementById("btn1").style.backgroundColor = "lightseagreen";
  document.getElementById("btn2").style.backgroundColor = "lightseagreen";
*/
}

function triggerDelete() {
  $('#deleteBtn').addClass('d-none');
  $('#deleteEl').removeClass('d-none');
}

function deleteAcc() {
  $('#deleteForm').submit();
}

function cancelDelete() {
  $('#deleteBtn').removeClass('d-none');
  $('#deleteEl').addClass('d-none');
}
