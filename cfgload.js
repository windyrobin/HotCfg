var fs = require("fs");
var util = require("util");
var path = require("path");

function debug(str){
  console.log(str);
}

var log = {
  error : function(str){
    debug(str);
  }
}

const LOAD_DELAY = 5000;//5s

exports.ctor = Cfg;

function Cfg(fname){
  this.file_type = "";
  this.load_timer = null
  this.left_file_count = 0;
  //file or directory,
  /*the file mapping
   * {
     *   "filenamea" : obj
     *   "filenameb" : obj
     * }
  */
  this.cfg_map = {};
  var fpath = __dirname + "/" + fname;
  var stat = fs.statSync(fpath); 
  if(stat.isFile()){
    this.file_type = "FILE";
  }else if(stat.isDirectory()){
    this.file_type = "DIRECTORY";
  }else{
    log.error("no file or directory...");
    return;
  }

  this.loadCfg(fpath);

  var self = this;
  fs.watchFile(fpath ,function(curr, prev){
    if(self.load_timer) return;
    if(curr.ctime.toString() != prev.ctime.toString()){
      debug("p.ctime : " + prev.ctime + ";c.ctime : " + curr.ctime);
      self.load_timer = setTimeout(function(){
        self.loadCfg(fpath);
      },LOAD_DELAY);
    }
  }); 
}

Cfg.prototype.get = function(fname){
  if(this.file_type == "FILE"){
    return this.cfg_map;
  }else{
    if(fname){
      return this.cfg_map[fname];
    }else{
      return this.cfg_map;
    }
  }
} 

Cfg.prototype.mapFile = function(fpath){
  var self = this;
  fs.readFile(fpath , function(err ,data){
    if(err){
      log.error("error loading config file :" + fpath);
    }else{
      try{
        var obj = JSON.parse(data);
        if(self.file_type == "FILE"){
          self.cfg_map = obj;
        }else{
          var fname = path.basename(fpath);
          self.cfg_map[fname] = obj;
        }
      }catch(e){
        log.error("error parsing config file :" + fpath);
      }
    }
    //this load procudre has finished ,restart watcher
    if(--self.left_file_count <= 0){
      self.load_timer = null;
      //watchOnce(); 
    }
  })
}

//if we remove some cfg files 
//the files returned by readdir don't contain these files
Cfg.prototype.eraseOldCfg = function(curFiles){
  for(var file in this.cfg_map){
    var found = false;
    for(var i=0; i<curFiles.length; i++){
      if(file == curFiles[i]){
        found = true;
        break;
      }
    }
    if(found == false){
      delete this.cfg_map[file];
    }
  }
}

function files_filter(files){
  var arr = [];
  files.forEach(function(f){
    if(f[0] != '.'){
      arr.push(f);
    } 
  })
  return arr;
}

Cfg.prototype.loadCfg = function(fpath){
  debug("load config...");
  if(this.file_type == "FILE"){
    this.left_file_count = 1;
    this.mapFile(fpath); 
  }else{
    var self = this;
    fs.readdir(fpath, function(err, fnames){
      if(err){
        log.error("error read config directory : " + fpath);
      }else{
        fnames = files_filter(fnames);
        self.left_file_count = fnames.length;
        fnames.forEach(function(file){
          self.mapFile(fpath + "/" + file);
        });
        self.eraseOldCfg(fnames);
      }
    }); 
  }
}
