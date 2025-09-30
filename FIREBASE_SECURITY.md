# Firebase Security Rules for OpenClassBoard

This document explains the security configuration for OpenClassBoard's Firebase Realtime Database, optimized for production deployment at openclassboard.com.

## 🔒 Security Overview

The Firebase Realtime Database is used exclusively for the **Poll Widget** feature, allowing real-time voting between teachers and students. These rules balance security with the open nature required for classroom polling.

## 📋 Rule Options

Two rule configurations are provided:

### 1. Enhanced Rules (Recommended for Production)
**File:** `firebase-database-rules-enhanced.json`

**Features:**
- ✅ Public read access for polls (required for voting pages)
- ✅ Controlled write access with validation
- ✅ Rate limiting (max 10 options, 10,000 voters per poll)
- ✅ Data validation (string lengths, number ranges)
- ✅ Time-based validation (polls must be recent)
- ✅ Prevents unlimited poll growth
- ✅ Performance indexing

**Best for:** Production deployment with high traffic

### 2. Standard Rules
**File:** `firebase-database-rules.json`

**Features:**
- ✅ Public read access for polls
- ✅ Controlled write access
- ✅ Basic data validation
- ✅ Voter tracking to prevent duplicates
- ✅ Poll lifecycle management

**Best for:** Smaller deployments or testing

## 🚀 Deployment Instructions

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your OpenClassBoard project
3. Navigate to **Realtime Database** → **Rules**

### Step 2: Copy Rules

**For Enhanced Security (Recommended):**
```bash
# Copy the contents of firebase-database-rules-enhanced.json
```

**For Standard Security:**
```bash
# Copy the contents of firebase-database-rules.json
```

### Step 3: Apply Rules

1. Paste the rules into the Firebase Console rules editor
2. Click **Publish**
3. Confirm the changes

### Step 4: Test Rules

After publishing, test the rules by:
1. Creating a poll on openclassboard.com
2. Accessing the voting URL from a different device
3. Submitting votes
4. Verifying poll updates in real-time

## 🛡️ Security Features Explained

### Public Read Access
```json
".read": true
```
**Why:** Students need to access poll data from the voting page without authentication. This is safe because:
- Only poll data is exposed (no sensitive information)
- Polls are temporary and classroom-specific
- Teachers control what polls are created

### Controlled Write Access
```json
".write": "(!data.exists()) || (data.exists() && data.child('isLive').val() === true)"
```
**What it does:**
- Allows creating new polls
- Allows updates only while poll is live
- Prevents modification of ended polls
- Requires valid data structure

### Data Validation

**Title validation:**
```json
"title": {
  ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 200"
}
```
- Must be a string
- Cannot be empty
- Maximum 200 characters

**Vote validation:**
```json
"votes": {
  "$option": {
    ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 10000"
  }
}
```
- Must be a number
- Cannot be negative
- Maximum 10,000 votes per option (prevents abuse)

### Rate Limiting (Enhanced Rules Only)

**Maximum options per poll:**
```json
".validate": "newData.hasChildren() && newData.numChildren() <= 10"
```

**Maximum voters per poll:**
```json
".validate": "newData.hasChildren() && newData.numChildren() <= 10000"
```

**Prevents:**
- Database bloat from unlimited options
- Abuse from excessive voting attempts
- Performance degradation

### Time-Based Validation (Enhanced Rules Only)
```json
"created": {
  ".validate": "newData.isNumber() && newData.val() <= now && newData.val() >= (now - 86400000)"
}
```
- Polls must have valid timestamps
- Created timestamp must be within last 24 hours
- Prevents backdating or future-dating polls

## 🎯 Additional Security Recommendations

### 1. Enable App Check (Recommended)
Protect your Firebase resources from abuse:

1. Go to **Firebase Console** → **App Check**
2. Click **Get Started**
3. Register your web app domain: `openclassboard.com`
4. Enable enforcement for Realtime Database

**Benefits:**
- Blocks requests from unauthorized domains
- Prevents API abuse
- Free for Firebase projects

### 2. Set Up Database Quotas

1. Go to **Realtime Database** → **Usage**
2. Set limits:
   - **Downloads:** 10 GB/day (adjust based on traffic)
   - **Connections:** 100 concurrent (adjust based on classroom size)
   - **Storage:** 1 GB

### 3. Monitor Database Usage

Regularly check:
- Firebase Console → Realtime Database → Usage
- Look for unusual spikes in:
  - Read operations
  - Write operations
  - Concurrent connections
  - Storage size

### 4. Implement Poll Cleanup

**Automatic Cleanup (Already Implemented):**
The app automatically cleans up polls older than 24 hours.

**Manual Cleanup:**
Periodically review and delete old polls:
1. Firebase Console → Realtime Database
2. Browse to `polls` node
3. Delete old or test polls

### 5. Domain Restrictions

**Firebase Project Settings:**
1. Go to **Project Settings** → **General**
2. Under **Your Apps**, find your web app
3. Add authorized domains:
   - `openclassboard.com`
   - `www.openclassboard.com`
   - Remove `localhost` for production

## 🔍 Security Considerations

### What's Protected:
✅ Poll data structure is validated
✅ Write access is controlled
✅ Rate limiting prevents abuse (enhanced rules)
✅ Time-based validation prevents backdating
✅ Storage growth is limited

### What's Intentionally Open:
⚠️ **Public Read Access:** Required for voting functionality
⚠️ **Public Poll Creation:** Anyone can create polls (by design)
⚠️ **No Authentication:** Simplified for classroom use

### Known Limitations:

**No User Authentication:**
- Trade-off for ease of use in classrooms
- Students don't need accounts to vote
- Consider implementing if needed for your use case

**Public Write Access:**
- Anyone can create polls
- Mitigated by data validation and rate limiting
- Monitor for abuse in Firebase Console

**Duplicate Voting:**
- Client-side prevention only (voter ID tracking)
- Determined users can vote multiple times
- Acceptable for classroom trust environment

## 🚨 Monitoring & Alerts

### Set Up Email Alerts

1. Firebase Console → **Project Settings** → **Integrations**
2. Enable alerts for:
   - Unusual database activity
   - Quota exceeded warnings
   - Security rule failures

### Check Logs Regularly

1. Firebase Console → **Realtime Database** → **Usage**
2. Review for:
   - Unusual traffic patterns
   - Failed write attempts
   - Rapid poll creation

## 🔄 Updating Rules

When updating rules:

1. **Test in Firebase Console:**
   - Use the Rules Playground to test scenarios
   - Test both read and write operations

2. **Backup Current Rules:**
   - Copy existing rules before making changes
   - Keep version history

3. **Deploy During Low Traffic:**
   - Update rules outside of classroom hours
   - Notify users of maintenance window

4. **Verify After Deployment:**
   - Test all poll features
   - Check Firebase Console for errors

## 📞 Support

If you encounter issues with Firebase security:

1. Check Firebase Console for error messages
2. Review Firebase documentation: https://firebase.google.com/docs/database/security
3. Test rules in the Firebase Console Rules Playground
4. Submit issues to: https://github.com/Bacon8tor/OpenClassBoard/issues

---

**Last Updated:** 2025-09-30
**For:** OpenClassBoard v0.1.0
**Deployment:** openclassboard.com (Amazon Amplify)