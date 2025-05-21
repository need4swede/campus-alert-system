# Microsoft Entra ID Configuration Guide

## Solution Overview

I've implemented a client-side authentication approach using the Authorization Code Flow with PKCE (Proof Key for Code Exchange), which is the recommended best practice for Single-Page Applications (SPAs).

## What is PKCE?

PKCE (pronounced "pixy") is an extension to the OAuth 2.0 Authorization Code Flow that provides additional security for public clients like SPAs. It prevents authorization code interception attacks by using a dynamically generated code verifier and challenge.

## How It Works

1. When a user clicks "Sign in with Microsoft", the application:
   - Generates a random code verifier
   - Creates a code challenge from the verifier using SHA-256
   - Stores the code verifier in local storage
   - Redirects to Microsoft's authorization endpoint with the code challenge

2. After the user authenticates, Microsoft redirects back to your app with an authorization code

3. Your app exchanges this code for tokens by:
   - Sending the original code verifier (not the challenge) along with the authorization code
   - Microsoft verifies that the code verifier matches the original challenge
   - If valid, tokens are returned to your application

## Entra ID Configuration

You've already configured your application correctly in Microsoft Entra ID:

1. Added a SPA platform to your app registration
2. Set the redirect URI as `http://localhost:8181`

This configuration allows your application to use the Authorization Code Flow with PKCE.

## Additional Notes

- **IMPORTANT**: Client secrets should NOT be used with SPAs. They are only for confidential clients (like server-side applications).
- PKCE provides the necessary security for SPAs without requiring a client secret
- No server-side component is required for authentication
- This approach follows the latest security best practices for SPAs
- Make sure your redirect URI in Entra ID exactly matches the one in your application (including protocol, domain, port, and path)

## Running the Application

Simply start the application in development mode:
```
npm run dev
```

No additional server is needed for authentication.
