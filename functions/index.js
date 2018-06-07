const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.permissionChange = functions.database.ref('pending-permissions/{pushId}')
  .onCreate((snapshot, context) =>
    admin.auth().getUserByEmail(snapshot.val().email).then((user) =>
      admin.auth().setCustomUserClaims(user.uid, snapshot.val().roles).then(() =>
        admin.database().ref(`user-data/${user.uid}`).set({'token-refresh': new Date().getTime()}).then(() =>
          admin.database().ref(`pending-permissions/${context.params.pushId}`).remove()
        )
      )
    )
  )

exports.userSignUp = functions.auth.user().onCreate((user) => {
  return admin.database().ref('pending-permissions').orderByChild('email').equalTo(user.email).once('value', (snapshot) => {
    const claims = Object.assign({}, ...Object.keys(snapshot.val()).sort((pushId1, pushId2) =>
      snaphot[pushId1].timestamp - snaphot[pushId2].timestamp
    ).map((pushId) => {
      return {roles: snapshot.val()[pushId].roles}
    })).roles
    return admin.auth().setCustomUserClaims(user.uid, claims).then(() =>
      admin.database().ref(`user-data/${user.uid}`).set({'token-refresh': new Date().getTime()})
    ).then(() =>
      Promise.all(Object.keys(snapshot.val()).map((pushId) =>
        admin.database().ref(`pending-permissions/${pushId}`).remove()
      ))
    )
  })
})
