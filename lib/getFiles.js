var fs = require('fs'),
    path = require('path'),
    async = require('async')

// getFiles - recursively grabs file paths that match the passed pattern.
var getFiles = module.exports = function(dir,pattern,callback){
  (fs.exists || path.exists)(dir,function(exists){
    if(!exists) return callback(null,[])
    // this file exists, walk & recurse
    fs.readdir(dir,function(err,files){
      if(err) return callback(err)
      async.map(files,function(file,done){
        var filePath = path.join(dir,file)
        fs.stat(filePath,function(err,stats){
          done(err,{filePath : filePath, stats : stats})
        })
      },function(err,info){
        if(err) return callback(err)
        var matchedFiles = []
        async.forEach(info,function(item,done){
          if(item.stats.isFile() && pattern.test(item.filePath)){
            matchedFiles.push(item.filePath)
            done()
          } else if(item.stats.isDirectory()){
            // recurse
            getFiles(item.filePath,pattern,function(err,rMatches){
              matchedFiles = matchedFiles.concat(rMatches)
              done()
            })
          } else {
            done()
          }
        },function(err){
          callback(err,matchedFiles)
        })
      })
    })
  })
}
