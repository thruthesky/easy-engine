# Easy Engine

This project provides essential cloud functions to help front-end apps use Firebase more effectively. It includes server-side functions for tasks that can't be done on the client side, like disabling user accounts. It also offers helpful functions, such as deleting user accounts.


# Install



## Firebase Extensions

To make it ultamately easy to install cloud functions of easy engine, it is distributed as firebase extensions. You can simply click the link below and begin to install with easy.


## Firebase Security Rules


- To understand better about the security rules, please read the comments of the security rules source code.



# How to use

## Delete account

Firebase Client SDK noramlly asks for recent-login to delete the user's own account. And yes, it's an extra work for the client developers. If the user signed in with phone number, the user must re-authenticate with it. If the app provides multiple sign-in methods, the developer must implement all the re-authentication logic. To make it simple, it provides the `deleteAccount` of firebase cloud function through firebase extension.




## Claim as admin

- Call `claimAsAdmin` cloud function to become the admin. Only the only user who first claim becomes admin and the follow users who tries to claim will get error.



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


## Release


- [Version 0.0.1-rc.0](https://console.firebase.google.com/u/0/project/_/extensions/install?ref=jaehosong%2Feasy-extensions@0.0.1-rc.0)





## Release console

https://console.firebase.google.com/u/0/project/jaehosong/publisher/extensions/easy-extensions/v/0.0.1-rc.0
