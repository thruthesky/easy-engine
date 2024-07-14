# Easy Engine


This is a Firebase backend for supporting the [easy packages](https://github.com/thruthesky/easy_frame) Flutter framework. This project rovides firebase auth account management, and other features that cannot be made in Flutter Firebase Client SDK.

# Install



## Firebase Extensions

To make it ultamately easy to install cloud functions of easy engine, it is distributed as firebase extensions. You can simply click the link below and begin to install with easy.


## Firebase Security Rules

어느 사용자가 관리자이고, 또 어떤 권한이 있는지, 편리한 방법으로 관리를 하기 위해서, 사용자 문서에 바로 기록을 하기로 했다.

사용자 문서인 `/users/{uid}` 에 `admin` 필드 값 `true` 이면 관리자이다.

수퍼 관리자는 `adminRoot` 필드에 true 의 값이 들어간다.

루트 관리자는 1 명만 있을 수 있다.

루트 관리자는 다른 회원을 관리자로 지정 할 수 있다.

고객(회원) 상담을 할 때, 모든 관리자들과 함께 그룹 채팅방으로 상담이 진행된다.



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
```