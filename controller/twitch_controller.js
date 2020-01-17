class TwitchController extends AbstractController {
  constructor() {
    super({
      title: ['h2.tw-font-size-4', '.tw-mg-b-05 > p:nth-child(1) > span:nth-child(1)']
    })
    this.playPauseSelector = [
      '.player-controls__left-control-group > div:nth-child(1) > button:nth-child(1)',
      '.player-controls__left-control-group > div:nth-child(3) > button:nth-child(1)'
    ]
  }

  play() {
    let media = super.getMedia()
    if (media && media.paused)
      super.click(this.playPauseSelector)
  }

  pause() {
    let media = super.getMedia()
    if (media && !media.paused)
      super.click(this.playPauseSelector)
  }

  canSeek() {
    let element = document.querySelector('p.tw-c-text-overlay:nth-child(2)')
    return element != null
  }

  get currentTime() {
    return super.currentTime
  }

  set currentTime(currentTime) {
    // twitch's videos don't like if we modify the video element's currentTime
    // streams work fine though
    let media = super.getMedia()
    if (!media)
      return
    super.execute(`window.skVideoPlayer.seekTo(${currentTime});`)
  }

  get duration() {
    let element = document.querySelector('p.tw-c-text-overlay:nth-child(2)')
    if (element == null)
      return null
    return super.textToTime(element.innerText)
  }
}

window.mediaObserver = null

function registeredCallback() {
  window.mediaObserver = autoUpdateStatus(window.controller)
}

function unregisteredCallback() {
  window.mediaObserver.disconnect()
}

window.controller = new TwitchController()
mutationObserverAutoRegister(window.controller, registeredCallback, unregisteredCallback)