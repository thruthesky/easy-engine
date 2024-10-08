# Easy Engine

The `easy engine` provides essential cloud functions to help front-end apps use Firebase more effectively. It includes server-side functions for tasks that can't be done on the client side, like sending push notifications, disabling user accounts. It also offers helpful functions, such as deleting user accounts.

- [Easy Engine](#easy-engine)
- [Why cloud functions?](#why-cloud-functions)
- [Install](#install)
  - [Cloud functions install](#cloud-functions-install)
  - [Firestore Security Rules install](#firestore-security-rules-install)
  - [Realtime Database Security Rules install](#realtime-database-security-rules-install)
- [How to use](#how-to-use)
  - [Delete account](#delete-account)
  - [Claim as admin](#claim-as-admin)
  - [FCM](#fcm)
- [Unit Tests](#unit-tests)
- [E2E Tests](#e2e-tests)


# Why cloud functions?

- Only service accounts can enable and disable user accounts. This means web and app clients using SDKs like Flutter or JavaScript cannot perform this task.
  - This project supports such functionality for any client platform.
  - This includes enabling/disabling accounts, sending messages, and more.


- To send push notifications to a device token from Flutter, an `access token` for HTTP API v1 is required. There is no secure way to obtain one.
  - The official document states - [Update authorization of send requests](https://firebase.google.com/docs/cloud-messaging/migrate-v1#update-authorization-of-send-requests): `HTTP v1 messages must be sent through a trusted environment such as your app server or Cloud Functions for Firebase using the HTTP protocol or the Admin SDK to build message requests. Sending directly from client app logic carries extreme security risk and is not supported.`
  - Using the service account to get the access token for HTTP API v1 is very insecure and not recommended.

- The official document states - [Topic messaging on Flutter](https://firebase.google.com/docs/cloud-messaging/flutter/topic-messaging): `One app instance can be subscribed to no more than 2000 topics`.
  - To solve this issue, this project supports topic subscription.

- Unfortunately, there is no way to send push notifications in the `Firebase Extensions` environment. It must be a cloud function to send push notifications using Firebase.



# Install


## Cloud functions install

- `git clone` the easy-engine
- `cd cloud-functions/functions`
- `firebase use`: select the project you want to deploy the functions to.
- `npm run deploy`

## Firestore Security Rules install

- To understand better about the security rules, please read the comments of the security rules source code.

## Realtime Database Security Rules install

- Install the security rules for the Realtime Database at the [easy package database security rules](https://github.com/thruthesky/easy_packages/blob/main/docs/database_security_rules.json).

# How to use

## Delete account

Firebase Client SDK noramlly asks for recent-login to delete the user's own account. And yes, it's an extra work for the client developers. If the user signed in with phone number, the user must re-authenticate with it. If the app provides multiple sign-in methods, the developer must implement all the re-authentication logic. To make it simple, it provides the `deleteAccount` of firebase cloud function through firebase extension.




## Claim as admin

- Call `claimAsAdmin` cloud function to become the admin. Only the only user who first claim becomes admin and the follow users who tries to claim will get error.


## FCM

- Use `data` of the FCM payload for delivering parameters of what page(screen) to be opened and which information it should display.

- It provides `sendMessage`, `sendMessageToUid`, `sendMessageToSubscription` methods from MessagingService class. And this three functions are exposed by the `src/messaging/messaging.functions.ts` file. You need to deploy the functions first. then, access the cloud functions with your client app.



# Unit Tests

# E2E Tests

- First, run emulators like below.

```sh
% firebase emulators:start
```

- Second, run the tsc to transpile ts to javascript.

```sh
% npm run build -- --watch
```

- Then, run the test like below

```sh
npm run test:e2e:claimAdmin
```


