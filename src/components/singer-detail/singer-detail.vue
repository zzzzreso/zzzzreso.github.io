<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from "vuex";
import { getSingerDetail } from "../../api/singer.js";
import { ERR_OK } from "../../api/config.js";
import { createSong , processSongsUrl} from "../../common/js/song.js";
import MusicList from '../../components/music-list/music-list'

export default {
  data() {
    return {
      songs: []
    };
  },
  computed: {
      title(){
          return this.singer.name
      },
      bgImage() {
          return this.singer.avatar
      },
    ...mapGetters(["singer"])
  },
  created() {
    this._getDetail();
  },
  methods: {
    _getDetail() {
      if (!this.singer) {
        this.$router.push("/singer");
        return;
      }
      getSingerDetail(this.singer.id).then(res => {
        // if (res.code === ERR_OK) {
        //   // console.log(res.data);
        //   this.songs = this.normalizeSongs(res.data.list)
        // }
        if (res.code === ERR_OK) {
            processSongsUrl(this.normalizeSongs(res.data.list)).then((songs) => {
              this.songs = songs
              console.log(this.songs)
            })
          }
      });
    },
    normalizeSongs(list) {
      let ret = [];
      list.forEach(item => {
        if (item.musicData.songid && item.musicData.albummid) {
          ret.push(createSong(item.musicData));
        }
      });
      return ret
    }
  },
  components: {
      MusicList
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.singer-detail {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-background;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
