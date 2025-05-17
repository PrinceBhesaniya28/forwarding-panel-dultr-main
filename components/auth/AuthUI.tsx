'use client';

import EmailSignIn from '@/components/auth-ui/EmailSignIn';
import ForgotPassword from '@/components/auth-ui/ForgotPassword';
import OauthSignIn from '@/components/auth-ui/OauthSignIn';
import PasswordSignIn from '@/components/auth-ui/PasswordSignIn';
import Separator from '@/components/auth-ui/Separator';
import SignUp from '@/components/auth-ui/Signup';
import UpdatePassword from '@/components/auth-ui/UpdatePassword';

export default function AuthUI(props: any) {
  return (
    <div className="my-auto mb-auto mt-8 flex flex-col md:mt-[70px] md:max-w-full lg:mt-[130px] lg:max-w-[420px]">
      <p className="text-[32px] font-bold text-foreground dark:text-white">
        {props.viewProp === 'signup'
          ? 'Sign Up'
          : props.viewProp === 'forgot_password'
          ? 'Forgot Password'
          : props.viewProp === 'update_password'
          ? 'Update Password'
          : props.viewProp === 'email_signin'
          ? 'Email Sign In'
          : 'Sign In'}
      </p>
      <p className="mb-2.5 mt-2.5 font-normal text-foreground dark:text-zinc-400">
        {props.viewProp === 'signup'
          ? 'Enter your email and password to sign up!'
          : props.viewProp === 'forgot_password'
          ? 'Enter your email to get a passoword reset link!'
          : props.viewProp === 'update_password'
          ? 'Choose a new password for your account!'
          : props.viewProp === 'email_signin'
          ? 'Enter your email to get a magic link!'
          : 'Enter your email and password to sign in!'}
      </p>
      {props.viewProp !== 'update_password' &&
        props.viewProp !== 'signup' &&
        props.allowOauth && (
          <>
            <OauthSignIn />
            <Separator />
          </>
        )}
      {props.viewProp === 'password_signin' && (
        <PasswordSignIn
          allowEmail={props.allowEmail}
          redirectMethod={props.redirectMethod}
        />
      )}
      {props.viewProp === 'email_signin' && (
        <EmailSignIn
          allowPassword={props.allowPassword}
          redirectMethod={props.redirectMethod}
          disableButton={props.disableButton}
        />
      )}
      {props.viewProp === 'forgot_password' && (
        <ForgotPassword
          allowEmail={props.allowEmail}
          redirectMethod={props.redirectMethod}
          disableButton={props.disableButton}
        />
      )}
      {props.viewProp === 'update_password' && (
        <UpdatePassword redirectMethod={props.redirectMethod} />
      )}
      {props.viewProp === 'signup' && (
        <SignUp
          allowEmail={props.allowEmail}
          redirectMethod={props.redirectMethod}
        />
      )}
    </div>
  );
}
