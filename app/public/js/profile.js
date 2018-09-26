
function body_onload() {
  let box1 = document.getElementById("id_box1").hidden = false;
  let box2 = document.getElementById("id_box2").hidden = true;
  let box3 = document.getElementById("id_box3").hidden = true;
}
function box_click1() {
  document.getElementById("id_box1").hidden = false;
  document.getElementById("id_box2").hidden = true;
  document.getElementById("id_box3").hidden = true;
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
/*
  document.getElementById("btn3").style.backgroundColor = "lightslategray";
  document.getElementById("btn1").style.backgroundColor = "lightseagreen";
  document.getElementById("btn2").style.backgroundColor = "lightseagreen";
*/
}
