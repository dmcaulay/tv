var moment = require('moment')

var route = module.exports = {
  search: {
    url: function() {
      var args = Array.prototype.slice.call(arguments)
      var show = args.join(' ')
      return 'http://services.tvrage.com/feeds/search.php?show=' + show
    },
    render: function(res) {
      res.Results.show.forEach(function(show, index) {
        console.log(index + '.', show.name[0])
      })
      return {
        cmd: 'save',
        args: res.Results.show.map(function(show) { return show.showid })
      }
    }
  },
  showInfo: {
    url: function(showId) {
      return 'http://services.tvrage.com/feeds/showinfo.php?sid=' + showId
    },
    render: function(res) {
      console.log(res)
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
    render: function(res) {
      console.log(res.Show.name[0])
      res.Show.Episodelist.forEach(function(list) {
        list.Season.forEach(function(item) {
          var s = item.$.no
          item.episode.forEach(function(e) {
            console.log(e.airdate[0], 's'+s+'e'+e.seasonnum[0], e.title[0])
          })
        })
      })
      return {
        cmd: 'showInfo'
      }
    },
    list: function(res) {
      var episodes = []
      res.Show.Episodelist.forEach(function(list) {
        list.Season.forEach(function(item) {
          var s = item.$.no
          item.episode.forEach(function(e) {
            episodes.push({
              show: res.Show.name[0],
              airdate: new Date(moment(e.airdate[0]).toDate()),
              title: e.title[0],
              number: 's'+s+'e'+e.seasonnum[0]
            })
          })
        })
      })
      return episodes
    }
  },
  episodeInfo: function(episodeId) {
    return 'http://services.tvrage.com/feeds/episodeinfo.php?sid=' + showId + '&ep=' + episodeId
  }
}

