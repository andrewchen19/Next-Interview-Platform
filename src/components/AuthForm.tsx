"use client";

// client-side form
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";

// custom form field
import FormField from "./FormField";

import { auth } from "@/firebase/client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { signIn, signUp } from "@/actions/auth.action";
import { FirebaseError } from "firebase/app";

// Define the shape of your form
const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
  });
};

export default function AuthForm({ type }: { type: FormType }) {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const formSchema = authFormSchema(type);

  // 1. Define your form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      if (type === "sign-up") {
        const { name, email, password } = values;

        // create a new user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          //  new user's unique Firebase UID
          uid: userCredential.user.uid,
          // non-null assertion
          name: name!,
          email,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.push("/sign-in");
      } else {
        const { email, password } = values;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();

        if (!idToken) {
          toast.error("Sign in failed.");
          return;
        }

        const result = await signIn({
          email,
          idToken,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.push("/");
      }
    } catch (error: unknown) {
      // handle firebase specific errors
      if (error instanceof FirebaseError) {
        if (error.code === "auth/email-already-in-use") {
          return toast.error("Email is already in use.");
        }
        if (error.code === "auth/invalid-credential") {
          return toast.error("Invalid credential.");
        }

        return toast.error(error.message);
      }

      toast.error("There was an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[556px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row justify-center gap-2">
          <Image src={"/logo.svg"} alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">HireReady</h2>
        </div>

        <h3 className="text-center">Practice Job Interview with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Loading..." : isSignIn ? "Sign in" : "Sign up"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-bold text-user-primary ml-2"
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
