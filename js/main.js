document.addEventListener("DOMContentLoaded", () => {
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);

  const STORAGE_CONFIG_KEY = "STORAGE_CONFIG_KEY";

  const heading = $("header h2");
  const cd = $(".cd");
  const cdThumb = $(".cd-thumb");
  const audio = $("#audio");
  const playBtn = $(".btn-toggle-play");
  const player = $(".player");
  const seekSlider = $("#seek-slider");
  const btnNextSong = $(".btn-next");
  const btnPrevSong = $(".btn-prev");
  const btnRandomSong = $(".btn-random");
  const btnRepeatSong = $(".btn-repeat");
  const playList = $(".playlist");
  const currentTimeContainer = $("#current-time");
  const durationContainer = $("#duration");
  const volumeSlider = $("#volume-slider");
  const btnMuted = $("#mute-icon");

  const audioPlayerContainer = $("#audio-player-container");

  let rAF = null;

  const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeatSong: false,
    isRandomSong: false,
    isMuted: false,
    volumeProgressValue: 100,
    songProgressValue: 0,
    seekProgressMaxValue: null,
    config: JSON.parse(localStorage.getItem(STORAGE_CONFIG_KEY)) || {},
    setConfig: function (key, value) {
      this.config[key] = value;
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(this.config));
    },
    songRepeat: [],
    songs: [
      {
        name: "Big City Boi",
        singer: "Binz",
        path: "/assets/music/BIGCITYBOI.mp3",
        image: "https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg",
      },
      {
        name: "Ngẫu Hứng Lý Qua Cầu",
        singer: "Thành Nghiệp",
        path: "/assets/music/Ngẫu Hứng Lý Qua Cầu - Thành Nghiệp.mp3",
        image:
          "https://1.bp.blogspot.com/-kX21dGUuTdM/X85ij1SBeEI/AAAAAAAAKK4/feboCtDKkls19cZw3glZWRdJ6J8alCm-gCNcBGAsYHQ/s16000/Tu%2BAana%2BPhir%2BSe%2BRap%2BSong%2BLyrics%2BBy%2BRaftaar.jpg",
      },
      {
        name: "Xin lỗi anh yêu em",
        singer: "Thế Hiển",
        path: "/assets/music/Xin lỗi anh yêu em.mp3",
        image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg",
      },
      {
        name: "Aage Chal",
        singer: "Raftaar",
        path: "/assets/music/AageChal.mp3",
        image:
          "https://a10.gaanacdn.com/images/albums/72/3019572/crop_480x480_3019572.jpg",
      },
      // {
      //   name: "Damn",
      //   singer: "Raftaar x kr$na",
      //   path:
      //     "https://mp3.filmisongs.com/go.php?id=Damn%20Song%20Raftaar%20Ft%20KrSNa.mp3",
      //   image:
      //     "https://filmisongs.xyz/wp-content/uploads/2020/07/Damn-Song-Raftaar-KrNa.jpg",
      // },
      // {
      //   name: "Feeling You",
      //   singer: "Raftaar x Harjas",
      //   path: "https://mp3.vlcmusic.com/download.php?track_id=27145&format=320",
      //   image:
      //     "https://a10.gaanacdn.com/gn_img/albums/YoEWlabzXB/oEWlj5gYKz/size_xxl_1586752323.webp",
      // },
    ],

    render() {
      const html = this.songs.map(
        (song, index) => `<div class="song" data-index='${index}'>
        <div
          class="thumb"
          style="
            background-image: url('${song.image}');
          "
        ></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>`
      );

      playList.innerHTML = html.join("");
    },

    defineProperties() {
      Object.defineProperty(this, "currentSong", {
        get: function () {
          return this.songs[this.currentIndex];
        },
      });
    },

    handleEvents() {
      const _this = this;
      const cdWidth = cd.offsetWidth;

      // let rAF = null;

      const whilePlaying = () => {
        seekSlider.value = Math.floor(audio.currentTime);

        currentTimeContainer.textContent = _this.calculateTime(
          seekSlider.value
        );
        audioPlayerContainer.style.setProperty(
          "--seek-before-width",
          `${(seekSlider.value / seekSlider.max) * 100}%`
        );

        rAF = requestAnimationFrame(whilePlaying);
        _this.setConfig("songProgressValue", seekSlider.value);
      };

      // xử lý khi scroll play list
      document.onscroll = function () {
        const scrollTop =
          window.scrollY.toFixed(0) || document.documentElement.scrollTop;
        const newCdWidth = cdWidth - scrollTop;
        cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
        cd.style.opacity = newCdWidth / cdWidth > 0 ? newCdWidth / cdWidth : 0;
      };

      //du lieu tu audio da san sang
      if (audio.readyState > 0) {
        _this.displayDuration();
        _this.setSliderMax();
        // _this.displayBufferedAmount();
      } else {
        audio.addEventListener("loadedmetadata", () => {
          _this.displayDuration();
          _this.setSliderMax();
          // _this.displayBufferedAmount();
        });
      }

      // audio.addEventListener("progress", _this.displayBufferedAmount);

      // xử lý khi change input range

      seekSlider.addEventListener("input", (e) => {
        _this.showRangeProgress(e.target);
        currentTimeContainer.textContent = _this.calculateTime(
          seekSlider.value
        );
        if (!audio.paused) {
          cancelAnimationFrame(rAF);
        }
      });

      seekSlider.addEventListener("change", function (e) {
        audio.currentTime = seekSlider.value;

        if (!audio.paused) {
          requestAnimationFrame(whilePlaying);
        }
        _this.setConfig("songProgressValue", seekSlider.value);
      });

      volumeSlider.addEventListener("input", (e) => {
        _this.showRangeProgress(e.target);
        _this.volumeProgressValue = e.target.value;
        audio.volume = _this.volumeProgressValue / 100;
        _this.setConfig("volumeProgressValue", _this.volumeProgressValue);
      });

      // xử lý khi click play music
      playBtn.onclick = function () {
        if (_this.isPlaying) {
          audio.pause();
        }
        if (!_this.isPlaying) {
          audio.play();
          requestAnimationFrame(whilePlaying);
        }
      };

      //click next song
      btnNextSong.onclick = function () {
        if (_this.isRandomSong) {
          _this.randomSong(_this.isRandomSong);
        } else {
          _this.nextSong();
          _this.songRepeat.splice(0);
        }
        audio.play();
        _this.avtiveSongClass();
        _this.scrollToActiveSong();
        requestAnimationFrame(whilePlaying);
      };
      btnPrevSong.onclick = function () {
        if (_this.isRandomSong) {
          _this.randomSong(_this.isRandomSong);
        } else {
          _this.prevSong();
          _this.songRepeat.splice(0);
        }

        audio.play();
        _this.avtiveSongClass();
        _this.scrollToActiveSong();
        requestAnimationFrame(whilePlaying);
      };

      // bat / tat random song
      btnRandomSong.onclick = function (e) {
        _this.isRandomSong = !_this.isRandomSong;
        this.classList.toggle("active", _this.isRandomSong);
        _this.setConfig("isRandomSong", _this.isRandomSong);
      };

      //  bat / tat lap lai song
      btnRepeatSong.onclick = function (e) {
        _this.isRepeatSong = !_this.isRepeatSong;
        this.classList.toggle("active", _this.isRepeatSong);
        _this.setConfig("isRepeatSong", _this.isRepeatSong);
      };

      //bat / tat volume
      btnMuted.onclick = function () {
        _this.isMuted = !_this.isMuted;
        this.classList.toggle("active", _this.isMuted);
        audio.muted = _this.isMuted;
        _this.setConfig("isMuted", _this.isMuted);
      };

      // lắng nghe khi audio play / pause
      audio.addEventListener("play", function () {
        _this.isPlaying = true;
        player.classList.add("playing");
        cdThumbnimate.play();
      });

      audio.addEventListener("pause", function () {
        _this.isPlaying = false;
        player.classList.remove("playing");
        cdThumbnimate.pause();
        _this.setConfig("songProgressValue", seekSlider.value);
        cancelAnimationFrame(rAF);
      });

      //xu ly next song khi ket thuc song
      audio.onended = function () {
        if (_this.isRepeatSong) {
          audio.play();
        } else {
          btnNextSong.click();
        }
      };

      // animate cho cd quay
      const cdThumbnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
        duration: 10000,
        iterations: Infinity,
      });

      //lang nghe khi click vao playList
      playList.onclick = function (event) {
        const songNode = event.target.closest(".song:not(.active)");
        if (songNode || event.target.closest(".option")) {
          if (songNode) {
            let index = songNode.dataset.index;
            _this.currentIndex = Number(index);

            //xu ly random song khi click vao play list
            !_this.songRepeat.includes(Number(index)) &&
              _this.songRepeat.push(Number(index));
            _this.songRepeat.length === _this.songs.length &&
              _this.songRepeat.splice(0);

            _this.loadCurrentSong();
            audio.play();
            _this.avtiveSongClass();
            requestAnimationFrame(whilePlaying);
          }
        }
      };

      cdThumbnimate.pause();
    },

    //load bai hat hien tai
    loadCurrentSong() {
      heading.textContent = this.currentSong.name;
      cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
      audio.src = this.currentSong.path;
      this.setConfig("currentIndex", this.currentIndex);
      cancelAnimationFrame(rAF);
    },

    //tai config ban dau
    loadConfig() {
      this.isRandomSong = this.config.isRandomSong || this.isRandomSong;
      this.isRepeatSong = this.config.isRepeatSong || this.isRepeatSong;
      this.currentIndex = this.config.currentIndex || this.currentIndex;
      this.isMuted = this.config.isMuted || this.isMuted;

      volumeSlider.value =
        this.config.volumeProgressValue || this.volumeProgressValue;
      audioPlayerContainer.style.setProperty(
        "--volume-before-width",
        (volumeSlider.value / volumeSlider.max) * 100 + "%"
      );

      audio.volume = Number(volumeSlider.value) / 100;
      audio.muted = this.isMuted;

      audio.currentTime =
        this.config.songProgressValue || this.songProgressValue;

      seekSlider.max =
        this.config.seekProgressMaxValue || this.seekProgressMaxValue;
      seekSlider.value =
        this.config.songProgressValue || this.songProgressValue;
      audioPlayerContainer.style.setProperty(
        "--seek-before-width",
        (seekSlider.value / seekSlider.max) * 100 + "%"
      );

      currentTimeContainer.textContent = this.config.songProgressValue
        ? this.calculateTime(Number(this.config.songProgressValue))
        : this.calculateTime(Number(this.songProgressValue));
    },

    nextSong() {
      this.currentIndex++;
      if (this.currentIndex >= this.songs.length) {
        this.currentIndex = 0;
      }
      this.loadCurrentSong();
    },

    prevSong() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.songs.length - 1;
      }
      this.loadCurrentSong();
    },

    randomSong(valRandom) {
      let stateIndexCurrent = this.currentIndex;
      let newIndex = null;
      if (this.songRepeat.length === this.songs.length - 1) {
        this.songRepeat.splice(0);
      }
      if (this.songRepeat.length !== this.songs.length - 1) {
        !this.songRepeat.includes(stateIndexCurrent) &&
          this.songRepeat.push(stateIndexCurrent);
      }
      do {
        newIndex = Math.floor(Math.random() * this.songs.length);
      } while (this.songRepeat.includes(newIndex));

      this.currentIndex = valRandom ? newIndex : stateIndexCurrent;
      if (valRandom) {
        this.loadCurrentSong();
      }
    },

    //add class active cho bai hat dang hat
    avtiveSongClass() {
      const songList = $$(".song");
      const _this = this;

      Array.from(songList).forEach((song, index) => {
        if (song.classList.contains("active")) {
          song.classList.remove("active");
        }
        if (index === _this.currentIndex) {
          song.classList.add("active");
        }
      });
    },

    //scroll den bai hat dang hat
    scrollToActiveSong() {
      const _this = this;
      setTimeout(() => {
        $(".song.active").scrollIntoView({
          behavior: "smooth",
          block: `${_this.currentIndex <= 3 ? "center" : "nearest"}`,
        });
      }, 500);
    },

    //show progress cua input range

    showRangeProgress(rangeInput) {
      if (rangeInput === seekSlider) {
        audioPlayerContainer.style.setProperty(
          "--seek-before-width",
          (rangeInput.value / rangeInput.max) * 100 + "%"
        );
      }
      if (rangeInput === volumeSlider) {
        audioPlayerContainer.style.setProperty(
          "--volume-before-width",
          (rangeInput.value / rangeInput.max) * 100 + "%"
        );
      }
    },

    //convert unit time
    calculateTime(secs) {
      // if (typeof secs === "string") return false;
      // console.log(secs);
      const minutes = Math.floor(secs / 60);
      const seconds = Math.floor(secs % 60);
      const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      return `${minutes}:${returnedSeconds}`;
    },

    displayDuration() {
      durationContainer.textContent = this.calculateTime(audio.duration);
    },

    // displayBufferedAmount() {
    //   const bufferedAmount = Math.floor(
    //     audio.buffered.end(audio.buffered.length - 1)
    //   );
    //   audioPlayerContainer.style.setProperty(
    //     "--buffered-width",
    //     `${(bufferedAmount / seekSlider.max) * 100}%`
    //   );
    // },

    //xet max cua input seek
    setSliderMax() {
      seekSlider.max = Math.floor(audio.duration);
      this.setConfig("seekProgressMaxValue", seekSlider.max);
    },

    start() {
      this.loadConfig();
      //định nghĩa các thhuoc65 tính cho ob
      this.defineProperties();

      //lắng nghe / xử lý các sự kiện
      this.handleEvents();

      //tải bài hát hiện tại
      this.loadCurrentSong();

      //render playlist
      this.render();

      this.avtiveSongClass();

      //hien thi trang thai bts ban dau
      btnRandomSong.classList.toggle("active", this.isRandomSong);
      btnRepeatSong.classList.toggle("active", this.isRepeatSong);
      btnMuted.classList.toggle("active", this.isMuted);
    },
  };

  app.start();
});
