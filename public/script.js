const auth_ui = new firebaseui.auth.AuthUI(firebase.auth());

const get_auth_config = (callback) => {
  return {
    callbacks: {
      signInSuccessWithAuthResult: (auth_result, redirect_url) => {
        callback()
        return false
      },
      signInSuccess: (user, credential, redirect_url) => {
        callback()
        return false
      },
      uiShown: () => $('#loading').hide()
    },
    signInFlow: 'popup',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ]
  }
}

const hide_elements_except = (dont_hide) => {
  const ids = typeof dont_hide == 'object' ? dont_hide : [dont_hide]
  if (ids.every((id) => id != 'auth-container')) $('#auth-container').hide()
  if (ids.every((id) => id != 'loading')) $('#loading').hide()
  if (ids.every((id) => id != 'error')) $('#error').hide()
  if (ids.every((id) => id != 'content')) $('#content').hide()
  if (ids.every((id) => id != 'admin-console')) $('#admin-console').hide()
  ids.forEach((id) => $(`#${id}`).show())
}

const auth_state = {
  init: () => {
    console.log('App initializing')
    hide_elements_except('loading')
    if(firebase.auth().currentUser && firebase.auth().currentUser.uid) {
      auth_state.signed_in()
    } else {
      auth_state.not_signed_in()
    }
  },
  not_signed_in: () => {
    console.log('User not signed in')
    const auth_ui_config = get_auth_config(() => {
      if (firebase.auth().currentUser.emailVerified) {
        auth_state.email_verified()
      } else {
        auth_state.email_not_verified()
      }
    })
    hide_elements_except('auth-container')
    auth_ui.start('#auth-container', auth_ui_config)
  },
  email_verified: () => {
    console.log('Email verified')
    auth_state.signed_in()
  },
  email_not_verified: () => {
    console.log('Email not verified')
    firebase.auth().currentUser.sendEmailVerification().then(() => {
      hide_elements_except('content')
      $('#content p').text(`Your email address hasn\'t been verified yet. An email has been sent to ${firebase.auth().currentUser.email}. Please click on the link and then refresh this page.`)
    })
  },
  signed_in: () => {
    console.log('User signed in')
    hide_elements_except('loading')
    firebase.database().ref(`user-data/${firebase.auth().currentUser.uid}/token-refresh`).on('value', (snapshot) =>
      firebase.auth().currentUser.getIdTokenResult(true).then((token) => {
        if (!!token.claims.admin) {
          auth_state.admin()
        } else if (!!token.claims.user){
          auth_state.user()
        } else {
          auth_state.invalid_permissions()
        }
      }).catch((error) => {
        auth_state.not_signed_in()
      })
    )
  },
  admin: () => {
    console.log('User is an admin')
    hide_elements_except(['content', 'admin-console'])
    $('#content p').text('You are an admin.')
  },
  user: () => {
    console.log('User is unelevated')
    hide_elements_except('content')
    $('#content p').text('You are a user.')
  },
  invalid_permissions: () => {
    console.log('User has no permissions')
    hide_elements_except('content')
    $('#content p').text('You do not have proper permissions.')
  },
  error: (message) => {
    console.log('Error encountered')
    hide_elements_except('error')
    $('#error p').text(`Error: ${message}`)
  }
}

add_admin = (email) => firebase.database().ref('pending-permissions').push({
  email: email,
  roles: {
    admin: true
  },
  timestamp: Date.now()
})

add_user = (email) => firebase.database().ref('pending-permissions').push({
  email: email,
  roles: {
    user: true
  },
  timestamp: Date.now()
})

remove_user = (email) => firebase.database().ref('pending-permissions').push({
  email: email,
  roles: {
    user: false
  },
  timestamp: Date.now()
})

$(document).ready(function() {
  $('#add-admin button').click(() => {
    add_admin($('#add-admin input').val())
    $('#add-admin input').val('')
  })
  $('#add-user button#add-button').click(() => {
    add_user($('#add-user input').val())
    $('#add-user input').val('')
  })
  $('#add-user button#remove-button').click(() => {
    remove_user($('#add-user input').val())
    $('#add-user input,#remove-user').val('')
  })
  auth_state.init()
})
