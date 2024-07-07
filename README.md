# House Engine



## Firebase Security Rules


처음에는 아래와 같이 관리자를 위한 Security Rules 문서를 따로 만들었다. 

```sh
match /settings/admins {
  allow read: if true;
  allow create: if isAdminNotSet() && request.resource.data.keys().hasOnly([request.auth.uid]);
  allow update: if isRootAdmin();
  allow delete: if false;
}
```