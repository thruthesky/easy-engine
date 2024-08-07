

/**
 * Config
 *
 * 기본적으로 설정을 하는 클래스
 */
export class Config {
    // debug = true 이면, 함수에 로그를 남긴다.
    static debug = true;

    // asia-northeast3 => Seoul
    // us-central1 => default region (US)
    // asia-southeast1 => Singapore

    // Sets default options for all functions written using the 2nd gen SDK
    //
    // This is used in index.ts to set the region of the 2nd gen functions.
    // If you don't know what to put, then put the same region of the Firestore or Realtime Database.
    static region = "asia-southeast1"; //  "us-central1";  "asia-southeast1";

    // Cloud Functions Server Region
    //
    // This is not used for the meantime.
    static firestoreRegion = "asia-northeast3"; // "nam5"; // "asia-northeast3";

    // Firebase Realtime Database Region
    //
    // The functions that listens the Realtime Database events must be in the same region as the Realtime Database.
    static databaseRegion = "asia-southeast1"; // "us-central1"; // asia-southeast1


    static fcmTokens = "fcm-tokens";
    static fcmSubscriptions = "fcm-subscriptions";

    static fcmSendingResults = "fcm-sending-results";

    // Remove the tokens that have errors like messaging/invalid-argument,
    // messaging/invalid-registration-token, messaging/registration-token-not-registered.
    //
    // But be careful, when you set it to true since there is a case that the token is valid
    // but produceses error due to developer's mistake like mis-setup.
    //
    // 푸시 알림을 보낼 때, 잘못된 토큰이 있으면 삭제를 할 것인지 여부.
    // 주의 할 점은 올바른 토큰임에도 불구하고 Network 에러나 기타 설정, 서버 등의 에러로 인해서 푸시 알림 전송시 에러(잘못된 토큰)로 인식될 수 있다.
    // 그래서, 가능한 이 값을 false 로 하여, 푸시 알림을 할 때 잘못된 토큰을 삭제하지 않을 것을 권장한다. 잘못된 토큰을 DB 에 계속 남겨 두고, 반복적으로 푸시 알림 에러가 떠도 큰 문제가 없다.
    // 이 값이 true 로 지정되면, 올바른 토큰을 삭제해버리는 결과가 나올 수 있다.
    // 실제로 토큰이 올바르지만 네트워크 또는 서버 문제, 소스 코딩 문제로 푸시 알림 전송시 에러가 발생할 수 있다.
    // 그래서, 올바른 토큰이 삭제되는 경우가 발생하기 때문이다. 이를 해결하기 위해서는 공식 문서에서 권장하는 방법을 사용해야 한다.
    static removeTokensWithErrors = false;


    // 푸시 알림 기록을 기록할 것인지 여부.
    // 이 값을 true 로 하면, 푸시 알림을 한 후, 그 결과를 DB 에 기록한다. 로그를 기록하면 DB 용량이 커 질 수 있으므로 주의해야 한다.
    // 개발 및 테스트 할 때에는 이 값을 true 로 해서, 확인을 해 볼 필요가 있다.
    static logSendingPushNotificationResult = true;
}

