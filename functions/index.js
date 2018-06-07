const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.permissionChange = functions.database.ref('pending-permissions/{push_id}')
  .onCreate((snapshot, context) =>
    admin.auth().getUserByEmail(snapshot.val().email).then((user) =>
      admin.auth().setCustomUserClaims(user.uid, snapshot.val().roles).then(() =>
        admin.database().ref(`user-data/${user.uid}`).set({'token-refresh': new Date().getTime()}).then(() =>
          admin.database().ref(`pending-permissions/${context.params.push_id}`).remove()
        )
      )
    )
  )

exports.userSignUp = functions.auth.user().onCreate((user) => {
  return admin.database().ref('pending-permissions').orderByChild('email').equalTo(user.email).once('value', (snapshot) => {
    if (snapshot.exists()) {
      const claims = Object.assign({}, ...Object.keys(snapshot.val()).sort((push_id1, push_id2) =>
        snaphot[push_id1].timestamp - snaphot[push_id2].timestamp
      ).map((push_id) => {
        return {roles: snapshot.val()[push_id].roles}
      })).roles
      return admin.auth().setCustomUserClaims(user.uid, claims).then(() =>
        admin.database().ref(`user-data/${user.uid}`).set({'token-refresh': new Date().getTime()})
      ).then(() =>
        Promise.all(Object.keys(snapshot.val()).map((push_id) =>
          admin.database().ref(`pending-permissions/${push_id}`).remove()
        ))
      )
    } else {
      return Promise.resolve()
    }
  })
})
