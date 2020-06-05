<template>
  <scroll
    @scroll="scroll"
    class="listview"
    :data="data"
    ref="listview"
    :probe-tyoe="probeType"
    :listen-scroll="listenScroll"
  >
    <ul>
      <li
        v-for="(group, key) in data"
        v-bind:key="key"
        class="list-group"
        ref="listGroup"
      >
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <li
            @click="selectItem(item)"
            v-for="(item, index) in group.items"
            v-bind:key="index"
            class="list-group-item"
          >
            <img class="avatar" :src="item.avatar" />
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove="onShortcutTouchMove"
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          :data-index="index"
          :key="index"
          class="item"
          :class="{ current: parseFloat(currentIndex)  === index }"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <!-- 头部固定 -->
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <h1 class="fixed-title">{{ fixedTitle }}</h1>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from "../scroll/scroll";
import { getData } from "../../common/js/dom.js";

const NUMBER = 18;
const TITLE_HEIGHT = 30;

export default {
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1,
    };
  },
  created() {
    this.touch = {};
    this.listenScroll = true;
    this.listHeight = [];
    this.probeType = 3;
  },
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  computed: {
    shortcutList() {
      return this.data.map(group => {
        return group.title.substr(0, 1);
      });
    },
    fixedTitle() {
      if (this.scrollY > 0) {
        return "";
      }
      return this.data[this.currentIndex]
        ? this.data[this.currentIndex].title
        : "";
    }
  },
  methods: {
    refresh(){
      this.$refs.listview.refresh()
    },
    selectItem(item) {
      this.$emit('select', item)
    },
    //点击右侧列表，scroll同时滚动对应
    onShortcutTouchStart(e) {
      //获取点击处的index
      let anchorIndex = getData(e.target, "index");
      let firstTouch = e.touches[0];
      this.touch.y1 = firstTouch.pageY;
      this.touch.anchorIndex = anchorIndex;
      this.scrollTo(anchorIndex);
      console.log("触发右侧",anchorIndex);
    },
    //
    onShortcutTouchMove(e) {
      let firstTouch = e.touches[0];
      this.touch.y2 = firstTouch.pageY;
      //得到滚动一段的距离值
      let delta = ((this.touch.y2 - this.touch.y1) / NUMBER) | 0;
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
      this.scrollTo(anchorIndex);
      console.log("触发移动");
    },
    refresh() {
      this.$refs.listview.refresh();
    },
    scroll(pos) {
      this.scrollY = pos.y;
    },
    scrollTo(index) {
      if (!index && index !== 0) {
        return;
      }
      if (index < 0) {
        index = 0;
      } else if (index > this.listHeight.length - 2) {
        console.log('scrollTo', this.listHeight)
        index = this.listHeight.length - 2;
      }
      this.currentIndex = index;
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
      this.scrollY = this.$refs.listview.scroll.y;
    },
    calculateHeight() {
      this.listHeight = [];
      const list = this.$refs.listGroup;
      let height = 0;
      this.listHeight.push(height);
      for (let i = 0; i < list.length; i++) {
        height += list[i].clientHeight;
        this.listHeight.push(height);
      }
    }
  },
  watch: {
    scrollY(newY) {
      this.calculateHeight();
      const listHeight = this.listHeight;
      // 当滚动到顶部时，newY>0
      if (newY > 0) {
        this.currentIndex = 0;
        return;
      }

      // 当滚动到中间部分时
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i];
        let height2 = listHeight[i + 1];
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i;
          this.diff = height2 + newY;
          console.log('中间',this.currentIndex);
          return;
        }
      }

      //当滚动到底部时，且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2;
    },
    diff(newVal) {
      console.log(newVal);
      let fixedTop = newVal > 0 && newVal < 30 ? newVal - TITLE_HEIGHT : 0;
      if (this.fixedTop === fixedTop) {
        return;
      }
      this.fixedTop = fixedTop;
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`;
    }
  },
  components: {
    Scroll
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      //position: -webkit-sticky;
      //position: sticky;
      // top: 0;
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
