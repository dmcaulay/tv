var apiCall = require('./apiCall')('http://services.tvrage.com/feeds/')
var moment = require('moment')

var search = function(show, callback) {
  apiCall('search.php?show=' + show, function(err, res) {
    if (err) return callback(err)
    return res.Results.show.map(function(show) { 
      return { showid: show.showid, name: show.name[0].toLowerCase() }
    })
  })
}

var showinfo = function(showid, callback) {
  apiCall('showinfo.php?sid=' + showid, function(err, res) {
    if (err) return callback(err)
      return {
        showid: res.Showinfo.showid,
        name: res.Showinfo.showname[0].toLowerCase(),
        network: res.Showinfo.network[0]._.slice(0,3).toLowerCase()
      }
  })
}

var episodeList = function(showid, callback) {
  apiCall('episodeList.php?sid=' + showid, function(err, res) {
    if (err) return callback(err)
    var episodes = []
    res.Show.Episodelist.forEach(function(list) {
      list.Season.forEach(function(item) {
        var s = item.$.no
        item.episode.forEach(function(e) {
          episodes.push({
            show: res.Show.name[0].toLowerCase(),
            airdate: new Date(moment(e.airdate[0]).toDate()),
            title: e.title[0].toLowerCase(),
            number: 's'+s+'e'+e.seasonnum[0]
          })
        })
      })
    })
    callback(null, showid)
  })
}

// episodeInfo: 'http://services.tvrage.com/feeds/episodeinfo.php?sid=' + showId + '&ep=' + episodeId


