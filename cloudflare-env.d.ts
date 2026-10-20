declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    FIREBASE_PROJECT_ID?: string;
    FIREBASE_WEB_API_KEY?: string;
    FIREBASE_APP_ID?: string;
    FIREBASE_AUTH_DOMAIN?: string;
    BUCKET?: R2Bucket;
  }
}
