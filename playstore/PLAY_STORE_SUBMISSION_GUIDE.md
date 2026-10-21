# SummifySocial: Complete Google Play Store Publishing Guide 🚀

This guide walks you step-by-step through publishing **SummifySocial** (`com.summifysocial.app`) to the **Google Play Store**.

---

## 📋 Pre-Flight Checklist

- [x] **Native Android Project Prepared**: Located at `c:\Users\bra_s\Documents\Summify\android`
- [x] **Package ID Configured**: `com.summifysocial.app` (Target SDK 36, Min SDK 24)
- [x] **Store Listing Metadata Prepared**: `playstore\APP_LISTING.md`
- [x] **Privacy Policy Prepared**: `playstore\PRIVACY_POLICY.html`
- [x] **Keystore Generator Tool**: `playstore\generate_keystore.bat`
- [ ] **Google Play Developer Account**: ($25 one-time registration fee at [play.google.com/console](https://play.google.com/console))

---

## Step 1: Create Your Release Signing Keystore

Google Play requires all Android App Bundles (`.aab`) to be cryptographically signed with a private keystore.

1. Double-click `playstore\generate_keystore.bat` (or open terminal in `playstore` and run `.\generate_keystore.bat`).
2. Enter a secure password (e.g. at least 6 characters) and answer the certificate prompt questions (Your Name, Organization, Country).
3. This creates **`summify-release.keystore`** with the alias `summify-key`.
> [!IMPORTANT]
> **BACK UP THIS KEYSTORE FILE AND PASSWORD!** If you lose this key, you will not be able to push app updates to Google Play.

---

## Step 2: Build the Signed Android App Bundle (`.aab`)

Google Play stopped accepting `.apk` files for new apps; apps must be submitted as an **Android App Bundle (`.aab`)**.

### Using Android Studio (Recommended & Easiest)
1. Open **Android Studio** (`C:\Program Files\Android\Android Studio\bin\studio64.exe`).
2. Select **Open** and choose the folder:
   `c:\Users\bra_s\Documents\Summify\android`
3. Wait 1–2 minutes for Gradle sync to complete.
4. Click **Build** in the top menu bar → **Generate Signed Bundle / APK...**
5. Select **Android App Bundle** → click **Next**.
6. Under **Key store path**, click **Choose existing...** and select `playstore\summify-release.keystore`.
7. Enter your **Key store password**, select alias **`summify-key`**, and enter the **Key password**.
8. Select **release** build variant and click **Finish**.
9. Your production `.aab` file will be generated in:
   `android\app\release\app-release.aab`

---

## Step 3: Set Up Your Google Play Console Account

1. Go to your [Google Play Console](https://play.google.com/console) dashboard where you created `com.summifysocial.app`.
2. Under app details, verify:
   - **App name**: `SummifySocial - Verified News`
   - **Package name**: `com.summifysocial.app`
   - **Default language**: English (United States)
   - **Free or paid**: Free

---

## Step 4: Complete the App Content Section (Required by Google)

In the left sidebar, scroll down to **Policy and programs** → **App content**:

1. **Privacy Policy**:
   - Host `playstore\PRIVACY_POLICY.html` on GitHub Pages, Vercel, or your domain.
   - Paste the public URL into the **Privacy policy URL** field.
2. **Ads**:
   - Select **No, my app does not contain ads**.
3. **App Access**:
   - Select **All functionality is available without special access**.
4. **Content Ratings**:
   - Click **Start questionnaire**, enter your email, select category **News / Informational**, and answer the content questions.
   - This awards your app an **Everyone** / **Teen** rating.
5. **Target Audience**:
   - Select **13 and older** (13–15, 16–17, 18+).
6. **News Apps**:
   - Answer **Yes**, this is a news aggregator app.
7. **Data Safety**:
   - SummifySocial does not collect personal contact information or track users across external advertising networks.

---

## Step 5: Set Up Store Listing & Graphics

In the left sidebar, click **Store presence** → **Main store listing**:

1. **Short description**: Paste from `playstore\APP_LISTING.md`
2. **Full description**: Paste from `playstore\APP_LISTING.md`
3. **App Icon**: Upload 512 x 512 px PNG from `playstore\icon_512x512.png`.
4. **Feature Graphic**: Upload 1024 x 500 px graphic from `playstore\feature_graphic_1024x500.png`.
5. **Phone Screenshots**: Take 2 to 4 screenshots of SummifySocial on phone or Android emulator and upload them.

---

## Step 6: Upload the `.aab` & Submit for Review

1. In the left sidebar, go to **Release** → **Production** (or **Testing** → **Internal testing** for immediate verification).
2. Click **Create new release**.
3. Click **Upload** and select your generated:
   `android\app\release\app-release.aab`
4. Enter Release notes:
   `Initial release of SummifySocial — Real-time social media news aggregator with AI summaries and live fact-checking corroboration.`
5. Click **Next** → Review release summary.
6. Click **Save** → **Start rollout to Production**!
