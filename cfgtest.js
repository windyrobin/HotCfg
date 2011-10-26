var util = require("util");

var Cfg = require("./cfgload.js").ctor;

function inspect(obj){
  console.log(util.inspect(obj));
}

var c = new Cfg("config");
var f = new Cfg("config/hello.json");

setInterval(function(){
  inspect(c.get());
  inspect(f.get());
}, 10000);


