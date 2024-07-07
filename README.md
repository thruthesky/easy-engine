# House Engine



## Firebase Security Rules

어느 사용자가 관리자이고, 또 어떤 권한이 있는지, 편리한 방법으로 관리를 하기 위해서, 사용자 문서에 바로 기록을 하기로 했다.

사용자 문서인 `/users/{uid}` 에 `admin` 필드 값 `true` 이면 관리자이다.

수퍼 관리자는 `adminRoot` 필드에 true 의 값이 들어간다.

루트 관리자는 1 명만 있을 수 있다.

루트 관리자는 다른 회원을 관리자로 지정 할 수 있다.

고객(회원) 상담을 할 때, 모든 관리자들과 함께 그룹 채팅방으로 상담이 진행된다.


### 관리자로 지정하기

- 2024. 07. 07. 현재는 Firestore 의 사용자 문서에서 `admin` 필드에 `true` 의 값을 주어야 한다.
- 앞으로는 백엔드에서 관리자가 설정되지 않은 경우, 누구나 먼저 선착순으로 root 관리자로 지정 할 수 있도록 한다.


### 관리자 권한의 과거 설정 - 2024. 07. 06 이전

이전에는 아래와 같이 관리자를 위한 Security Rules 문서를 따로 만들었는데 로직 및 데이터 관리에 불편함이 있었다.

```sh
match /settings/admins {
  allow read: if true;
  allow create: if isAdminNotSet() && request.resource.data.keys().hasOnly([request.auth.uid]);
  allow update: if isRootAdmin();
  allow delete: if false;
}
```

데이터 구조 예:

```json
/settings
  /admin
    {
        "user-id-1": ["root", "customer-chat-support"],
        "user-id-2": ["customer-chat-support"]
    }
```