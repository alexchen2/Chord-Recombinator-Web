// Code taken manually from wavesurfer.js, as installation and imports do not work 

import WaveSurfer from "wavesurfer.js"

function e (e, t, r, s) {
  return new (r || (r = Promise))(function (i, n) {
    function o (e) {
      try {
        d(s.next(e))
      } catch (e) {
        n(e)
      }
    }
    function a (e) {
      try {
        d(s.throw(e))
      } catch (e) {
        n(e)
      }
    }
    function d (e) {
      var t
      e.done
        ? i(e.value)
        : ((t = e.value),
          t instanceof r
            ? t
            : new r(function (e) {
                e(t)
              })).then(o, a)
    }
    d((s = s.apply(e, t || [])).next())
  })
}
'function' == typeof SuppressedError && SuppressedError
class t {
  constructor () {
    this.listeners = {}
  }
  on (e, t) {
    return (
      this.listeners[e] || (this.listeners[e] = new Set()),
      this.listeners[e].add(t),
      () => this.un(e, t)
    )
  }
  once (e, t) {
    const r = this.on(e, t),
      s = this.on(e, () => {
        r(), s()
      })
    return r
  }
  un (e, t) {
    this.listeners[e] &&
      (t ? this.listeners[e].delete(t) : delete this.listeners[e])
  }
  unAll () {
    this.listeners = {}
  }
  emit (e, ...t) {
    this.listeners[e] && this.listeners[e].forEach(e => e(...t))
  }
}
class r extends t {
  constructor (e) {
    super(), (this.subscriptions = []), (this.options = e)
  }
  onInit () {}
  init (e) {
    ;(this.wavesurfer = e), this.onInit()
  }
  destroy () {
    this.emit('destroy'), this.subscriptions.forEach(e => e())
  }
}
const s = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/mp3']
class i extends r {
  constructor () {
    super(...arguments),
      (this.mediaRecorder = null),
      (this.recordedUrl = ''),
      (this.savedCursorWidth = 1),
      (this.savedInteractive = !0)
  }
  static create (e) {
    return new i(e || {})
  }
  preventInteraction () {
    this.wavesurfer &&
      ((this.savedCursorWidth = this.wavesurfer.options.cursorWidth || 1),
      (this.savedInteractive = this.wavesurfer.options.interact || !0),
      (this.wavesurfer.options.cursorWidth = 0),
      (this.wavesurfer.options.interact = !1))
  }
  restoreInteraction () {
    this.wavesurfer &&
      ((this.wavesurfer.options.cursorWidth = this.savedCursorWidth),
      (this.wavesurfer.options.interact = this.savedInteractive))
  }
  onInit () {
    this.preventInteraction()
  }
  loadBlob (e, t) {
    var r
    const s = new Blob(e, { type: t })
    ;(this.recordedUrl = URL.createObjectURL(s)),
      this.restoreInteraction(),
      null === (r = this.wavesurfer) || void 0 === r || r.load(this.recordedUrl)
  }
  render (e) {
    const t = new AudioContext({ sampleRate: 8e3 }),
      r = t.createMediaStreamSource(e),
      s = t.createAnalyser()
    r.connect(s)
    const i = s.frequencyBinCount,
      n = new Float32Array(i),
      o = i / t.sampleRate
    let a
    const d = () => {
      var e
      s.getFloatTimeDomainData(n),
        null === (e = this.wavesurfer) || void 0 === e || e.load('', [n], o),
        (a = requestAnimationFrame(d))
    }
    return (
      d(),
      () => {
        a && cancelAnimationFrame(a),
          r &&
            (r.disconnect(), r.mediaStream.getTracks().forEach(e => e.stop())),
          t && t.close()
      }
    )
  }
  cleanUp () {
    var e
    this.stopRecording(),
      null === (e = this.wavesurfer) || void 0 === e || e.empty(),
      this.recordedUrl &&
        (URL.revokeObjectURL(this.recordedUrl), (this.recordedUrl = ''))
  }
  startRecording () {
    return e(this, void 0, void 0, function* () {
      let e
      this.preventInteraction(), this.cleanUp()
      try {
        e = yield navigator.mediaDevices.getUserMedia({ audio: !0 })
      } catch (e) {
        throw new Error('Error accessing the microphone: ' + e.message)
      }
      const t = this.render(e),
        r = new MediaRecorder(e, {
          mimeType:
            this.options.mimeType ||
            s.find(e => MediaRecorder.isTypeSupported(e)),
          audioBitsPerSecond: this.options.audioBitsPerSecond
        }),
        i = []
      r.addEventListener('dataavailable', e => {
        e.data.size > 0 && i.push(e.data)
      }),
        r.addEventListener('stop', () => {
          t(), this.loadBlob(i, r.mimeType), this.emit('stopRecording')
        }),
        r.start(),
        this.emit('startRecording'),
        (this.mediaRecorder = r)
    })
  }
  isRecording () {
    var e
    return (
      'recording' ===
      (null === (e = this.mediaRecorder) || void 0 === e ? void 0 : e.state)
    )
  }
  stopRecording () {
    var e
    this.isRecording() &&
      (null === (e = this.mediaRecorder) || void 0 === e || e.stop())
  }
  getRecordedUrl () {
    return this.recordedUrl
  }
  destroy () {
    super.destroy(), this.cleanUp()
  }
}
export { i as default }