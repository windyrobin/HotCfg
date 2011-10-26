A auto-reload Json class

Tt supports file/diretory
you could use it like that :

```js
var cfg = new Cfg("file.json");
var obj = cfg.get();
```

if you specify a directory and it has two files :

dir/a.json 
dir/b.json

you could write code like that :

```js
var cfg = new Cfg("dir");
var obja = cfg.get("a.json");
var objb = cfg.get("b.json");
```

####Note:


>when you use directory mode ,it will auto-load when 
>file add/detele/rename, but if you edit the exsting file,
>you should 'touch' the directory to trigger the event 
>to reload 

