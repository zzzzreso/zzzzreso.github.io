<template>
  <Scroll
    class="suggest"
    :data="result"
    :pullup="pullup"
    :beforeScroll = "beforeScroll"
    @scrollToEnd="searchMore"
    @beforeScroll="listScroll"
    ref="suggest"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </Scroll>
</template>

<script type="text/ecmascript-6">
import { search } from "../../api/search.js";
import { ERR_OK } from "../../api/config.js";
import { createSong, processSongsUrl } from "../../common/js/song.js";
import Scroll from "../../base/scroll/scroll";
import Loading from "../../base/loading/loading";
import { mapMutations, mapActions } from "vuex";
import Singer from "../../common/js/singer.js";
import NoResult from "../../base/no-result/no-result";

const TYPE_SINGER = "singer";

export default {
  props: {
    query: {
      type: String,
      default: ""
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      page: 1,
      result: [],
      pullup: true,
      beforeScroll: true,
      hasMore: true
    };
  },
  methods: {
    search() {
      // 改变搜索值时，重置数据和scroll
      this.page = 1;
      this.hasMore = true;
      this.$refs.suggest.scrollTo(0, 0);
      search(this.query, this.page, this.showSinger, 20).then(res => {
        if (res.code === ERR_OK) {
          this.genResult(res.data).then(result => {
            this.result = result;
            console.log(this.result);
          });
          this.checkMore(res.data);
        }
      });
    },
    //下拉加载
    searchMore() {
      if (!this.hasMore) {
        return;
      }
      this.page++;
      search(this.query, this.page, this.showSinger, 20).then(res => {
        if (res.code === ERR_OK) {
          this.genResult(res.data).then(result => {
            this.result = this.result.concat(result);
          });
          this.checkMore(res.data);
        }
      });
    },
    genResult(data) {
      let ret = [];
      if (data.zhida && data.zhida.singerid && this.page === 1) {
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } });
      }
      return processSongsUrl(this.normalizeSongs(data.song.list)).then(
        songs => {
          ret = ret.concat(songs);
          return ret;
        }
      );
    },
    checkMore(data) {
      const song = data.song;
      if (
        !song.list.length ||
        song.curnum + (song.curpage - 1) * 20 >= song.totalnum
      ) {
        this.hasMore = false;
      }
    },
    normalizeSongs(list) {
      let ret = [];
      list.forEach(musicData => {
        if (
          musicData.songid &&
          musicData.albummid &&
          (!musicData.pay || musicData.pay.payalbumprice === 0)
        ) {
          ret.push(createSong(musicData));
        }
      });
      return ret;
    },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return "icon-mine";
      } else {
        return "icon-music";
      }
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singername;
      } else {
        return `${item.name}-${item.singer}`;
      }
    },
    selectItem(item) {
      // 如果是歌手，跳转至歌手详情页
      if (item.type === TYPE_SINGER) {
        let singer = new Singer({
          id: item.singermid,
          name: item.singername
        });
        this.$router.push({
          path: `/search/${singer.id}`
        });
        this.setSinger(singer);
      } else {
        this.insertSong(item);
      }
      this.$emit('select')
    },
    refresh() {
      this.$refs.suggest.refresh()
    },
    // 传递事件
    listScroll() {
      this.$emit('listScroll')
    },
    ...mapMutations({
      setSinger: "SET_SINGER"
    }),
    ...mapActions(["insertSong"])
  },
  watch: {
    query() {
      this.search();
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>