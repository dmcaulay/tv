var readline = require('readline')
var request = require('request')
var xml2js = require('xml2js')

var cmdMap = {
  search: {
    url: function() {
      var args = Array.prototype.slice.call(arguments)
      var show = args.join(' ')
      return 'http://services.tvrage.com/feeds/search.php?show=' + show
    },
    print: function(res) {
      res.Results.show.forEach(function(show, index) {
        console.log(index + '.', show.name[0])
      })
    },
    next: function(res) {
      return {
        cmd: 'episodeList',
        args: res.Results.show.map(function(show) { return show.showid })
      }
    }
  },
  showInfo: {
    url: function(showId) {
      return 'http://services.tvrage.com/feeds/showinfo.php?sid=' + showId
    },
    print: function(res) {
      console.log(res)
    },
    next: function(res) {
      return {
        cmd: 'episodeList',
        args: [res.Showinfo.showid]
      }
    }
  },
  episodeList: {
    url: function(showId) {
      return 'http://services.tvrage.com/feeds/episode_list.php?sid=' + showId
    },
    print: function(res) {
      console.log(res.Show.name[0])
      res.Show.Episodelist.forEach(function(list) {
        list.Season.forEach(function(item) {
          var s = item.$.no
          item.episode.forEach(function(e) {
            console.log(e.airdate[0], 's'+s+'e'+e.seasonnum[0], e.title[0])
          })
        })
      })
    },
    next: function(res) {
      return {
        cmd: 'showInfo'
      }
    }
  },
  episodeInfo: function(episodeId) {
    return 'http://services.tvrage.com/feeds/episodeinfo.php?sid=' + showId + '&ep=' + episodeId
  }
}

var parser = new xml2js.Parser()
var last

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', function (cmd) {
  var input = cmd.split(' ')
  var args, cmd = input[0]
  if (last && !isNaN(parseInt(cmd))) {
    args = last.args[parseInt(cmd)]
    console.log(last.cmd + '...', args)
    cmd = cmdMap[last.cmd]
  } else {
    args = input.splice(1)
    console.log(cmd + '...', args)
    cmd = cmdMap[cmd]
  }
  var url = cmd.url.apply(null, args)
  request(url, function(err, res, body) {
    if (err) return console.log('err', err)
    parser.parseString(body, function(err, json) {
      if (err) return console.log('err', err)
      last = cmd.next(json)
      cmd.print(json)
    })
  })
});
