# Firebase Permission Demo

Authentication, role, and permission management with no servers. Hosted at http://authdemo.scottcrossen.com

### Description

This repository is for a statically-hosted website that authenticates users and gives them different access levels.
'Admins' can add other admins and users. 'Users' can see content.
Everyone else is not whitelisted for any privileges but can still login.
Authentication happens via Google OAuth. Permissions are handled via custom claims on the security tokens released.
Cloud functions are used to facilitate a better user flow for user invites.
A database is also used to keep track of user-invites and some permission requests.
User info and privilege is not maintained in this project but is rather kept by Google's OAuth.
The website itself is written in vanilla HTML and JQuery. Cloud functions are written in a Node environment.
Database rules are in a custom firebase JSON markup.

### Helpful Links

[Hosted Version](http://authdemo.scottcrossen.com)

### Contributors

1. Scott Leland Crossen  
<http://scottcrossen.com>  
<scottcrossen42@gmail.com>  
