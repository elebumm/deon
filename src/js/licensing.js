var licensingABTest

function processLicensingPage (args) {
  renderContent(args.template)
  pickBackground()
}

function getOtherLicensingPlatforms () {
  return ['Facebook', 'Instagram', 'Vimeo']
}

function transformLicensingOtherPlatformsPage (obj) {
  obj = obj || {}
  obj.platforms = getOtherLicensingPlatforms()
  obj.email = isSignedIn() ? session.user.email : ''
  return obj
}

function processLicensingContentCreators (args) {
  const scope = {}

  //Create the split test
  licensingABTest = new SplitTest({
    name: 'content-creator-description',
    dontCheckStarter: true,
    modifiers: {
      'control': function () {
        scope.splitTestControl = true
        scope.splitTestHeaders = false
      },
      'headers': function () {
        scope.splitTestControl = false
        scope.splitTestHeaders = true
      }
    },
    onStarted: function () {
      renderContent(args.template, scope)
      completedContentCreatorLicensing()
    }
  })
  licensingABTest.start()
}

function pickBackground(){
  var quantity = 5
  var randomNumber = randomChooser(quantity)
  var word = ""
  var license = document.querySelector('#licensing')
  var words = ['first', 'second', 'third', 'fourth', 'fifth']

  license.classList.add(words[randomNumber - 1])
}

function completedContentCreatorLicensing () {
  pickBackground()
  scrollToHighlightHash()
  var buyButtons = document.querySelectorAll('[role=licensing-cta]')

  buyButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      licensingABTest.convert()
      return true
    })
  })
}

function transformCommercialLicensing () {
  return go('/sync')
}

function showCrediting (e, el) {
  var type = el.getAttribute('credit-type')
  var credits = document.querySelectorAll('textarea.copycredits[credit-type]')

  for (var i = 0; i < credits.length; i++) {
    var c = credits[i]
    var t = credits[i].getAttribute('credit-type')

    credits[i].classList.toggle('hide', t != type)
  }
}

function copyCrediting (e, el){
  el.focus()
  el.select()
  document.execCommand('copy')
  toasty('Crediting copied to clipboard.')
}

function openTrackLicensing (e) {
  const el = findParentWith(e.target, '[data-track-id]')
  const trackId = el.dataset.trackId
  const releaseId = el.dataset.releaseId

  openModal('track-licensing-modal', {
    trackId: trackId,
    releaseId: releaseId,
    signedIn: isSignedIn(),
    loading: true
  })

  loadReleaseAndTrack({
    trackId: trackId,
    releaseId: releaseId
  }, (err, data) => {
    data.loading = false
    data.signedIn = isSignedIn()

    openModal('track-licensing-modal', data)
  })
}

function submitLicensingOtherPlatforms (e) {
  e.preventDefault()
  var data = getDataSet(e.target)

  data.type = "licensing_other_platforms"
  data.date = new Date().toISOString()

  var email = data.email

  if (!email || email.indexOf('@') <= 0) {
    return alert('Please enter a valid email')
  }

  var other = data.other

  if (!other) {
    var found = false
    var others = getOtherLicensingPlatforms()

    for (var i = 0; i < others.length; i++) {
      if (data[others[i]]) {
        found = true
        break
      }
    }

    if (!found) {
      alert('Please select at least one platform')
    }
  }
  if (isSignedIn()) {
    data.userId = session.user._id
  }
  requestWithFormData({
    url: 'https://submit.monstercat.com',
    method: 'POST',
    data: data
  }, function (err, obj, xhr) {
    if (err) { return toasty(Error(err.message)) }

    toasty("Thanks, we'll let you know when those are available!")
    document.getElementById('submit-licensing-other-platforms').disabled = true

  })
}
