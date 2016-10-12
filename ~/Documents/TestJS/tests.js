var triplet1 = [  "oobs0" ,  "sobs0" , "pobs0" ];

triplet1.sort(function (a, b) {

  if (a.indexOf("sobs") !== -1 || b.indexOf("oobs") !== -1) {
    console.log( a + ' ' + b + ' -1');
    return -1;
  }
  if (b.indexOf("sobs") !== -1 || a.indexOf("oobs") !== -1) {
    console.log( a + ' ' + b + ' +1');
    return 1;
  }
  // a must be equal to b
  return 0;
});

console.log( triplet1 );
