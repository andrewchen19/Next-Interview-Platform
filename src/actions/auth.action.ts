"use server";

import { auth, db } from "@/firebase/admin";
import { FirebaseAuthError } from "firebase-admin/auth";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };
    }

    await db.collection("users").doc(uid).set({
      name,
      email,
    });

    return {
      success: true,
      message: "Account created Successfully. Please sign in.",
    };
  } catch (error: unknown) {
    // handle firebase specific errors
    if (error instanceof FirebaseAuthError) {
      if (error.code === "auth/email-already-in-use") {
        return {
          success: false,
          message: "Email is already exists.",
        };
      }
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000,
  });

  cookieStore.set("sessionCookie", sessionCookie, {
    // sets the cookie’s lifespan in seconds
    maxAge: ONE_WEEK,
    // prevents JavaScript from accessing the cookie (via document.cookie)
    httpOnly: true,
    // sends the cookie only over HTTPS
    secure: process.env.NODE_ENV === "production",
    // controls the cookie's cross-site request behavior
    sameSite: "lax",
    // sets which paths can access the cookie
    // "/" is default, which means the cookie will be sent on every request to the site
    path: "/",
  });
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Create an account instead.",
      };
    }

    await setSessionCookie(idToken);

    return {
      success: true,
      message: "Sign in Successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to log into an account. Please try again.",
    };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("sessionCookie")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // make sure it's valid and not revoked
    // if valid, returns the user's decoded information
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) return null;

    return {
      id: userRecord.id,
      ...userRecord.data(),
    } as User;
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user;
}
